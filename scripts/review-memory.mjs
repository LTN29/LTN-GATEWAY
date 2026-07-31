#!/usr/bin/env node
import {
  approveReviewCandidate,
  getReviewCandidate,
  listReviewCandidates,
  rejectReviewCandidate
} from "../src/admin/services/admin-memory-service.mjs";

const args = process.argv.slice(2);
const command = args[0];
const id = args[1];

function argValue(name) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] || "" : "";
}

function usage() {
  console.log(`Usage:
  node scripts/review-memory.mjs list [--scope TEAM] [--team SALES]
  node scripts/review-memory.mjs show CANDIDATE_ID
  node scripts/review-memory.mjs approve CANDIDATE_ID [--note "..."]
  node scripts/review-memory.mjs reject CANDIDATE_ID [--note "..."]`);
}

if (!command || command === "--help") {
  usage();
  process.exit(0);
}

if (command === "list") {
  const filters = {
    scope: argValue("scope").toUpperCase(),
    teamId: argValue("team").toUpperCase(),
    status: argValue("status") || "pending",
    pageSize: 100
  };
  const items = [];
  let page = 1;
  let result;
  do {
    result = await listReviewCandidates({ ...filters, page });
    items.push(...result.items);
    page += 1;
  } while (items.length < result.total);
  for (const candidate of items) {
    console.log([
      candidate.id,
      candidate.createdAt,
      candidate.scope,
      candidate.sourceTeamId || "-",
      candidate.status,
      candidate.normalizedKey,
      `confidence=${candidate.confidence}`
    ].join("\t"));
  }
} else if (command === "show") {
  if (!id) throw new Error("Thiếu CANDIDATE_ID");
  console.log(JSON.stringify(await getReviewCandidate(id), null, 2));
} else if (command === "approve") {
  if (!id) throw new Error("Thiếu CANDIDATE_ID");
  await approveReviewCandidate(id, { note: argValue("note") }, { email: "local-admin", roles: ["SUPER_ADMIN"] });
  console.log(`Approved: ${id}`);
} else if (command === "reject") {
  if (!id) throw new Error("Thiếu CANDIDATE_ID");
  await rejectReviewCandidate(id, { note: argValue("note") }, { email: "local-admin", roles: ["SUPER_ADMIN"] });
  console.log(`Rejected: ${id}`);
} else {
  usage();
  process.exitCode = 1;
}
