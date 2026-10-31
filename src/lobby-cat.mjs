// Mèo của quán (tên "Mít"): Gateway quyết định mèo đi đâu / làm gì để mọi máy thấy cùng một con mèo.
// App tự tìm đường và diễn hoạt cảnh; Gateway chỉ phát "ý định" (tới chỗ nào, rồi làm gì, ai vừa chơi với mèo).
// Không lưu xuống đĩa.
const SPOTS = [
  { x: 0.4, z: 0.4 }, { x: -1.6, z: 0.6 }, { x: 1.9, z: 0.0 }, { x: -5.0, z: 2.6 }, { x: 5.4, z: -3.3 },
  { x: -2.4, z: 3.9 }, { x: 2.6, z: 3.8 }, { x: -5.6, z: -2.8 }, { x: 0.2, z: -3.6 }, { x: 3.2, z: -3.7 },
  { x: -8.5, z: 1.5 }, { x: 8.5, z: 2.5 }, { x: -10.5, z: -4.5 }, { x: 10.5, z: 6.0 }
];
export const CAT_ACTIONS = { pet: "vuốt ve", feed: "cho ăn", play: "chơi cùng", call: "gọi" };
const DURATION = { pet: 4500, feed: 9000, play: 9000, call: 30000 };

export class LobbyCat {
  constructor({ broadcast, now = () => Date.now(), random = Math.random }) {
    this.broadcast = broadcast; this.now = now; this.random = random;
    this.seq = 0;
    this.state = { seq: 0, mode: "sit", target: { ...SPOTS[0] }, then: "sit", by: null, byName: "", act: null, until: 0, at: now() };
    this.timer = null;
    this.schedule(8000);
  }

  schedule(ms) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.wander(), ms);
    this.timer.unref?.();
  }

  set(patch) {
    this.state = { ...this.state, ...patch, seq: ++this.seq, at: this.now() };
    this.broadcast("cat", this.state);
  }

  // tự đi dạo: tới 1 chỗ ngẫu nhiên rồi ngồi / nằm cuộn tròn
  wander() {
    if (this.state.until > this.now()) { this.schedule(this.state.until - this.now() + 500); return; }
    let s = SPOTS[Math.floor(this.random() * SPOTS.length)];
    if (Math.hypot(s.x - this.state.target.x, s.z - this.state.target.z) < 1) s = SPOTS[(SPOTS.indexOf(s) + 3) % SPOTS.length];
    this.set({ mode: "walk", target: { ...s }, then: this.random() < 0.35 ? "loaf" : "sit", by: null, byName: "", act: null, until: 0 });
    this.schedule(14000 + this.random() * 18000);
  }

  // người chơi với mèo: mèo chạy tới cạnh người đó rồi diễn (vuốt ve: vui vẻ · cho ăn: ăn bát · chơi: vồ len · gọi: đi theo)
  act(action, who, pos) {
    if (!CAT_ACTIONS[action]) throw Object.assign(new Error("action phải là pet | feed | play | call"), { statusCode: 400 });
    const p = pos || { x: 0, z: 0 };
    // đứng cạnh (phía trước người đó một chút) – app tự tìm ô trống gần nhất
    const target = { x: clamp(p.x + 0.55, -13, 13), z: clamp(p.z + 0.45, -9, 9) };
    this.set({ mode: action === "call" ? "follow" : "walk", target, then: action === "call" ? "sit" : action, by: who.id, byName: who.name, act: action, until: this.now() + DURATION[action] });
    this.schedule(DURATION[action] + 15000); // mèo ở xa thì chạy tới mất một lúc rồi mới diễn
    return { ok: true, until: this.state.until };
  }

  stop() { clearTimeout(this.timer); }
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, Number(v) || 0));
