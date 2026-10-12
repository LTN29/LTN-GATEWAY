import { readFile, writeFile, mkdir, copyFile, access } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

export async function prepareComboApi(repo) {
  const proxyPath = join(resolve(repo), "src", "proxy.js");
  const proxy = await readFile(proxyPath, "utf8");
  const marker = "// LTN internal combo reader: route performs token and trusted-peer checks.";
  const anchor = "export default async function proxy(request) {";
  if (!proxy.includes(anchor) || !proxy.includes("return dashboardProxy(request);") || !proxy.includes('"./dashboardGuard"')) {
    throw new Error("Unsupported 9Router proxy.js; expected v0.5.95 source. No files changed.");
  }
  const assets = [
    ["../integrations/9router/internal-combos.mjs", join(resolve(repo), "src/lib/ltnInternalCombos.mjs")],
    ["../integrations/9router/route.js", join(resolve(repo), "src/app/api/internal/ltn-combos/route.js")]
  ];
  const contents = await Promise.all(assets.map(async ([source, target]) => {
    const content = await readFile(new URL(source, import.meta.url), "utf8");
    try {
      const existing = await readFile(target, "utf8");
      if (existing !== content) throw new Error(`Existing custom file differs: ${target}. No files changed.`);
    } catch (error) { if (error.code !== "ENOENT") throw error; }
    return { target, content };
  }));
  if (!proxy.includes(marker)) {
    const backup = `${proxyPath}.ltn-backup`;
    try { await access(backup); throw new Error("Proxy backup already exists; review it before patching."); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
    await copyFile(proxyPath, backup);
    const branch = `${anchor}\n  ${marker}\n  if (request.nextUrl.pathname === "/api/internal/ltn-combos") return NextResponse.next();`;
    const patched = (proxy.includes('import { NextResponse } from "next/server";') ? "" : 'import { NextResponse } from "next/server";\n') + proxy.replace(anchor, branch);
    await writeFile(proxyPath, patched, "utf8");
  }
  for (const { target, content } of contents) {
    await mkdir(resolve(target, ".."), { recursive: true });
    await writeFile(target, content, "utf8");
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const repo = process.argv[2];
  if (!repo) throw new Error("Usage: node scripts/prepare-9router-combo-api.mjs <9router-source-directory>");
  await prepareComboApi(repo);
  console.log("Prepared read-only Combo API. Rebuild 9Router; existing container is unchanged.");
}
