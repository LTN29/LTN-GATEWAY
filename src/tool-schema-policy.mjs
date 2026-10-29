// Anthropic rejects tool input schemas whose ROOT uses oneOf/anyOf/allOf:
//   "tools.N.custom.input_schema: input_schema does not support oneOf, allOf,
//    or anyOf at the top level".
// Some MCP servers (and Codex-forwarded MCP tools) declare such roots, and one
// bad tool breaks every request in the conversation. Rewrite only the root into
// a single object schema; nested combiners are allowed and kept.

const COMBINERS = ["allOf", "anyOf", "oneOf"];

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasRootCombiner(schema) {
  return isObject(schema) && COMBINERS.some((key) => Array.isArray(schema[key]));
}

function isObjectSchema(schema) {
  if (!isObject(schema)) return false;
  if (schema.type === undefined) return isObject(schema.properties) || hasRootCombiner(schema);
  return schema.type === "object" || (Array.isArray(schema.type) && schema.type.includes("object"));
}

function sameSchema(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function addProperty(properties, name, schema, combiner) {
  if (!(name in properties)) {
    properties[name] = schema;
    return;
  }
  const existing = properties[name];
  if (sameSchema(existing, schema)) return;
  const options = Array.isArray(existing?.[combiner]) && Object.keys(existing).length === 1
    ? existing[combiner]
    : [existing];
  if (!options.some((option) => sameSchema(option, schema))) options.push(schema);
  properties[name] = { [combiner]: options };
}

export function normalizeRootSchema(schema) {
  if (!isObject(schema)) return { type: "object", properties: {} };
  if (!hasRootCombiner(schema)) {
    if (schema.type === undefined && isObject(schema.properties)) return { type: "object", ...schema };
    return schema;
  }

  const base = { ...schema };
  for (const key of COMBINERS) delete base[key];
  const properties = { ...(isObject(base.properties) ? base.properties : {}) };
  const required = new Set(Array.isArray(base.required) ? base.required : []);
  const notes = [];
  let closed = base.additionalProperties === false;

  if (Array.isArray(schema.allOf)) {
    for (const raw of schema.allOf) {
      const branch = normalizeRootSchema(raw);
      if (!isObjectSchema(branch)) continue;
      for (const [name, value] of Object.entries(branch.properties || {})) addProperty(properties, name, value, "allOf");
      for (const name of branch.required || []) required.add(name);
      if (branch.additionalProperties === false) closed = true;
    }
  }

  for (const combiner of ["anyOf", "oneOf"]) {
    if (!Array.isArray(schema[combiner])) continue;
    const branches = schema[combiner].map(normalizeRootSchema).filter(isObjectSchema);
    if (!branches.length) continue;
    let common = null;
    for (const branch of branches) {
      for (const [name, value] of Object.entries(branch.properties || {})) addProperty(properties, name, value, "anyOf");
      const branchRequired = new Set(branch.required || []);
      common = common ? new Set([...common].filter((name) => branchRequired.has(name))) : branchRequired;
    }
    for (const name of common || []) required.add(name);
    if (branches.every((branch) => branch.additionalProperties === false) && base.additionalProperties === undefined) {
      closed = true;
    }
    const shapes = branches.map((branch, index) => {
      const names = (branch.required || []).join(", ") || "no required fields";
      return `(${index + 1}) ${branch.title || branch.description || names}`;
    });
    notes.push(`Provide exactly ${combiner === "oneOf" ? "one" : "at least one"} of these argument shapes: ${shapes.join("; ")}.`);
  }

  const result = { ...base, type: "object", properties };
  if (required.size) result.required = [...required];
  else delete result.required;
  if (closed) result.additionalProperties = false;
  if (notes.length) {
    result.description = [base.description, ...notes].filter(Boolean).join("\n");
  }
  return result;
}

function fixSchema(container, key, name, changed) {
  const schema = container?.[key];
  if (!hasRootCombiner(schema)) return container;
  changed.push(name || "(unnamed)");
  return { ...container, [key]: normalizeRootSchema(schema) };
}

function fixTool(tool, format, changed) {
  if (!isObject(tool)) return tool;
  if (format === "messages") return fixSchema(tool, "input_schema", tool.name, changed);
  if (format === "chat") {
    if (!isObject(tool.function)) return tool;
    const fn = fixSchema(tool.function, "parameters", tool.function.name, changed);
    return fn === tool.function ? tool : { ...tool, function: fn };
  }
  if (tool.type === "namespace" && Array.isArray(tool.tools)) {
    const inner = tool.tools.map((entry) => fixTool(entry, format, changed));
    return inner.some((entry, index) => entry !== tool.tools[index]) ? { ...tool, tools: inner } : tool;
  }
  return fixSchema(tool, "parameters", tool.name, changed);
}

// format: "responses" (tools[].parameters), "chat" (tools[].function.parameters),
// "messages" (tools[].input_schema). Never mutates the input payload.
export function sanitizeToolSchemas(payload, format = "responses") {
  if (!isObject(payload) || !Array.isArray(payload.tools)) return { payload, changed: [] };
  const changed = [];
  const tools = payload.tools.map((tool) => fixTool(tool, format, changed));
  if (!changed.length) return { payload, changed };
  return { payload: { ...payload, tools }, changed };
}
