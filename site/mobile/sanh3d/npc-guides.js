/* Nội dung có sẵn của NPC "Trợ lý SIMI": hướng dẫn từng bước + mẹo dùng AI. Admin sửa / thêm được trong tab Quản trị
   (Gateway lưu, app tải về – không cần phát hành app mới). target = nút được chỉ tới (làm tối phần còn lại của màn hình),
   view = tab cần mở trước (office | chat | lobby), place = chỗ trong Sảnh 3D để camera bay tới (npc | bar | dance | cinema | game | garden). */
(function () {
  const GUIDES = [
    { id: 'tour', icon: '🧭', title: 'Làm quen Văn Phòng AI (1 phút)', steps: [
      { text: 'Văn Phòng AI có 3 khu chính trên thanh trên cùng: 🏢 Văn phòng (giao việc cho đội AI), 💬 Chat (trò chuyện với AI như ChatGPT), 🌐 Sảnh (gặp đồng nghiệp).', target: '.viewtabs' },
      { text: '🏢 Văn phòng: gõ việc cần làm, chọn người nhận rồi bấm Giao ngay. Trưởng phòng ★ sẽ chia việc cho cả đội, có người kiểm tra lại trước khi nộp.', target: '.viewtabs button[data-v="office"]' },
      { text: '💬 Chat: hỏi AI bất cứ điều gì, gửi kèm ảnh / file, gọi skill bằng phím /. Đoạn chat được lưu lại ở cột trái.', target: '.viewtabs button[data-v="chat"]' },
      { text: '🌐 Sảnh: thấy ai đang online, nhắn tin, gửi ảnh, xem video chung, nhảy, chơi bida và chơi với mèo Mít.', target: '.viewtabs button[data-v="lobby"]' },
      { text: '🔌 Kết nối: nơi cài SIMI Gateway bằng key của bạn – app tự dùng key này cho Chat và Sảnh.', target: '#btnAccounts' },
      { text: '⚙️ Cài đặt: bật / tắt âm thanh, thông báo, Sảnh, chế độ nhẹ cho máy yếu, tự cập nhật app.', target: '#btnSettings' },
    ] },
    { id: 'chat', icon: '💬', title: 'Chat với AI', steps: [
      { view: 'chat', text: 'Bấm "Đoạn chat mới" ở cột trái để bắt đầu một cuộc trò chuyện mới (mỗi việc một đoạn cho AI đỡ lẫn).', target: '.ch-new' },
      { view: 'chat', text: 'Gõ yêu cầu vào ô nhập, Enter để gửi. Shift + Enter để xuống dòng.', target: '#chInput' },
      { view: 'chat', text: 'Gửi ảnh / file: dán ảnh bằng Ctrl + V, kéo thả file vào ô chat, hoặc bấm nút ＋.', target: '#chInput' },
      { view: 'chat', text: 'Gõ / để chọn skill (tạo ảnh, tạo video, đọc PDF, tìm web…). Gõ @ để gọi công cụ như 🖱️ Máy tính.', target: '.cb.skill' },
      { view: 'chat', text: 'Chọn model và mức suy nghĩ ngay dưới ô nhập: việc khó chọn Kỹ / Rất kỹ, việc nhanh chọn Nhanh cho đỡ tốn lượt.', target: '#chModel' },
      { view: 'chat', text: 'Quyền trên máy: mặc định chỉ sửa file trong thư mục dự án. Khi AI cần làm thêm, sẽ hiện hộp vàng hỏi bạn Cho phép / Từ chối.', target: '#chSandbox' },
    ] },
    { id: 'project', icon: '📁', title: 'Dự án, lưu trữ, xoá đoạn chat', steps: [
      { view: 'chat', text: 'Bấm ＋ Thêm dự án để chọn một thư mục: đoạn chat trong dự án đọc / ghi file ngay trong thư mục đó.' },
      { view: 'chat', text: 'Rê chuột vào đoạn chat → ⋯ → 📦 Lưu trữ để ẩn đi, hoặc 🗑 Xoá (có hỏi lại trước khi xoá).' },
      { view: 'chat', text: '📦 Đã lưu trữ (dưới danh sách) để xem lại và ↩ Bỏ lưu trữ khi cần.' },
      { view: 'chat', text: 'Đoạn chat bên ChatGPT Work / Codex Desktop tự hiện ở cột trái (biểu tượng ↗) – chat tiếp ở đây được luôn.' },
    ] },
    { id: 'computer', icon: '🖱️', title: 'Nhờ AI thao tác trên máy (Computer Use)', steps: [
      { view: 'chat', text: 'Trong Chat, gõ @Máy tính rồi nói việc cần làm, ví dụ: "@Máy tính mở Excel file báo cáo, lọc cột Doanh thu > 10 triệu".', target: '#chInput' },
      { view: 'chat', text: 'Lần đầu app hỏi "AI muốn điều khiển chuột & bàn phím" → bấm Cho phép trong đoạn chat này.' },
      { view: 'chat', text: 'Trong lúc AI làm, đừng dùng chuột / bàn phím. Muốn dừng: bấm lại vào app → nút Dừng (■).' },
      { view: 'chat', text: '🧰 Công cụ: xem trạng thái, cấp quyền (Mac), cài Computer Use của ChatGPT, mở Trình duyệt SIMI để đăng nhập các trang cần đọc.', target: '#chTools' },
      { view: 'chat', text: 'AI không tự nhập mật khẩu, OTP, thông tin thanh toán và không bấm chuyển tiền / xoá dữ liệu nếu bạn chưa nói rõ.' },
    ] },
    { id: 'office', icon: '🏢', title: 'Giao việc cho đội AI (Văn phòng)', steps: [
      { view: 'office', text: 'Gõ việc cần làm vào ô Giao việc, hoặc chọn một Mẫu việc (Email, Báo cáo, Tóm tắt, Kế hoạch, Dịch…).', target: '#cardText' },
      { view: 'office', text: 'Bấm vào ảnh người nhận ở mục Giao cho. Giao cho Trưởng phòng ★ thì cả đội cùng làm và kiểm tra chéo.', target: '#assignChips' },
      { view: 'office', text: 'Bấm Giao ngay (hoặc Ctrl + Enter). Theo dõi tiến độ ở thẻ Đang làm và Nhật ký phòng.', target: '#btnGo' },
      { view: 'office', text: 'Xong việc có thông báo; kết quả ở Khay kết quả và được lưu thành file trong Documents/VanPhongAI.', target: '#btnFolder' },
      { view: 'office', text: '👥 Đội ngũ: chọn model cho từng người, hoặc bấm "Cả phòng dùng SIMI".', target: '#btnTeam' },
    ] },
    { id: 'lobby-chat', icon: '🌐', title: 'Sảnh: nhắn tin, gửi ảnh, gọi tên', steps: [
      { view: 'lobby', text: 'Ô chat bên phải: phòng 🏢 Cả công ty cho mọi người; bấm vào một người → 💬 Nhắn riêng để chat riêng.', target: '#lbInput' },
      { view: 'lobby', text: 'Gửi ảnh: bấm 🖼️, dán ảnh bằng Ctrl + V hoặc kéo thả ảnh vào khung chat (tối đa 4 ảnh mỗi tin).', target: '#lbAttach' },
      { view: 'lobby', text: 'Gọi tên: gõ @ rồi vài chữ trong tên → chọn người. Người đó nhận thông báo kể cả khi đang ở tab khác.', target: '#lbInput' },
      { view: 'lobby', text: 'Rê chuột vào một tin → ↩ để trả lời (kèm trích tin gốc), 🗑 bấm 2 lần để thu hồi tin của mình.' },
      { view: 'lobby', text: '👁 Đang hiện / 🙈 Đang ẩn: ẩn khỏi danh sách online khi cần tập trung (vẫn nhắn tin được).', target: '#lbHide' },
    ] },
    { id: 'lobby-fun', icon: '🎉', title: 'Sảnh: màn chiếu, nhảy, mèo Mít', steps: [
      { view: 'lobby', text: '🎬 Màn chiếu: dán link YouTube → + Thêm. Cả quán xem cùng lúc, xếp hàng theo lượt mỗi người 1 video.', target: '#lbCineBtn' },
      { view: 'lobby', text: '🕺 Nhảy: chọn 1 trong 6 điệu, cả quán nhún cùng một nhịp. Đi chỗ khác là thôi nhảy.', target: '#lbDanceBtn' },
      { view: 'lobby', text: 'Bấm vào đồng nghiệp: ✋ Đập tay, 🥂 Cụng ly, ☕ Mời cà phê, 🤗 Ôm, 💃 Mời nhảy (ôm và nhảy cần người kia đồng ý).' },
      { view: 'lobby', text: 'Bấm vào mèo Mít: vuốt ve, cho ăn, chơi len, gọi Mít đi theo. Cả công ty đều thấy cùng một con mèo.' },
      { view: 'lobby', text: '👕 Tủ đồ: đổi kiểu tóc, màu áo, phụ kiện cho nhân vật của bạn.', target: '#lbMe' },
    ] },
    { id: 'lobby-map', icon: '🗺️', title: 'Đi một vòng Sảnh', steps: [
      { view: 'lobby', place: 'npc', text: 'Đây là quầy lễ tân ngay cổng vào – mình đứng ở đây. Cần gì cứ bấm vào mình: hướng dẫn từng bước, mẹo dùng AI, hỏi đáp.' },
      { view: 'lobby', place: 'bar', text: 'Quầy bar SIMI: bấm vào ghế cao để ngồi. Bấm sàn để đi, hoặc dùng phím W A S D.' },
      { view: 'lobby', place: 'dance', text: 'Sàn nhảy: đứng lên sàn là hiện bảng chọn điệu, cả quán nhún cùng một nhịp.' },
      { view: 'lobby', place: 'cinema', text: 'Màn chiếu: dán link YouTube để cả quán xem cùng lúc.', target: '#lbCineBtn' },
      { view: 'lobby', place: 'game', text: 'Khu Game: 2 bàn bida chơi được. Bấm vào bàn → chọn người để mời; người kia đồng ý là bàn bida hiện lên.' },
      { view: 'lobby', place: 'altar', text: 'Bàn thờ Thần Tài cầu nhiều đơn: bấm vào bồ đoàn trước bàn thờ để quỳ khấn – khách vào như nước, chốt đơn ầm ầm 💰' },
      { view: 'lobby', place: 'fortune', text: 'Ống xin quẻ cạnh bàn thờ: bấm vào để lắc quẻ đầu ngày – mỗi ngày một thông điệp may mắn, đầy năng lượng dành cho bạn 🎋' },
      { view: 'lobby', place: 'zen', text: 'Góc Thiền · Dưỡng sinh: bấm vào bồ đoàn để ngồi xếp bằng, nhắm mắt thở chậm – nghỉ mắt vài phút giữa giờ. Bên cạnh có bàn trà và vườn đá.' },
      { view: 'lobby', place: 'garden', text: 'Sân vườn: bàn dù, ghế đá quanh đài phun nước – ngồi nói chuyện với đồng nghiệp.' },
      { view: 'lobby', text: 'Muốn nhìn cả quán: bấm 🗺 Toàn cảnh. Muốn quay về nhân vật của mình: 🎯 Về chỗ mình.', target: '#lbOverview' },
    ] },
    { id: 'pool', icon: '🎱', title: 'Chơi bida với đồng nghiệp', steps: [
      { view: 'lobby', place: 'game', text: 'Bấm vào một bàn bida trống ở khu Game rồi chọn người để mời. Hoặc bấm vào đồng nghiệp → 🎱 Mời chơi bida.' },
      { view: 'lobby', text: 'Người kia bấm "Vào bàn" là cả hai tự đi tới bàn, bàn bida hiện lên. Ai đánh trước do Gateway bốc thăm.' },
      { view: 'lobby', text: 'Tới lượt mình: rê chuột để ngắm (có đường ngắm và hướng bi đi), nhấn giữ rồi kéo ngược để lấy lực, thả tay để đánh.' },
      { view: 'lobby', text: 'Luật 8 bi: lần đầu vào bi hợp lệ thì nhận nhóm (trơn 1–7 hoặc sọc 9–15). Vào hết nhóm mình rồi mới đánh bi 8. Bi trắng rơi lỗ thì đối thủ được đặt bi trắng.' },
      { view: 'lobby', text: 'Mỗi lượt có 90 giây. Bấm – để thu nhỏ bàn (ván vẫn tiếp tục), bấm nút "Bida với…" ở góc Sảnh để mở lại.' },
    ] },
    { id: 'update', icon: '⬆️', title: 'Cập nhật app', steps: [
      { text: 'Có bản mới, app tự tải sẵn rồi hiện thẻ "Văn Phòng AI x.y.z đã sẵn sàng" ở góc dưới bên phải.' },
      { text: 'Bấm Cập nhật ngay: app tự đóng, cài bản mới rồi mở lại sau khoảng nửa phút. Đoạn chat và cài đặt giữ nguyên.' },
      { text: 'Muốn kiểm tra ngay: Cài đặt → Cập nhật → 🔄 Kiểm tra bản mới.', target: '#btnSettings' },
    ] },
  ];

  // mẹo dùng AI hiệu quả: trước / sau
  const TIPS = [
    { icon: '🎯', title: 'Nói rõ mục tiêu, người đọc và độ dài', bad: 'Viết email cho khách.', good: 'Viết email ngắn (dưới 120 chữ) gửi khách đã mua máy lọc nước tháng trước, nhắc lịch bảo trì miễn phí tuần sau, giọng thân thiện, kết bằng số hotline.' },
    { icon: '📎', title: 'Đưa đủ tài liệu, đừng bắt AI đoán', bad: 'Tóm tắt báo cáo doanh thu giúp tôi.', good: 'Đính kèm file báo cáo (kéo thả vào ô chat) rồi hỏi: "Tóm tắt 5 ý chính, nêu 2 sản phẩm giảm mạnh nhất và lý do có thể".' },
    { icon: '🧩', title: 'Chia việc lớn thành từng bước', bad: 'Lập kế hoạch marketing cả năm và viết hết nội dung.', good: 'Bước 1: liệt kê 4 chủ đề theo quý. Xong mình duyệt rồi bước 2 mới viết lịch đăng cho quý 1.' },
    { icon: '🧑‍🏫', title: 'Cho AI một vai và ví dụ mẫu', bad: 'Trả lời khách hỏi về bảo hành.', good: 'Bạn là nhân viên CSKH của SIMI. Trả lời theo mẫu: Chào anh/chị → xác nhận vấn đề → 3 bước xử lý → hẹn thời gian. Ví dụ: …' },
    { icon: '📋', title: 'Yêu cầu đúng định dạng cần dùng', bad: 'So sánh 3 nhà cung cấp.', good: 'So sánh 3 nhà cung cấp theo bảng: Giá, Thời gian giao, Bảo hành, Điểm mạnh, Rủi ro. Cuối bảng đề xuất 1 lựa chọn.' },
    { icon: '🔁', title: 'Sửa tiếp thay vì hỏi lại từ đầu', bad: 'Mở đoạn chat mới và gõ lại toàn bộ yêu cầu.', good: 'Trong cùng đoạn chat: "Giữ ý 1 và 3, ý 2 viết ngắn lại, thêm số liệu tháng 9".' },
    { icon: '🔍', title: 'Luôn kiểm tra lại con số và tên riêng', bad: 'Gửi thẳng cho khách bản AI viết.', good: 'Đọc lại số liệu, tên người, ngày tháng; nhờ AI "liệt kê các chỗ bạn không chắc chắn" trước khi gửi.' },
    { icon: '🔒', title: 'Không dán mật khẩu, thông tin nhạy cảm', bad: 'Đây là mật khẩu ngân hàng của công ty, đăng nhập giúp tôi…', good: 'Tự đăng nhập; chỉ nhờ AI các bước còn lại. Việc nhạy cảm hỏi IT trước.' },
  ];

  // văn bản gọn để gửi kèm câu hỏi (AI dùng làm nguồn trả lời)
  function guideText(guides) {
    const g = (guides || GUIDES).map((x) => `## ${x.title}\n${x.steps.map((s, i) => `${i + 1}. ${s.text}`).join('\n')}`).join('\n\n');
    const t = TIPS.map((x) => `- ${x.title}: chưa tốt "${x.bad}" → tốt hơn "${x.good}"`).join('\n');
    return `${g}\n\n## Mẹo dùng AI hiệu quả\n${t}`;
  }

  window.VPNpcGuides = { GUIDES, TIPS, guideText };
})();
