import { createHash } from "node:crypto";

// Codex sends MCP tools grouped as {type:"namespace", tools:[...]}. 9Router does
// not understand that type and lets the model call the namespace name itself,
// which Codex rejects as "unsupported call". Flatten the groups into ordinary
// function tools for upstream and restore {namespace, name} on the way back.

const MAX_NAME = 64;

function flatName(namespace, name, used) {
  let candidate = `${namespace}__${name}`.replace(/[^a-zA-Z0-9_-]/g, "_");
  if (candidate.length > MAX_NAME || used.has(candidate)) {
    const hash = createHash("sha256").update(`${namespace}\u0000${name}`).digest("hex").slice(0, 10);
    candidate = `${candidate.slice(0, MAX_NAME - 11)}_${hash}`;
  }
  used.add(candidate);
  return candidate;
}

export function flattenNamespaceTools(payload) {
  if (!payload || !Array.isArray(payload.tools) ||
      !payload.tools.some((tool) => tool?.type === "namespace" && Array.isArray(tool.tools))) {
    return { payload, toolMap: null };
  }
  const used = new Set(payload.tools.filter((tool) => tool?.type === "function").map((tool) => tool.name));
  const toFlat = new Map();
  const fromFlat = new Map();
  const tools = [];
  for (const tool of payload.tools) {
    if (tool?.type !== "namespace" || !Array.isArray(tool.tools)) {
      tools.push(tool);
      continue;
    }
    for (const inner of tool.tools) {
      if (inner?.type !== "function" || !inner.name) continue;
      const name = flatName(tool.name, inner.name, used);
      toFlat.set(`${tool.name}\u0000${inner.name}`, name);
      fromFlat.set(name, { namespace: tool.name, name: inner.name });
      const description = [tool.description, inner.description].filter(Boolean).join("\n\n");
      tools.push({ ...inner, name, ...(description ? { description } : {}) });
    }
  }

  const flattenItem = (item) => {
    if (!item || typeof item !== "object" || !item.namespace) return item;
    const name = toFlat.get(`${item.namespace}\u0000${item.name}`);
    if (!name) return item;
    const { namespace, ...rest } = item;
    return { ...rest, name };
  };

  const next = { ...payload, tools };
  if (Array.isArray(payload.input)) next.input = payload.input.map(flattenItem);
  if (payload.tool_choice && typeof payload.tool_choice === "object" && payload.tool_choice.namespace) {
    next.tool_choice = flattenItem(payload.tool_choice);
  }
  return { payload: next, toolMap: fromFlat };
}

export function restoreNamespaceCalls(value, toolMap) {
  if (!toolMap || !value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((entry) => restoreNamespaceCalls(entry, toolMap));
  let result = value;
  if (value.type === "function_call" && typeof value.name === "string" && toolMap.has(value.name)) {
    const original = toolMap.get(value.name);
    result = { ...value, name: original.name, namespace: original.namespace };
  }
  for (const [key, child] of Object.entries(result)) {
    if (!child || typeof child !== "object") continue;
    const restored = restoreNamespaceCalls(child, toolMap);
    if (restored === child) continue;
    if (result === value) result = { ...value };
    result[key] = restored;
  }
  return result;
}

function restoreEventBlock(block, toolMap) {
  return block.split(/\r?\n/).map((line) => {
    if (!line.startsWith("data:")) return line;
    const raw = line.slice(5).trimStart();
    if (!raw || raw === "[DONE]") return line;
    try {
      return `data: ${JSON.stringify(restoreNamespaceCalls(JSON.parse(raw), toolMap))}`;
    } catch {
      return line;
    }
  }).join("\n");
}

// Rewrites a server-sent-event stream one complete event at a time.
export function createSseNamespaceRestorer(toolMap) {
  let buffer = "";
  return {
    push(text) {
      buffer += text;
      let output = "";
      let match;
      const boundary = /\r?\n\r?\n/g;
      let last = 0;
      while ((match = boundary.exec(buffer))) {
        output += restoreEventBlock(buffer.slice(last, match.index), toolMap) + "\n\n";
        last = match.index + match[0].length;
      }
      buffer = buffer.slice(last);
      return output;
    },
    flush() {
      const rest = buffer;
      buffer = "";
      return rest ? restoreEventBlock(rest, toolMap) : "";
    }
  };
}
