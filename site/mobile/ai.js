// 🤖 Chat AI trên điện thoại (app Android / PWA ở /m): chat với model qua Gateway bằng quota của chính người đã ghép
// (token vpm_ → Gateway dùng key máy tính đã mã hoá). Chọn model, gửi ảnh, trả lời chạy chữ, lịch sử lưu trên máy.
// Dùng tiện ích của trang chính qua window.VPM (el, svg, IC, toast, headers, LS, sheet…).
'use strict';
(() => {
  const KEY = 'vpm.ai.threads';
  const MAX_THREADS = 40;
  const NOT_CHAT = /image|dall-?e|tts|whisper|stt|transcri|embed|rerank|moderation|veo|video|sora|imagen|flux|midjourney|seedance|kling|audio|speech|music/i;
  const GUIDE = [
    'Bạn là trợ lý AI của SIMI, đang trả lời trong app Văn Phòng AI trên điện thoại.',
    'Trả lời bằng tiếng Việt tự nhiên, rõ ràng, đi thẳng vào việc; dùng markdown nhẹ (đoạn ngắn, gạch đầu dòng, **đậm**, bảng nhỏ khi cần).',
    'Màn hình điện thoại nhỏ: tránh bảng quá rộng, khối code quá dài trừ khi người dùng cần.',
    'Trên điện thoại không có công cụ máy tính (chạy file, Excel, trình duyệt tự động, tạo ảnh). Việc cần các công cụ đó thì trả lời phần làm được và gợi ý mở app Văn Phòng AI trên máy tính.',
  ].join('\n');
  const A = {
    threads: null, cur: null, models: [], model: '', loadingModels: null, busy: null, err: '', imgs: [], draft: '',
  };
  const V = () => window.VPM;

  // ---------- lưu lịch sử ----------
  function load() {
    if (A.threads) return;
    A.threads = (V().LS.get(KEY, []) || []).filter((t) => t && t.id && Array.isArray(t.msgs));
    A.model = V().LS.get('vpm.ai.model', '');
  }
  function save() {
    const list = A.threads.filter((t) => t.msgs.length).sort((a, b) => b.at - a.at).slice(0, MAX_THREADS);
    for (let n = list.length; n > 0; n--) {
      try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, n))); return; } catch { /* đầy bộ nhớ → bỏ bớt đoạn cũ */ }
    }
  }
  const newThread = () => ({ id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), title: '', at: Date.now(), msgs: [] });
  function thread() {
    if (!A.cur) {
      // mở lại app: tiếp đoạn chat gần nhất (trong 12 giờ), lâu hơn thì mở đoạn mới
      const last = A.threads.slice().sort((a, b) => b.at - a.at)[0];
      A.cur = last && (!last.msgs.length || Date.now() - last.at < 12 * 3600_000) ? last : newThread();
      if (!A.threads.includes(A.cur)) A.threads.unshift(A.cur);
    }
    return A.cur;
  }

  // ---------- model ----------
  async function loadModels(force) {
    if (A.models.length && !force) return;
    if (A.loadingModels) return A.loadingModels;
    A.loadingModels = (async () => {
      const h = V().headers();
      const [m, cfg] = await Promise.all([
        fetch('/v1/models', { headers: h }).then(async (r) => { const j = await r.json().catch(() => null); if (!r.ok) throw new Error((j && j.error && j.error.message) || `Lỗi ${r.status}`); return j; }),
        fetch('/v1/codex/config', { headers: h }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);
      A.models = (m && m.data || []).filter((x) => x && x.id && !NOT_CHAT.test(x.id));
      const ids = A.models.map((x) => x.id);
      if (!ids.includes(A.model)) A.model = (cfg && ids.includes(cfg.defaultModel) && cfg.defaultModel) || ids.find((i) => /claude-sonnet|gpt-5/i.test(i)) || ids[0] || '';
      A.err = '';
    })().catch((e) => { A.err = e.message; }).finally(() => { A.loadingModels = null; });
    return A.loadingModels;
  }
  function speedTag(sp) {
    if (!sp || typeof sp !== 'object') return '';
    const sec = Number.isFinite(sp.medianMs) ? Math.max(1, Math.round(sp.medianMs / 1000)) : null;
    if (sp.label === 'unstable') return '⚠ hay lỗi';
    if (sp.label === 'fast') return `⚡ nhanh${sec ? ` ~${sec}s` : ''}`;
    if (sp.label === 'slow') return `🐢 chậm${sec ? ` ~${sec}s` : ''}`;
    return '';
  }
  const shortName = (id) => String(id || 'Chọn model').replace(/^[a-z0-9-]+\//i, '');
  function pickModel() {
    const { el, bigSheet } = V();
    const list = el('div', { class: 'ai-models' }, A.models.length ? A.models.map((m) => el('button', {
      class: 'ai-mrow' + (m.id === A.model ? ' on' : ''),
      onclick: () => { A.model = m.id; V().LS.set('vpm.ai.model', m.id); document.querySelector('.sheet') && document.querySelector('.sheet').remove(); paint(); },
    }, el('b', { text: shortName(m.id) }), el('small', { text: [m.id.includes('/') ? m.id.split('/')[0] : '', speedTag(m.speed)].filter(Boolean).join(' · ') }))) : el('p', { class: 'hint', text: A.err || 'Đang tải danh sách model…' }));
    bigSheet('Chọn model', 'Model nhanh (⚡) hợp hỏi đáp thường ngày; model mạnh hợp việc khó.', list);
  }

  // ---------- markdown gọn (dựng DOM, không dùng innerHTML) ----------
  function inline(text) {
    const out = [];
    const re = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*|_[^_\n]+_)|(\[[^\]\n]+\]\(https?:\/\/[^\s)]+\))|(https?:\/\/[^\s<>()]+)/g;
    let last = 0; let m;
    const { el } = V();
    while ((m = re.exec(text))) {
      if (m.index > last) out.push(text.slice(last, m.index));
      const t = m[0];
      if (m[1]) out.push(el('code', { text: t.slice(1, -1) }));
      else if (m[2]) out.push(el('strong', {}, inline(t.slice(2, -2))));
      else if (m[3]) out.push(el('em', {}, inline(t.slice(1, -1))));
      else if (m[4]) { const mm = /^\[([^\]]+)\]\((.+)\)$/.exec(t); out.push(el('a', { href: mm[2], target: '_blank', rel: 'noopener', text: mm[1] })); }
      else out.push(el('a', { href: t, target: '_blank', rel: 'noopener', text: t }));
      last = m.index + t.length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }
  function md(src) {
    const { el, toast } = V();
    const lines = String(src || '').replace(/\r/g, '').split('\n');
    const root = el('div', { class: 'md' });
    let i = 0;
    while (i < lines.length) {
      const l = lines[i];
      const fence = /^\s*```(\S*)/.exec(l);
      if (fence) {
        const buf = []; i++;
        while (i < lines.length && !/^\s*```/.test(lines[i])) buf.push(lines[i++]);
        i++;
        const code = buf.join('\n');
        root.append(el('div', { class: 'md-code' }, el('div', { class: 'md-code-h' }, el('span', { text: fence[1] || 'code' }), el('button', { onclick: () => copy(code).then(() => toast('Đã chép code')), text: 'Chép' })), el('pre', {}, el('code', { text: code }))));
        continue;
      }
      if (!l.trim()) { i++; continue; }
      const h = /^(#{1,4})\s+(.*)$/.exec(l);
      if (h) { root.append(el('h' + Math.min(4, h[1].length + 1), {}, inline(h[2]))); i++; continue; }
      if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(l)) { root.append(el('hr')); i++; continue; }
      if (/^\s*\|.*\|\s*$/.test(l) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
        const row = (s) => s.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        const head = row(l); i += 2; const body = [];
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) body.push(row(lines[i++]));
        root.append(el('div', { class: 'md-table' }, el('table', {}, el('thead', {}, el('tr', {}, head.map((c) => el('th', {}, inline(c))))), el('tbody', {}, body.map((r) => el('tr', {}, r.map((c) => el('td', {}, inline(c)))))))));
        continue;
      }
      if (/^\s*>/.test(l)) {
        const buf = []; while (i < lines.length && /^\s*>/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ''));
        root.append(el('blockquote', {}, inline(buf.join(' ')))); continue;
      }
      const li = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(l);
      if (li) {
        const ordered = /\d/.test(li[2]); const list = el(ordered ? 'ol' : 'ul');
        while (i < lines.length) {
          const x = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(lines[i]);
          if (!x) { if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && list.lastChild) { list.lastChild.append(' ', ...inline(lines[i].trim())); i++; continue; } break; }
          list.append(el('li', { class: x[1].length >= 2 ? 'sub' : null }, inline(x[3]))); i++;
        }
        root.append(list); continue;
      }
      const buf = [];
      while (i < lines.length && lines[i].trim() && !/^\s*(```|#{1,4}\s|>|([-*+]|\d+[.)])\s|\|)/.test(lines[i])) buf.push(lines[i++]);
      if (!buf.length) buf.push(lines[i++]);
      const p = el('p'); buf.forEach((b, k) => { if (k) p.append(el('br')); p.append(...inline(b)); }); root.append(p);
    }
    return root;
  }
  async function copy(t) {
    try { await navigator.clipboard.writeText(t); return; } catch { /* WebView cũ */ }
    if (window.VPAndroid && window.VPAndroid.copy) { window.VPAndroid.copy(t); return; }
    const ta = document.createElement('textarea'); ta.value = t; document.body.append(ta); ta.select(); try { document.execCommand('copy'); } catch { /* bỏ qua */ } ta.remove();
  }

  // ---------- ảnh đính kèm (thu nhỏ trước khi gửi) ----------
  function shrink(file, max = 1280, q = 0.82) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file); const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', q));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Không đọc được ảnh')); };
      img.src = url;
    });
  }
  async function addImages(files) {
    for (const f of [...files].slice(0, 4 - A.imgs.length)) {
      if (!/^image\//.test(f.type)) continue;
      try { A.imgs.push(await shrink(f)); } catch (e) { V().toast(e.message); }
    }
    paintCompose();
  }

  // ---------- gửi + nhận chữ chạy ----------
  function toInput(t) {
    // gửi tối đa ~30 lượt gần nhất; ảnh cũ chỉ gửi lại ở 2 lượt người dùng gần nhất cho nhẹ
    const msgs = t.msgs.filter((m) => m.text || (m.images && m.images.length)).slice(-30);
    const userIdx = msgs.map((m, k) => (m.role === 'user' ? k : -1)).filter((k) => k >= 0);
    const keepImg = new Set(userIdx.slice(-2));
    return msgs.map((m, k) => (m.role === 'user'
      ? { role: 'user', content: [...(keepImg.has(k) ? (m.images || []).map((u) => ({ type: 'input_image', image_url: u })) : []), { type: 'input_text', text: m.text || (m.images && m.images.length ? 'Xem ảnh này giúp mình.' : '') }] }
      : { role: 'assistant', content: [{ type: 'output_text', text: m.text || '' }] }));
  }
  async function send() {
    const ta = document.getElementById('aiText');
    const text = (ta ? ta.value : A.draft).trim();
    if ((!text && !A.imgs.length) || A.busy) return;
    if (!A.model) { await loadModels(true); if (!A.model) { V().toast(A.err || 'Chưa có model nào dùng được'); return; } }
    const t = thread();
    t.msgs.push({ role: 'user', text, images: A.imgs.slice(), at: Date.now() });
    if (!t.title) t.title = (text || '🖼️ Ảnh').replace(/\s+/g, ' ').slice(0, 60);
    A.imgs = []; A.draft = ''; if (ta) ta.value = '';
    await ask(t);
  }
  async function ask(t) {
    const reply = { role: 'assistant', text: '', model: A.model, at: Date.now(), pending: true };
    t.msgs.push(reply); t.at = Date.now();
    const ctrl = new AbortController();
    A.busy = { ctrl, reply, t };
    paint(true);
    let lastPaint = 0;
    try {
      const res = await fetch('/v1/responses', {
        method: 'POST', signal: ctrl.signal,
        headers: V().headers({ 'content-type': 'application/json', accept: 'text/event-stream' }),
        body: JSON.stringify({ model: A.model, instructions: GUIDE, input: toInput({ msgs: t.msgs.slice(0, -1) }), stream: true, store: false, prompt_cache_key: 'vpm-' + t.id }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error((j && j.error && j.error.message) || `Gateway trả lỗi ${res.status}`);
      }
      const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let k;
        while ((k = buf.indexOf('\n\n')) >= 0) {
          const block = buf.slice(0, k); buf = buf.slice(k + 2);
          const data = block.split('\n').filter((x) => x.startsWith('data:')).map((x) => x.slice(5).trim()).join('');
          if (!data || data === '[DONE]') continue;
          let ev; try { ev = JSON.parse(data); } catch { continue; }
          if (ev.type === 'response.output_text.delta' && ev.delta) reply.text += ev.delta;
          else if (ev.type === 'response.reasoning_summary_text.delta' || ev.type === 'response.reasoning_text.delta') reply.thinking = true;
          else if ((ev.type === 'response.failed' || ev.type === 'error')) throw new Error((ev.response && ev.response.error && ev.response.error.message) || (ev.error && ev.error.message) || ev.message || 'Model báo lỗi');
          else if (ev.type === 'response.completed' && !reply.text) {
            const out = (ev.response && ev.response.output) || [];
            reply.text = out.flatMap((o) => o.content || []).filter((c) => c.type === 'output_text').map((c) => c.text).join('');
          }
        }
        if (Date.now() - lastPaint > 60) { lastPaint = Date.now(); paintReply(reply); }
      }
      if (!reply.text) throw new Error('Model không trả lời (thử lại hoặc đổi model)');
    } catch (e) {
      if (e.name === 'AbortError') reply.stopped = true;
      else reply.error = e.message;
    } finally {
      reply.pending = false; reply.ms = Date.now() - reply.at;
      A.busy = null; t.at = Date.now(); save(); paint();
    }
  }
  function stop() { if (A.busy) A.busy.ctrl.abort(); }
  function retry(t) {
    const last = t.msgs[t.msgs.length - 1];
    if (last && last.role === 'assistant') t.msgs.pop();
    ask(t);
  }

  // ---------- giao diện ----------
  function msgNode(m, t, idx) {
    const { el, toast } = V();
    if (m.role === 'user') {
      return el('div', { class: 'ai-u' }, (m.images || []).length ? el('div', { class: 'ai-imgs' }, m.images.map((u) => el('img', { src: u, alt: 'Ảnh đã gửi' }))) : null, m.text ? el('div', { class: 'ai-ub', text: m.text }) : null);
    }
    const body = el('div', { class: 'ai-a', 'data-i': idx });
    fillReply(body, m, t);
    return body;
  }
  function fillReply(box, m, t) {
    const { el, toast } = V();
    const kids = [];
    if (m.text) kids.push(md(m.text));
    if (m.pending) kids.push(el('div', { class: 'ai-typing' }, el('i'), el('i'), el('i'), el('span', { text: m.text ? '' : (m.thinking ? 'Đang suy nghĩ…' : 'Đang trả lời…') })));
    if (m.error) kids.push(el('div', { class: 'ai-err' }, el('span', { text: '⚠️ ' + m.error }), /ghép lại/.test(m.error) ? null : el('button', { onclick: () => retry(t), text: 'Thử lại' })));
    if (!m.pending && !m.error) {
      kids.push(el('div', { class: 'ai-meta' },
        el('span', { text: [shortName(m.model), m.ms ? (m.ms / 1000).toFixed(1) + ' giây' : '', m.stopped ? 'đã dừng' : ''].filter(Boolean).join(' · ') }),
        el('button', { onclick: () => copy(m.text).then(() => toast('Đã chép câu trả lời')), text: 'Chép' }),
        t.msgs[t.msgs.length - 1] === m ? el('button', { onclick: () => retry(t), text: 'Trả lời lại' }) : null));
    }
    box.replaceChildren(...kids);
  }
  function paintReply(m) {
    const box = document.querySelector('.ai-list .ai-a:last-child');
    if (!box || !A.busy || A.busy.reply !== m) return;
    const list = document.querySelector('.ai-list');
    const atEnd = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
    fillReply(box, m, A.busy.t);
    if (atEnd) list.scrollTop = list.scrollHeight;
  }
  function emptyState() {
    const { el } = V();
    const ideas = ['Viết caption bán hàng cho sản phẩm mới', 'Tóm tắt giúp mình nội dung ảnh này', 'Soạn tin nhắn xin nghỉ phép lịch sự', 'Lên kế hoạch nội dung Facebook 1 tuần'];
    return el('div', { class: 'ai-empty' },
      el('div', { class: 'ai-logo', text: '✨' }), el('h3', { text: 'Hỏi SIMI bất cứ điều gì' }),
      el('p', { text: 'Dùng quota AI của bạn như trên máy tính. Gửi kèm ảnh bằng nút 🖼️.' }),
      el('div', { class: 'ai-ideas' }, ideas.map((q) => el('button', { onclick: () => { const ta = document.getElementById('aiText'); if (ta) { ta.value = q; ta.focus(); grow(ta); } }, text: q }))));
  }
  function grow(ta) { ta.style.height = 'auto'; ta.style.height = Math.min(140, ta.scrollHeight) + 'px'; }
  function paintCompose() {
    const box = document.getElementById('aiCompose'); if (!box) return;
    const { el, svg, IC } = V();
    const ta = el('textarea', { id: 'aiText', rows: 1, placeholder: 'Nhắn cho SIMI…', enterkeyhint: 'send', oninput: (e) => { A.draft = e.target.value; grow(e.target); } });
    ta.value = A.draft;
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && matchMedia('(hover: hover)').matches) { e.preventDefault(); send(); } });
    const file = el('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true, onchange: (e) => { addImages(e.target.files); e.target.value = ''; } });
    box.replaceChildren(...[
      A.imgs.length ? el('div', { class: 'ai-pend' }, A.imgs.map((u, k) => el('div', {}, el('img', { src: u, alt: '' }), el('button', { 'aria-label': 'Bỏ ảnh', onclick: () => { A.imgs.splice(k, 1); paintCompose(); }, text: '×' })))) : null,
      el('div', { class: 'bar' },
        el('button', { class: 'iconbtn', 'aria-label': 'Gửi ảnh', title: 'Gửi ảnh', onclick: () => file.click() }, svg(IC.image)), file,
        ta,
        A.busy ? el('button', { class: 'send ai-stop', 'aria-label': 'Dừng', onclick: stop }, el('i'))
          : el('button', { class: 'send', 'aria-label': 'Gửi', onclick: send }, svg(IC.send)))].filter(Boolean));
    setTimeout(() => grow(ta), 0);
  }
  function openHistory() {
    const { el, bigSheet } = V();
    const items = A.threads.filter((t) => t.msgs.length).sort((a, b) => b.at - a.at);
    const close = () => { const s = document.querySelector('.sheet'); if (s) s.remove(); };
    bigSheet('Đoạn chat AI', items.length ? 'Lưu trên điện thoại này (tối đa 40 đoạn).' : 'Chưa có đoạn chat nào.', el('div', { class: 'ai-hist' },
      el('button', { class: 'ai-hnew', onclick: () => { close(); startNew(); }, text: '＋ Đoạn chat mới' }),
      items.map((t) => el('div', { class: 'ai-hrow' + (t === A.cur ? ' on' : '') },
        el('button', { class: 'ai-hgo', onclick: () => { close(); A.cur = t; paint(true); } }, el('b', { text: t.title || 'Đoạn chat' }), el('small', { text: new Date(t.at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) })),
        el('button', { class: 'ai-hdel', 'aria-label': 'Xoá đoạn chat', onclick: (e) => { e.stopPropagation(); A.threads = A.threads.filter((x) => x !== t); if (A.cur === t) A.cur = null; save(); close(); openHistory(); paint(); }, text: '🗑' })))));
  }
  function startNew() { if (A.busy) return; A.threads = A.threads.filter((x) => x.msgs.length); A.cur = newThread(); A.threads.unshift(A.cur); A.imgs = []; A.draft = ''; paint(true); }

  function paint(toBottom) {
    const host = document.getElementById('aiMain'); if (!host) return;
    const { el, svg, IC } = V();
    const t = thread();
    const head = document.getElementById('aiModel');
    if (head) head.textContent = shortName(A.model) + ' ▾';
    const list = el('div', { class: 'ai-list scroll' }, t.msgs.length ? t.msgs.map((m, k) => msgNode(m, t, k)) : emptyState());
    host.replaceChildren(list);
    if (A.err && !A.models.length) list.prepend(el('div', { class: 'banner', text: A.err }));
    paintCompose();
    if (toBottom !== false) list.scrollTop = list.scrollHeight;
    void svg; void IC;
  }

  // vẽ cả tab (thanh trên + nội dung + ô nhập) – gọi từ render() của trang chính
  function render() {
    const { el, svg, IC, avatar, S, tabBar, askLogout } = V();
    load();
    const top = el('div', { class: 'top ai-top' },
      el('button', { class: 'iconbtn', 'aria-label': 'Các đoạn chat', title: 'Các đoạn chat', onclick: openHistory }, svg('<path d="M4 6h16M4 12h16M4 18h10"/>')),
      el('h2', {}, 'Chat AI', el('button', { class: 'ai-model', id: 'aiModel', onclick: async () => { await loadModels(); pickModel(); }, text: shortName(A.model) + ' ▾' })),
      el('button', { class: 'iconbtn', 'aria-label': 'Đoạn chat mới', title: 'Đoạn chat mới', onclick: startNew }, svg('<path d="M12 5v14M5 12h14"/>')),
      el('button', { class: 'iconbtn', 'aria-label': 'Đăng xuất', title: 'Đăng xuất', onclick: askLogout }, svg(IC.out)));
    void avatar; void S;
    window.VPM.app.replaceChildren(top, el('div', { class: 'ai-main', id: 'aiMain' }), el('div', { class: 'compose ai-compose', id: 'aiCompose' }), tabBar());
    paint(true);
    loadModels().then(() => { const h = document.getElementById('aiModel'); if (h) h.textContent = shortName(A.model) + ' ▾'; if (A.err && !A.models.length) paint(false); });
  }

  window.VPMAI = { render, md, _state: A };
})();
