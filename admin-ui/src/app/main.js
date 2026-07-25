import "./styles.css";

const state = {
  csrfToken: "",
  admin: null,
  toast: "",
  oneTimeKey: null
};

const navItems = [
  { href: "/admin", label: "Tổng quan", permission: "dashboard" },
  { href: "/admin/users", label: "Nhân viên", permission: "users" },
  { href: "/admin/users/import", label: "Import CSV", permission: "usersWrite" },
  { href: "/admin/teams", label: "Bộ phận", permission: "teams" },
  { href: "/admin/usage", label: "Usage", permission: "usage" },
  { href: "/admin/memory/review", label: "Duyệt kiến thức", permission: "memory" },
  { href: "/admin/memory/files", label: "Knowledge Memory", permission: "memory" },
  { href: "/admin/sync", label: "Đồng bộ", permission: "sync" },
  { href: "/admin/system", label: "Hệ thống", permission: "system" },
  { href: "/admin/audit", label: "Audit", permission: "audit" }
];

function hasRole(role) {
  return state.admin?.roles?.includes("SUPER_ADMIN") || state.admin?.roles?.includes(role);
}

function can(permission) {
  if (!state.admin) return false;
  if (hasRole("SUPER_ADMIN")) return true;
  if (permission === "usersWrite") return hasRole("IT_ADMIN");
  if (permission === "sync" || permission === "system" || permission === "audit") return hasRole("IT_ADMIN") || hasRole("AUDITOR");
  return true;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function qs(params) {
  const out = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== "") out.set(key, value);
  }
  const text = out.toString();
  return text ? `?${text}` : "";
}

async function api(path, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init.method && init.method !== "GET" ? 15000 : 8000);
  const headers = new Headers(init.headers || {});
  if (!(init.body instanceof FormData)) headers.set("content-type", "application/json");
  if (state.csrfToken) headers.set("x-ltn-csrf-token", state.csrfToken);
  try {
    const response = await fetch(`/admin/api/v1${path}`, {
      ...init,
      headers,
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal
    });
    if (response.headers.get("content-type")?.includes("text/csv")) return response;
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      const code = payload.error?.code;
      if (response.status === 403) throw new Error("Bạn không có quyền thực hiện thao tác này.");
      if (response.status === 401) throw new Error("Phiên Cloudflare Access không hợp lệ hoặc đã hết hạn.");
      if (response.status === 409) throw new Error("Dữ liệu đã thay đổi hoặc đang bị xử lý bởi người khác.");
      if (response.status === 429) throw new Error("Bạn thao tác quá nhanh. Vui lòng thử lại sau.");
      if (response.status >= 500) throw new Error(`Có lỗi hệ thống. Mã yêu cầu: ${payload.requestId || "unknown"}.`);
      throw new Error(payload.error?.message || code || "Admin API lỗi.");
    }
    return payload.data;
  } finally {
    clearTimeout(timeout);
  }
}

async function refreshCsrf() {
  const data = await api("/csrf");
  state.csrfToken = data.token;
}

function routeTitle() {
  const path = location.pathname;
  if (path.includes("/users/import")) return "Import nhân viên";
  if (path.match(/\/users\/[^/]+$/)) return "Chi tiết nhân viên";
  if (path.includes("/users")) return "Nhân viên";
  if (path.includes("/teams/")) return "Chi tiết bộ phận";
  if (path.includes("/teams")) return "Bộ phận";
  if (path.includes("/usage")) return "Usage analytics";
  if (path.includes("/memory/review")) return "Duyệt kiến thức";
  if (path.includes("/memory/files")) return "Knowledge Memory";
  if (path.includes("/sync")) return "SharePoint sync";
  if (path.includes("/system")) return "Hệ thống";
  if (path.includes("/audit")) return "Audit";
  return "Tổng quan";
}

function shell(content) {
  const nav = navItems.filter((item) => can(item.permission)).map((item) =>
    `<a class="${location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href)) ? "active" : ""}" href="${item.href}">${item.label}</a>`
  ).join("");
  return `
    <div class="shell">
      <aside class="sidebar" aria-label="Điều hướng Admin">
        <div class="brand"><span class="brandMark">S</span><div><strong>SIMI AI</strong><small>LTN Admin Console</small></div></div>
        <nav>${nav}</nav>
      </aside>
      <main class="main">
        <header class="topbar">
          <div><div class="breadcrumb">Admin / ${escapeHtml(routeTitle())}</div><h1>${escapeHtml(routeTitle())}</h1><p>Quản trị user, policy, usage, memory và vận hành Gateway.</p></div>
          <div class="adminBadge">
            <strong>${escapeHtml(state.admin?.email || "Cloudflare Access")}</strong>
            <span>${escapeHtml(state.admin?.roles?.join(", ") || "")}</span>
            <small>Team scope: ${escapeHtml(state.admin?.teamIds?.join(", ") || "Toàn hệ thống")}</small>
          </div>
        </header>
        ${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ""}
        <section class="content">${content}</section>
      </main>
    </div>
    ${state.oneTimeKey ? oneTimeKeyModal() : ""}`;
}

function render(content) {
  document.querySelector("#root").innerHTML = shell(content);
}

function metric(label, value, hint = "") {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>${hint ? `<small>${escapeHtml(hint)}</small>` : ""}</div>`;
}

function table(headers, rows, empty = "Không có dữ liệu.") {
  if (!rows.length) return `<div class="card empty"><h2>Trống</h2><p>${escapeHtml(empty)}</p></div>`;
  return `<div class="tableWrap"><table><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

function button(label, action, danger = false) {
  return `<button class="${danger ? "danger" : ""}" data-action="${escapeHtml(action)}">${escapeHtml(label)}</button>`;
}

function oneTimeKeyModal() {
  return `<div class="modalBackdrop"><div class="modal" role="dialog" aria-modal="true">
    <h2>API key chỉ hiển thị một lần</h2>
    <p>Hãy gửi riêng cho đúng nhân viên. Đóng hộp thoại sẽ xóa key khỏi state trình duyệt.</p>
    <pre>${escapeHtml(state.oneTimeKey)}</pre>
    <div class="actions">${button("Copy", "copy-key")}${button("Đóng và xóa key", "close-key", true)}</div>
  </div></div>`;
}

function teamOptions(teams, selected = "") {
  return (teams.items || []).map((team) => {
    const id = team.teamId || team.code;
    return `<option value="${escapeHtml(id)}" ${selected === id ? "selected" : ""}>${escapeHtml(team.displayName || id)} (${escapeHtml(id)})</option>`;
  }).join("");
}

function csvTemplate(teams) {
  const ids = (teams.items || []).map((team) => team.teamId || team.code);
  const fallback = ids.length ? ids : ["CSKH", "SALES", "MARKETING"];
  return [
    "userId,displayName,teamId,apiKey,policyMode,premiumLimit",
    `nguyen-van-a,Nguyễn Văn A,${fallback[0] || "CSKH"},DAN_API_KEY_9ROUTER_VAO_DAY,inherit,`,
    `tran-thi-b,Trần Thị B,${fallback[1] || fallback[0] || "SALES"},DAN_API_KEY_9ROUTER_VAO_DAY,inherit,`,
    `le-van-c,Lê Văn C,${fallback[2] || fallback[0] || "MARKETING"},DAN_API_KEY_9ROUTER_VAO_DAY,inherit,`
  ].join("\n");
}

function createUserPanel(teams) {
  return can("usersWrite") ? `
    <div class="card createUserCard">
      <div>
        <h2>Tạo user nhanh</h2>
        <p>Tạo user trong 9Router trước, copy API key của user đó rồi dán vào đây. Gateway chỉ lưu hash, không lưu API key gốc.</p>
      </div>
      <div class="formGrid">
        <label>User ID<input id="newUserId" placeholder="vd: ngoc-cskh" /></label>
        <label>Tên hiển thị<input id="newDisplayName" placeholder="vd: Ngọc CSKH" /></label>
        <label>Team<select id="newTeamId">${teamOptions(teams)}</select></label>
        <label>API key 9Router<input id="newApiKey" type="password" autocomplete="off" placeholder="Dán API key của user từ 9Router" /></label>
        <label>Policy<select id="newPolicyMode"><option value="inherit">Kế thừa team</option><option value="limited_daily">Giới hạn hằng ngày</option><option value="premium_always">Luôn Premium</option><option value="free_only">Chỉ Free</option></select></label>
        <label>Premium/ngày<input id="newPremiumLimit" type="number" min="0" max="10000" placeholder="để trống = theo team" /></label>
      </div>
      <div class="actions">${button("Lưu user", "create-user-from-form")}<a class="pill secondary" href="/admin/users/import">Import nhiều user</a></div>
    </div>
  ` : "";
}

function importResultHtml(result) {
  const preview = result.preview || [];
  const errors = result.errors || [];
  if (result.valid) {
    return `<div class="card success compactCard">
      <h2>CSV hợp lệ</h2>
      <p>Sẵn sàng import ${preview.length} user. API key trong CSV chỉ dùng để hash rồi lưu, không được trả lại hoặc ghi log.</p>
      ${table(["Dòng", "User ID", "Tên", "Team", "Policy", "Premium"], preview.slice(0, 30).map((item) => `
        <tr><td>${escapeHtml(item.row)}</td><td>${escapeHtml(item.userId)}</td><td>${escapeHtml(item.displayName)}</td><td>${escapeHtml(item.teamId)}</td><td>${escapeHtml(item.aiPolicy?.mode || "inherit")}</td><td>${escapeHtml(item.aiPolicy?.premiumLimit ?? "")}</td></tr>
      `), "Chưa có dòng preview.")}
    </div>`;
  }
  return `<div class="card error compactCard">
    <h2>CSV chưa hợp lệ</h2>
    <p>Sửa các dòng lỗi bên dưới rồi validate lại. Import là all-or-nothing nên chưa có user nào được tạo.</p>
    ${table(["Dòng", "Lỗi"], errors.map((item) => `<tr><td>${escapeHtml(item.row)}</td><td>${escapeHtml(item.message)}</td></tr>`), "Không có chi tiết lỗi.")}
  </div>`;
}

async function pageDashboard() {
  const [dashboard, timeseries, teams] = await Promise.all([
    api("/dashboard"),
    api("/usage/timeseries"),
    api("/usage/teams")
  ]);
  render(`
    <div class="grid">
      ${metric("Tổng nhân viên", dashboard.usersTotal)}
      ${metric("Đang hoạt động", dashboard.usersEnabled)}
      ${metric("Đã khóa", dashboard.usersDisabled)}
      ${metric("Request", dashboard.usage.requests)}
      ${metric("Premium", dashboard.usage.premium)}
      ${metric("Free", dashboard.usage.free)}
      ${metric("Success rate", `${dashboard.usage.successRate || 0}%`)}
      ${metric("Latency TB", `${dashboard.usage.averageLatencyMs || 0}ms`)}
      ${metric("TEAM pending", dashboard.health.memoryPendingTeam)}
      ${metric("COMPANY pending", dashboard.health.memoryPendingCompany)}
      ${metric("Sync pending", dashboard.health.syncPending)}
      ${metric("Sync failed", dashboard.health.syncFailed)}
    </div>
    <div class="twoCol">
      <div class="card"><h2>Request 7/30 ngày</h2>${miniBars(timeseries.map((x) => ({ label: x.date, value: x.requests })))}</div>
      <div class="card"><h2>Usage theo team</h2>${miniBars((teams.items || []).map((x) => ({ label: x.teamId, value: x.requests })))}</div>
    </div>
    <div class="card"><h2>Trạng thái hệ thống</h2><p>Gateway: ${escapeHtml(dashboard.health.gateway)} · 9Router: ${escapeHtml(dashboard.health.router)} · SharePoint: ${dashboard.health.sharePointConfigured ? "configured" : "off"} · Extractor: ${dashboard.health.memoryExtractionEnabled ? "on" : "off"}</p></div>
  `);
}

function miniBars(items) {
  const max = Math.max(1, ...items.map((item) => Number(item.value || 0)));
  return `<div class="bars">${items.slice(-12).map((item) => `<div><span>${escapeHtml(item.label)}</span><b style="width:${Math.max(4, Number(item.value || 0) / max * 100)}%"></b><em>${escapeHtml(item.value)}</em></div>`).join("")}</div>`;
}

async function pageUsers() {
  const params = new URLSearchParams(location.search);
  const [users, teams] = await Promise.all([api(`/users${location.search}`), api("/teams")]);
  render(`
    ${createUserPanel(teams)}
    <div class="toolbar">
      <input aria-label="Tìm nhân viên" id="search" placeholder="Tìm user hoặc tên" value="${escapeHtml(params.get("search") || "")}" />
      <select id="teamFilter"><option value="">Tất cả team</option>${teamOptions(teams, params.get("teamId") || "")}</select>
      <select id="enabledFilter"><option value="">Tất cả trạng thái</option><option value="true" ${params.get("enabled") === "true" ? "selected" : ""}>Đang hoạt động</option><option value="false" ${params.get("enabled") === "false" ? "selected" : ""}>Đã khóa</option></select>
      ${can("usersWrite") ? `<a class="pill" href="/admin/users/import">Import 30 người</a>` : ""}
    </div>
    ${table(["User ID", "Tên", "Team", "Trạng thái", "Policy", "Premium", "Thao tác"], (users.items || []).map((u) => `
      <tr>
        <td><a href="/admin/users/${encodeURIComponent(u.userId)}">${escapeHtml(u.userId)}</a></td>
        <td>${escapeHtml(u.displayName)}</td>
        <td>${escapeHtml(u.teamId)}</td>
        <td><span class="status">${u.enabled ? "Hoạt động" : "Đã khóa"}</span></td>
        <td>${escapeHtml(u.aiPolicy?.mode || "inherit")}</td>
        <td>${escapeHtml(u.aiPolicy?.premiumLimit ?? "")}</td>
        <td class="actions">${can("usersWrite") ? `${button(u.enabled ? "Disable" : "Enable", `${u.enabled ? "disable" : "enable"}:${u.userId}`, !u.enabled)} ${button("Cập nhật key", `rotate:${u.userId}`, true)}` : ""}</td>
      </tr>`), "Chưa có nhân viên.")}`);
}

async function pageUserDetail(userId) {
  const [user, usage, devices] = await Promise.all([
    api(`/users/${encodeURIComponent(userId)}`),
    api(`/users/${encodeURIComponent(userId)}/usage`),
    api(`/users/${encodeURIComponent(userId)}/devices`)
  ]);
  render(`
    <div class="twoCol">
      <div class="card"><h2>${escapeHtml(user.displayName)}</h2><p>User ID: ${escapeHtml(user.userId)}</p><p>Team: ${escapeHtml(user.teamId)}</p><p>Policy: ${escapeHtml(user.aiPolicy?.mode || "inherit")}</p></div>
      <div class="grid compact">${metric("Request", usage.requests)}${metric("Premium", usage.premium)}${metric("Free", usage.free)}${metric("Devices", usage.devices)}</div>
    </div>
    <div class="card"><h2>Thiết bị</h2>${table(["Hash prefix", "Request", "First seen", "Last seen", "Cảnh báo"], (devices.items || []).map((d) => `<tr><td>${escapeHtml(d.clientIdHashPrefix)}</td><td>${d.requests}</td><td>${escapeHtml(d.firstSeenAt)}</td><td>${escapeHtml(d.lastSeenAt)}</td><td>${escapeHtml(d.warning || "")}</td></tr>`))}</div>
  `);
}

async function pageImport() {
  const teams = await api("/teams");
  render(`<div class="twoCol importLayout">
    <div class="card">
      <h2>Import 30 user bằng CSV</h2>
      <p>Dùng khi cần tạo nhiều nhân viên cùng lúc. Mỗi dòng dùng API key đã tạo sẵn từ 9Router; Gateway chỉ lưu hash.</p>
      <div class="hintBox">
        <strong>Header bắt buộc</strong>
        <code>userId,displayName,teamId,apiKey,policyMode,premiumLimit</code>
      </div>
      <div class="actions">${button("Điền mẫu CSV", "fill-import-template")}${button("Validate", "validate-import")}${button("Commit import", "commit-import", true)}</div>
      <textarea id="csvInput" rows="14" spellcheck="false" placeholder="${escapeHtml(csvTemplate(teams))}"></textarea>
      <div id="importResult"></div>
    </div>
    <div class="card">
      <h2>Team đang có</h2>
      <p>Copy đúng Team ID vào cột <code>teamId</code>. Không cần API key ở team.</p>
      ${table(["Team ID", "Tên", "Policy", "Premium"], (teams.items || []).map((team) => `<tr><td>${escapeHtml(team.teamId)}</td><td>${escapeHtml(team.displayName)}</td><td>${escapeHtml(team.aiPolicy?.mode || "inherit")}</td><td>${escapeHtml(team.aiPolicy?.premiumLimit ?? "")}</td></tr>`), "Chưa có team.")}
    </div>
  </div>`);
}

async function pageTeams() {
  const teams = await api("/teams");
  render(table(["Team", "Tên", "Trạng thái", "User", "Policy", "Premium"], (teams.items || []).map((t) => `<tr><td><a href="/admin/teams/${encodeURIComponent(t.teamId)}">${escapeHtml(t.teamId)}</a></td><td>${escapeHtml(t.displayName)}</td><td>${t.enabled ? "Enabled" : "Disabled"}</td><td>${t.memberCount}</td><td>${escapeHtml(t.aiPolicy?.mode || "inherit")}</td><td>${escapeHtml(t.aiPolicy?.premiumLimit ?? "")}</td></tr>`)));
}

async function pageTeamDetail(teamId) {
  const [team, users, usage] = await Promise.all([api(`/teams/${teamId}`), api(`/teams/${teamId}/users`), api(`/teams/${teamId}/usage`)]);
  render(`<div class="card"><h2>${escapeHtml(team.displayName)}</h2><p>${escapeHtml(team.teamId)} · ${team.enabled ? "Enabled" : "Disabled"}</p><p>Policy: ${escapeHtml(team.aiPolicy?.mode || "inherit")}</p></div><div class="grid compact">${metric("Members", team.memberCount)}${metric("Request", usage.requests)}${metric("Premium", usage.premium)}${metric("Free", usage.free)}</div>${table(["User", "Tên", "Trạng thái"], (users.items || []).map((u) => `<tr><td>${escapeHtml(u.userId)}</td><td>${escapeHtml(u.displayName)}</td><td>${u.enabled ? "Enabled" : "Disabled"}</td></tr>`))}`);
}

async function pageUsage() {
  const [summary, users, teams, devices] = await Promise.all([api(`/usage/summary${location.search}`), api(`/usage/users${location.search}`), api(`/usage/teams${location.search}`), api(`/usage/devices${location.search}`)]);
  render(`<div class="grid">${metric("Request", summary.requests)}${metric("Premium", summary.premium)}${metric("Free", summary.free)}${metric("Token", summary.totalTokens)}${metric("Success rate", `${summary.successRate || 0}%`)}${metric("Latency", `${summary.averageLatencyMs || 0}ms`)}${metric("Active devices", summary.devices)}${metric("Errors", summary.errors)}</div><div class="card"><h2>Top users</h2>${table(["User", "Team", "Request", "Premium", "Free", "Errors", "Devices", "Last used"], (users.items || []).map((u) => `<tr><td>${escapeHtml(u.userId)}</td><td>${escapeHtml(u.teamId)}</td><td>${u.requests}</td><td>${u.premium}</td><td>${u.free}</td><td>${u.errors}</td><td>${u.devices}</td><td>${escapeHtml(u.lastUsedAt || "")}</td></tr>`))}</div><div class="twoCol"><div class="card"><h2>Team</h2>${miniBars((teams.items || []).map((t) => ({ label: t.teamId, value: t.requests })))}</div><div class="card"><h2>Thiết bị</h2>${table(["User", "Hash", "Request", "Cảnh báo"], (devices.items || []).map((d) => `<tr><td>${escapeHtml(d.userId)}</td><td>${escapeHtml(d.clientIdHashPrefix)}</td><td>${d.requests}</td><td>${escapeHtml(d.warning || "")}</td></tr>`))}</div></div>`);
}

async function pageReview() {
  const status = new URLSearchParams(location.search).get("status") || "pending";
  const data = await api(`/memory/review${qs({ status })}`);
  render(`<div class="toolbar"><a class="pill" href="/admin/memory/review?status=pending">Pending</a><a class="pill" href="/admin/memory/review?status=approved">Approved</a><a class="pill" href="/admin/memory/review?status=rejected">Rejected</a></div>${table(["Scope", "Team", "Key", "Summary", "Confidence", "Action"], (data.items || []).map((c) => `<tr><td>${escapeHtml(c.scope)}</td><td>${escapeHtml(c.sourceTeamId || "")}</td><td>${escapeHtml(c.normalizedKey)}</td><td>${escapeHtml(c.summary)}</td><td>${escapeHtml(c.confidence)}</td><td class="actions">${status === "pending" ? `${button("Approve", `approve:${c.id}`)} ${button("Reject", `reject:${c.id}`, true)}` : ""}</td></tr>`), "Không có candidate.")}`);
}

async function pageMemoryFiles() {
  const data = await api("/memory/files");
  render(table(["File", "Scope", "Team", "Size", "Versions", "Updated"], (data.items || []).map((f) => `<tr><td><a href="/admin/memory/files/${encodeURIComponent(f.fileId)}">${escapeHtml(f.path)}</a></td><td>${escapeHtml(f.scope)}</td><td>${escapeHtml(f.teamId || "")}</td><td>${f.size}</td><td>${f.versionCount}</td><td>${escapeHtml(f.updatedAt || "")}</td></tr>`), "Chưa có memory file."));
}

async function pageMemoryFile(fileId) {
  const [file, versions] = await Promise.all([api(`/memory/files/${encodeURIComponent(fileId)}`), api(`/memory/files/${encodeURIComponent(fileId)}/versions`)]);
  render(`<div class="card"><h2>${escapeHtml(file.path)}</h2><p>Hash: ${escapeHtml(file.contentHash)}</p><pre>${escapeHtml(file.content)}</pre></div><div class="card"><h2>Versions</h2>${table(["Version", "Action"], (versions.items || []).map((v) => `<tr><td>${escapeHtml(v.versionId)}</td><td>${button("Rollback", `rollback:${fileId}:${v.versionId}`, true)}</td></tr>`), "Chưa có backup.")}</div>`);
}

async function pageSync() {
  const data = await api("/sync");
  render(`<div class="actions">${button("Retry all", "retry-all-sync")}</div>${table(["Local", "Remote", "Status", "Attempts", "Next", "Error", "Action"], (data.items || []).map((s) => `<tr><td>${escapeHtml(s.localPath)}</td><td>${escapeHtml(s.remotePath)}</td><td>${escapeHtml(s.status)}</td><td>${s.attempts}</td><td>${escapeHtml(s.nextAttemptAt || "")}</td><td>${escapeHtml(s.lastErrorCode || "")}</td><td>${button("Retry", `retry-sync:${s.id}`)}</td></tr>`), "Sync outbox trống.")}`);
}

async function pageSystem() {
  const [health, cfg] = await Promise.all([api("/system/health"), api("/system/config-summary")]);
  render(`<div class="grid">${metric("Gateway", health.gateway)}${metric("9Router", health.router)}${metric("Uptime", `${health.uptimeSeconds}s`)}${metric("Node", health.nodeVersion)}${metric("Sync pending", health.syncPending)}${metric("Sync failed", health.syncFailed)}${metric("Disk data", health.diskBytes)}${metric("Admin UI", cfg.adminUiEnabled ? "Enabled" : "Disabled")}</div><div class="card"><h2>Config an toàn</h2><p>Allowed hosts: ${escapeHtml((cfg.allowedHosts || []).join(", "))}</p><p>SharePoint mode: ${escapeHtml(cfg.sharePointMode)}</p></div>`);
}

async function pageAudit() {
  const data = await api(`/audit${location.search}`);
  render(table(["Time", "Admin", "Action", "Target", "Team", "Result", "Request"], (data.items || []).map((a) => `<tr><td>${escapeHtml(a.timestamp)}</td><td>${escapeHtml(a.adminEmail)}</td><td>${escapeHtml(a.action)}</td><td>${escapeHtml(a.targetType)}:${escapeHtml(a.targetId)}</td><td>${escapeHtml(a.teamId || "")}</td><td>${escapeHtml(a.result)}</td><td>${escapeHtml(a.requestId)}</td></tr>`), "Chưa có audit."));
}

async function route() {
  try {
    state.admin = (await api("/me")).admin;
    await refreshCsrf();
    const path = location.pathname;
    if (path === "/admin") await pageDashboard();
    else if (path === "/admin/users") await pageUsers();
    else if (path === "/admin/users/import") await pageImport();
    else if (path.match(/^\/admin\/users\/[^/]+$/)) await pageUserDetail(decodeURIComponent(path.split("/").at(-1)));
    else if (path === "/admin/teams") await pageTeams();
    else if (path.match(/^\/admin\/teams\/[^/]+$/)) await pageTeamDetail(decodeURIComponent(path.split("/").at(-1)));
    else if (path === "/admin/usage") await pageUsage();
    else if (path === "/admin/memory/review") await pageReview();
    else if (path === "/admin/memory/files") await pageMemoryFiles();
    else if (path.match(/^\/admin\/memory\/files\/[^/]+$/)) await pageMemoryFile(decodeURIComponent(path.split("/").at(-1)));
    else if (path === "/admin/sync") await pageSync();
    else if (path === "/admin/system") await pageSystem();
    else if (path === "/admin/audit") await pageAudit();
    else render(`<div class="card error"><h2>Không tìm thấy trang</h2><p>Route này chưa được cấu hình.</p></div>`);
  } catch (error) {
    document.querySelector("#root").innerHTML = `<main class="standaloneError"><h1>Không truy cập được Admin Console</h1><p>${escapeHtml(error.message)}</p><p>Kiểm tra Cloudflare Access, admins.json, hostname và quyền RBAC.</p></main>`;
  }
}

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target?.id === "teamFilter" || target?.id === "enabledFilter") {
    const search = document.querySelector("#search")?.value || "";
    const teamId = document.querySelector("#teamFilter")?.value || "";
    const enabled = document.querySelector("#enabledFilter")?.value || "";
    history.pushState(null, "", `/admin/users${qs({ search, teamId, enabled })}`);
    route();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.target?.id !== "search") return;
  const search = document.querySelector("#search")?.value || "";
  const teamId = document.querySelector("#teamFilter")?.value || "";
  const enabled = document.querySelector("#enabledFilter")?.value || "";
  history.pushState(null, "", `/admin/users${qs({ search, teamId, enabled })}`);
  route();
});

document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  try {
    if (action === "copy-key" && state.oneTimeKey) await navigator.clipboard.writeText(state.oneTimeKey);
    else if (action === "close-key") state.oneTimeKey = null;
    else if (action === "create-user-from-form") {
      const userId = document.querySelector("#newUserId")?.value.trim();
      const displayName = document.querySelector("#newDisplayName")?.value.trim();
      const teamId = document.querySelector("#newTeamId")?.value.trim();
      const apiKey = document.querySelector("#newApiKey")?.value.trim();
      const policyMode = document.querySelector("#newPolicyMode")?.value || "inherit";
      const premiumLimit = document.querySelector("#newPremiumLimit")?.value.trim();
      if (!userId || !displayName || !teamId || !apiKey) throw new Error("Vui lòng nhập User ID, tên hiển thị, team và API key 9Router.");
      const aiPolicy = { mode: policyMode };
      if (premiumLimit !== "") aiPolicy.premiumLimit = Number(premiumLimit);
      await api("/users", { method: "POST", body: JSON.stringify({ userId, displayName, teamId, apiKey, aiPolicy }) });
    } else if (action.startsWith("rotate:")) {
      const userId = action.split(":")[1];
      const apiKey = prompt(`Dán API key 9Router mới cho ${userId}`);
      if (apiKey && confirm(`Cập nhật key hash cho ${userId}? Key cũ trong Gateway sẽ mất hiệu lực.`)) {
        await api(`/users/${encodeURIComponent(userId)}/rotate-key`, { method: "POST", body: JSON.stringify({ apiKey }) });
      }
    } else if (action.startsWith("disable:") || action.startsWith("enable:")) {
      const [mode, userId] = action.split(":");
      if (confirm(`${mode === "disable" ? "Disable" : "Enable"} user ${userId}?`)) await api(`/users/${encodeURIComponent(userId)}/${mode}`, { method: "POST", body: "{}" });
    } else if (action === "fill-import-template") {
      const teams = await api("/teams");
      document.querySelector("#csvInput").value = csvTemplate(teams);
      return;
    } else if (action === "validate-import" || action === "commit-import") {
      const csv = document.querySelector("#csvInput").value;
      if (action === "validate-import") {
        const result = await api("/users/import/validate", { method: "POST", body: JSON.stringify({ csv }) });
        document.querySelector("#importResult").innerHTML = importResultHtml(result);
        return;
      }
      if (confirm("Import all-or-nothing và tải CSV key một lần?")) {
        const response = await api("/users/import/commit", { method: "POST", body: JSON.stringify({ csv }) });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ltn-users-imported.csv";
        a.click();
        URL.revokeObjectURL(url);
      }
    } else if (action.startsWith("approve:") || action.startsWith("reject:")) {
      const [mode, id] = action.split(":");
      const note = prompt("Ghi chú?") || "";
      await api(`/memory/review/${encodeURIComponent(id)}/${mode}`, { method: "POST", body: JSON.stringify({ note }) });
    } else if (action.startsWith("rollback:")) {
      const [, fileId, versionId] = action.split(":");
      if (confirm(`Rollback file về version ${versionId}? File hiện tại sẽ được backup và sync lại SharePoint.`)) {
        await api(`/memory/files/${encodeURIComponent(fileId)}/rollback`, { method: "POST", body: JSON.stringify({ versionId }) });
      }
    } else if (action.startsWith("retry-sync:")) {
      await api(`/sync/${encodeURIComponent(action.split(":")[1])}/retry`, { method: "POST", body: "{}" });
    } else if (action === "retry-all-sync") {
      await api("/sync/retry-all", { method: "POST", body: "{}" });
    }
    state.toast = "Đã thực hiện thao tác.";
    await route();
  } catch (error) {
    state.toast = error.message;
    await route();
  }
});

window.addEventListener("popstate", () => {
  route();
});

window.addEventListener("storage", () => {
  // Không lưu API key hoặc CSRF vào localStorage/sessionStorage.
});

route();
