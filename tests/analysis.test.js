import assert from "node:assert/strict";
import test from "node:test";
import {
  detectMoneyRing,
  dollariseRingExposure,
  expandAccountMath,
  mean,
  sampleStdDev,
  scoreAccounts,
  traceFlowMath,
  zScore,
} from "../src/analysis/math.js";
import { createFraudDataset } from "../src/data/fraud-ring.js";
import { forceLayout } from "../src/ui/controller.js";

const dataset = createFraudDataset();

test("seeded dataset is pinned and its case flow totals exactly", () => {
  const caseTransfers = dataset.transfers().filter((transfer) => !transfer.id.startsWith("tx-bg-"));
  const total = caseTransfers.reduce((sum, transfer) => sum + transfer.amount, 0);

  assert.equal(dataset.anchorTime, "2026-08-24T19:42:00.000Z");
  assert.equal(caseTransfers.length, 27);
  assert.equal(total, 2_318_750);
  assert.equal(caseTransfers.filter((transfer) => transfer.status === "pending").length, 7);
});

test("Atlas-style mean, sample deviation, and z-score use the trailing fixture", () => {
  assert.equal(mean([10, 20, 30]), 20);
  assert.equal(sampleStdDev([10, 20, 30]), 10);
  assert.equal(zScore(40, [10, 20, 30]), 2);
  assert.equal(zScore(40, [20, 20, 20]), null);
});

test("traceFlow follows a reproducible bounded graph from the flagged transfer", () => {
  const first = traceFlowMath(dataset, {
    transferId: "tx-flag-001",
    maxHops: 3,
    direction: "outbound",
  });
  const second = traceFlowMath(dataset, {
    transferId: "tx-flag-001",
    maxHops: 3,
    direction: "outbound",
  });

  assert.deepEqual(first, second);
  assert.deepEqual(first.accountIds.slice(0, 7), [
    "acct-acme-004", "mule-01", "mule-02", "mule-03", "mule-04", "mule-05", "mule-06",
  ]);
  assert.ok(first.transferIds.includes("tx-flag-001"));
  assert.ok(!first.accountIds.includes("mule-14"));
});

test("expandAccount reveals both sides of a middle account without leaving the case graph", () => {
  const result = expandAccountMath(dataset, { accountId: "mule-08", depth: 2 });

  assert.ok(result.accountIds.includes("mule-07"));
  assert.ok(result.accountIds.includes("mule-10"));
  assert.ok(result.accountIds.includes("mule-12"));
  assert.ok(result.accountIds.includes("sink-crypto"));
  assert.ok(result.transfers.every((transfer) => !transfer.id.startsWith("tx-bg-")));
});

test("directed component detection finds exactly the hidden fourteen-account ring", () => {
  const ring = detectMoneyRing(dataset, { seedAccountId: "mule-01", minAccounts: 8 });

  assert.equal(ring.status, "found");
  assert.equal(ring.ringId, "ring-ember-14");
  assert.equal(ring.size, 14);
  assert.equal(ring.internalTransferCount, 19);
  assert.equal(ring.cycleRank, 6);
  assert.equal(ring.passThroughAccounts, 14);
  assert.equal(ring.confidence, 0.973);
  assert.deepEqual(ring.accountIds, Array.from({ length: 14 }, (_, index) => `mule-${String(index + 1).padStart(2, "0")}`));
  assert.deepEqual(ring.entryTransferIds, ["tx-flag-001"]);
  assert.equal(ring.exitTransferIds.length, 7);
});

test("ring exposure counts each relevant transfer once and isolates pending exits", () => {
  const ring = detectMoneyRing(dataset, { seedAccountId: "mule-01", minAccounts: 8 });
  const exposure = dollariseRingExposure(dataset, ring);

  assert.equal(exposure.grossSuspiciousFlow, 2_318_750);
  assert.equal(exposure.pendingAtRisk, 665_450);
  assert.equal(exposure.transferCount, 27);
  assert.equal(exposure.entryPrincipal, 187_500);
  assert.equal(exposure.layeringMultiple, 12.37);
  assert.equal(exposure.zScore, 10.98);
  assert.equal(exposure.pendingTransferIds.length, 7);
});

test("all fourteen ring accounts score critical from reproducible behavioral features", () => {
  const ring = detectMoneyRing(dataset, { seedAccountId: "mule-01", minAccounts: 8 });
  const first = scoreAccounts(dataset, ring.accountIds);
  const second = scoreAccounts(dataset, ring.accountIds);

  assert.deepEqual(first, second);
  assert.equal(first.length, 14);
  assert.ok(first.every((score) => score.status === "critical"));
  assert.ok(first.every((score) => score.circular));
  assert.ok(first.every((score) => score.risk >= 75 && score.risk <= 99));
});

test("hand-written force layout is deterministic and keeps every graph node in bounds", () => {
  const transfers = dataset.transfers().filter((transfer) => !transfer.id.startsWith("tx-bg-"));
  const graphIds = new Set(transfers.flatMap((transfer) => [transfer.from, transfer.to]));
  const accounts = dataset.accounts().filter((account) => graphIds.has(account.id));
  const first = forceLayout(accounts, transfers);
  const second = forceLayout(accounts, transfers);

  assert.deepEqual([...first.entries()], [...second.entries()]);
  assert.equal(first.size, 20);
  for (const position of first.values()) {
    assert.ok(position.x >= 0 && position.x <= 1_000);
    assert.ok(position.y >= 0 && position.y <= 590);
  }
  assert.deepEqual(first.get("acct-acme-004"), { x: 105, y: 295 });
});
