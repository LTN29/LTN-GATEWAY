importScripts("bridge-config.js");

const BRIDGE_URL = "http://127.0.0.1:20130";

async function getToken() {
  const result = await chrome.storage.local.get(["bridgeToken"]);
  return String(result.bridgeToken || self.SIMI_BRIDGE_TOKEN || "").trim();
}

async function bridgeFetch(path, options = {}) {
  const token = await getToken();
  if (!token) throw new Error("Chưa cấu hình Browser Bridge token.");
  const headers = {
    ...(options.headers || {}),
    authorization: `Bearer ${token}`
  };
  return fetch(`${BRIDGE_URL}${path}`, { ...options, headers });
}

async function captureActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const tab = tabs[0];
  if (!tab?.id || !/^https?:\/\//i.test(String(tab.url || ""))) {
    throw new Error("Tab hiện tại không phải trang HTTP/HTTPS.");
  }

  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      url: location.href,
      title: document.title,
      text: document.body?.innerText || document.documentElement?.innerText || "",
      selectedText: window.getSelection?.()?.toString?.() || ""
    })
  });
  return {
    requestId: null,
    ...result.result,
    capturedAt: new Date().toISOString()
  };
}

async function pollOnce() {
  const response = await bridgeFetch("/v1/bridge/poll");
  if (!response.ok) throw new Error(`Bridge poll thất bại: HTTP ${response.status}`);
  const payload = await response.json();
  if (!payload.pending?.requestId) return { pending: false };

  const page = await captureActiveTab();
  page.requestId = payload.pending.requestId;
  const sent = await bridgeFetch("/v1/bridge/page", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(page)
  });
  if (!sent.ok) throw new Error(`Bridge gửi tab thất bại: HTTP ${sent.status}`);
  await chrome.storage.local.set({ lastStatus: "Đã gửi tab hiện tại tới Gateway.", lastAt: Date.now() });
  return { pending: true };
}

async function safePoll() {
  try {
    await pollOnce();
  } catch (error) {
    await chrome.storage.local.set({ lastStatus: error?.message || "Browser bridge thất bại.", lastAt: Date.now() });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("simi-browser-bridge-poll", { periodInMinutes: 0.5 });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("simi-browser-bridge-poll", { periodInMinutes: 0.5 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "simi-browser-bridge-poll") safePoll();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "poll-now") return false;
  safePoll().then(() => sendResponse({ ok: true })).catch((error) => {
    sendResponse({ ok: false, error: error?.message || "Bridge thất bại." });
  });
  return true;
});
