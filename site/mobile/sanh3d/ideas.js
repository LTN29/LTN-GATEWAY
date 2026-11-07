/* 📮 Hòm thư góp ý SIMI – dùng chung cho app máy tính và trang điện thoại (/m, đóng gói vào sanh3d/ideas.js).
   Mọi người gửi ý tưởng / cải thiện / báo lỗi cho App mobile, Mini app Zalo, Website, Khác; IT duyệt, trả lời, đổi trạng thái.
   Cần window.VP.el + VP.openModal / VP.closeModal. Nơi gọi truyền:
     load() → { ideas, summary, canReview, products, kinds, statuses, sites }
     act(action, body) → gọi Gateway (create | vote | review | delete)
     upload(file) → id ảnh đã tải lên (tuỳ chọn) · img(image, thumb) → URL hoặc Promise<URL> */
(function () {
  const PRODUCTS = { mobile: ['📱', 'App mobile', 'Ứng dụng SIMI trên điện thoại'], zalo: ['💬', 'Mini app Zalo', 'Mini app SIMI trong Zalo'], web: ['🌐', 'Website', 'simi.vn, bảo hành, kho, nhà cung cấp…'], other: ['✨', 'Khác', 'Quy trình, công cụ, ý tưởng mới…'] };
  const KINDS = { idea: '💡 Ý tưởng mới', improve: '🛠️ Cải thiện', bug: '🐞 Báo lỗi' };
  const STATUS = { new: '📥 Mới gửi', reviewing: '🔍 IT đang xem', planned: '🗓️ Đã lên kế hoạch', doing: '🛠️ Đang làm', done: '✅ Đã cập nhật', declined: '🙅 Chưa phù hợp' };
  const SITES = ['simi.vn', 'inventory.simi.vn', 'baohanh.simi.vn', 'prosper-supply.simi.vn'];
  const OPEN = ['new', 'reviewing', 'planned', 'doing'];
  const HINT = {
    idea: 'Ý tưởng là gì, giúp được ai, dùng trong tình huống nào…',
    improve: 'Hiện đang thế nào, chỗ nào bất tiện, mong muốn sửa ra sao…',
    bug: 'Làm bước nào → bị lỗi gì → đúng ra phải thế nào. Có ảnh chụp màn hình thì càng tốt!',
  };
  const ago = (t) => {
    const s = (Date.now() - t) / 1000;
    if (s < 60) return 'vừa xong'; if (s < 3600) return Math.floor(s / 60) + ' phút trước';
    if (s < 86400) return Math.floor(s / 3600) + ' giờ trước'; if (s < 86400 * 30) return Math.floor(s / 86400) + ' ngày trước';
    return new Date(t).toLocaleDateString('vi-VN');
  };
  let cur = null; // bảng đang mở (để làm mới khi có góp ý mới)

  function open(opts = {}) {
    const U = window.VP; const { el } = U;
    const st = { tab: opts.tab || 'send', data: null, err: '', product: '', site: '', kind: 'idea', title: '', detail: '', anon: false, files: [], prod: 'all', status: 'open', sort: 'new', expanded: new Set(), sent: null, busy: false };
    const body = el('div', { class: 'ib' });
    const act = async (action, b) => { try { const r = await opts.act(action, b); await reload(); return r; } catch (e) { toast(e.message || 'Có lỗi, thử lại nhé'); return null; } };
    const toast = (t) => { const n = body.querySelector('.ib-err'); if (n) { n.textContent = '⚠️ ' + t; n.hidden = false; } };

    // ---- biển hiệu đầu bảng: 4 sản phẩm + số góp ý ----
    const sign = () => {
      const s = (st.data && st.data.summary) || {};
      return el('div', { class: 'ib-sign' },
        el('div', { class: 'ib-sign-h' }, el('span', { class: 'ib-box', text: '📮' }), el('div', {}, el('b', { text: 'HÒM THƯ GÓP Ý SIMI' }), el('small', { text: 'Cùng xây sản phẩm tốt hơn – IT đọc từng thư và trả lời tại đây' }))),
        el('div', { class: 'ib-sign-row' }, ...Object.entries(PRODUCTS).map(([k, [ic, name]]) => {
          const b = s[k] || {};
          return el('button', { class: 'ib-plate', title: `Xem góp ý cho ${name}`, onclick: () => { st.tab = 'all'; st.prod = k; paint(); } },
            el('span', { class: 'ib-ic', text: ic }), el('b', { text: name }), el('small', { text: `${b.open || 0} đang xử lý · ${b.done || 0} đã làm` }));
        })));
    };
    const tabs = () => {
      const d = st.data; const mine = d ? d.ideas.filter((x) => x.mine).length : 0; const fresh = d ? d.ideas.filter((x) => x.status === 'new').length : 0;
      const T = [['send', '✍️ Gửi góp ý'], ['all', d && d.canReview ? `🛠️ Duyệt góp ý${fresh ? ` (${fresh} mới)` : ''}` : '📬 Góp ý của mọi người'], ['mine', `🙋 Của tôi${mine ? ` (${mine})` : ''}`]];
      return el('div', { class: 'ib-tabs', role: 'tablist' }, ...T.map(([k, label]) => el('button', { class: 'ib-tab' + (st.tab === k ? ' on' : ''), role: 'tab', 'aria-selected': String(st.tab === k), onclick: () => { st.tab = k; st.sent = null; paint(); } }, label)));
    };

    // ---- gửi góp ý ----
    const form = () => {
      if (st.sent) {
        return el('div', { class: 'ib-done' }, el('div', { class: 'ib-done-ic', text: '📮' }), el('b', { text: 'Đã bỏ vào hòm thư!' }),
          el('p', { text: 'IT sẽ xem và trả lời ngay trong mục "Của tôi". Cảm ơn bạn đã góp ý 💙' }),
          el('div', { class: 'ib-row' }, el('button', { class: 'btn', onclick: () => { st.sent = null; paint(); } }, '✍️ Gửi góp ý khác'), el('button', { class: 'btn primary', onclick: () => { st.tab = 'mine'; st.sent = null; paint(); } }, '🙋 Xem góp ý của tôi')));
      }
      const title = el('input', { class: 'ib-in', id: 'ibTitle', maxlength: '140', placeholder: 'Tóm tắt 1 câu, vd. "Trang bảo hành cho tra cứu bằng số điện thoại"', 'aria-label': 'Tiêu đề góp ý', oninput: (e) => { st.title = e.target.value; } });
      const detail = el('textarea', { class: 'ib-in', id: 'ibDetail', rows: '4', maxlength: '3000', placeholder: HINT[st.kind], 'aria-label': 'Chi tiết', oninput: (e) => { st.detail = e.target.value; } });
      title.value = st.title; detail.value = st.detail;
      const otherSite = el('input', { class: 'ib-in small', placeholder: 'Trang khác, vd. dealer.simi.vn', 'aria-label': 'Website khác', value: st.site && !SITES.includes(st.site) ? st.site : '', oninput: (e) => { st.site = e.target.value.trim(); } });
      const anon = el('input', { type: 'checkbox', id: 'ibAnon', onchange: (e) => { st.anon = e.target.checked; } });
      anon.checked = st.anon;
      const fileIn = el('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true, onchange: (e) => { addFiles([...e.target.files]); e.target.value = ''; } });
      const tray = el('div', { class: 'ib-tray' }, ...st.files.map((f, i) => el('span', { class: 'ib-thumb' }, el('img', { src: f.url, alt: 'Ảnh đính kèm' }), el('button', { 'aria-label': 'Bỏ ảnh', onclick: () => { st.files.splice(i, 1); paint(); } }, '✕'))));
      const addFiles = (files) => { for (const f of files.filter((x) => /^image\//.test(x.type))) { if (st.files.length >= 3) break; st.files.push({ file: f, url: URL.createObjectURL(f) }); } paint(); };
      const submit = async () => {
        if (!st.product) return toast('Chọn sản phẩm cần góp ý ở trên nhé');
        if (st.product === 'web' && !st.site) return toast('Chọn website (hoặc gõ tên trang khác)');
        if (title.value.trim().length < 4) { title.focus(); return toast('Viết tiêu đề rõ hơn chút nhé'); }
        st.busy = true; btn.disabled = true; btn.textContent = 'Đang gửi…';
        try {
          const images = [];
          for (const f of st.files) images.push(await opts.upload(f.file));
          await opts.act('create', { product: st.product, site: st.site, kind: st.kind, title: title.value, detail: detail.value, images, anon: anon.checked });
          st.files.forEach((f) => URL.revokeObjectURL(f.url));
          st.sent = true; st.files = []; st.product = ''; st.site = ''; st.kind = 'idea'; st.title = ''; st.detail = ''; st.anon = false;
          await reload();
        } catch (e) { toast(e.message || 'Chưa gửi được, thử lại nhé'); }
        st.busy = false; btn.disabled = false; btn.textContent = '📮 Bỏ vào hòm thư';
      };
      const btn = el('button', { class: 'btn primary ib-send', onclick: submit }, '📮 Bỏ vào hòm thư');
      return el('div', { class: 'ib-form' },
        el('label', { class: 'ib-lb', text: '1. Góp ý cho sản phẩm nào?' }),
        el('div', { class: 'ib-prods' }, ...Object.entries(PRODUCTS).map(([k, [ic, name, sub]]) => el('button', { class: 'ib-prod' + (st.product === k ? ' on' : ''), 'aria-pressed': String(st.product === k), onclick: () => { st.product = k; if (k !== 'web') st.site = ''; paint(); } },
          el('span', { class: 'ib-ic', text: ic }), el('b', { text: name }), el('small', { text: sub })))),
        st.product === 'web' ? el('div', { class: 'ib-sites' }, el('label', { class: 'ib-lb', text: 'Website nào?' }),
          el('div', { class: 'ib-chips' }, ...SITES.map((x) => el('button', { class: 'ib-chip' + (st.site === x ? ' on' : ''), onclick: () => { st.site = x; paint(); } }, x)), otherSite)) : null,
        el('label', { class: 'ib-lb', text: '2. Loại góp ý' }),
        el('div', { class: 'ib-chips' }, ...Object.entries(KINDS).map(([k, label]) => el('button', { class: 'ib-chip' + (st.kind === k ? ' on' : ''), onclick: () => { st.kind = k; paint(); } }, label))),
        el('label', { class: 'ib-lb', for: 'ibTitle', text: '3. Nội dung' }), title, detail,
        opts.upload ? el('div', { class: 'ib-row wrap' }, el('button', { class: 'btn small', disabled: st.files.length >= 3, onclick: () => fileIn.click() }, '📎 Đính kèm ảnh chụp màn hình'), el('small', { class: 'dim', text: 'tối đa 3 ảnh' }), fileIn) : null,
        st.files.length ? tray : null,
        el('label', { class: 'ib-anon' }, anon, el('span', { text: 'Gửi ẩn danh (đồng nghiệp không thấy tên, IT vẫn thấy để hỏi thêm)' })),
        el('p', { class: 'ib-err', hidden: true }),
        el('div', { class: 'ib-row end' }, btn));
    };

    // ---- danh sách ----
    const card = (x, review) => {
      const [ic, name] = PRODUCTS[x.product] || PRODUCTS.other;
      const long = (x.detail || '').length > 220 && !st.expanded.has(x.id);
      const imgs = (x.images || []).length ? el('div', { class: 'ib-imgs' }, ...x.images.map((im) => {
        const i = el('img', { alt: 'Ảnh góp ý', loading: 'lazy' });
        Promise.resolve(opts.img ? opts.img(im, true) : '').then((u) => { if (u) i.src = u; }).catch(() => { i.alt = 'Ảnh không còn'; });
        return el('button', { class: 'ib-img', title: 'Xem ảnh', onclick: () => opts.view && opts.view(im) }, i);
      })) : null;
      let del = null;
      if (x.canEdit || (st.data && st.data.canReview)) {
        del = el('button', { class: 'ib-del', title: x.canEdit ? 'Rút lại góp ý' : 'Xoá (trùng / spam)' }, '🗑');
        del.addEventListener('click', () => { if (!del.classList.contains('armed')) { del.classList.add('armed'); del.textContent = x.canEdit ? 'Rút lại?' : 'Xoá?'; setTimeout(() => { del.classList.remove('armed'); del.textContent = '🗑'; }, 4000); return; } act('delete', { id: x.id }); });
      }
      let rv = null;
      if (review) {
        const sel = el('select', { class: 'ib-in small', 'aria-label': 'Trạng thái' }, ...Object.entries(STATUS).map(([k, l]) => el('option', { value: k, text: l, selected: k === x.status })));
        const reply = el('textarea', { class: 'ib-in', rows: '2', maxlength: '2000', placeholder: 'Trả lời người góp ý (họ sẽ thấy ngay)…', 'aria-label': 'Trả lời của IT' });
        reply.value = x.reply || '';
        rv = el('div', { class: 'ib-review' }, el('div', { class: 'ib-row' }, el('b', { text: '🛠️ IT duyệt:' }), sel), reply,
          el('div', { class: 'ib-row end' }, el('button', { class: 'btn small primary', onclick: async (e) => { e.target.disabled = true; await act('review', { id: x.id, status: sel.value, reply: reply.value }); } }, '💾 Lưu & báo người gửi')));
      }
      return el('article', { class: 'ib-card st-' + x.status + (x.mine ? ' mine' : '') },
        el('div', { class: 'ib-tags' }, el('span', { class: 'ib-tag prod', text: `${ic} ${name}${x.site ? ' · ' + x.site : ''}` }), el('span', { class: 'ib-tag', text: KINDS[x.kind] || KINDS.idea }), el('span', { class: 'ib-st', text: STATUS[x.status] || x.status })),
        el('h4', { text: x.title }),
        x.detail ? el('p', { class: 'ib-detail' + (long ? ' clamp' : ''), text: x.detail }) : null,
        long ? el('button', { class: 'linkbtn small', onclick: () => { st.expanded.add(x.id); paint(); } }, 'Xem thêm') : null,
        imgs,
        x.reply ? el('div', { class: 'ib-reply' }, el('b', { text: `💬 ${x.replyBy || 'IT'} trả lời:` }), el('span', { text: x.reply })) : null,
        el('div', { class: 'ib-foot' },
          el('small', { text: `${x.mine ? 'Bạn' : x.name}${x.team ? ' · ' + x.team : ''}${x.anon && (x.mine || review) ? ' · ẩn danh' : ''} · ${ago(x.ts)}` }),
          el('span', { class: 'grow' }), del,
          el('button', { class: 'ib-vote' + (x.voted ? ' on' : ''), 'aria-pressed': String(!!x.voted), title: 'Bấm nếu bạn cũng cần điều này – IT ưu tiên việc nhiều người cần', onclick: () => act('vote', { id: x.id }) }, `👍 Tôi cũng cần${x.votes ? ' · ' + x.votes : ''}`)),
        rv);
    };
    const list = (mineOnly) => {
      const d = st.data; if (!d) return el('div', { class: 'ib-empty', text: st.err ? '⚠️ ' + st.err : 'Đang mở hòm thư…' });
      const review = d.canReview && !mineOnly;
      let items = d.ideas.filter((x) => (mineOnly ? x.mine : true));
      if (st.prod !== 'all') items = items.filter((x) => x.product === st.prod);
      if (!mineOnly) items = items.filter((x) => (st.status === 'open' ? OPEN.includes(x.status) : st.status === 'done' ? x.status === 'done' || x.status === 'declined' : true));
      items.sort(st.sort === 'votes' ? (a, b) => b.votes - a.votes || b.ts - a.ts : (a, b) => b.ts - a.ts);
      const filters = el('div', { class: 'ib-filters' },
        el('div', { class: 'ib-chips' }, ...[['all', 'Tất cả'], ...Object.entries(PRODUCTS).map(([k, [ic, n]]) => [k, `${ic} ${n}`])].map(([k, l]) => el('button', { class: 'ib-chip' + (st.prod === k ? ' on' : ''), onclick: () => { st.prod = k; paint(); } }, l))),
        mineOnly ? null : el('div', { class: 'ib-row wrap' },
          el('select', { class: 'ib-in small', 'aria-label': 'Lọc trạng thái', onchange: (e) => { st.status = e.target.value; paint(); } }, ...[['open', 'Đang xử lý'], ['done', 'Đã xong / đóng'], ['any', 'Tất cả trạng thái']].map(([k, l]) => el('option', { value: k, text: l, selected: st.status === k }))),
          el('select', { class: 'ib-in small', 'aria-label': 'Sắp xếp', onchange: (e) => { st.sort = e.target.value; paint(); } }, ...[['new', 'Mới nhất'], ['votes', 'Nhiều người cần nhất']].map(([k, l]) => el('option', { value: k, text: l, selected: st.sort === k })))));
      const empty = el('div', { class: 'ib-empty' }, el('div', { class: 'ib-done-ic', text: '📭' }),
        el('b', { text: mineOnly ? 'Bạn chưa gửi góp ý nào' : 'Chưa có góp ý ở mục này' }),
        el('button', { class: 'btn small', onclick: () => { st.tab = 'send'; paint(); } }, '✍️ Gửi góp ý đầu tiên'));
      return el('div', { class: 'ib-list' }, filters, el('p', { class: 'ib-err', hidden: true }), ...(items.length ? items.map((x) => card(x, review)) : [empty]));
    };

    const paint = () => {
      const keep = body.closest('.modal-body, .box, .fq-sheet'); const top = keep ? keep.scrollTop : 0;
      body.replaceChildren(sign(), tabs(), st.tab === 'send' ? form() : list(st.tab === 'mine'));
      if (keep && st.tab !== 'send') keep.scrollTop = top;
    };
    const reload = async () => { try { st.data = await opts.load(); st.err = ''; } catch (e) { st.err = (e && e.message) || 'Chưa mở được hòm thư'; } if (body.isConnected) paint(); };
    U.openModal('📮 Hòm thư góp ý SIMI', body, [el('div', { class: 'left' }, el('small', { class: 'dim', text: 'Góp ý cho App mobile · Mini app Zalo · Website · Khác' })), el('button', { class: 'btn', text: 'Đóng', onclick: U.closeModal })]);
    paint(); reload();
    cur = { reload, body };
  }

  // có góp ý mới / IT vừa trả lời → bảng đang mở tự làm mới
  function refresh() { if (cur && cur.body.isConnected) cur.reload(); else cur = null; }

  window.VPIdeas = { open, refresh, PRODUCTS, STATUS };
})();
