import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  stat,
  utimes,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = await mkdtemp(join(tmpdir(), "ltn-codex-usage-store-test-"));
const usageFile = join(root, "nested", "codex-usage.json");
process.env.CODEX_USAGE_FILE = usageFile;
process.env.CODEX_USAGE_RESERVATION_TTL_MS = "5000";
process.env.CODEX_USAGE_LOCK_TIMEOUT_MS = "1000";
process.env.CODEX_USAGE_LOCK_STALE_MS = "500";

const {
  reserveDailyUsageSlot,
  confirmDailyUsageSlot,
  releaseDailyUsageSlot
} = await import(`../src/codex-usage-store.mjs?store=${Date.now()}`);

const usageDate = "2026-07-23";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function usageJson() {
  return JSON.parse(await readFile(usageFile, "utf8"));
}

function records(store) {
  return Object.values(store.codex_daily_usage);
}

test("usage store creates parent dir, stores TTL reservations and never stores secrets", async () => {
  const reservation = await reserveDailyUsageSlot({
    teamCode: "AUDIT",
    clientIdHash: sha256("11111111-1111-4111-8111-111111111111"),
    usageDate,
    usageScope: "client",
    premiumLimit: 3
  });

  assert.equal(reservation.routeTier, "premium");
  assert.equal(reservation.requestNumber, 1);
  assert.ok(reservation.reservationId);

  let store = await usageJson();
  const record = records(store).find((item) => item.team_code === "AUDIT");
  assert.equal(record.successful_request_count, 0);
  assert.equal(record.reserved_request_count, 1);
  assert.equal(record.reservations.length, 1);
  assert.match(record.reservations[0].expires_at, /^\d{4}-\d{2}-\d{2}T/);

  const raw = await readFile(usageFile, "utf8");
  assert.doesNotMatch(raw, /sk-test-secret|11111111-1111-4111-8111-111111111111/);

  if (process.platform !== "win32") {
    const mode = (await stat(usageFile)).mode & 0o777;
    assert.equal(mode, 0o600);
  }

  await confirmDailyUsageSlot(reservation.key, reservation.reservationId);
  store = await usageJson();
  const confirmed = records(store).find((item) => item.team_code === "AUDIT");
  assert.equal(confirmed.successful_request_count, 1);
  assert.equal(confirmed.reserved_request_count, 0);
  assert.equal(confirmed.reservations.length, 0);
});

test("stale reservation is cleaned up and returns the premium slot", async () => {
  const first = await reserveDailyUsageSlot({
    teamCode: "STALE_RESERVATION",
    clientIdHash: sha256("stale-client"),
    usageDate,
    usageScope: "client",
    premiumLimit: 1
  });

  const store = await usageJson();
  store.codex_daily_usage[first.key].reservations[0].expires_at =
    new Date(Date.now() - 1000).toISOString();
  await writeFile(usageFile, JSON.stringify(store, null, 2) + "\n", "utf8");

  const second = await reserveDailyUsageSlot({
    teamCode: "STALE_RESERVATION",
    clientIdHash: sha256("stale-client"),
    usageDate,
    usageScope: "client",
    premiumLimit: 1
  });

  assert.equal(second.requestNumber, 1);
  assert.equal(second.routeTier, "premium");
  await releaseDailyUsageSlot(second.key, second.reservationId);
});

test("stale lock directory is recovered after process crash", async () => {
  const lockPath = `${usageFile}.lock`;
  await mkdir(lockPath, { recursive: true });
  await writeFile(join(lockPath, "owner.json"), '{"pid":999999}\n', "utf8");
  const old = new Date(Date.now() - 5000);
  await utimes(lockPath, old, old);

  const reservation = await reserveDailyUsageSlot({
    teamCode: "STALE_LOCK",
    clientIdHash: "",
    usageDate,
    usageScope: "team",
    premiumLimit: 1
  });

  assert.equal(reservation.routeTier, "premium");
  await releaseDailyUsageSlot(reservation.key, reservation.reservationId);
});

test("concurrent reservations do not exceed the premium limit", async () => {
  const results = await Promise.all(
    Array.from({ length: 4 }, () => reserveDailyUsageSlot({
      teamCode: "CONCURRENT",
      clientIdHash: sha256("same-client"),
      usageDate,
      usageScope: "client",
      premiumLimit: 3
    }))
  );

  assert.deepEqual(
    results.map((item) => item.routeTier).sort(),
    ["free", "premium", "premium", "premium"]
  );

  await Promise.all(results.map((item) =>
    releaseDailyUsageSlot(item.key, item.reservationId)
  ));
});

test("corrupt JSON is backed up and is not silently reset", async () => {
  await writeFile(usageFile, "{not-json", "utf8");

  await assert.rejects(
    reserveDailyUsageSlot({
      teamCode: "CORRUPT",
      clientIdHash: sha256("client"),
      usageDate,
      usageScope: "client",
      premiumLimit: 1
    }),
    /bị hỏng JSON/
  );

  const files = await readdir(join(root, "nested"));
  assert.ok(files.some((file) => file.startsWith("codex-usage.json.corrupt-")));
  assert.equal(await readFile(usageFile, "utf8"), "{not-json");
});

test("valid JSON with invalid usage schema is backed up and fails closed", async () => {
  await writeFile(usageFile, JSON.stringify({ version: 1, unexpected: true }), "utf8");

  await assert.rejects(
    reserveDailyUsageSlot({
      teamCode: "INVALID_SCHEMA",
      clientIdHash: sha256("client"),
      usageDate,
      usageScope: "client",
      premiumLimit: 1
    }),
    /sai schema/
  );

  const files = await readdir(join(root, "nested"));
  assert.ok(files.some((file) => file.startsWith("codex-usage.json.corrupt-")));
  assert.match(await readFile(usageFile, "utf8"), /unexpected/);
});
