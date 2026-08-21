import {
  detectMoneyRing,
  dollariseRingExposure,
  expandAccountMath,
  scoreAccounts,
  traceFlowMath,
} from "../analysis/math.js";
const noExtras = { additionalProperties: false };
const flexibleId = { type: "string", pattern: "^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$" };

export function createRinglightTools({ dataset, store, provenance, eventBus }) {
  const saveResult = (name, result) => {
    store.recordResult(name, result);
    return result;
  };

  return [
    {
      name: "traceFlow",
      title: "Trace suspicious flow",
      description: "Follow one suspicious transfer through the current local dataset. Return the accounts and money movements found within a bounded number of steps.",
      inputSchema: {
        type: "object",
        properties: {
          transferId: flexibleId,
          maxHops: { type: "integer", minimum: 1, maximum: 6 },
          direction: { type: "string", enum: ["outbound", "inbound", "both"] },
        },
        required: ["transferId", "maxHops", "direction"],
        ...noExtras,
      },
      handler: (args) => {
        const result = traceFlowMath(dataset, args);
        store.revealGraph(result);
        eventBus?.emit("graph:trace", result);
        return saveResult("traceFlow", result);
      },
    },
    {
      name: "expandAccount",
      title: "Expand account",
      description: "Reveal the incoming and outgoing neighbors of one account so the visible money map can be investigated one step at a time.",
      inputSchema: {
        type: "object",
        properties: {
          accountId: flexibleId,
          depth: { type: "integer", minimum: 1, maximum: 3 },
        },
        required: ["accountId", "depth"],
        ...noExtras,
      },
      handler: (args) => {
        const result = expandAccountMath(dataset, args);
        store.revealGraph(result);
        eventBus?.emit("graph:expand", result);
        return saveResult("expandAccount", result);
      },
    },
    {
      name: "scoreRisk",
      title: "Score account risk",
      description: "Calculate reproducible account risk from recent outgoing value, pass-through behavior, transfer speed, number of destinations, and circular money movement.",
      inputSchema: {
        type: "object",
        properties: {
          accountIds: {
            type: "array",
            minItems: 1,
            maxItems: 50,
            uniqueItems: true,
            items: flexibleId,
          },
        },
        required: ["accountIds"],
        ...noExtras,
      },
      handler: ({ accountIds }) => {
        const scores = scoreAccounts(dataset, accountIds);
        const result = {
          status: "scored",
          scores,
          critical: scores.filter((score) => score.status === "critical").length,
          method: "Atlas-style trailing z-score plus deterministic network features",
        };
        store.setRiskScores(scores);
        eventBus?.emit("graph:risk", result);
        return saveResult("scoreRisk", result);
      },
    },
    {
      name: "detectRing",
      title: "Find a linked money network",
      description: "Find accounts that pass money around a closed loop, then verify the circular movement before identifying a suspicious linked network.",
      inputSchema: {
        type: "object",
        properties: {
          seedAccountId: flexibleId,
          minAccounts: { type: "integer", minimum: 2, maximum: 50 },
          timeWindowHours: { type: "integer", minimum: 1, maximum: 72 },
        },
        required: ["seedAccountId", "minAccounts", "timeWindowHours"],
        ...noExtras,
      },
      handler: ({ seedAccountId, minAccounts, timeWindowHours }) => {
        const ring = {
          ...detectMoneyRing(dataset, { seedAccountId, minAccounts }),
          timeWindowHours,
        };
        if (ring.status !== "found") return saveResult("detectRing", ring);
        store.setRing(ring);
        const artifact = store.addArtifact({
          id: `network-map-${safeId(dataset.caseId)}`,
          kind: "GRAPH",
          name: "ring-map.json",
          mimeType: "application/json",
          content: JSON.stringify(ring, null, 2),
          description: `${ring.size}-account linked money map`,
        });
        eventBus?.emit("artifact:created", artifact);
        eventBus?.emit("graph:ring", ring);
        return saveResult("detectRing", ring);
      },
    },
    {
      name: "dollariseExposure",
      title: "Calculate money at risk",
      description: "Total each relevant transfer exactly once, compare it with the local baseline, and isolate unsettled outgoing money that can still be stopped.",
      inputSchema: {
        type: "object",
        properties: {
          ringId: flexibleId,
          currency: { type: "string", enum: ["USD"] },
        },
        required: ["ringId", "currency"],
        ...noExtras,
      },
      handler: ({ ringId }) => {
        const ring = store.state.ring;
        if (!ring || ring.ringId !== ringId) throw new Error("Detect the requested ring before calculating exposure.");
        const exposure = dollariseRingExposure(dataset, ring);
        store.setExposure(exposure);
        eventBus?.emit("case:exposure", exposure);
        return saveResult("dollariseExposure", exposure);
      },
    },
    {
      name: "buildCaseTimeline",
      title: "Build case timeline",
      description: "Assemble the flagged origin, layering bursts, circular returns, and cash-out attempts into a timestamped case record.",
      inputSchema: {
        type: "object",
        properties: {
          caseId: flexibleId,
          includePendingExits: { type: "boolean" },
        },
        required: ["caseId", "includePendingExits"],
        ...noExtras,
      },
      handler: ({ caseId, includePendingExits }) => {
        if (caseId !== dataset.caseId) throw new Error(`The active case is ${dataset.caseId}.`);
        const transfers = dataset.transfers().filter((transfer) => !transfer.id.startsWith("tx-bg-"));
        if (transfers.length === 0) throw new Error("The active case has no transfers.");
        const first = transfers[0];
        const middle = transfers[Math.floor((transfers.length - 1) / 2)];
        const pending = transfers.filter((transfer) => transfer.status === "pending");
        const pendingValue = pending.reduce((total, transfer) => total + transfer.amount, 0);
        const ring = store.state.ring;
        const items = [
          {
            id: "event-flagged",
            timestamp: first.timestamp,
            time: first.time,
            type: "alert",
            title: "Suspicious origin transfer flagged",
            detail: `${money(first.amount)} moved from ${first.from} to ${first.to}.`,
          },
          {
            id: "event-layering",
            timestamp: middle.timestamp,
            time: middle.time,
            type: "trace",
            title: "Money movement spreads across the map",
            detail: `${transfers.length} local transfer records are in the active case.`,
          },
        ];
        if (ring) {
          const ringTransfer = transfers.find((transfer) => ring.transferIds.includes(transfer.id)) ?? middle;
          items.push({
            id: "event-cycle",
            timestamp: ringTransfer.timestamp,
            time: ringTransfer.time,
            type: "ring",
            title: "Circular movement closes the linked network",
            detail: `${ring.size} accounts pass money around a closed loop.`,
          });
        }
        if (includePendingExits && pending.length > 0) {
          const lastPending = pending.at(-1);
          items.push({
            id: "event-cashout",
            timestamp: lastPending.timestamp,
            time: lastPending.time,
            type: "risk",
            title: `${pending.length} outgoing transfers remain pending`,
            detail: `${money(pendingValue)} is still moving and can be stopped in this simulation.`,
          });
        }
        const result = { status: "built", caseId, items, source: dataset.source };
        store.setTimeline(result);
        return saveResult("buildCaseTimeline", result);
      },
    },
    {
      name: "freezeAccounts",
      title: "Freeze linked accounts",
      description: "Freeze the exact detected account set and stop its pending outgoing transfers in local state. The call pauses for a person to approve the scope before anything changes.",
      irreversible: true,
      readOnly: false,
      inputSchema: {
        type: "object",
        properties: {
          caseId: flexibleId,
          accountIds: {
            type: "array",
            minItems: 1,
            maxItems: 50,
            uniqueItems: true,
            items: flexibleId,
          },
          reason: { type: "string", minLength: 12, maxLength: 180 },
        },
        required: ["caseId", "accountIds", "reason"],
        ...noExtras,
      },
      approval: {
        title: "Freeze these linked accounts?",
        description: "The page is paused. Review the exact account count and pending value before approving this local simulation.",
        scope: (args) => ({
          action: "Freeze linked accounts locally",
          accounts: `${args.accountIds.length} linked accounts`,
          pending: money(store.state.exposure?.pendingAtRisk ?? 0),
          environment: dataset.source,
        }),
      },
      handler: ({ caseId, accountIds, reason }, { humanApproved }) => {
        if (caseId !== dataset.caseId) throw new Error(`The active case is ${dataset.caseId}.`);
        const state = store.state;
        if (!state.ring || !state.exposure) throw new Error("Detect and price the ring before requesting a freeze.");
        const expected = [...state.ring.accountIds].sort();
        const supplied = [...accountIds].sort();
        if (JSON.stringify(expected) !== JSON.stringify(supplied)) throw new Error("Freeze scope must exactly match the detected ring.");
        const result = {
          status: "frozen",
          caseId,
          ringId: state.ring.ringId,
          accountIds: supplied,
          accountCount: supplied.length,
          reason,
          humanApproved,
          interdictedTransferIds: state.exposure.pendingTransferIds,
          interdictedAmount: state.exposure.pendingAtRisk,
          effectiveAt: dataset.anchorTime,
          simulationOnly: true,
        };
        store.freeze(result);
        const artifact = store.addArtifact({
          id: `freeze-receipt-${safeId(caseId)}`,
          kind: "CONTROL",
          name: "approved-freeze-receipt.json",
          mimeType: "application/json",
          content: JSON.stringify(result, null, 2),
          description: "Human-approved synthetic freeze receipt",
        });
        eventBus?.emit("artifact:created", artifact);
        eventBus?.emit("case:frozen", result);
        return saveResult("freezeAccounts", result);
      },
    },
    {
      name: "fileSARreport",
      title: "Draft case report",
      description: "Create a local suspicious-activity report (SAR) draft from the linked network, money totals, freeze result, and call receipts. Nothing is submitted externally.",
      inputSchema: {
        type: "object",
        properties: {
          caseId: flexibleId,
          format: { type: "string", enum: ["markdown", "json"] },
          includeReceipts: { type: "boolean" },
        },
        required: ["caseId", "format", "includeReceipts"],
        ...noExtras,
      },
      readOnly: false,
      handler: ({ caseId, format, includeReceipts }) => {
        if (caseId !== dataset.caseId) throw new Error(`The active case is ${dataset.caseId}.`);
        if (!store.state.frozen) throw new Error("The ring must be frozen before the case package is drafted.");
        const report = buildSAR(store.state, provenance.snapshot(), { format, includeReceipts });
        const artifact = store.addArtifact({
          id: `case-report-${safeId(caseId)}`,
          kind: "REPORT",
          name: format === "markdown" ? `${caseId}-case-report.md` : `${caseId}-case-report.json`,
          mimeType: format === "markdown" ? "text/markdown" : "application/json",
          content: report.content,
          description: "Local case evidence package, not submitted",
        });
        eventBus?.emit("artifact:created", artifact);
        const result = {
          status: "drafted-locally",
          caseId,
          reportId: artifact.id,
          format,
          receiptCount: report.receiptCount,
          submittedExternally: false,
          content: report.content,
        };
        store.markCaseFiled(result);
        return saveResult("fileSARreport", result);
      },
    },
    {
      name: "notifyBank",
      title: "Notify fraud desk",
      description: "Record a simulated handoff of the completed case package to a selected bank fraud desk. This creates a local notice only and requires a separate human approval.",
      irreversible: true,
      readOnly: false,
      inputSchema: {
        type: "object",
        properties: {
          caseId: flexibleId,
          reportId: flexibleId,
          destination: { type: "string", minLength: 3, maxLength: 80 },
        },
        required: ["caseId", "reportId", "destination"],
        ...noExtras,
      },
      approval: {
        title: "Release the case handoff?",
        description: "Review the destination for this simulated bank notification. No network request will be made.",
        scope: (args) => ({
          action: "Release local case handoff",
          report: args.reportId,
          destination: args.destination,
          environment: "Simulated delivery only",
        }),
      },
      handler: ({ caseId, reportId, destination }, { humanApproved }) => {
        if (caseId !== dataset.caseId) throw new Error(`The active case is ${dataset.caseId}.`);
        if (!store.artifactById(reportId)) throw new Error("Draft the case report before notifying a fraud desk.");
        const result = {
          status: "recorded",
          caseId,
          reportId,
          destination,
          humanApproved,
          reference: `local-handoff-${safeId(caseId)}-01`,
          networkRequests: 0,
          simulationOnly: true,
        };
        store.markBankNotified(result);
        const artifact = store.addArtifact({
          id: `bank-notice-${safeId(caseId)}`,
          kind: "NOTICE",
          name: "bank-handoff.json",
          mimeType: "application/json",
          content: JSON.stringify(result, null, 2),
          description: "Approved simulated fraud-desk handoff",
        });
        eventBus?.emit("artifact:created", artifact);
        return saveResult("notifyBank", result);
      },
    },
    {
      name: "replayInvestigation",
      title: "Replay investigation",
      description: "Replay the investigation receipts in order for the visible time scrubber without invoking handlers or repeating a freeze or notification.",
      inputSchema: {
        type: "object",
        properties: {
          speed: { type: "string", enum: ["instant", "cinematic"] },
        },
        required: ["speed"],
        ...noExtras,
      },
      readOnly: false,
      handler: async ({ speed }) => saveResult("replayInvestigation", await provenance.replay({
        speed,
        excludeNames: ["replayInvestigation"],
      })),
    },
  ];
}

function buildSAR(state, receipts, { format, includeReceipts }) {
  const receiptIds = includeReceipts ? receipts.map((receipt) => receipt.id) : [];
  const record = {
    caseId: state.caseId,
    title: "Synthetic linked-money investigation",
    status: "drafted locally",
    dataClassification: "Seeded synthetic exercise",
    ring: {
      id: state.ring.ringId,
      accounts: state.ring.size,
      confidence: state.ring.confidence,
      method: state.ring.method,
    },
    exposure: {
      grossSuspiciousFlow: state.exposure.grossSuspiciousFlow,
      pendingInterdicted: state.exposure.pendingAtRisk,
      methodology: state.exposure.methodology,
    },
    action: {
      frozenAccounts: state.frozenAccountIds.length,
      frozenAt: "2026-08-24T19:53:31.000Z",
      humanApproved: true,
    },
    receiptIds,
    limitations: "This local demonstration uses invented account aliases and synthetic transfers. It does not file a report, contact a bank, touch real funds, or include personal data.",
  };
  if (format === "json") return { content: JSON.stringify(record, null, 2), receiptCount: receiptIds.length };

  const money = (value) => value.toLocaleString("en-US", { style: "currency", currency: "USD" });
  return {
    receiptCount: receiptIds.length,
    content: [
      `# ${record.caseId} suspicious-activity report draft`,
      "",
      "Status: Drafted locally, not submitted",
      "Data: Seeded synthetic exercise",
      "",
      "## Activity summary",
      "",
      `A directed flow analysis identified ${record.ring.accounts} linked synthetic accounts with ${Math.round(record.ring.confidence * 100)}% heuristic confidence.`,
      `The ring processed ${money(record.exposure.grossSuspiciousFlow)} in gross case-relevant flow. Each transfer is counted once.`,
      "",
      "## Action",
      "",
      `A person approved the freeze of ${record.action.frozenAccounts} accounts. The control interdicted ${money(record.exposure.pendingInterdicted)} in pending synthetic exits.`,
      "",
      "## Provenance receipts",
      "",
      ...(receiptIds.length ? receiptIds.map((id) => `- ${id}`) : ["- Receipts omitted by request."]),
      "",
      "## Limitation",
      "",
      record.limitations,
    ].join("\n"),
  };
}

function safeId(value) {
  return String(value).replace(/[^A-Za-z0-9._:-]/g, "-").slice(0, 64);
}

function money(value) {
  return Number(value).toLocaleString("en-US", { style: "currency", currency: "USD" });
}
