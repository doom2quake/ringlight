export function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function mean(values) {
  if (!Array.isArray(values) || values.length === 0) return null;
  return values.reduce((total, value) => total + Number(value), 0) / values.length;
}

export function sampleStdDev(values) {
  if (!Array.isArray(values) || values.length < 2) return null;
  const average = mean(values);
  const variance = values.reduce((total, value) => total + (Number(value) - average) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function zScore(value, baselineValues) {
  const average = mean(baselineValues);
  const deviation = sampleStdDev(baselineValues);
  if (average === null || deviation === null || deviation === 0) return null;
  return (Number(value) - average) / deviation;
}

export function traceFlowMath(dataset, {
  transferId,
  maxHops = 2,
  direction = "outbound",
} = {}) {
  const transfers = dataset.transfers();
  const start = transfers.find((transfer) => transfer.id === transferId);
  if (!start) throw new RangeError(`Unknown transfer ${transferId}.`);

  const boundedHops = Math.max(1, Math.min(Number(maxHops), 6));
  const accountIds = new Set([start.from, start.to]);
  const transferIds = new Set([start.id]);
  const queue = [{ accountId: direction === "inbound" ? start.from : start.to, depth: 0 }];
  const visitedAt = new Map();

  while (queue.length > 0) {
    const { accountId, depth } = queue.shift();
    if (depth >= boundedHops || (visitedAt.has(accountId) && visitedAt.get(accountId) <= depth)) continue;
    visitedAt.set(accountId, depth);

    const adjacent = transfers.filter((transfer) => {
      if (direction === "outbound") return transfer.from === accountId;
      if (direction === "inbound") return transfer.to === accountId;
      return transfer.from === accountId || transfer.to === accountId;
    });

    for (const transfer of adjacent) {
      transferIds.add(transfer.id);
      accountIds.add(transfer.from);
      accountIds.add(transfer.to);
      const nextId = transfer.from === accountId ? transfer.to : transfer.from;
      queue.push({ accountId: nextId, depth: depth + 1 });
    }
  }

  return graphResult(dataset, accountIds, transferIds, {
    status: "traced",
    startTransferId: start.id,
    maxHops: boundedHops,
    direction,
  });
}

export function expandAccountMath(dataset, { accountId, depth = 1 } = {}) {
  const transfers = dataset.transfers();
  if (!dataset.accounts().some((account) => account.id === accountId)) {
    throw new RangeError(`Unknown account ${accountId}.`);
  }

  const boundedDepth = Math.max(1, Math.min(Number(depth), 3));
  const accountIds = new Set([accountId]);
  const transferIds = new Set();
  const queue = [{ accountId, depth: 0 }];
  const visitedAt = new Map();

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.depth >= boundedDepth || (visitedAt.has(current.accountId) && visitedAt.get(current.accountId) <= current.depth)) continue;
    visitedAt.set(current.accountId, current.depth);
    for (const transfer of transfers) {
      if (transfer.from !== current.accountId && transfer.to !== current.accountId) continue;
      transferIds.add(transfer.id);
      accountIds.add(transfer.from);
      accountIds.add(transfer.to);
      const nextId = transfer.from === current.accountId ? transfer.to : transfer.from;
      queue.push({ accountId: nextId, depth: current.depth + 1 });
    }
  }

  return graphResult(dataset, accountIds, transferIds, {
    status: "expanded",
    focusAccountId: accountId,
    depth: boundedDepth,
  });
}

export function detectMoneyRing(dataset, { seedAccountId, minAccounts = 4 } = {}) {
  const transfers = dataset.transfers();
  const accountIds = new Set(transfers.flatMap((transfer) => [transfer.from, transfer.to]));
  const adjacency = new Map([...accountIds].map((id) => [id, []]));
  for (const transfer of transfers) adjacency.get(transfer.from).push(transfer.to);

  const components = stronglyConnectedComponents([...accountIds], adjacency);
  const component = components
    .filter((candidate) => candidate.length >= minAccounts)
    .find((candidate) => candidate.includes(seedAccountId));

  if (!component) {
    return {
      status: "not-found",
      ringId: null,
      seedAccountId,
      accountIds: [],
      transferIds: [],
      size: 0,
      confidence: 0,
    };
  }

  const ringIds = new Set(component);
  const internalTransfers = transfers.filter((transfer) => ringIds.has(transfer.from) && ringIds.has(transfer.to));
  const entryTransfers = transfers.filter((transfer) => !ringIds.has(transfer.from) && ringIds.has(transfer.to));
  const exitTransfers = transfers.filter((transfer) => ringIds.has(transfer.from) && !ringIds.has(transfer.to));
  const possibleEdges = component.length * (component.length - 1);
  const cycleRank = Math.max(1, internalTransfers.length - component.length + 1);
  const density = possibleEdges ? internalTransfers.length / possibleEdges : 0;
  const passThroughAccounts = component.filter((id) => {
    const inbound = internalTransfers.filter((transfer) => transfer.to === id).length;
    const outbound = internalTransfers.filter((transfer) => transfer.from === id).length;
    return inbound > 0 && outbound > 0;
  }).length;
  const confidence = Math.min(0.99,
    0.52
    + Math.min(0.24, component.length / 60)
    + Math.min(0.12, cycleRank / 30)
    + Math.min(0.1, passThroughAccounts / component.length / 10),
  );

  return {
    status: "found",
    ringId: dataset.ringId,
    seedAccountId,
    accountIds: [...component].sort(),
    transferIds: internalTransfers.map((transfer) => transfer.id),
    entryTransferIds: entryTransfers.map((transfer) => transfer.id),
    exitTransferIds: exitTransfers.map((transfer) => transfer.id),
    size: component.length,
    internalTransferCount: internalTransfers.length,
    passThroughAccounts,
    cycleRank,
    density: round(density, 3),
    confidence: round(confidence, 3),
    method: "directed strongly connected component plus flow-through evidence",
  };
}

export function scoreAccountRisk(dataset, accountId) {
  const account = dataset.accounts().find((candidate) => candidate.id === accountId);
  if (!account) throw new RangeError(`Unknown account ${accountId}.`);
  const related = dataset.transfers().filter((transfer) => (
    transfer.from === accountId || transfer.to === accountId
  ));
  const inbound = related.filter((transfer) => transfer.to === accountId).reduce((total, transfer) => total + transfer.amount, 0);
  const outbound = related.filter((transfer) => transfer.from === accountId).reduce((total, transfer) => total + transfer.amount, 0);
  const baselineMean = mean(account.dailyOutboundHistory);
  const outboundZ = zScore(outbound, account.dailyOutboundHistory) ?? 0;
  const flowThroughRatio = Math.max(inbound, outbound) > 0 ? Math.min(inbound, outbound) / Math.max(inbound, outbound) : 0;
  const ring = detectMoneyRing(dataset, { seedAccountId: accountId, minAccounts: 4 });
  const circular = ring.status === "found";
  const transferVelocity = related.length;
  const fanOut = new Set(related.filter((transfer) => transfer.from === accountId).map((transfer) => transfer.to)).size;
  const risk = Math.min(99, Math.max(1, Math.round(
    Math.min(32, Math.max(0, outboundZ) * 2.8)
    + flowThroughRatio * 22
    + (circular ? 27 : 0)
    + Math.min(12, transferVelocity * 2)
    + Math.min(6, fanOut * 2),
  )));

  return {
    accountId,
    status: risk >= 75 ? "critical" : risk >= 50 ? "high" : risk >= 25 ? "review" : "normal",
    risk,
    outboundZ: round(outboundZ, 2),
    baselineMean: round(baselineMean, 2),
    todayOutbound: round(outbound, 2),
    inbound: round(inbound, 2),
    outbound: round(outbound, 2),
    flowThroughRatio: round(flowThroughRatio, 3),
    transferVelocity,
    fanOut,
    circular,
    method: "Atlas-style trailing z-score plus deterministic network features",
  };
}

export function scoreAccounts(dataset, accountIds) {
  return accountIds.map((accountId) => scoreAccountRisk(dataset, accountId));
}

export function dollariseRingExposure(dataset, ring) {
  if (!ring || ring.status !== "found") throw new TypeError("A detected ring is required before exposure can be calculated.");
  const ringIds = new Set(ring.accountIds);
  const relatedTransfers = dataset.transfers().filter((transfer) => (
    ringIds.has(transfer.from) || ringIds.has(transfer.to)
  ));
  const grossSuspiciousFlow = relatedTransfers.reduce((total, transfer) => total + transfer.amount, 0);
  const pendingExitTransfers = relatedTransfers.filter((transfer) => (
    transfer.status === "pending" && ringIds.has(transfer.from) && !ringIds.has(transfer.to)
  ));
  const pendingAtRisk = pendingExitTransfers.reduce((total, transfer) => total + transfer.amount, 0);
  const baselineValues = dataset.historicalCaseGross();
  const baselineGross = mean(baselineValues);
  const grossZ = zScore(grossSuspiciousFlow, baselineValues);
  const entryPrincipal = relatedTransfers
    .filter((transfer) => !ringIds.has(transfer.from) && ringIds.has(transfer.to))
    .reduce((total, transfer) => total + transfer.amount, 0);

  return {
    status: "calculated",
    currency: "USD",
    ringId: ring.ringId,
    accountCount: ring.size,
    transferCount: relatedTransfers.length,
    grossSuspiciousFlow: round(grossSuspiciousFlow, 2),
    historicalCaseMean: round(baselineGross, 2),
    aboveHistoricalMean: round(Math.max(0, grossSuspiciousFlow - baselineGross), 2),
    zScore: round(grossZ, 2),
    entryPrincipal: round(entryPrincipal, 2),
    layeringMultiple: entryPrincipal ? round(grossSuspiciousFlow / entryPrincipal, 2) : null,
    pendingAtRisk: round(pendingAtRisk, 2),
    pendingTransferIds: pendingExitTransfers.map((transfer) => transfer.id),
    methodology: "Gross case-relevant flow, counted once per transfer; pending-at-risk includes unsettled ring exits only.",
  };
}

function graphResult(dataset, accountIds, transferIds, extras) {
  const accounts = dataset.accounts().filter((account) => accountIds.has(account.id));
  const transfers = dataset.transfers().filter((transfer) => transferIds.has(transfer.id));
  return {
    ...extras,
    accountIds: accounts.map((account) => account.id),
    transferIds: transfers.map((transfer) => transfer.id),
    accounts: accounts.map(({ dailyOutboundHistory: _history, ...account }) => account),
    transfers,
  };
}

function stronglyConnectedComponents(vertices, adjacency) {
  let index = 0;
  const stack = [];
  const onStack = new Set();
  const indices = new Map();
  const lowLinks = new Map();
  const components = [];

  function visit(vertex) {
    indices.set(vertex, index);
    lowLinks.set(vertex, index);
    index += 1;
    stack.push(vertex);
    onStack.add(vertex);

    for (const next of adjacency.get(vertex) ?? []) {
      if (!indices.has(next)) {
        visit(next);
        lowLinks.set(vertex, Math.min(lowLinks.get(vertex), lowLinks.get(next)));
      } else if (onStack.has(next)) {
        lowLinks.set(vertex, Math.min(lowLinks.get(vertex), indices.get(next)));
      }
    }

    if (lowLinks.get(vertex) === indices.get(vertex)) {
      const component = [];
      let current;
      do {
        current = stack.pop();
        onStack.delete(current);
        component.push(current);
      } while (current !== vertex);
      components.push(component);
    }
  }

  for (const vertex of vertices) if (!indices.has(vertex)) visit(vertex);
  return components;
}
