const url = process.env.NINEROUTER_COMBO_API_URL;
const token = process.env.NINEROUTER_COMBO_API_TOKEN || "";
let target;
try { target = new URL(url); } catch { /* Report a safe message below. */ }
if (!target || target.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(target.hostname) ||
    target.pathname !== "/api/internal/ltn-combos" || target.username || target.password || target.search || target.hash ||
    !/^[A-Za-z0-9_-]{32,256}$/.test(token)) {
  console.error("Invalid loopback Combo API URL or server token configuration.");
  process.exitCode = 1;
} else {
  try {
    const response = await fetch(target, { headers: { authorization: `Bearer ${token}` }, redirect: "manual", signal: AbortSignal.timeout(5000) });
    console.log(`HTTP ${response.status}`);
    if (!response.ok) process.exitCode = 1;
    else {
      const payload = await response.json();
      if (!Array.isArray(payload.combos)) throw new Error();
      console.log(JSON.stringify(payload.combos.map(({ name, models }) => ({ name, models })), null, 2));
    }
  } catch {
    console.error("Cannot read internal Combo API: network, timeout or invalid response.");
    process.exitCode = 1;
  }
}
