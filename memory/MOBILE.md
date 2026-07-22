# MOBILE TEAM CONTEXT

Cập nhật gần nhất: 2026-07-23

## Ngữ cảnh và kiến thức

- UNIQ App dùng React Native CLI 0.86, TypeScript, package id vn.simi.uniq và ưu tiên Android.
- Device provider hỗ trợ mock hoặc tuya; PID hiện tại là ofjtdrwf4.
- Tuya SDK dùng com.thingclips.smart:thingsmart:7.5.1.
- AppKey và AppSecret chỉ đọc từ Gradle properties local, không đưa vào source, .env mẫu hoặc báo cáo.

## Quyết định và quy trình

- Access token giữ trong memory; refresh/session lưu trong Keychain.
- Điện thoại thật là môi trường test chính trước khi phát hành.
- Không copy blind assets/res dành cho BizBundle.

## Việc đang làm

- Hoàn thiện BLE scan, pairing, Wi-Fi onboarding và control thiết bị thật.
