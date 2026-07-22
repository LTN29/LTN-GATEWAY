# LTN Memory Gateway

Gateway OpenAI-compatible đặt phía trước 9Router.

## Chức năng MVP

- Nhận Bearer API key.
- Hash key bằng SHA-256 để xác định team.
- Đọc file Markdown của team.
- Chèn ngữ cảnh vào messages.
- Proxy `/v1/chat/completions` và `/v1/models` sang 9Router.
- Hỗ trợ `stream: true` và `stream: false`.
- Không log API key hoặc nội dung chat.
- Chưa tự cập nhật Markdown và chưa đồng bộ OneDrive.

## Yêu cầu

- macOS
- Node.js 20 trở lên
- 9Router đang chạy tại `http://127.0.0.1:20128`

## Cài đặt

```bash
cd ~/ltn-memory-gateway
cp .env.example .env
cp config/teams.example.json config/teams.json
chmod +x start.sh test-local.sh scripts/hash-key.sh
```

Tạo SHA-256 cho key team:

```bash
./scripts/hash-key.sh
```

Dán hash vào `config/teams.json`, sau đó chạy:

```bash
./start.sh
```

Kiểm tra:

```bash
curl -sS http://127.0.0.1:20129/health
./test-local.sh
```

Kết quả đúng phải chứa `LTN GATEWAY OK`.
