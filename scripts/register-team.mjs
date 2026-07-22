import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { sha256, safeTeamCode } from "../src/utils.mjs";

const teamsFile = resolve(process.env.TEAMS_FILE || "./config/teams.json");
const rl = createInterface({ input, output });

try {
  const code = safeTeamCode(
    process.argv[2] || await rl.question("Team code, ví dụ WARRANTY: ")
  );
  const displayName =
    process.argv[3] || await rl.question(`Tên hiển thị [${code}]: `) || code;

  output.write("Dán API key của team rồi Enter: ");
  const key = await new Promise((resolveKey) => {
    let value = "";
    input.setRawMode?.(true);
    input.resume();

    const onData = (chunk) => {
      const char = chunk.toString("utf8");

      if (char === "\r" || char === "\n") {
        input.off("data", onData);
        input.setRawMode?.(false);
        output.write("\n");
        resolveKey(value);
      } else if (char === "\u0003") {
        process.exit(130);
      } else if (char === "\u007f") {
        value = value.slice(0, -1);
      } else {
        value += char;
      }
    };

    input.on("data", onData);
  });

  if (key.trim().length < 8) {
    throw new Error("API key quá ngắn");
  }

  await mkdir(resolve("./config"), { recursive: true });

  let config = { teams: [] };
  try {
    config = JSON.parse(await readFile(teamsFile, "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  if (!Array.isArray(config.teams)) config.teams = [];

  const team = {
    code,
    displayName,
    keyHash: sha256(key.trim()),
    memoryFile: `${code}.md`,
    enabled: true
  };

  const index = config.teams.findIndex((item) =>
    String(item.code || "").toUpperCase() === code
  );

  if (index >= 0) {
    config.teams[index] = team;
  } else {
    config.teams.push(team);
  }

  await writeFile(teamsFile, JSON.stringify(config, null, 2) + "\n", "utf8");
  output.write(`Đã đăng ký ${code} vào ${teamsFile}\n`);
  output.write("Gateway chỉ lưu SHA-256, không lưu API key thật.\n");
} finally {
  rl.close();
}
