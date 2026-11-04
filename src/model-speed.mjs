// Tốc độ thực tế từng model, đo trên chính các yêu cầu đi qua Gateway (trong bộ nhớ, không lưu đĩa):
// thời gian tới chữ / suy nghĩ đầu tiên (firstTokenMs) và tỉ lệ lỗi. Dùng để gắn nhãn ⚡ / 🐢 trong ô chọn model
// – chỉ là thông tin, user vẫn tự chọn model.
const MAX_SAMPLES = 60;
const MAX_AGE_MS = 6 * 60 * 60 * 1000;
const MIN_SAMPLES = 5;
const FAST_MS = Number(process.env.MODEL_SPEED_FAST_MS) || 4000;
const SLOW_MS = Number(process.env.MODEL_SPEED_SLOW_MS) || 15000;

const samples = new Map(); // model -> [{ at, ok, firstTokenMs }]

export function recordModelSpeed(model, { ok, firstTokenMs }, now = Date.now()) {
  if (!model || typeof model !== "string") return;
  const list = samples.get(model) || [];
  list.push({ at: now, ok: !!ok, firstTokenMs: ok && Number.isFinite(firstTokenMs) ? Math.max(0, Math.round(firstTokenMs)) : null });
  while (list.length > MAX_SAMPLES || (list.length && now - list[0].at > MAX_AGE_MS)) list.shift();
  samples.set(model, list);
}

function quantile(sorted, q) {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo));
}

export function modelSpeed(model, now = Date.now()) {
  const list = (samples.get(model) || []).filter((s) => now - s.at <= MAX_AGE_MS);
  if (list.length < MIN_SAMPLES) return null;
  const times = list.filter((s) => s.ok && s.firstTokenMs !== null).map((s) => s.firstTokenMs).sort((a, b) => a - b);
  const errorRate = Math.round((list.filter((s) => !s.ok).length / list.length) * 100) / 100;
  const medianMs = quantile(times, 0.5);
  const p90Ms = quantile(times, 0.9);
  const label = errorRate >= 0.25 ? "unstable" : medianMs === null ? null : medianMs <= FAST_MS ? "fast" : medianMs >= SLOW_MS ? "slow" : "normal";
  return { samples: list.length, medianMs, p90Ms, errorRate, label };
}

// thêm trường speed vào danh sách model kiểu OpenAI (data[]) – không đụng catalog Codex để catalog không đổi liên tục
export function withModelSpeed(list, now = Date.now()) {
  return (Array.isArray(list) ? list : []).map((item) => {
    const speed = item && item.id ? modelSpeed(item.id, now) : null;
    return speed ? { ...item, speed } : item;
  });
}

export function resetModelSpeed() {
  samples.clear();
}
