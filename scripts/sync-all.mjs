import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { config } from "../src/config.mjs";
import { syncMemoryFile } from "../src/onedrive.mjs";

const files = (await readdir(config.memoryDir))
  .filter((name) => name.toLowerCase().endsWith(".md"));

for (const filename of files) {
  const content = await readFile(resolve(config.memoryDir, filename), "utf8");
  await syncMemoryFile(filename, content);
  console.log(`Synced: ${filename}`);
}
