const status = document.getElementById("status");

chrome.storage.local.get(["bridgeToken", "lastStatus"]).then((state) => {
  status.textContent = state.bridgeToken
    ? (state.lastStatus || "Đã cấu hình; đang chờ Codex yêu cầu.")
    : "Chưa cấu hình token. Mở Options của extension.";
});

document.getElementById("poll").addEventListener("click", () => {
  status.textContent = "Đang kiểm tra…";
  chrome.runtime.sendMessage({ type: "poll-now" }).then((result) => {
    status.textContent = result?.ok ? "Đã kiểm tra." : (result?.error || "Bridge thất bại.");
  });
});
