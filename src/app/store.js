import { createFraudDataset } from "../data/fraud-ring.js";

function initialState(dataset) {
  const firstTransfer = dataset.transfers().find((transfer) => transfer.id === dataset.flaggedTransferId)
    ?? dataset.transfers()[0];
  return {
    caseId: dataset.caseId,
    openedAt: dataset.anchorTime,
    dataSource: dataset.source,
    phase: "flagged",
    visibleAccountIds: [...dataset.primedAccountIds],
    visibleTransferIds: [...dataset.primedTransferIds],
    riskScores: {},
    ring: null,
    exposure: null,
    timeline: firstTransfer ? [{
      id: "event-flagged",
      timestamp: firstTransfer.timestamp,
      time: firstTransfer.time,
      type: "alert",
      title: "Suspicious transfer ready to trace",
      detail: `${money(firstTransfer.amount)} moved from ${firstTransfer.from} to ${firstTransfer.to}.`,
    }] : [],
    artifacts: [],
    frozenAccountIds: [],
    frozenTransferIds: [],
    frozen: false,
    caseFiled: false,
    bankNotified: false,
    results: {},
  };
}

export class RinglightStore {
  #state;
  #dataset;
  #listeners = new Set();

  constructor(dataset = createFraudDataset()) {
    this.#dataset = dataset;
    this.#state = initialState(dataset);
  }

  get state() {
    return structuredClone(this.#state);
  }

  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  reset() {
    this.#state = initialState(this.#dataset);
    this.#notify("reset");
    return this.state;
  }

  recordResult(toolName, result) {
    this.#state.results[toolName] = structuredClone(result);
    this.#state.phase = toolName;
    this.#notify("result", { toolName, result });
  }

  revealGraph(result) {
    const accountIds = new Set([...this.#state.visibleAccountIds, ...(result.accountIds ?? [])]);
    const transferIds = new Set([...this.#state.visibleTransferIds, ...(result.transferIds ?? [])]);
    this.#state.visibleAccountIds = [...accountIds];
    this.#state.visibleTransferIds = [...transferIds];
    this.#notify("graph-revealed", result);
  }

  setRiskScores(scores) {
    for (const score of scores) this.#state.riskScores[score.accountId] = structuredClone(score);
    this.#notify("risk-scored", scores);
  }

  setRing(ring) {
    this.#state.ring = structuredClone(ring);
    this.#state.visibleAccountIds = [...new Set([...this.#state.visibleAccountIds, ...ring.accountIds])];
    this.#state.visibleTransferIds = [...new Set([...this.#state.visibleTransferIds, ...ring.transferIds, ...ring.entryTransferIds, ...ring.exitTransferIds])];
    this.#notify("ring-detected", ring);
  }

  setExposure(exposure) {
    this.#state.exposure = structuredClone(exposure);
    this.#notify("exposure-calculated", exposure);
  }

  setTimeline(timeline) {
    this.#state.timeline = structuredClone(timeline.items ?? []);
    this.#notify("timeline-built", timeline);
  }

  freeze(result) {
    this.#state.frozen = true;
    this.#state.phase = "frozen";
    this.#state.frozenAccountIds = [...result.accountIds];
    this.#state.frozenTransferIds = [...result.interdictedTransferIds];
    this.#state.timeline.push({
      id: "event-freeze",
      timestamp: "2026-08-24T19:53:31.000Z",
      time: "19:53",
      type: "freeze",
      title: `${result.accountIds.length}-account freeze approved`,
      detail: `${money(result.interdictedAmount)} in outgoing transfers stopped.`,
    });
    this.#notify("ring-frozen", result);
  }

  markCaseFiled(result) {
    this.#state.caseFiled = true;
    this.#state.timeline.push({
      id: "event-sar",
      timestamp: "2026-08-24T19:54:04.000Z",
      time: "19:54",
      type: "report",
      title: "Case evidence package drafted",
      detail: `${result.receiptCount} call receipts attached. No external filing was made.`,
    });
    this.#notify("case-filed", result);
  }

  markBankNotified(result) {
    this.#state.bankNotified = true;
    this.#state.timeline.push({
      id: "event-notify",
      timestamp: "2026-08-24T19:54:27.000Z",
      time: "19:54",
      type: "notice",
      title: "Fraud desk handoff recorded",
      detail: `Approved simulation reference ${result.reference}.`,
    });
    this.#notify("bank-notified", result);
  }

  addArtifact(artifact) {
    const next = {
      id: artifact.id ?? `artifact-${String(this.#state.artifacts.length + 1).padStart(2, "0")}`,
      createdAt: artifact.createdAt ?? "2026-08-24T19:54:00.000Z",
      ...structuredClone(artifact),
    };
    const index = this.#state.artifacts.findIndex((candidate) => candidate.id === next.id);
    if (index >= 0) this.#state.artifacts[index] = next;
    else this.#state.artifacts.push(next);
    this.#notify("artifact", next);
    return structuredClone(next);
  }

  artifactById(id) {
    const artifact = this.#state.artifacts.find((candidate) => candidate.id === id);
    return artifact ? structuredClone(artifact) : null;
  }

  #notify(reason, detail = null) {
    const snapshot = this.state;
    for (const listener of this.#listeners) listener(snapshot, reason, detail);
  }
}

function money(value) {
  return Number(value).toLocaleString("en-US", { style: "currency", currency: "USD" });
}
