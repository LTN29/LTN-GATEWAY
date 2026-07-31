import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("user error logs are bounded, redacted and exposed without raw payloads", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-usage-errors-"));
  const analyticsFile = join(root, "user-analytics.json");
  process.env.USER_ANALYTICS_ENABLED = "true";
  process.env.USER_ANALYTICS_FILE = analyticsFile;

  const { recordUserAnalytics } = await import(`../src/user-analytics-store.mjs?errors=${Date.now()}`);
  const { usageUserErrors } = await import(`../src/admin/services/admin-usage-service.mjs?errors=${Date.now()}`);
  const principal = { userId: "sales-ngoc", teamId: "SALES" };

  await recordUserAnalytics({
    date: "2026-07-31",
    principal,
    routeTier: "premium",
    selectedCombo: "SIMI-GPT",
    status: 429,
    latencyMs: 321,
    clientIdHashPrefix: "abc123",
    errorDetail: {
      code: "rate_limit_error",
      message: "Limit hit for sk-secret-value",
      requestId: "req-error-1",
      endpoint: "/v1/responses"
    }
  });

  const result = await usageUserErrors("sales-ngoc", { page: 1, pageSize: 10 });
  assert.equal(result.total, 1);
  assert.equal(result.items[0].status, 429);
  assert.equal(result.items[0].code, "rate_limit_error");
  assert.equal(result.items[0].requestId, "req-error-1");
  assert.equal(result.items[0].selectedCombo, "SIMI-GPT");
  assert.doesNotMatch(result.items[0].message, /sk-secret-value/);

  const stored = await readFile(analyticsFile, "utf8");
  assert.doesNotMatch(stored, /sk-secret-value/);
  const storedError = JSON.parse(stored).dailyUsers["2026-07-31|sales-ngoc"].recentErrors[0];
  assert.deepEqual(Object.keys(storedError).sort(), [
    "code", "endpoint", "latencyMs", "message", "occurredAt", "requestId", "routeTier", "selectedCombo", "status"
  ]);
});
