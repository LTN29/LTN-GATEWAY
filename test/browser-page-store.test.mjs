import test from "node:test";
import assert from "node:assert/strict";
import {
  browserPageScope,
  clearBrowserPages,
  getBrowserPage,
  storeBrowserPage
} from "../src/browser-page-store.mjs";

test("browser pages are scoped by principal and client and expire", () => {
  clearBrowserPages();
  const principal = { principalType: "user", principalId: "inventory-user" };
  const first = browserPageScope(principal, "client-a");
  const second = browserPageScope(principal, "client-b");
  storeBrowserPage(first, { url: "https://inventory.simi.vn/inventory", text: "A" }, 60_000);

  assert.equal(getBrowserPage(first).text, "A");
  assert.equal(getBrowserPage(second), null);

  storeBrowserPage(second, { url: "https://inventory.simi.vn/inventory", text: "B" }, -1);
  assert.equal(getBrowserPage(second), null);
  clearBrowserPages();
});
