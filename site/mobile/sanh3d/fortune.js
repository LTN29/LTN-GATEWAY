/* 🎋 Xin quẻ đầu ngày ở Sảnh: AI viết thông điệp may mắn, đầy năng lượng cho từng người (30 câu dưới chỉ là dự phòng khi AI lỗi): bấm ống quẻ cạnh bàn thờ Thần Tài → lắc 3 lần → 1 que rơi ra → đọc quẻ.
   Mỗi người mỗi ngày 1 quẻ: số quẻ tính từ mã người dùng + ngày nên máy nào cũng ra cùng quẻ, mai mới đổi. */
(function () {
  // 30 thông điệp dự phòng ("tên quẻ|thông điệp") – dùng khi chưa kết nối SIMI hoặc AI trả lời quá lâu
  const RAW = [
    'Khai Vận|Hôm nay vận may đang mở cửa chờ bạn. Cứ tự tin bước tới – mọi nỗ lực của bạn đều đang được ghi nhận!',
    'Tài Lộc|Lộc đang trên đường về với bạn. Một cuộc gọi, một tin nhắn hôm nay có thể mở ra cơ hội lớn – hãy chủ động!',
    'Mặt Trời|Năng lượng của bạn hôm nay rực rỡ như nắng sớm. Nụ cười của bạn sẽ khiến khách hàng và đồng nghiệp vui lây.',
    'Hạt Giống|Những gì bạn gieo hôm qua đang nảy mầm. Kiên nhẫn thêm chút nữa, trái ngọt sẽ đến đúng lúc.',
    'Thuận Buồm|Gió đang thổi về phía bạn. Việc gì còn dang dở, hôm nay chính là ngày để hoàn thành nó.',
    'Quý Nhân|Hôm nay bạn sẽ gặp người giúp đỡ mình đúng lúc. Hãy mở lòng, lắng nghe và đừng quên nói lời cảm ơn.',
    'Bứt Phá|Bạn mạnh mẽ hơn bạn nghĩ. Thử thách hôm nay chính là bậc thang đưa bạn lên một tầm cao mới.',
    'Niềm Vui|Một tin vui đang chờ bạn. Hãy để ý những điều tốt đẹp quanh mình – chúng nhiều hơn bạn tưởng đấy!',
    'Chốt Đơn|Hôm nay là ngày của những cái gật đầu. Nói bằng cả trái tim, khách hàng sẽ cảm nhận được sự chân thành của bạn.',
    'Đồng Đội|Bạn không bao giờ đi một mình. Cả team luôn ở phía sau bạn – cùng nhau, không gì là không thể!',
    'Tự Tin|Bạn xứng đáng với mọi điều tốt đẹp. Ngẩng cao đầu và bước vào ngày mới như một nhà vô địch!',
    'Bình An|Mọi lo lắng rồi sẽ qua. Hít một hơi thật sâu – hôm nay bạn sẽ xử lý mọi việc thật nhẹ nhàng.',
    'Phát Đạt|Con số hôm nay sẽ khiến bạn mỉm cười. Mỗi bước nhỏ đều đang cộng dồn thành một thành công lớn.',
    'Sáng Tạo|Đầu óc bạn hôm nay đầy ý tưởng hay. Ghi lại ngay – một trong số đó có thể làm nên cả tháng của bạn.',
    'Kiên Trì|Người kiên trì luôn là người về đích. Đừng bỏ cuộc – bạn đã đi được xa hơn mình nghĩ rồi!',
    'Ngôi Sao|Hôm nay bạn chính là ngôi sao. Hãy tỏa sáng theo cách của riêng mình – mọi người đều đang nhìn thấy bạn.',
    'Biết Ơn|Lòng biết ơn là chìa khoá mở cửa may mắn. Cảm ơn một người hôm nay, bạn sẽ nhận lại gấp nhiều lần.',
    'Rộng Mở|Một cánh cửa mới đang mở ra. Đừng ngại thay đổi – điều tuyệt vời nhất thường đến từ những lối đi mới.',
    'Năng Lượng|Bạn đang được sạc đầy pin! Dồn năng lượng ấy cho việc quan trọng nhất ngay từ buổi sáng nhé.',
    'Khách Quý|Một khách hàng tốt đang tìm đến bạn. Chuẩn bị nụ cười và sự tận tâm – phần còn lại cứ để may mắn lo.',
    'Bản Lĩnh|Bạn đủ bản lĩnh để vượt qua mọi khó khăn. Hôm nay, hãy tin vào chính mình thêm một chút nữa.',
    'Hạnh Phúc|Hạnh phúc nằm ngay trong công việc bạn đang làm. Làm bằng cả trái tim, thành quả sẽ đến thật tự nhiên.',
    'Thăng Tiến|Sự cố gắng của bạn đang được nhìn thấy. Cứ tiếp tục – cơ hội thăng tiến không còn xa nữa đâu.',
    'Lan Tỏa|Một lời động viên của bạn hôm nay có thể làm bừng sáng ngày của ai đó. Hãy lan tỏa năng lượng tích cực!',
    'Vững Vàng|Nền móng bạn xây đang rất chắc chắn. Mọi việc bạn làm hôm nay đều góp phần cho thành công lâu dài.',
    'Đúng Lúc|Mọi thứ đang đến đúng thời điểm. Không cần vội – bạn đang ở đúng nơi và làm đúng việc.',
    'Cầu Vồng|Sau cơn mưa trời lại sáng. Nếu hôm qua chưa như ý, hôm nay chính là ngày để bắt đầu lại thật rực rỡ.',
    'Thành Công|Thành công không ở đâu xa – nó nằm ngay trong việc tiếp theo bạn làm. Bắt tay vào thôi!',
    'Tâm An|Giữ tâm bình an thì việc gì cũng sáng suốt. Hôm nay bạn sẽ đưa ra những quyết định thật đúng đắn.',
    'Đại Cát|Quẻ đẹp nhất trong ống! Hôm nay mọi điều tốt lành đều hướng về bạn – hãy đón nhận bằng cả trái tim.',
  ];
  // loại quẻ (đều là quẻ tốt): 10 Đại cát · 10 Thượng cát · 10 Trung cát
  const LEVEL = 'ĐĐTGĐTTGĐTTGĐTGĐGTTĐTGĐTGGGĐGĐ'.split('').map((c) => ({ Đ: 'Đại cát', T: 'Thượng cát', G: 'Trung cát' })[c]);
  const LEVEL_TAG = { 'Đại cát': '🌟', 'Thượng cát': '✨', 'Trung cát': '🍀' };
  const DO = ['Gọi lại 3 khách cũ', 'Đăng 1 bài bán hàng', 'Nhờ AI viết lời chào hàng mới', 'Cập nhật bảng giá', 'Cảm ơn một khách quen', 'Dọn dẹp danh sách khách',
    'Học thêm về sản phẩm 15 phút', 'Khen một đồng nghiệp', 'Uống đủ 2 lít nước', 'Chốt đơn trước 11 giờ', 'Trả lời tin nhắn trong 5 phút', 'Xin khách một đánh giá 5 sao',
    'Mời đồng nghiệp ly cà phê', 'Đứng dậy vươn vai mỗi giờ', 'Viết ra mục tiêu hôm nay', 'Chụp lại ảnh sản phẩm thật đẹp', 'Hỏi thăm khách trước khi chào hàng', 'Ghi chú câu hỏi khó của khách'];
  const COLOR_HEX = { 'Đỏ son': '#d22a1f', 'Vàng kim': '#e0ae3c', 'Xanh lá': '#2fae5a', 'Xanh dương SIMI': '#0a78f0', 'Trắng': '#ffffff', 'Tím mộng mơ': '#8f6ad8', 'Cam may mắn': '#ff8a1e', 'Hồng đào': '#ff8fb1', 'Xanh ngọc': '#1fb5a8', 'Bạc': '#c0c6cf' };
  const COLORS = Object.keys(COLOR_HEX);
  const HOURS = ['8:00 – 9:00', '9:00 – 10:00', '10:00 – 11:00', '11:00 – 12:00', '13:30 – 14:30', '14:30 – 15:30', '15:30 – 16:30', '16:30 – 17:30', '19:00 – 20:00'];

  function hash(str) { let h = 0x811c9dc5; for (const ch of String(str)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
  function rng(seed) { let s = seed || 1; return () => { s = (Math.imul(s ^ (s >>> 15), 0x2c1b3c6d) + 0x6d2b79f5) >>> 0; s ^= s >>> 13; return (s >>> 0) / 4294967296; }; }
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

  // quẻ của người này hôm nay (cố định trong ngày, máy nào cũng giống)
  function fortuneOf(userId, date = today()) {
    const R = rng(hash(`${userId || 'me'}|${date}|simi-que`));
    const n = 1 + Math.floor(R() * RAW.length);
    const [name, message] = RAW[n - 1].split('|');
    const pick = (a) => a[Math.floor(R() * a.length)];
    return { n, name, level: LEVEL[n - 1], message, do: pick(DO), number: 1 + Math.floor(R() * 99), color: pick(COLORS), hour: pick(HOURS), date };
  }
  const store = {
    get: () => { try { return JSON.parse(localStorage.getItem('vp.fortune') || 'null'); } catch { return null; } },
    set: (v) => { try { localStorage.setItem('vp.fortune', JSON.stringify(v)); } catch { /* bỏ qua */ } },
  };
  const drawnToday = (userId) => { const s = store.get(); return !!(s && s.date === today() && s.user === (userId || 'me')); };

  let U = null;
  function open({ me = null, share = null, onDrawn = null } = {}) {
    const saved = store.get();
    U = U || window.VP;
    const { el } = U;
    const uid = me && me.id ? me.id : 'me';
    const f = fortuneOf(uid);
    if (saved && saved.date === f.date && saved.user === uid && saved.ai) Object.assign(f, saved.ai); // quẻ AI đã viết hôm nay
    const already = drawnToday(uid);
    const sticks = el('div', { class: 'fq-sticks' }, ...Array.from({ length: 13 }, (_, i) => el('i', { style: `--i:${i - 6};--h:${70 + ((i * 37) % 26)}px` })));
    const tube = el('div', { class: 'fq-tube' }, sticks, el('div', { class: 'fq-body' }, el('span', { text: '籤' })));
    const out = el('div', { class: 'fq-out', hidden: true }, el('b', { text: `${f.n}` }));
    const count = el('div', { class: 'fq-count', 'aria-live': 'polite' });
    const card = el('div', { class: 'fq-card', hidden: true });
    const stage = el('div', { class: 'fq-stage' }, tube, out, count);
    const btn = el('button', { class: 'btn primary fq-shake', text: '🎋 Lắc quẻ' });
    const body = el('div', { class: 'fq' }, el('p', { class: 'fq-hint', text: already ? 'Hôm nay bạn đã xin quẻ rồi – đây là quẻ của bạn. Mai quay lại xin quẻ mới nhé!' : 'Thành tâm nghĩ về ngày hôm nay, rồi bấm Lắc quẻ – lắc 3 lần, que nào rơi ra là thông điệp may mắn dành cho bạn.' }), stage, already ? null : btn, card);
    const showCard = () => {
      card.replaceChildren(
        el('div', { class: 'fq-head' }, el('span', { class: 'fq-no', text: `Quẻ số ${f.n} · ${f.name}` }), el('span', { class: 'fq-lv fq-' + (['Đại cát', 'Thượng cát', 'Trung cát'].indexOf(f.level) + 1), text: `${LEVEL_TAG[f.level]} ${f.level}` })),
        el('blockquote', { class: 'fq-poem fq-msg', text: f.message }),
        el('div', { class: 'fq-grid' },
          el('div', { class: 'fq-big' }, el('small', { text: '🔢 Số may mắn' }), el('b', { text: String(f.number) })),
          el('div', { class: 'fq-big' }, el('small', { text: '🎨 Màu may mắn' }), el('b', {}, el('i', { class: 'fq-dot', style: `background:${COLOR_HEX[f.color] || '#e8b84a'}` }), f.color)),
          el('div', { class: 'wide' }, el('small', { text: '🍀 Việc nên làm hôm nay' }), el('b', { text: f.do })),
          el('div', { class: 'wide' }, el('small', { text: '⏰ Giờ vàng chốt đơn' }), el('b', { text: f.hour }))),
        el('small', { class: 'fq-note', text: (f.byAi ? '🔮 Quẻ do AI luận riêng cho bạn hôm nay · ' : '') + 'Chúc bạn một ngày thật nhiều năng lượng và may mắn! 🍀' }));
      card.hidden = false;
      card.scrollIntoView && card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
    const shareBtn = share ? el('button', { class: 'btn', text: '📣 Khoe lên Sảnh', onclick: () => { share(`🎋 Quẻ đầu ngày của mình: Quẻ số ${f.n} · ${f.name} – ${f.level} ${LEVEL_TAG[f.level]}\n“${f.message}”\n🔢 Số may mắn ${f.number} · 🎨 Màu ${f.color}`); shareBtn.disabled = true; shareBtn.textContent = '✓ Đã khoe'; } }) : null;
    if (shareBtn && !already) shareBtn.style.display = 'none'; // .btn tự đặt display nên thuộc tính hidden không ăn
    U.openModal('🎋 Xin quẻ đầu ngày', body, [el('div', { class: 'left' }, el('small', { class: 'dim', text: 'Mỗi ngày 1 quẻ · AI luận riêng cho bạn' })), shareBtn, el('button', { class: 'btn primary', text: 'Đóng', onclick: U.closeModal })].filter(Boolean));
    if (already) { out.hidden = false; out.classList.add('done'); showCard(); if (onDrawn) { try { onDrawn(f); } catch { /* bỏ qua */ } } return; }
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      // AI viết quẻ trong lúc lắc; lắc xong mà chưa có thì lắc tiếp "đang luận quẻ" (tối đa ~25 giây, quá thì dùng quẻ dự phòng)
      let ai = null; let aiDone = false;
      const aiTask = (window.vp && window.vp.fortune ? window.vp.fortune.ask({ name: me && me.name, team: me && me.teamName, level: f.level, n: f.n, date: f.date }) : Promise.reject(new Error('no ai')))
        .then((r) => { ai = r; }).catch(() => { ai = null; }).finally(() => { aiDone = true; });
      for (let k = 1; k <= 3 || (!aiDone && k <= 40); k++) {
        count.textContent = k <= 3 ? `Lắc… ${k}` : '🔮 Đang luận quẻ…';
        tube.classList.remove('shake'); void tube.offsetWidth; tube.classList.add('shake');
        await wait(620);
      }
      await Promise.race([aiTask, wait(200)]);
      if (ai && ai.message) Object.assign(f, { message: ai.message, name: ai.name || f.name, do: ai.do || f.do, byAi: true });
      tube.classList.remove('shake');
      count.textContent = 'Có quẻ rồi!';
      out.hidden = false; out.classList.add('fall');
      await wait(1100);
      store.set({ date: f.date, user: uid, n: f.n, ai: f.byAi ? { message: f.message, name: f.name, do: f.do, byAi: true } : null });
      btn.remove(); if (shareBtn) shareBtn.style.display = '';
      showCard();
      if (onDrawn) { try { onDrawn(f); } catch { /* bỏ qua */ } } // báo Bảng vàng (Gateway tự tính mức quẻ)
    });
  }

  window.VPFortune = { open, fortuneOf, drawnToday, count: RAW.length };
})();
