import assert from "node:assert/strict";
import test from "node:test";
import { RinglightStore } from "../src/app/store.js";
import { createRinglightTools } from "../src/app/tools.js";
import { createFraudDataset } from "../src/data/fraud-ring.js";
import { createMutableDataset, parseTransferText } from "../src/data/import-transfers.js";
import { GUIDED_CALLS, GuidedDemo } from "../src/sim/guided-demo.js";
import { EventBus } from "../src/webmcp/event-bus.js";
import { ApprovalRequiredError, HumanApprovalGate } from "../src/webmcp/human-gate.js";
import { createModelContextPolyfill } from "../src/webmcp/polyfill.js";
import { DeterministicClock, ProvenanceRail } from "../src/webmcp/provenance.js";
import { ToolContractError } from "../src/webmcp/schema.js";
import { WebMCPSubstrate } from "../src/webmcp/substrate.js";

const EXPECTED_TOOLS = [
  "buildCaseTimeline",
  "detectRing",
  "dollariseExposure",
  "expandAccount",
  "fileSARreport",
  "freezeAccounts",
  "notifyBank",
  "replayInvestigation",
  "scoreRisk",
  "traceFlow",
];

function createHarness({ approvalProvider = null } = {}) {
  const eventBus = new EventBus();
  const dataset = createFraudDataset();
  const store = new RinglightStore(dataset);
  const provenance = new ProvenanceRail({
    eventBus,
    caseId: dataset.caseId,
    clock: new DeterministicClock({ start: dataset.anchorTime, stepMs: 11_000 }),
  });
  const approvalGate = new HumanApprovalGate({ eventBus, approvalProvider });
  const modelContext = createModelContextPolyfill();
  const substrate = new WebMCPSubstrate({
    modelContext,
    eventBus,
    provenance,
    approvalGate,
  });
  const tools = createRinglightTools({ dataset, store, provenance, eventBus });
  return { eventBus, dataset, store, provenance, approvalGate, modelContext, substrate, tools };
}

async function invokeCalls(harness, calls) {
  const results = [];
  for (const call of calls) results.push(await harness.substrate.invoke(call.name, structuredClone(call.args)));
  return results;
}

test("ten tools register through the imperative WebMCP descriptor contract", async () => {
  const harness = createHarness();
  await harness.substrate.registerAll(harness.tools);
  const descriptors = await harness.modelContext.getTools();

  assert.equal(harness.substrate.mode, "polyfill");
  assert.equal(harness.substrate.size, 10);
  assert.deepEqual(descriptors.map((descriptor) => descriptor.name), EXPECTED_TOOLS);
  assert.ok(descriptors.every((descriptor) => descriptor.inputSchema.type === "object"));
  assert.ok(descriptors.every((descriptor) => typeof descriptor.description === "string"));
  assert.equal(descriptors.find((descriptor) => descriptor.name === "traceFlow").annotations.readOnlyHint, true);
  assert.equal(descriptors.find((descriptor) => descriptor.name === "freezeAccounts").annotations.readOnlyHint, false);
  assert.equal(descriptors.find((descriptor) => descriptor.name === "notifyBank").annotations.readOnlyHint, false);
});

test("schema validation rejects missing, extra, and out-of-range arguments before handlers run", async () => {
  const harness = createHarness();
  await harness.substrate.registerAll(harness.tools);

  await assert.rejects(
    harness.substrate.invoke("traceFlow", { transferId: "tx-flag-001", maxHops: 3 }),
    (error) => error instanceof ToolContractError && error.code === "INVALID_TOOL_ARGUMENTS",
  );
  await assert.rejects(
    harness.substrate.invoke("traceFlow", {
      transferId: "tx-flag-001",
      maxHops: 8,
      direction: "outbound",
      hidden: true,
    }),
    (error) => error instanceof ToolContractError && error.issues.length === 2,
  );
  assert.equal(harness.store.state.phase, "flagged");
  assert.equal(harness.provenance.snapshot().length, 2);
  assert.ok(harness.provenance.snapshot().every((receipt) => receipt.status === "error"));
});

test("freezeAccounts refuses to run when its human gate denies approval", async () => {
  const harness = createHarness({ approvalProvider: async () => false });
  await harness.substrate.registerAll(harness.tools);
  await invokeCalls(harness, GUIDED_CALLS.slice(0, 9));

  await assert.rejects(
    harness.substrate.invoke(GUIDED_CALLS[9].name, structuredClone(GUIDED_CALLS[9].args)),
    (error) => error instanceof ApprovalRequiredError && error.code === "HUMAN_APPROVAL_REQUIRED",
  );
  assert.equal(harness.store.state.frozen, false);
  const receipt = harness.provenance.snapshot().at(-1);
  assert.equal(receipt.name, "freezeAccounts");
  assert.equal(receipt.status, "denied");
  assert.equal(receipt.humanApproved, false);
});

test("notifyBank requires its own approval after an approved freeze and local report", async () => {
  const harness = createHarness({
    approvalProvider: async (request) => request.toolName === "freezeAccounts",
  });
  await harness.substrate.registerAll(harness.tools);
  await invokeCalls(harness, GUIDED_CALLS.slice(0, 11));

  await assert.rejects(
    harness.substrate.invoke(GUIDED_CALLS[11].name, structuredClone(GUIDED_CALLS[11].args)),
    (error) => error instanceof ApprovalRequiredError,
  );
  assert.equal(harness.store.state.frozen, true);
  assert.equal(harness.store.state.caseFiled, true);
  assert.equal(harness.store.state.bankNotified, false);
  const approvals = harness.provenance.snapshot().filter((receipt) => receipt.name === "freezeAccounts" || receipt.name === "notifyBank");
  assert.deepEqual(approvals.map((receipt) => receipt.humanApproved), [true, false]);
});

test("every invocation receives a deterministic timestamp and stable result digest", async () => {
  const first = createHarness();
  const second = createHarness();
  await first.substrate.registerAll(first.tools);
  await second.substrate.registerAll(second.tools);
  const call = GUIDED_CALLS[0];
  await first.substrate.invoke(call.name, structuredClone(call.args));
  await second.substrate.invoke(call.name, structuredClone(call.args));

  const firstReceipt = first.provenance.snapshot()[0];
  const secondReceipt = second.provenance.snapshot()[0];
  assert.equal(firstReceipt.timestamp, "2026-08-24T19:42:00.000Z");
  assert.equal(firstReceipt.argsDigest, secondReceipt.argsDigest);
  assert.equal(firstReceipt.resultDigest, secondReceipt.resultDigest);
  assert.equal(firstReceipt.name, "traceFlow");
  assert.equal(firstReceipt.status, "success");
});

test("provenance replay reproduces receipt order without repeating side effects", async () => {
  const harness = createHarness();
  const replayed = [];
  harness.eventBus.on("provenance:replay-entry", ({ detail }) => replayed.push(detail.entry.name));
  harness.provenance.record({
    callId: "call-001",
    name: "freezeAccounts",
    args: { caseId: "RL-2408" },
    result: { status: "frozen" },
    status: "success",
    humanApproved: true,
  });
  harness.provenance.record({
    callId: "call-002",
    name: "fileSARreport",
    args: { caseId: "RL-2408" },
    result: { status: "drafted-locally" },
    status: "success",
  });

  const result = await harness.provenance.replay({ speed: "instant" });
  assert.deepEqual(replayed, ["freezeAccounts", "fileSARreport"]);
  assert.equal(result.replayed, 2);
  assert.equal(result.sideEffectsRepeated, false);
  assert.equal(harness.provenance.snapshot().length, 2);
});

test("guided harness completes the full bust through the same thirteen tool calls", async () => {
  const harness = createHarness({ approvalProvider: async () => true });
  await harness.substrate.registerAll(harness.tools);
  const demo = new GuidedDemo({ substrate: harness.substrate, eventBus: harness.eventBus });

  const outcome = await demo.run({ stepDelay: 0 });
  const state = harness.store.state;
  const receipts = harness.provenance.snapshot();

  assert.equal(outcome.status, "completed");
  assert.equal(outcome.steps, 13);
  assert.equal(receipts.length, 13);
  assert.deepEqual(receipts.map((receipt) => receipt.name), GUIDED_CALLS.map((call) => call.name));
  assert.equal(state.ring.size, 14);
  assert.equal(state.exposure.grossSuspiciousFlow, 2_318_750);
  assert.equal(state.exposure.pendingAtRisk, 665_450);
  assert.equal(state.frozen, true);
  assert.equal(state.caseFiled, true);
  assert.equal(state.bankNotified, true);
  assert.equal(state.artifacts.length, 4);
  assert.equal(receipts.find((receipt) => receipt.name === "freezeAccounts").humanApproved, true);
  assert.equal(receipts.find((receipt) => receipt.name === "notifyBank").humanApproved, true);
  assert.equal(state.results.replayInvestigation.sideEffectsRepeated, false);
});

test("aborting registration removes a tool without affecting the remaining surface", async () => {
  const harness = createHarness();
  await harness.substrate.registerAll(harness.tools);

  assert.equal(harness.substrate.unregister("traceFlow"), true);
  assert.equal(harness.substrate.unregister("traceFlow"), false);
  assert.equal(harness.substrate.size, 9);
  await assert.rejects(
    harness.modelContext.executeTool("traceFlow", GUIDED_CALLS[0].args),
    (error) => error.name === "NotFoundError",
  );
  assert.throws(() => harness.substrate.invoke("traceFlow", GUIDED_CALLS[0].args), /not registered/);
});

test("registered tools switch to a validated local file without re-registration", async () => {
  const harness = createHarness();
  const mutable = createMutableDataset(harness.dataset);
  const store = new RinglightStore(mutable);
  const tools = createRinglightTools({
    dataset: mutable,
    store,
    provenance: harness.provenance,
    eventBus: harness.eventBus,
  });
  await harness.substrate.registerAll(tools);
  const imported = parseTransferText(JSON.stringify([
    { id: "local-1", from: "source", to: "middle", amount: 900, timestamp: "2026-08-27T10:00:00Z" },
    { id: "local-2", from: "middle", to: "destination", amount: 850, timestamp: "2026-08-27T10:01:00Z", status: "pending" },
  ]), { filename: "local.json" });

  mutable.replace(imported);
  store.reset();
  const result = await harness.substrate.invoke("traceFlow", {
    transferId: "local-1",
    maxHops: 3,
    direction: "outbound",
  });

  assert.deepEqual(result.transferIds, ["local-1", "local-2"]);
  assert.deepEqual(result.accountIds, ["destination", "middle", "source"]);
  assert.equal(harness.substrate.size, 10);
});
