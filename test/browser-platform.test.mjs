import test from "node:test";
import assert from "node:assert/strict";
import { browserLaunchArgs, findBrowserExecutable, isHeadlessBrowserSession, resolveBrowserProfile } from "../scripts/browser-cdp.mjs";

const existsIn = (paths) => (path) => paths.includes(path);
const identity = (path) => path;

test("Windows prefers Chrome, then falls back to Edge", () => {
  const env = { PROGRAMFILES: "C:\\Program Files", LOCALAPPDATA: "C:\\Users\\a\\AppData\\Local" };
  const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const edge = "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe";
  assert.equal(findBrowserExecutable({ platform: "win32", env, exists: existsIn([chrome, edge]), realpath: identity }).path, chrome);
  assert.equal(findBrowserExecutable({ platform: "win32", env, exists: existsIn([edge]), realpath: identity }).path, edge);
  assert.equal(resolveBrowserProfile({ platform: "win32", env: { USERPROFILE: "C:\\Users\\a" }, home: "C:\\Users\\a" }), "C:\\Users\\a\\.codex\\chrome-profile");
});

test("macOS finds browsers in system and user Applications folders", () => {
  const userEdge = "/Users/a/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge";
  const found = findBrowserExecutable({ platform: "darwin", env: {}, home: "/Users/a", exists: existsIn([userEdge]), realpath: identity });
  assert.equal(found.path, userEdge);
  assert.equal(found.kind, "native");
  assert.equal(resolveBrowserProfile({ browser: found, platform: "darwin", env: {}, home: "/Users/a" }), "/Users/a/.codex/chrome-profile");
});

test("Ubuntu prefers native Chrome over snap Chromium", () => {
  const env = { PATH: "/usr/local/bin:/usr/bin" };
  const found = findBrowserExecutable({ platform: "linux", env, home: "/home/a",
    exists: existsIn(["/usr/bin/google-chrome-stable", "/snap/bin/chromium"]), realpath: identity });
  assert.equal(found.path, "/usr/bin/google-chrome-stable");
  assert.equal(found.kind, "native");
});

test("Ubuntu snap Chromium gets a profile inside its snap sandbox", () => {
  const env = { PATH: "/usr/bin" };
  const found = findBrowserExecutable({ platform: "linux", env, home: "/home/a",
    exists: existsIn(["/usr/bin/chromium-browser", "/snap/chromium/current"]), realpath: () => "/usr/bin/snap" });
  assert.equal(found.kind, "snap");
  assert.equal(resolveBrowserProfile({ browser: found, platform: "linux", env: {}, home: "/home/a" }),
    "/home/a/snap/chromium/common/simi-chrome-profile");
  const direct = findBrowserExecutable({ platform: "linux", env: { PATH: "" }, home: "/home/a",
    exists: existsIn(["/snap/bin/chromium"]), realpath: identity });
  assert.equal(direct.kind, "snap");
  assert.equal(direct.snapName, "chromium");
});

test("explicit profile and browser overrides win on every OS", () => {
  const env = { LTN_CHROME_BIN: "/opt/custom/chrome", LTN_CHROME_DEBUG_USER_DATA_DIR: "/data/profile" };
  const found = findBrowserExecutable({ platform: "linux", env, exists: () => false, realpath: identity });
  assert.equal(found.path, "/opt/custom/chrome");
  assert.equal(resolveBrowserProfile({ browser: found, platform: "linux", env }), "/data/profile");
});

test("launch arguments: Wayland hint, root sandbox, headless servers", () => {
  const wayland = browserLaunchArgs({ platform: "linux", profile: "/p", env: { WAYLAND_DISPLAY: "wayland-0" }, isRoot: false });
  assert.ok(wayland.includes("--ozone-platform-hint=auto"));
  assert.ok(!wayland.includes("--headless=new"));
  const server = browserLaunchArgs({ platform: "linux", profile: "/p", env: {}, isRoot: true, url: "https://example.com" });
  assert.ok(server.includes("--headless=new"));
  assert.ok(server.includes("--no-sandbox"));
  assert.equal(server.at(-1), "https://example.com");
  const mac = browserLaunchArgs({ platform: "darwin", profile: "/p", env: {}, isRoot: false });
  assert.ok(!mac.includes("--headless=new") && !mac.includes("--no-sandbox"));
  assert.equal(isHeadlessBrowserSession({ platform: "win32", env: {} }), false);
  assert.equal(isHeadlessBrowserSession({ platform: "linux", env: { DISPLAY: ":0" } }), false);
  assert.ok(browserLaunchArgs({ platform: "win32", profile: "C:\\p", env: {} }).includes("--remote-debugging-address=127.0.0.1"));
});
