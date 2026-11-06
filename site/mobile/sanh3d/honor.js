/* 🏆 Bảng vàng Sảnh – dùng chung cho app máy tính và trang điện thoại (/m, đóng gói vào sanh3d/honor.js).
   Cần window.VP.el + VP.openModal / VP.closeModal; dữ liệu lấy qua hàm load({ period, offset }) do nơi gọi truyền vào. */
(function () {
  const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');
  const CATS = [
    { key: 'thantai', icon: '💰', title: 'Thần Tài sống', short: 'Thần Tài sống', sub: 'Tổng điểm Tài lộc của tuần: xin quẻ + khấn Thần Tài + chăm dùng AI.', unit: (x) => `${fmt(x.score)} điểm`, detail: (x) => x.parts ? `🎋 ${x.parts.fortune} · 🙏 ${x.parts.pray} · 🤖 ${x.parts.ai}` : '' },
    { key: 'lucky', icon: '🍀', title: 'Người may mắn nhất', short: 'May mắn nhất', sub: 'Bóc được nhiều quẻ xịn nhất: Đại cát 3 điểm · Thượng cát 2 · Trung cát 1.', unit: (x) => `${fmt(x.score)} điểm`, detail: (x) => `${x.dai ? `🌟 ${x.dai} Đại cát · ` : ''}${x.draws || 0} quẻ` },
    { key: 'ai', icon: '🤖', title: 'Chiến thần AI', short: 'Chiến thần AI', sub: 'Dùng AI nhiều nhất (số lượt hỏi AI thành công, tài khoản cá nhân).', unit: (x) => `${fmt(x.score)} lượt`, detail: () => '' },
  ];
  const MEDAL = ['🥇', '🥈', '🥉'];
  const PERIODS = [{ id: 'w0', label: 'Tuần này', q: { period: 'week', offset: 0 } }, { id: 'w1', label: 'Tuần trước', q: { period: 'week', offset: 1 } }, { id: 'm0', label: 'Tháng này', q: { period: 'month', offset: 0 } }];

  function rulesBox(el, r) {
    if (!r) return null;
    const f = r.fortunePts || {};
    return el('details', { class: 'hn-rules' }, el('summary', { text: '📜 Cách tính điểm Tài lộc (Thần Tài sống)' }),
      el('ul', {},
        el('li', { text: `🎋 Xin quẻ đầu ngày (ống quẻ cạnh bàn thờ): Đại cát +${f['Đại cát']} · Thượng cát +${f['Thượng cát']} · Trung cát +${f['Trung cát']}` }),
        el('li', { text: `🙏 Quỳ khấn trước bàn thờ Thần Tài: +${r.prayPts} mỗi lần, tối đa ${r.prayMaxPerDay} lần/ngày (cách nhau 1 phút)` }),
        el('li', { text: `🤖 Dùng AI: +1 cho mỗi ${r.aiPer} lượt, tối đa +${r.aiMaxPerDay}/ngày` }),
        el('li', { text: '📅 Bảng tính lại từ Thứ Hai hằng tuần. Quẻ do máy chủ tính – không chỉnh được 😉' })));
  }

  function open({ load, me = null } = {}) {
    const U = window.VP; const { el } = U;
    const st = { per: 'w0', cat: 'thantai', data: null, err: null };
    const body = el('div', { class: 'hn' });
    const paint = () => {
      const d = st.data;
      const perBar = el('div', { class: 'hn-seg', role: 'tablist' }, ...PERIODS.map((p) => el('button', { class: 'hn-chip' + (p.id === st.per ? ' on' : ''), role: 'tab', 'aria-selected': String(p.id === st.per), onclick: () => { if (st.per !== p.id) { st.per = p.id; fetchNow(); } } }, p.label)));
      const catBar = el('div', { class: 'hn-cats', role: 'tablist' }, ...CATS.map((c) => el('button', { class: 'hn-cat' + (c.key === st.cat ? ' on' : ''), role: 'tab', 'aria-selected': String(c.key === st.cat), onclick: () => { st.cat = c.key; paint(); } },
        el('span', { class: 'hn-ci', text: c.icon }), el('span', { text: c.short }))));
      if (st.err) { body.replaceChildren(perBar, el('div', { class: 'hn-empty', text: '⚠️ ' + st.err })); return; }
      if (!d) { body.replaceChildren(perBar, catBar, el('div', { class: 'hn-empty', text: 'Đang mở Bảng vàng…' })); return; }
      const cat = CATS.find((c) => c.key === st.cat);
      const rows = (d.boards && d.boards[cat.key]) || [];
      const meId = (d.me && d.me.id) || (me && me.id);
      const list = rows.length ? el('ol', { class: 'hn-list' }, ...rows.map((x) => el('li', { class: 'hn-row' + (x.rank <= 3 ? ' top top' + x.rank : '') + (x.id === meId ? ' me' : '') },
        el('span', { class: 'hn-rank', text: MEDAL[x.rank - 1] || String(x.rank) }),
        el('span', { class: 'hn-who' }, el('b', { text: x.name + (x.id === meId ? ' (bạn)' : '') }), el('small', { text: [x.team, cat.detail(x)].filter(Boolean).join(' · ') })),
        el('span', { class: 'hn-score', text: cat.unit(x) }))))
        : el('div', { class: 'hn-empty', text: cat.key === 'ai' ? 'Chưa có ai dùng AI trong kỳ này.' : 'Chưa có ai – ra ống quẻ cạnh bàn thờ Thần Tài để mở hàng nhé! 🎋' });
      const mine = d.me && d.me[cat.key];
      const meLine = mine ? el('div', { class: 'hn-me' }, el('span', { text: mine.rank ? `Bạn đang hạng ${mine.rank}` : 'Bạn chưa vào bảng' }),
        el('b', { text: cat.unit({ score: mine.score }) })) : null;
      const t = d.me && d.me.today;
      const today = t && st.per === 'w0' ? el('div', { class: 'hn-today' },
        el('span', { text: t.fortune ? `🎋 Quẻ hôm nay: ${t.fortune}` : '🎋 Hôm nay chưa xin quẻ' }),
        el('span', { text: `🙏 Đã khấn ${t.prays}/${(d.rules && d.rules.prayMaxPerDay) || 3}` })) : null;
      const last = d.last && st.per === 'w0' && (d.last.thantai || d.last.lucky || d.last.ai) ? el('div', { class: 'hn-last' }, el('small', { text: `🏅 Vinh danh ${d.last.label.replace(/^Tuần/, 'tuần').replace(/^Tháng/, 'tháng')}` }),
        el('div', {}, ...CATS.filter((c) => d.last[c.key]).map((c) => el('span', { class: 'hn-tag', text: `${c.icon} ${d.last[c.key].name}` })))) : null;
      body.replaceChildren(...[perBar, el('div', { class: 'hn-period', text: `${d.label}` }), catBar, el('p', { class: 'hn-sub', text: cat.sub }), list, meLine, today, last, rulesBox(el, d.rules)].filter(Boolean));
    };
    const fetchNow = async () => {
      st.data = null; st.err = null; paint();
      const p = PERIODS.find((x) => x.id === st.per);
      try { st.data = await load(p.q); } catch (e) { st.err = (e && e.message) || 'Chưa mở được Bảng vàng'; }
      paint();
    };
    U.openModal('🏆 Bảng vàng Sảnh', body, [el('div', { class: 'left' }, el('small', { class: 'dim', text: 'Vinh danh mỗi tuần · cùng đua Tài lộc nhé!' })), el('button', { class: 'btn primary', text: 'Đóng', onclick: U.closeModal })]);
    fetchNow();
  }

  window.VPHonor = { open, CATS };
})();
