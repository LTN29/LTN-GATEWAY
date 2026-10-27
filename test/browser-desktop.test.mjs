import test from "node:test";
import assert from "node:assert/strict";
import { browserLaunchArgs, isHeadlessBrowserSession, isHeadlessBrowserVersion, resolveDesktopEnv } from "../scripts/browser-cdp.mjs";

const probe = (files, dirs) => ({
  uid: 1000,
  exists: (path) => files.includes(path),
  readdir: (path) => dirs[path] || []
});

test("Ubuntu: recovers X11 desktop when Codex starts the MCP without DISPLAY", () => {
  const p = probe(["/run/user/1000", "/run/user/1000/bus", "/home/dell/.Xauthority"], { "/tmp/.X11-unix": ["X0"] });
  const env = resolveDesktopEnv({ platform: "linux", env: { HOME: "/home/dell" }, ...p });
  assert.equal(env.DISPLAY, ":0");
  assert.equal(env.XDG_RUNTIME_DIR, "/run/user/1000");
  assert.equal(env.DBUS_SESSION_BUS_ADDRESS, "unix:path=/run/user/1000/bus");
  assert.equal(env.XAUTHORITY, "/home/dell/.Xauthority");
  assert.equal(isHeadlessBrowserSession({ platform: "linux", env: { HOME: "/home/dell" }, ...p }), false);
});

test("Ubuntu: recovers a Wayland session and Xwayland authority", () => {
  const p = probe(["/run/user/1000", "/run/user/1000/.mutter-Xwaylandauth.ABC"],
    { "/run/user/1000": ["wayland-0", "bus", ".mutter-Xwaylandauth.ABC"], "/tmp/.X11-unix": ["X1"] });
  const env = resolveDesktopEnv({ platform: "linux", env: { HOME: "/home/dell" }, ...p });
  assert.equal(env.WAYLAND_DISPLAY, "wayland-0");
  assert.equal(env.DISPLAY, ":1");
  assert.equal(env.XAUTHORITY, "/run/user/1000/.mutter-Xwaylandauth.ABC");
});

test("Ubuntu server without any desktop socket stays headless", () => {
  const p = probe([], {});
  assert.equal(isHeadlessBrowserSession({ platform: "linux", env: {}, ...p }), true);
});

test("existing desktop variables are kept and other OSes are untouched", () => {
  const p = probe([], { "/tmp/.X11-unix": ["X5"] });
  assert.equal(resolveDesktopEnv({ platform: "linux", env: { DISPLAY: ":2" }, ...p }).DISPLAY, ":2");
  assert.deepEqual(resolveDesktopEnv({ platform: "darwin", env: { A: "1" } }), { A: "1" });
  assert.equal(isHeadlessBrowserSession({ platform: "win32", env: {} }), false);
});

test("a headless SIMI Chrome is recognised so it can be reopened visibly", () => {
  assert.equal(isHeadlessBrowserVersion({ Browser: "HeadlessChrome/156.0.8078.48" }), true);
  assert.equal(isHeadlessBrowserVersion({ Browser: "Chrome/156.0.8078.48", "User-Agent": "Mozilla/5.0 Chrome/156" }), false);
});

test("Ubuntu installer forwards desktop session variables to the browser MCP", async () => {
  const { readFile } = await import("node:fs/promises");
  const unix = await readFile(new URL("../scripts/install-codex-unix.sh", import.meta.url), "utf8");
  assert.match(unix, /\[mcp_servers\.simi_browser\][\s\S]*env_vars = \["DISPLAY", "WAYLAND_DISPLAY", "XDG_RUNTIME_DIR", "XAUTHORITY"/);
  const page = await readFile(new URL("../scripts/browser-page.mjs", import.meta.url), "utf8");
  assert.match(page, /closeCdpBrowser/);
  const launcher = await readFile(new URL("../scripts/chrome-debug.mjs", import.meta.url), "utf8");
  assert.match(launcher, /env: resolveDesktopEnv\(\)/);
});
