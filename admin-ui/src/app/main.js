import "./styles.css";

const state = {
  csrfToken: "",
  admin: null,
  oneTimeKey: null,
  cachedTeams: null,
  codexCombos: [],
  editingUser: null,
  editingTeam: null,
  pendingReviewItems: []
};

let progressInterval;
function startProgress() {
  let p = document.getElementById("nprogress");
  if (!p) {
    p = document.createElement("div");
    p.id = "nprogress";
    document.body.appendChild(p);
  }
  p.style.width = "0%";
  p.style.opacity = "1";
  let width = 0;
  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    width += Math.random() * 15;
    if (width > 90) width = 90;
    p.style.width = width + "%";
  }, 200);
}

function finishProgress() {
  clearInterval(progressInterval);
  let p = document.getElementById("nprogress");
  if (p) {
    p.style.width = "100%";
    setTimeout(() => p.style.opacity = "0", 300);
  }
}

function showToast(message, isError = false) {
  const t = document.createElement("div");
  t.className = `toast-floating ${isError ? "error" : ""}`;
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

const navItems = [
  { href: "/admin", label: "Tổng quan", permission: "dashboard" },
  { href: "/admin/users", label: "Nhân viên", permission: "users" },
  { href: "/admin/teams", label: "Bộ phận", permission: "teams" },
  { href: "/admin/usage", label: "Thống kê", permission: "usage" },
  { href: "/admin/memory/review", label: "Duyệt kiến thức", permission: "memory" },
  { href: "/admin/memory/files", label: "Kho kiến thức", permission: "memory" },
  { href: "/admin/sync", label: "Đồng bộ", permission: "sync" },
  { href: "/admin/system", label: "Hệ thống", permission: "system" },
  { href: "/admin/audit", label: "Nhật ký hệ thống", permission: "audit" }
];

function hasRole(role) {
  return state.admin?.roles?.includes("SUPER_ADMIN") || state.admin?.roles?.includes(role);
}

function can(permission) {
  if (!state.admin) return false;
  if (hasRole("SUPER_ADMIN")) return true;
  if (permission === "usersWrite") return hasRole("IT_ADMIN");
  if (permission === "teamsWrite") return hasRole("IT_ADMIN");
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

function formatPolicy(mode) {
  switch (mode) {
    case "inherit": return "Kế thừa";
    case "limited_daily": return "Giới hạn (ngày)";
    case "premium_always": return "Luôn Premium";
    case "free_only": return "Chỉ Free";
    case "test_only": return "Test";
    default: return mode || "Kế thừa";
  }
}

function qs(params) {
  const out = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== "") out.set(key, value);
  }
  const text = out.toString();
  return text ? `?${text}` : "";
}

const apiCache = new Map();

async function api(path, init = {}) {
  const method = init.method || "GET";
  
  if (method === "GET") {
    const cached = apiCache.get(path);
    const ttl = path === "/teams" ? 60000 : 3000;
    if (cached && (Date.now() - cached.time < ttl)) {
      return cached.data;
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), method !== "GET" ? 15000 : 8000);
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
      if (response.status === 409) throw new Error(payload.error?.message || "Dữ liệu đã thay đổi hoặc đang bị xử lý bởi người khác.");
      if (response.status === 429) throw new Error("Bạn thao tác quá nhanh. Vui lòng thử lại sau.");
      if (response.status >= 500) throw new Error(`Có lỗi hệ thống. Mã yêu cầu: ${payload.requestId || "unknown"}.`);
      throw new Error(payload.error?.message || code || "Admin API lỗi.");
    }
    
    if (method === "GET") {
      apiCache.set(path, { time: Date.now(), data: payload.data });
    } else {
      apiCache.clear();
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
  if (path.match(/\/users\/[^/]+$/)) return "Chi tiết nhân viên";
  if (path.includes("/users")) return "Nhân viên";
  if (path.includes("/teams/")) return "Chi tiết bộ phận";
  if (path.includes("/teams")) return "Bộ phận";
  if (path.includes("/usage")) return "Thống kê sử dụng";
  if (path.includes("/memory/review")) return "Duyệt kiến thức";
  if (path.includes("/memory/files")) return "Kho kiến thức";
  if (path.includes("/sync")) return "Đồng bộ SharePoint";
  if (path.includes("/system")) return "Hệ thống";
  if (path.includes("/audit")) return "Nhật ký hệ thống";
  return "Tổng quan";
}

function shell(content) {
  const nav = navItems.filter((item) => can(item.permission)).map((item) =>
    `<a class="${location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href)) ? "active" : ""}" href="${item.href}">${item.label}</a>`
  ).join("");
  return `
    <div class="shell">
      <aside class="sidebar" aria-label="Điều hướng Admin">
        <div class="brand"><span class="brandMark">S</span><div><strong>SIMI AI</strong><small>Admin Console</small></div></div>
        <nav>${nav}</nav>
        <div class="sidebarFooter">By LTN</div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div><div class="breadcrumb">Admin / ${escapeHtml(routeTitle())}</div><h1>${escapeHtml(routeTitle())}</h1><p>Quản trị user, policy, usage, memory và vận hành Gateway.</p></div>
          <div class="adminBadge">
            <strong>${escapeHtml(state.admin?.email || "Cloudflare Access")}</strong>
            <span>${escapeHtml(state.admin?.roles?.join(", ") || "")}</span>
            <small>Phạm vi: ${escapeHtml(state.admin?.teamIds?.join(", ") || "Toàn hệ thống")}</small>
          </div>
        </header>
        <section class="content">${content}</section>
      </main>
    </div>
    ${state.oneTimeKey ? oneTimeKeyModal() : ""}`;
}

function render(content) {
  document.querySelector("#root").innerHTML = shell(content);
  
  // Auto-scroll mobile horizontal nav to active item
  setTimeout(() => {
    const activeNav = document.querySelector("nav a.active");
    const nav = document.querySelector("nav");
    if (activeNav && nav && nav.scrollWidth > nav.clientWidth) {
      nav.scrollLeft = activeNav.offsetLeft - (nav.clientWidth / 2) + (activeNav.clientWidth / 2);
    }
  }, 10);
}

function metric(label, value, hint = "") {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>${hint ? `<small>${escapeHtml(hint)}</small>` : ""}</div>`;
}

function formatBytes(value) {
  const bytes = Math.max(0, Number(value) || 0);
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let amount = bytes;
  let unit = -1;
  while (amount >= 1024 && unit < units.length - 1) {
    amount /= 1024;
    unit += 1;
  }
  return `${amount.toFixed(amount >= 10 ? 1 : 2)} ${units[unit]}`;
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

function createUserModalHtml(teams) {
  return can("usersWrite") ? `
    <div class="modalBackdrop">
      <div class="modal" role="dialog" aria-modal="true" style="max-width: 720px; width: 90vw;">
        <h2>Tạo nhân viên mới</h2>
        <p style="margin-bottom: 20px;">Nhập thông tin và API Key tương ứng từ hệ thống 9Router. Hệ thống áp dụng chuẩn bảo mật mã hóa một chiều cho toàn bộ API Key.</p>
        <div class="formGrid" style="grid-template-columns: repeat(2, 1fr);">
          <label>Mã định danh (User ID)<input id="newUserId" placeholder="vd: nguyen-van-a" /></label>
          <label>Tên hiển thị<input id="newDisplayName" placeholder="vd: Nguyễn Văn A" /></label>
          <label>Phòng ban (Team)<select id="newTeamId">${teamOptions(teams)}</select></label>
          <label>API Key (9Router)<input id="newApiKey" type="password" autocomplete="off" placeholder="Nhập API key từ hệ thống 9Router" /></label>
          <label>Chính sách (Policy)<select id="newPolicyMode"><option value="inherit">Kế thừa phòng ban</option><option value="limited_daily">Giới hạn hằng ngày</option><option value="premium_always">Luôn Premium</option><option value="free_only">Chỉ Free</option><option value="test_only">Test</option></select></label>
          <label>Giới hạn Premium/ngày<input id="newPremiumLimit" type="number" min="0" max="10000" placeholder="Để trống = Mặc định theo team" /></label>
        </div>
        <div class="actions" style="margin-top: 24px; justify-content: flex-end; gap: 12px;">
          ${button("Hủy", "close-create-user", true)}
          ${button("Lưu thông tin", "create-user-from-form")}
        </div>
      </div>
    </div>
  ` : "";
}

function editUserModalHtml(user, teams) {
  if (!can("usersWrite") || !user) return "";
  const policyMode = user.aiPolicy?.mode || "inherit";
  const premiumLimit = user.aiPolicy?.premiumLimit ?? "";
  const outsideControlNote = user.outsideControl
    ? `<p class="status">Ngoài vòng kiểm soát: không nạp/lưu MD và không ghi analytics nội dung sử dụng.</p>`
    : "";
  return `
    <div class="modalBackdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="edit-user-title" style="max-width: 760px; width: 92vw;">
        <h2 id="edit-user-title">Chỉnh sửa nhân viên</h2>
        <p>Cập nhật hồ sơ, bộ phận, trạng thái, chính sách AI hoặc API key. Để trống API key nếu muốn giữ nguyên key hiện tại.</p>
        ${outsideControlNote}
        <div class="formGrid" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
          <label>Mã nhân viên<input id="editUserId" value="${escapeHtml(user.userId)}" /></label>
          <label>Tên hiển thị<input id="editDisplayName" value="${escapeHtml(user.displayName)}" /></label>
          <label>Bộ phận<select id="editTeamId">${teamOptions(teams, user.teamId)}</select></label>
          <label>Vai trò<input id="editRole" value="${escapeHtml(user.role || "")}" placeholder="Ví dụ: Nhân viên kinh doanh" /></label>
          <label>Trạng thái<select id="editEnabled"><option value="true" ${user.enabled ? "selected" : ""}>Hoạt động</option><option value="false" ${!user.enabled ? "selected" : ""}>Đã khóa</option></select></label>
          <label>Chế độ bộ nhớ<select id="editMemoryMode" ${user.outsideControl ? "disabled" : ""}><option value="full" ${user.memoryMode === "full" ? "selected" : ""}>Đầy đủ</option><option value="read_only" ${user.memoryMode === "read_only" ? "selected" : ""}>Chỉ đọc</option><option value="none" ${user.memoryMode === "none" ? "selected" : ""}>Tắt</option></select></label>
          <label>Chính sách AI<select id="editPolicyMode"><option value="inherit" ${policyMode === "inherit" ? "selected" : ""}>Kế thừa bộ phận</option><option value="limited_daily" ${policyMode === "limited_daily" ? "selected" : ""}>Giới hạn hằng ngày</option><option value="premium_always" ${policyMode === "premium_always" ? "selected" : ""}>Luôn Premium</option><option value="free_only" ${policyMode === "free_only" ? "selected" : ""}>Chỉ Free</option><option value="test_only" ${policyMode === "test_only" ? "selected" : ""}>Test</option></select></label>
          <label>Giới hạn Premium/ngày<input id="editPremiumLimit" type="number" min="0" max="10000" value="${escapeHtml(premiumLimit)}" placeholder="Để trống nếu không áp dụng" /></label>
          <label style="grid-column: 1 / -1;">API key 9Router mới<input id="editApiKey" type="password" autocomplete="new-password" placeholder="Để trống để giữ nguyên key hiện tại" /></label>
        </div>
        <div class="actions" style="margin-top: 24px; justify-content: flex-end;">
          ${button("Hủy", "close-edit-user", true)}
          ${button("Lưu thay đổi", "save-edit-user")}
        </div>
      </div>
    </div>
  `;
}

function comboOptions(items, selected) {
  const values = [...new Set([
    ...(items || []).map((item) => item.id).filter(Boolean),
    selected
  ].filter(Boolean))];
  return `<option value="">Kế thừa Combo mặc định</option>${values.map((id) =>
    `<option value="${escapeHtml(id)}" ${id === selected ? "selected" : ""}>${escapeHtml(id)}</option>`
  ).join("")}`;
}

function teamModalHtml(team = null, combos = []) {
  if (!can("teamsWrite")) return "";
  const editing = Boolean(team);
  const mode = team?.aiPolicy?.mode || "inherit";
  const premiumLimit = team?.aiPolicy?.premiumLimit ?? "";
  const premiumCombo = team?.aiPolicy?.premiumCombo || "";
  const freeCombo = team?.aiPolicy?.freeCombo || "";
  const testCombo = team?.aiPolicy?.testCombo || "";
  const outsideControlNote = team?.outsideControl
    ? `<p class="status">Ngoài vòng kiểm soát: tin nhắn không dùng memory, không lưu MD và không ghi user analytics.</p>`
    : "";
  return `
    <div class="modalBackdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="team-modal-title" style="max-width: 720px; width: 92vw;">
        <h2 id="team-modal-title">${editing ? "Chỉnh sửa bộ phận" : "Tạo bộ phận mới"}</h2>
        <p>${editing ? "Cập nhật tên, trạng thái và chính sách AI của bộ phận." : "Mã bộ phận sẽ được viết hoa và không thể đổi sau khi tạo."}</p>
        ${outsideControlNote}
        <div class="formGrid" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
          <label>Mã bộ phận<input id="teamCode" value="${escapeHtml(team?.teamId || "")}" ${editing ? "disabled" : ""} placeholder="Ví dụ: SALES" /></label>
          <label>Tên bộ phận<input id="teamDisplayName" value="${escapeHtml(team?.displayName || "")}" placeholder="Ví dụ: Kinh doanh" /></label>
          <label>Trạng thái<select id="teamEnabled"><option value="true" ${team?.enabled !== false ? "selected" : ""}>Hoạt động</option><option value="false" ${team?.enabled === false ? "selected" : ""}>Đã khóa</option></select></label>
          <label>Chính sách AI<select id="teamPolicyMode"><option value="inherit" ${mode === "inherit" ? "selected" : ""}>Kế thừa mặc định</option><option value="limited_daily" ${mode === "limited_daily" ? "selected" : ""}>Giới hạn hằng ngày</option><option value="premium_always" ${mode === "premium_always" ? "selected" : ""}>Luôn Premium</option><option value="free_only" ${mode === "free_only" ? "selected" : ""}>Chỉ Free</option><option value="test_only" ${mode === "test_only" ? "selected" : ""}>Test</option></select></label>
          <label>Giới hạn Premium/ngày<input id="teamPremiumLimit" type="number" min="0" max="10000" value="${escapeHtml(premiumLimit)}" placeholder="Để trống nếu không áp dụng" /></label>
          <label>Combo Premium<select id="teamPremiumCombo">${comboOptions(combos, premiumCombo)}</select></label>
          <label>Combo Free<select id="teamFreeCombo">${comboOptions(combos, freeCombo)}</select></label>
          <label>Combo Test<select id="teamTestCombo">${comboOptions(combos, testCombo)}</select></label>
          ${editing ? "" : `<label style="grid-column: 1 / -1;">API key bộ phận (nếu đang dùng legacy key)<input id="teamApiKey" type="password" autocomplete="new-password" placeholder="Bắt buộc khi LTN_LEGACY_TEAM_KEYS_ENABLED=true" /></label>`}
        </div>
        <div class="actions" style="margin-top: 24px; justify-content: flex-end;">
          ${button("Hủy", "close-team-modal", true)}
          ${button(editing ? "Lưu thay đổi" : "Tạo bộ phận", editing ? "save-edit-team" : "create-team-from-form")}
        </div>
      </div>
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
      ${metric("Lượt dùng", dashboard.usage.requests)}
      ${metric("Premium", dashboard.usage.premium)}
      ${metric("Free", dashboard.usage.free)}
      ${metric("Test", dashboard.usage.test)}
      ${metric("Tỉ lệ thành công", `${dashboard.usage.successRate || 0}%`)}
      ${metric("Độ trễ trung bình", `${dashboard.usage.averageLatencyMs || 0}ms`)}
      ${metric("Chờ xử lý (Bộ phận)", dashboard.health.memoryPendingTeam)}
      ${metric("Chờ xử lý (Công ty)", dashboard.health.memoryPendingCompany)}
      ${metric("Chờ đồng bộ", dashboard.health.syncPending)}
      ${metric("Đồng bộ lỗi", dashboard.health.syncFailed)}
    </div>
    <div class="twoCol">
      <div class="card"><h2>Lượt dùng 7/30 ngày</h2>${miniBars(timeseries.map((x) => ({ label: x.date, value: x.requests })))}</div>
      <div class="card"><h2>Sử dụng theo bộ phận</h2>${miniBars((teams.items || []).map((x) => ({ label: x.teamId, value: x.requests })))}</div>
    </div>
    <div class="card"><h2>Trạng thái hệ thống</h2><p>Gateway: ${escapeHtml(dashboard.health.gateway)} · 9Router: ${escapeHtml(dashboard.health.router)} · SharePoint: ${dashboard.health.sharePointConfigured ? "Đã kết nối" : "Chưa kết nối"} · Bộ trích xuất: ${dashboard.health.memoryExtractionEnabled ? "Bật" : "Tắt"}</p></div>
  `);
}

function miniBars(items) {
  const max = Math.max(1, ...items.map((item) => Number(item.value || 0)));
  return `<div class="bars">${items.slice(-12).map((item) => `<div><span>${escapeHtml(item.label)}</span><b style="width:${Math.max(4, Number(item.value || 0) / max * 100)}%"></b><em>${escapeHtml(item.value)}</em></div>`).join("")}</div>`;
}

async function pageUsers() {
  const params = new URLSearchParams(location.search);
  const [users, teams] = await Promise.all([api(`/users${location.search}`), api("/teams")]);
  state.cachedTeams = teams;
  render(`
    <div class="toolbar">
      <div class="toolbarGroup">
        <input aria-label="Tìm nhân viên" id="search" placeholder="Tìm user hoặc tên" value="${escapeHtml(params.get("search") || "")}" />
        <select id="teamFilter"><option value="">Tất cả team</option>${teamOptions(teams, params.get("teamId") || "")}</select>
        <select id="enabledFilter"><option value="">Tất cả trạng thái</option><option value="true" ${params.get("enabled") === "true" ? "selected" : ""}>Đang hoạt động</option><option value="false" ${params.get("enabled") === "false" ? "selected" : ""}>Đã khóa</option></select>
      </div>
      <div class="toolbarGroup">
        ${can("usersWrite") ? `<button class="pill" data-action="open-create-user">Tạo nhân viên mới</button>` : ""}
      </div>
    </div>
    ${table(["Mã nhân viên", "Tên", "Bộ phận", "Trạng thái", "Gói AI", "Lượt Premium", "Thao tác"], (users.items || []).map((u) => `
      <tr>
        <td><a href="/admin/users/${encodeURIComponent(u.userId)}">${escapeHtml(u.userId)}</a></td>
        <td>${escapeHtml(u.displayName)}</td>
        <td>${escapeHtml(u.teamId)}</td>
        <td><span class="status">${u.outsideControl ? "Ngoài vòng kiểm soát" : (u.enabled ? "Hoạt động" : "Đã khóa")}</span></td>
        <td>${escapeHtml(formatPolicy(u.aiPolicy?.mode))}</td>
        <td>${escapeHtml(u.aiPolicy?.premiumLimit ?? "")}</td>
        <td class="actions">${can("usersWrite") ? `${button(u.enabled ? "Khóa" : "Mở khóa", `${u.enabled ? "disable" : "enable"}:${u.userId}`, !u.enabled)} ${button("Chỉnh sửa", `edit:${u.userId}`)} ${button("Xóa", `delete-user:${u.userId}`, true)}` : ""}</td>
      </tr>`), "Chưa có nhân viên.")}
  `);
}

async function pageUserDetail(userId) {
  const [user, usage, devices] = await Promise.all([
    api(`/users/${encodeURIComponent(userId)}`),
    api(`/users/${encodeURIComponent(userId)}/usage`),
    api(`/users/${encodeURIComponent(userId)}/devices`)
  ]);
  render(`
    <div class="twoCol">
      <div class="card"><h2>${escapeHtml(user.displayName)}</h2><p>Mã nhân viên: ${escapeHtml(user.userId)}</p><p>Bộ phận: ${escapeHtml(user.teamId)}</p><p>Gói AI: ${escapeHtml(formatPolicy(user.aiPolicy?.mode))}</p>${user.outsideControl ? '<p class="status">Ngoài vòng kiểm soát</p>' : ""}</div>
      <div class="grid compact">${metric("Lượt dùng", usage.requests)}${metric("Premium", usage.premium)}${metric("Free", usage.free)}${metric("Test", usage.test)}${metric("Thiết bị", usage.devices)}</div>
    </div>
    <div class="card"><h2>Thiết bị</h2>${table(["Mã thiết bị", "Lượt dùng", "Lần đầu", "Lần cuối", "Cảnh báo"], (devices.items || []).map((d) => `<tr><td>${escapeHtml(d.clientIdHashPrefix)}</td><td>${d.requests}</td><td>${escapeHtml(d.firstSeenAt)}</td><td>${escapeHtml(d.lastSeenAt)}</td><td>${escapeHtml(d.warning || "")}</td></tr>`))}</div>
  `);
}

async function pageTeams() {
  const teams = await api("/teams");
  state.cachedTeams = teams;
  render(`
    <div class="toolbar">
      <div></div>
      <div class="toolbarGroup">${can("teamsWrite") ? `<button class="pill" data-action="open-create-team">Tạo bộ phận mới</button>` : ""}</div>
    </div>
    ${table(["Bộ phận", "Tên", "Trạng thái", "Nhân viên", "Gói AI", "Lượt Premium", "Thao tác"], (teams.items || []).map((t) => `
      <tr>
        <td><a href="/admin/teams/${encodeURIComponent(t.teamId)}">${escapeHtml(t.teamId)}</a></td>
        <td>${escapeHtml(t.displayName)}</td>
        <td>${t.outsideControl ? "Ngoài vòng kiểm soát" : (t.enabled ? "Hoạt động" : "Đã khóa")}</td>
        <td>${t.memberCount}</td>
        <td>${escapeHtml(formatPolicy(t.aiPolicy?.mode))}</td>
        <td>${escapeHtml(t.aiPolicy?.premiumLimit ?? "")}</td>
        <td class="actions">${can("teamsWrite") ? `${button("Chỉnh sửa", `edit-team:${t.teamId}`)} ${button("Xóa", `delete-team:${t.teamId}`, true)}` : ""}</td>
      </tr>`), "Chưa có bộ phận.")}`);
}

async function pageTeamDetail(teamId) {
  const [team, users, usage] = await Promise.all([api(`/teams/${teamId}`), api(`/teams/${teamId}/users`), api(`/teams/${teamId}/usage`)]);
  render(`<div class="card"><h2>${escapeHtml(team.displayName)}</h2><p>${escapeHtml(team.teamId)} · ${team.outsideControl ? "Ngoài vòng kiểm soát" : (team.enabled ? "Hoạt động" : "Đã khóa")}</p><p>Gói AI: ${escapeHtml(formatPolicy(team.aiPolicy?.mode))}</p></div><div class="grid compact">${metric("Nhân viên", team.memberCount)}${metric("Lượt dùng", usage.requests)}${metric("Premium", usage.premium)}${metric("Free", usage.free)}${metric("Test", usage.test)}</div>${table(["Nhân viên", "Tên", "Trạng thái"], (users.items || []).map((u) => `<tr><td>${escapeHtml(u.userId)}</td><td>${escapeHtml(u.displayName)}</td><td>${u.outsideControl ? "Ngoài vòng kiểm soát" : (u.enabled ? "Hoạt động" : "Đã khóa")}</td></tr>`))}`);
}

async function pageUsage() {
  const [summary, users, teams, devices, timeseries] = await Promise.all([
    api(`/usage/summary${location.search}`),
    api(`/usage/users${location.search}`),
    api(`/usage/teams${location.search}`),
    api(`/usage/devices${location.search}`),
    api(`/usage/timeseries${location.search}`).catch(() => [])
  ]);
  
  render(`
    <div class="grid cols-8">
      ${metric("Lượt dùng", summary.requests)}
      ${metric("Premium", summary.premium)}
      ${metric("Free", summary.free)}
      ${metric("Test", summary.test)}
      ${metric("Token", summary.totalTokens)}
      ${metric("Thành công", `${summary.successRate || 0}%`)}
      ${metric("Độ trễ TB", `${summary.averageLatencyMs || 0}ms`)}
      ${metric("Thiết bị", summary.devices)}
      ${metric("Lỗi", summary.errors)}
    </div>
    
    <div class="twoCol">
      <div class="card">
        <h2>Truy cập (12 ngày qua)</h2>
        ${miniBars((timeseries || []).map((x) => ({ label: x.date, value: x.requests })))}
      </div>
      <div class="card">
        <h2>Top 12 Bộ phận (Lượt dùng)</h2>
        ${miniBars((teams.items || []).slice(0, 12).map((t) => ({ label: t.teamId, value: t.requests })))}
      </div>
    </div>
    
    <div class="card" style="margin-bottom: 24px;">
      <h2>Top nhân viên</h2>
      ${table(["Nhân viên", "Bộ phận", "Lượt dùng", "Premium", "Free", "Test", "Lỗi", "Thiết bị", "Dùng lần cuối"], (users.items || []).map((u) => `<tr><td><a href="/admin/users/${encodeURIComponent(u.userId)}">${escapeHtml(u.userId)}</a></td><td>${escapeHtml(u.teamId)}</td><td>${u.requests}</td><td>${u.premium}</td><td>${u.free}</td><td>${u.test}</td><td>${u.errors}</td><td>${u.devices}</td><td>${escapeHtml(u.lastUsedAt || "")}</td></tr>`))}
    </div>
    
    <div class="card">
      <h2>Thiết bị</h2>
      ${table(["Nhân viên", "Mã thiết bị", "Lượt dùng", "Cảnh báo"], (devices.items || []).map((d) => `<tr><td><a href="/admin/users/${encodeURIComponent(d.userId)}">${escapeHtml(d.userId)}</a></td><td>${escapeHtml(d.clientIdHashPrefix)}</td><td>${d.requests}</td><td>${escapeHtml(d.warning || "")}</td></tr>`))}
    </div>
  `);
}

async function pageReview() {
  const status = new URLSearchParams(location.search).get("status") || "pending";
  const data = await api(`/memory/review${qs({ status })}`);
  state.pendingReviewItems = status === "pending" ? (data.items || []) : [];
  const bulkApprove = state.pendingReviewItems.length
    ? button(`Duyệt hàng loạt (${state.pendingReviewItems.length})`, "approve-all-review")
    : "";
  render(`<div class="toolbar"><div class="toolbarGroup"><a class="pill" href="/admin/memory/review?status=pending">Chờ duyệt</a><a class="pill" href="/admin/memory/review?status=approved">Đã duyệt</a><a class="pill" href="/admin/memory/review?status=rejected">Bị từ chối</a></div><div class="toolbarGroup">${bulkApprove}</div></div>${table(["Phạm vi", "Bộ phận", "Khóa (Key)", "Tóm tắt", "Độ tin cậy", "Thao tác"], (data.items || []).map((c) => `<tr><td>${escapeHtml(c.scope)}</td><td>${escapeHtml(c.sourceTeamId || "")}</td><td>${escapeHtml(c.normalizedKey)}</td><td>${escapeHtml(c.summary)}</td><td>${escapeHtml(c.confidence)}</td><td class="actions">${status === "pending" ? `${button("Duyệt", `approve:${c.id}`)} ${button("Từ chối", `reject:${c.id}`, true)}` : ""}</td></tr>`), "Không có dữ liệu chờ duyệt.")}`);
}

async function pageMemoryFiles() {
  const data = await api("/memory/files");
  render(table(["Tập tin", "Phạm vi", "Bộ phận", "Kích thước", "Phiên bản", "Cập nhật lúc"], (data.items || []).map((f) => `<tr><td><a href="/admin/memory/files/${encodeURIComponent(f.fileId)}">${escapeHtml(f.path)}</a></td><td>${escapeHtml(f.scope)}</td><td>${escapeHtml(f.teamId || "")}</td><td>${f.size}</td><td>${f.versionCount}</td><td>${escapeHtml(f.updatedAt || "")}</td></tr>`), "Chưa có tập tin kiến thức."));
}

async function pageMemoryFile(fileId) {
  const [file, versions] = await Promise.all([api(`/memory/files/${encodeURIComponent(fileId)}`), api(`/memory/files/${encodeURIComponent(fileId)}/versions`)]);
  render(`<div class="card"><h2>${escapeHtml(file.path)}</h2><p>Mã băm: ${escapeHtml(file.contentHash)}</p><pre>${escapeHtml(file.content)}</pre></div><div class="card"><h2>Các phiên bản</h2>${table(["Phiên bản", "Thao tác"], (versions.items || []).map((v) => `<tr><td>${escapeHtml(v.versionId)}</td><td>${button("Phục hồi", `rollback:${fileId}:${v.versionId}`, true)}</td></tr>`), "Chưa có bản sao lưu.")}</div>`);
}

async function pageSync() {
  const data = await api("/sync");
  render(`<div class="actions">${button("Thử lại tất cả", "retry-all-sync")}</div>${table(["Máy chủ", "Đám mây", "Trạng thái", "Số lần thử", "Lần tới", "Lỗi", "Thao tác"], (data.items || []).map((s) => `<tr><td>${escapeHtml(s.localPath)}</td><td>${escapeHtml(s.remotePath)}</td><td>${escapeHtml(s.status)}</td><td>${s.attempts}</td><td>${escapeHtml(s.nextAttemptAt || "")}</td><td>${escapeHtml(s.lastErrorCode || "")}</td><td>${button("Thử lại", `retry-sync:${s.id}`)}</td></tr>`), "Không có tác vụ đồng bộ.")}`);
}

async function pageSystem() {
  const [health, cfg] = await Promise.all([api("/system/health"), api("/system/config-summary")]);
  const dataSize = formatBytes(health.diskBytes);
  render(`<div class="grid cols-8">${metric("Gateway", health.gateway)}${metric("9Router", health.router)}${metric("Uptime", `${health.uptimeSeconds}s`)}${metric("Phiên bản Node", health.nodeVersion)}${metric("Chờ đồng bộ", health.syncPending)}${metric("Đồng bộ lỗi", health.syncFailed)}${metric("Dung lượng dữ liệu", dataSize, "Thư mục ./data")}${metric("Admin UI", cfg.adminUiEnabled ? "Bật" : "Tắt")}</div><div class="card"><h2>Cấu hình bảo mật</h2><p>Allowed hosts: ${escapeHtml((cfg.allowedHosts || []).join(", "))}</p><p>Chế độ SharePoint: ${escapeHtml(cfg.sharePointMode)}</p></div>`);
}

async function pageAudit() {
  const data = await api(`/audit${location.search}`);
  render(table(["Thời gian", "Quản trị viên", "Thao tác", "Mục tiêu", "Bộ phận", "Kết quả", "Yêu cầu"], (data.items || []).map((a) => `<tr><td>${escapeHtml(a.timestamp)}</td><td>${escapeHtml(a.adminEmail)}</td><td>${escapeHtml(a.action)}</td><td>${escapeHtml(a.targetType)}:${escapeHtml(a.targetId)}</td><td>${escapeHtml(a.teamId || "")}</td><td>${escapeHtml(a.result)}</td><td>${escapeHtml(a.requestId)}</td></tr>`), "Chưa có nhật ký hoạt động."));
}

async function route() {
  startProgress();
  const contentArea = document.querySelector(".content");
  if (contentArea) contentArea.style.opacity = "0.4";
  document.body.style.cursor = "wait";

  try {
    if (!state.admin) {
      state.admin = (await api("/me")).admin;
    }
    if (!state.csrfToken) {
      await refreshCsrf();
    }
    const path = location.pathname;
    if (path === "/admin") await pageDashboard();
    else if (path === "/admin/users") await pageUsers();
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
  } finally {
    const newContent = document.querySelector(".content");
    if (newContent) newContent.style.opacity = "1";
    document.body.style.cursor = "default";
    finishProgress();
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
  const link = event.target.closest("a");
  if (link && link.href.startsWith(window.location.origin + "/admin")) {
    event.preventDefault();
    history.pushState(null, "", link.href);
    route();
    return;
  }

  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  try {
    if (action === "copy-key" && state.oneTimeKey) await navigator.clipboard.writeText(state.oneTimeKey);
    else if (action === "close-key") state.oneTimeKey = null;
    else if (action === "open-create-user") {
      const existing = document.getElementById("dynamic-modal-container");
      if (existing) existing.remove();
      const div = document.createElement("div");
      div.id = "dynamic-modal-container";
      div.innerHTML = createUserModalHtml(state.cachedTeams || { items: [] });
      document.body.appendChild(div);
      return;
    } else if (action === "close-create-user") {
      document.getElementById("dynamic-modal-container")?.remove();
      return;
    } else if (action === "create-user-from-form") {
      const userId = document.querySelector("#newUserId")?.value.trim();
      const displayName = document.querySelector("#newDisplayName")?.value.trim();
      const teamId = document.querySelector("#newTeamId")?.value.trim();
      const apiKey = document.querySelector("#newApiKey")?.value.trim();
      const policyMode = document.querySelector("#newPolicyMode")?.value || "inherit";
      const premiumLimit = document.querySelector("#newPremiumLimit")?.value.trim();
      if (!userId || !displayName || !teamId || !apiKey) throw new Error("Vui lòng nhập đầy đủ Mã định danh, Tên hiển thị, Phòng ban và API Key.");
      const aiPolicy = { mode: policyMode };
      if (premiumLimit !== "") aiPolicy.premiumLimit = Number(premiumLimit);
      await api("/users", { method: "POST", body: JSON.stringify({ userId, displayName, teamId, apiKey, aiPolicy }) });
      document.getElementById("dynamic-modal-container")?.remove();
      showToast("Đã tạo nhân viên mới thành công.");
      await route();
    } else if (action.startsWith("edit:")) {
      const userId = action.slice("edit:".length);
      state.editingUser = await api(`/users/${encodeURIComponent(userId)}`);
      document.getElementById("dynamic-modal-container")?.remove();
      const div = document.createElement("div");
      div.id = "dynamic-modal-container";
      div.innerHTML = editUserModalHtml(state.editingUser, state.cachedTeams || { items: [] });
      document.body.appendChild(div);
      document.querySelector("#editDisplayName")?.focus();
      return;
    } else if (action === "close-edit-user") {
      state.editingUser = null;
      document.getElementById("dynamic-modal-container")?.remove();
      return;
    } else if (action === "save-edit-user") {
      const user = state.editingUser;
      if (!user) throw new Error("Không tìm thấy nhân viên cần chỉnh sửa.");
      const userId = document.querySelector("#editUserId")?.value.trim();
      const displayName = document.querySelector("#editDisplayName")?.value.trim();
      const teamId = document.querySelector("#editTeamId")?.value.trim();
      const role = document.querySelector("#editRole")?.value.trim() || "";
      const enabled = document.querySelector("#editEnabled")?.value === "true";
      const memoryMode = document.querySelector("#editMemoryMode")?.value || "full";
      const policyMode = document.querySelector("#editPolicyMode")?.value || "inherit";
      const premiumLimit = document.querySelector("#editPremiumLimit")?.value.trim();
      const apiKey = document.querySelector("#editApiKey")?.value.trim();
      if (!userId || !displayName || !teamId) throw new Error("Mã nhân viên, Tên hiển thị và Bộ phận không được để trống.");
      const aiPolicy = { mode: policyMode };
      if (premiumLimit !== "") aiPolicy.premiumLimit = Number(premiumLimit);
      const updatedUser = await api(`/users/${encodeURIComponent(user.userId)}`, {
        method: "PATCH",
        body: JSON.stringify({ userId, displayName, teamId, role, memoryMode, aiPolicy })
      });
      const updatedUserId = updatedUser.userId;
      if (enabled !== user.enabled) {
        await api(`/users/${encodeURIComponent(updatedUserId)}/${enabled ? "enable" : "disable"}`, {
          method: "POST",
          body: "{}"
        });
      }
      if (apiKey) {
        await api(`/users/${encodeURIComponent(updatedUserId)}/rotate-key`, {
          method: "POST",
          body: JSON.stringify({ apiKey })
        });
      }
      state.editingUser = null;
      document.getElementById("dynamic-modal-container")?.remove();
      showToast("Đã cập nhật toàn bộ thông tin nhân viên.");
      await route();
    } else if (action.startsWith("delete-user:")) {
      const userId = action.slice("delete-user:".length);
      if (!confirm(`Xóa vĩnh viễn nhân viên ${userId}? Hồ sơ bộ nhớ cá nhân của nhân viên cũng sẽ bị xóa.`)) return;
      await api(`/users/${encodeURIComponent(userId)}`, { method: "DELETE" });
      showToast(`Đã xóa nhân viên ${userId}.`);
      if (location.pathname !== "/admin/users") history.pushState(null, "", "/admin/users");
      await route();
    } else if (action.startsWith("disable:") || action.startsWith("enable:")) {
      const [mode, userId] = action.split(":");
      if (confirm(`Bạn có chắc muốn ${mode === "disable" ? "khóa" : "mở khóa"} nhân viên ${userId}?`)) {
        await api(`/users/${encodeURIComponent(userId)}/${mode}`, { method: "POST", body: "{}" });
        await route();
      }
    } else if (action === "open-create-team") {
      const comboResult = await api("/codex/combos");
      state.codexCombos = comboResult.items || [];
      document.getElementById("dynamic-modal-container")?.remove();
      const div = document.createElement("div");
      div.id = "dynamic-modal-container";
      div.innerHTML = teamModalHtml(null, state.codexCombos);
      document.body.appendChild(div);
      document.querySelector("#teamCode")?.focus();
      return;
    } else if (action.startsWith("edit-team:")) {
      const teamId = action.slice("edit-team:".length);
      const [editingTeam, comboResult] = await Promise.all([
        api(`/teams/${encodeURIComponent(teamId)}`),
        api("/codex/combos")
      ]);
      state.editingTeam = editingTeam;
      state.codexCombos = comboResult.items || [];
      document.getElementById("dynamic-modal-container")?.remove();
      const div = document.createElement("div");
      div.id = "dynamic-modal-container";
      div.innerHTML = teamModalHtml(state.editingTeam, state.codexCombos);
      document.body.appendChild(div);
      document.querySelector("#teamDisplayName")?.focus();
      return;
    } else if (action === "close-team-modal") {
      state.editingTeam = null;
      document.getElementById("dynamic-modal-container")?.remove();
      return;
    } else if (action === "create-team-from-form" || action === "save-edit-team") {
      const editing = action === "save-edit-team";
      const teamId = (editing ? state.editingTeam?.teamId : document.querySelector("#teamCode")?.value || "").trim().toUpperCase();
      const displayName = document.querySelector("#teamDisplayName")?.value.trim();
      const enabled = document.querySelector("#teamEnabled")?.value === "true";
      const mode = document.querySelector("#teamPolicyMode")?.value || "inherit";
      const premiumLimit = document.querySelector("#teamPremiumLimit")?.value.trim();
      const premiumCombo = document.querySelector("#teamPremiumCombo")?.value.trim();
      const freeCombo = document.querySelector("#teamFreeCombo")?.value.trim();
      const testCombo = document.querySelector("#teamTestCombo")?.value.trim();
      const apiKey = document.querySelector("#teamApiKey")?.value.trim() || "";
      if (!teamId || !displayName) throw new Error("Mã bộ phận và Tên bộ phận không được để trống.");
      const aiPolicy = { mode };
      if (premiumLimit !== "") aiPolicy.premiumLimit = Number(premiumLimit);
      if (premiumCombo) aiPolicy.premiumCombo = premiumCombo;
      if (freeCombo) aiPolicy.freeCombo = freeCombo;
      if (testCombo) aiPolicy.testCombo = testCombo;
      await api(editing ? `/teams/${encodeURIComponent(teamId)}` : "/teams", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify({ teamId, displayName, enabled, aiPolicy, ...(apiKey ? { apiKey } : {}) })
      });
      state.editingTeam = null;
      document.getElementById("dynamic-modal-container")?.remove();
      showToast(editing ? `Đã cập nhật bộ phận ${teamId}.` : `Đã tạo bộ phận ${teamId}.`);
      await route();
    } else if (action.startsWith("delete-team:")) {
      const teamId = action.slice("delete-team:".length);
      if (!confirm(`Xóa vĩnh viễn bộ phận ${teamId}? Chỉ có thể xóa khi bộ phận không còn nhân viên.`)) return;
      await api(`/teams/${encodeURIComponent(teamId)}`, { method: "DELETE" });
      showToast(`Đã xóa bộ phận ${teamId}.`);
      if (location.pathname !== "/admin/teams") history.pushState(null, "", "/admin/teams");
      await route();
    } else if (action === "approve-all-review") {
      const items = [...state.pendingReviewItems];
      if (!items.length) {
        showToast("Không còn dữ liệu chờ duyệt.");
        return;
      }
      if (!confirm(`Duyệt toàn bộ ${items.length} mục đang chờ? Các mục sẽ được ghi vào đúng phạm vi USER, TEAM hoặc COMPANY.`)) return;
      let approved = 0;
      const failed = [];
      for (const item of items) {
        try {
          await api(`/memory/review/${encodeURIComponent(item.id)}/approve`, {
            method: "POST",
            body: JSON.stringify({ note: "Duyệt hàng loạt từ Admin Console" })
          });
          approved += 1;
        } catch (error) {
          failed.push({ id: item.id, message: error.message });
        }
      }
      state.pendingReviewItems = [];
      if (failed.length) {
        showToast(`Đã duyệt ${approved}/${items.length} mục; ${failed.length} mục lỗi. Mục lỗi đầu tiên: ${failed[0].message}`, true);
      } else {
        showToast(`Đã duyệt thành công ${approved} mục.`);
      }
      await route();
      return;
    } else if (action.startsWith("approve:") || action.startsWith("reject:")) {
      const [mode, id] = action.split(":");
      const note = prompt("Ghi chú?") || "";
      await api(`/memory/review/${encodeURIComponent(id)}/${mode}`, { method: "POST", body: JSON.stringify({ note }) });
    } else if (action.startsWith("rollback:")) {
      const [, fileId, versionId] = action.split(":");
      if (confirm(`Khôi phục tập tin về phiên bản ${versionId}? Tập tin hiện tại sẽ được sao lưu và đồng bộ lại SharePoint.`)) {
        await api(`/memory/files/${encodeURIComponent(fileId)}/rollback`, { method: "POST", body: JSON.stringify({ versionId }) });
      }
    } else if (action.startsWith("retry-sync:")) {
      await api(`/sync/${encodeURIComponent(action.split(":")[1])}/retry`, { method: "POST", body: "{}" });
    } else if (action === "retry-all-sync") {
      await api("/sync/retry-all", { method: "POST", body: "{}" });
    }
    showToast("Thao tác thành công.");
    await route();
  } catch (error) {
    showToast(error.message, true);
    finishProgress();
  }
});

if (location.pathname === "/admin/") {
  history.replaceState(null, "", `/admin${location.search}${location.hash}`);
}

window.addEventListener("popstate", () => {
  route();
});

window.addEventListener("storage", () => {
  // Không lưu API key hoặc CSRF vào localStorage/sessionStorage.
});

route();
