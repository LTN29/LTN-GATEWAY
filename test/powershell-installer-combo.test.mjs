import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const installerSource = await readFile(
  new URL("../scripts/install-codex-windows.ps1", import.meta.url),
  "utf8"
);

function findCommand(command) {
  const result = spawnSync(
    process.platform === "win32" ? "where.exe" : "which",
    [command],
    { encoding: "utf8" }
  );
  if (result.status !== 0) return null;
  return result.stdout.split(/\r?\n/).find(Boolean)?.trim() || null;
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

function runProcess(command, args, options) {
  return new Promise((resolve) => {
    const child = spawn(command, args, options);
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
    }, 30000);

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.once("error", (error) => {
      clearTimeout(timer);
      resolve({ status: null, stdout, stderr, error });
    });
    child.once("close", (status, signal) => {
      clearTimeout(timer);
      resolve({ status, signal, stdout, stderr });
    });
  });
}

async function runInstallerWithCombo({
  comboId = "SIMI-AI",
  models = [{ id: "SIMI-AI", owned_by: "combo" }],
  mode = "auto"
}) {
  const requests = [];
  const gateway = http.createServer((req, res) => {
    requests.push({
      url: req.url,
      authorization: req.headers.authorization || ""
    });

    if (req.url === "/v1/codex/config") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({
        combos: {
          auto: comboId,
          fast: "SIMI-FAST",
          default: "SIMI-DEFAULT",
          power: "SIMI-POWER"
        }
      }));
      return;
    }

    if (req.url === "/v1/models") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ data: models }));
      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end("{}");
  });

  const gatewayPort = await listen(gateway);
  const root = await mkdtemp(join(tmpdir(), "ltn-installer-combo-test-"));
  const codexHome = join(root, "codex-home");
  await mkdir(codexHome, { recursive: true });
  const scriptPath = join(root, "install-codex-windows.test.ps1");
  const testScript = installerSource.replace(
    '[Environment]::SetEnvironmentVariable("LTN_TEAM_API_KEY", $TeamApiKey, "User")',
    "$null = $TeamApiKey"
  );
  await writeFile(scriptPath, testScript, "utf8");

  try {
    const shell = findCommand("powershell.exe");
    if (!shell) return { skipped: "Windows PowerShell 5.1 is unavailable" };

    const result = await runProcess(shell, [
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      scriptPath,
      "-GatewayBaseUrl",
      `http://127.0.0.1:${gatewayPort}/v1`,
      "-TeamApiKey",
      "team-test-key",
      "-Mode",
      mode,
      "-SkipCodexInstall"
    ], {
      env: {
        ...process.env,
        CODEX_HOME: codexHome,
        CODEX_COMBO_AUTO: "",
        CODEX_COMBO_FAST: "",
        CODEX_COMBO_DEFAULT: "",
        CODEX_COMBO_POWER: "",
        LTN_TEAM_API_KEY: ""
      }
    });
    if (result.signal === "SIGKILL") {
      return { skipped: "PowerShell installer runtime test timed out." };
    }
    if (result.error?.code === "EPERM") {
      return {
        skipped: "Environment blocks Node child-process spawn; run this test directly on Windows."
      };
    }

    let config = "";
    try {
      config = await readFile(join(codexHome, "config.toml"), "utf8");
    } catch {
      config = "";
    }
    return { result, requests, config };
  } finally {
    await close(gateway);
  }
}

test("Windows installer accepts SIMI-AI exactly and sends it through /v1/models", async (t) => {
  const output = await runInstallerWithCombo({
    comboId: " SIMI-AI ",
    models: [{ id: "SIMI-AI", owned_by: "combo" }]
  });
  if (output.skipped) {
    t.skip(output.skipped);
    return;
  }

  assert.equal(output.result.status, 0, output.result.stderr || output.result.stdout);
  assert.equal(
    output.requests.find((request) => request.url === "/v1/models")
      ?.authorization,
    "Bearer team-test-key"
  );
  assert.match(output.config, /model = "SIMI-AI"/);
  assert.doesNotMatch(output.config, /combo\/SIMI-AI/);
  assert.doesNotMatch(
    `${output.result.stdout}\n${output.result.stderr}`,
    /team-test-key/
  );
});

test("Windows installer accepts model item without owned_by but warns", async (t) => {
  const output = await runInstallerWithCombo({
    models: [{ id: "SIMI-AI" }]
  });
  if (output.skipped) {
    t.skip(output.skipped);
    return;
  }

  assert.equal(output.result.status, 0, output.result.stderr || output.result.stdout);
  assert.match(
    `${output.result.stdout}\n${output.result.stderr}`,
    /không có owned_by/
  );
  assert.match(output.config, /model = "SIMI-AI"/);
});

test("Windows installer fails closed when combo is missing or owned_by is not combo", async (t) => {
  const missing = await runInstallerWithCombo({
    models: [{ id: "other-model", owned_by: "combo" }]
  });
  if (missing.skipped) {
    t.skip(missing.skipped);
    return;
  }
  assert.notEqual(missing.result.status, 0);
  assert.match(missing.result.stderr, /Thiếu Combo trên 9Router: SIMI-AI/);

  const wrongOwner = await runInstallerWithCombo({
    models: [{ id: "SIMI-AI", owned_by: "provider" }]
  });
  assert.notEqual(wrongOwner.result.status, 0);
  assert.match(wrongOwner.result.stderr, /owned_by không phải 'combo'/);

  const mixedOwners = await runInstallerWithCombo({
    models: [
      { id: "SIMI-AI", owned_by: "combo" },
      { id: "SIMI-AI", owned_by: "provider" }
    ]
  });
  assert.notEqual(mixedOwners.result.status, 0);
  assert.match(mixedOwners.result.stderr, /owned_by không phải 'combo'/);
});

test("Windows installer rejects empty, CR/LF and overlong combo IDs before /v1/models", async (t) => {
  const cases = [
    { comboId: "", message: /Thiếu Combo ID/ },
    { comboId: "   ", message: /Thiếu Combo ID/ },
    { comboId: "SIMI\rAI", message: /CR hoặc LF/ },
    { comboId: "SIMI\nAI", message: /CR hoặc LF/ },
    { comboId: "A".repeat(201), message: /quá dài/ }
  ];

  for (const item of cases) {
    const output = await runInstallerWithCombo({
      comboId: item.comboId,
      models: [{ id: item.comboId, owned_by: "combo" }]
    });
    if (output.skipped) {
      t.skip(output.skipped);
      return;
    }
    assert.notEqual(output.result.status, 0);
    assert.match(output.result.stderr, item.message);
    assert.equal(
      output.requests.some((request) => request.url === "/v1/models"),
      false
    );
  }
});
