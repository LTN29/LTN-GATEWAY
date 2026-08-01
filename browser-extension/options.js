const token = document.getElementById("token");
const status = document.getElementById("status");

chrome.storage.local.get(["bridgeToken"]).then((state) => {
  token.value = state.bridgeToken || "";
});

document.getElementById("save").addEventListener("click", async () => {
  const value = token.value.trim();
  if (!value) {
    status.textContent = "Token không được để trống.";
    return;
  }
  await chrome.storage.local.set({ bridgeToken: value });
  status.textContent = "Đã lưu.";
});
