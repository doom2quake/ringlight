/* Generated from the ES-module source for direct file:// use. Do not edit by hand. */
(() => {
  "use strict";
  const __modules = Object.create(null);
  __modules["src/data/fraud-ring.js"] = (() => {
    const CASE_ID = "RL-2408";
    const ANCHOR_DATE = "2026-08-24";
    const ANCHOR_TIME = "2026-08-24T19:42:00.000Z";
    const FLAGGED_TRANSFER_ID = "tx-flag-001";
    const RING_ID = "ring-ember-14";

    const RING_ALIASES = [
      "Harbor 17", "Quartz 04", "Kestrel 22", "Lumen 08", "Drift 31", "Cinder 12", "Sable 05",
      "Morrow 19", "Slate 27", "Vanta 06", "Copper 14", "Birch 23", "Tide 09", "Ember 28",
    ];

    const CASHOUTS = [
      ["sink-crypto", "Crypto off-ramp", "exchange"],
      ["sink-prepaid", "Prepaid aggregator", "prepaid"],
      ["sink-cash", "Cash logistics", "cash"],
      ["sink-gift", "Gift-card broker", "prepaid"],
      ["sink-shell", "Shell merchant", "merchant"],
    ];

    const BENIGN_ACCOUNTS = [
      ["acct-b01", "Payroll clearing", "business"],
      ["acct-b02", "Parts supplier", "business"],
      ["acct-b03", "Office services", "business"],
      ["acct-b04", "Freight partner", "business"],
      ["acct-b05", "Tax reserve", "business"],
      ["acct-b06", "Insurance premium", "business"],
    ];

    function dailyHistory(index, lowBaseline) {
      const baseline = lowBaseline ? 7_800 + index * 410 : 58_000 + index * 5_400;
      return Object.freeze(Array.from({ length: 14 }, (_, day) => (
        baseline + (((day + 3) * (index + 5) * 791) % 8_600) - 4_300
      )));
    }

    const ACCOUNTS = Object.freeze([
      Object.freeze({
        id: "acct-acme-004",
        label: "ACME-004",
        shortLabel: "ACME",
        type: "business",
        role: "compromised origin",
        dailyOutboundHistory: dailyHistory(2, false),
      }),
      ...RING_ALIASES.map((label, index) => Object.freeze({
        id: `mule-${String(index + 1).padStart(2, "0")}`,
        label,
        shortLabel: `M${String(index + 1).padStart(2, "0")}`,
        type: "personal",
        role: "unclassified",
        dailyOutboundHistory: dailyHistory(index, true),
      })),
      ...CASHOUTS.map(([id, label, type], index) => Object.freeze({
        id, label, shortLabel: `EXIT ${index + 1}`, type, role: "cash-out endpoint",
        dailyOutboundHistory: dailyHistory(index + 4, false),
      })),
      ...BENIGN_ACCOUNTS.map(([id, label, type], index) => Object.freeze({
        id, label, shortLabel: `B${index + 1}`, type, role: "background account",
        dailyOutboundHistory: dailyHistory(index + 8, false),
      })),
    ]);

    const CASE_TRANSFERS = [
      ["tx-flag-001", "19:42:00", "acct-acme-004", "mule-01", 187_500, "settled", "Flagged origin transfer"],
      ["tx-002", "19:42:41", "mule-01", "mule-02", 92_000, "settled", "First split"],
      ["tx-003", "19:42:56", "mule-01", "mule-03", 84_500, "settled", "First split"],
      ["tx-004", "19:43:22", "mule-02", "mule-04", 88_800, "settled", "Layer two"],
      ["tx-005", "19:43:39", "mule-03", "mule-05", 80_500, "settled", "Layer two"],
      ["tx-006", "19:44:03", "mule-04", "mule-06", 85_600, "settled", "Convergence"],
      ["tx-007", "19:44:19", "mule-05", "mule-06", 77_200, "settled", "Convergence"],
      ["tx-008", "19:44:58", "mule-06", "mule-07", 158_000, "settled", "Rapid pass-through"],
      ["tx-009", "19:45:21", "mule-07", "mule-08", 81_000, "settled", "Second split"],
      ["tx-010", "19:45:38", "mule-07", "mule-09", 72_500, "settled", "Second split"],
      ["tx-011", "19:46:04", "mule-08", "mule-10", 77_800, "settled", "Layer three"],
      ["tx-012", "19:46:29", "mule-09", "mule-11", 69_200, "settled", "Layer three"],
      ["tx-013", "19:46:51", "mule-10", "mule-12", 74_200, "settled", "Second convergence"],
      ["tx-014", "19:47:08", "mule-11", "mule-12", 65_500, "settled", "Second convergence"],
      ["tx-015", "19:47:44", "mule-12", "mule-13", 132_000, "settled", "Rapid pass-through"],
      ["tx-016", "19:48:12", "mule-13", "mule-14", 125_000, "settled", "Terminal aggregator"],
      ["tx-017", "19:48:40", "mule-14", "mule-01", 34_000, "settled", "Circular return"],
      ["tx-018", "19:48:53", "mule-14", "mule-05", 28_000, "settled", "Circular return"],
      ["tx-019", "19:49:09", "mule-10", "mule-03", 22_000, "settled", "Circular return"],
      ["tx-020", "19:49:31", "mule-11", "mule-04", 18_000, "settled", "Circular return"],
      ["tx-021", "19:50:02", "mule-13", "sink-crypto", 86_000, "pending", "Cash-out attempt"],
      ["tx-022", "19:50:21", "mule-14", "sink-gift", 79_000, "pending", "Cash-out attempt"],
      ["tx-023", "19:50:39", "mule-02", "sink-prepaid", 101_200, "pending", "Cash-out attempt"],
      ["tx-024", "19:51:10", "mule-04", "sink-cash", 98_250, "pending", "Cash-out attempt"],
      ["tx-025", "19:51:28", "mule-05", "sink-gift", 95_500, "pending", "Cash-out attempt"],
      ["tx-026", "19:51:49", "mule-08", "sink-crypto", 106_000, "pending", "Cash-out attempt"],
      ["tx-027", "19:52:18", "mule-12", "sink-shell", 99_500, "pending", "Cash-out attempt"],
    ];

    const BACKGROUND_TRANSFERS = [
      ["tx-bg-01", "18:12:00", "acct-acme-004", "acct-b01", 61_400],
      ["tx-bg-02", "18:31:00", "acct-b02", "acct-acme-004", 42_800],
      ["tx-bg-03", "18:54:00", "acct-acme-004", "acct-b03", 18_750],
      ["tx-bg-04", "19:03:00", "acct-b04", "acct-acme-004", 73_100],
      ["tx-bg-05", "19:17:00", "acct-acme-004", "acct-b05", 27_600],
      ["tx-bg-06", "19:29:00", "acct-b06", "acct-acme-004", 54_250],
    ];

    function makeTimestamp(time) {
      return `${ANCHOR_DATE}T${time}.000Z`;
    }

    const TRANSFERS = Object.freeze([
      ...CASE_TRANSFERS.map(([id, time, from, to, amount, status, memo]) => Object.freeze({
        id,
        timestamp: makeTimestamp(time),
        time: time.slice(0, 5),
        from,
        to,
        amount,
        currency: "USD",
        status,
        memo,
      })),
      ...BACKGROUND_TRANSFERS.map(([id, time, from, to, amount]) => Object.freeze({
        id,
        timestamp: makeTimestamp(time),
        time: time.slice(0, 5),
        from,
        to,
        amount,
        currency: "USD",
        status: "settled",
        memo: "Ordinary business transfer",
      })),
    ]);

    const HISTORICAL_CASE_GROSS = Object.freeze([
      420_000, 610_000, 370_000, 790_000, 560_000, 680_000, 450_000,
      520_000, 880_000, 640_000, 590_000, 730_000, 470_000, 810_000,
    ]);

    function createFraudDataset() {
      const accounts = ACCOUNTS.map((account) => ({
        ...account,
        dailyOutboundHistory: [...account.dailyOutboundHistory],
      }));
      const transfers = TRANSFERS.map((transfer) => ({ ...transfer }));
      return Object.freeze({
        caseId: CASE_ID,
        anchorDate: ANCHOR_DATE,
        anchorTime: ANCHOR_TIME,
        flaggedTransferId: FLAGGED_TRANSFER_ID,
        ringId: RING_ID,
        source: "seeded synthetic exercise",
        primedAccountIds: ["acct-acme-004", "mule-01", "mule-02", "mule-03", "mule-04", "mule-05", "mule-06"],
        primedTransferIds: ["tx-flag-001", "tx-002", "tx-003", "tx-004", "tx-005", "tx-006", "tx-007"],
        accounts: () => accounts.map((account) => ({ ...account, dailyOutboundHistory: [...account.dailyOutboundHistory] })),
        transfers: () => transfers.map((transfer) => ({ ...transfer })),
        historicalCaseGross: () => [...HISTORICAL_CASE_GROSS],
      });
    }
    return Object.freeze({ CASE_ID, ANCHOR_DATE, ANCHOR_TIME, FLAGGED_TRANSFER_ID, RING_ID, ACCOUNTS, TRANSFERS, HISTORICAL_CASE_GROSS, createFraudDataset });
  })();
  __modules["src/data/import-transfers.js"] = (() => {
    const REQUIRED_COLUMNS = Object.freeze(["from", "to", "amount", "timestamp"]);

    function parseTransferText(text, { filename = "transfers.json" } = {}) {
      if (typeof text !== "string" || text.trim().length === 0) {
        throw new TypeError("Choose a non-empty CSV or JSON file.");
      }
      const rows = filename.toLowerCase().endsWith(".json") || /^[\s]*[\[{]/.test(text)
        ? parseJson(text)
        : parseCsv(text);
      return createImportedDataset(rows);
    }

    function createImportedDataset(rows) {
      if (!Array.isArray(rows) || rows.length === 0) {
        throw new TypeError("The file must contain at least one transfer.");
      }

      const transfers = rows.map((row, index) => normaliseTransfer(row, index));
      transfers.sort((left, right) => left.timestamp.localeCompare(right.timestamp) || left.id.localeCompare(right.id));
      const ids = new Set();
      for (const transfer of transfers) {
        if (ids.has(transfer.id)) throw new TypeError(`Transfer id ${transfer.id} appears more than once.`);
        ids.add(transfer.id);
      }

      const labels = new Map();
      for (const [index, row] of rows.entries()) {
        const transfer = normaliseTransfer(row, index);
        labels.set(transfer.from, cleanLabel(row.fromLabel ?? row.from_label, transfer.from));
        labels.set(transfer.to, cleanLabel(row.toLabel ?? row.to_label, transfer.to));
      }

      const accountIds = [...new Set(transfers.flatMap((transfer) => [transfer.from, transfer.to]))].sort();
      const accounts = accountIds.map((id, index) => {
        const outbound = transfers
          .filter((transfer) => transfer.from === id)
          .reduce((total, transfer) => total + transfer.amount, 0);
        const baseline = Math.max(1_000, outbound / 8 || 5_000);
        return {
          id,
          label: labels.get(id) ?? id,
          shortLabel: compactLabel(id, index),
          type: "imported",
          role: "unclassified",
          dailyOutboundHistory: Array.from({ length: 14 }, (_, day) => (
            Math.round(baseline * (0.72 + ((stableHash(`${id}:${day}`) % 37) / 100)))
          )),
        };
      });

      const first = transfers[0];
      const total = transfers.reduce((sum, transfer) => sum + transfer.amount, 0);
      const fingerprint = stableHash(transfers.map(({ id, from, to, amount, timestamp }) => (
        `${id}|${from}|${to}|${amount}|${timestamp}`
      )).join("\n")).toString(16).padStart(8, "0");
      const primedTransfers = transfers.slice(0, Math.min(4, transfers.length));
      const primedAccountIds = [...new Set(primedTransfers.flatMap((transfer) => [transfer.from, transfer.to]))];

      return datasetFrom({
        caseId: `LOCAL-${fingerprint.slice(0, 6).toUpperCase()}`,
        anchorTime: first.timestamp,
        flaggedTransferId: first.id,
        ringId: `ring-local-${fingerprint.slice(0, 6)}`,
        accounts,
        transfers,
        historicalCaseGross: [0.34, 0.41, 0.29, 0.47, 0.38, 0.44, 0.31, 0.36, 0.49, 0.4, 0.35, 0.43, 0.33, 0.46]
          .map((ratio) => Math.round(total * ratio)),
        primedAccountIds,
        primedTransferIds: primedTransfers.map((transfer) => transfer.id),
      });
    }

    function createMutableDataset(initialDataset) {
      let current = initialDataset;
      return {
        get caseId() { return current.caseId; },
        get anchorDate() { return current.anchorDate; },
        get anchorTime() { return current.anchorTime; },
        get flaggedTransferId() { return current.flaggedTransferId; },
        get ringId() { return current.ringId; },
        get source() { return current.source; },
        get primedAccountIds() { return [...current.primedAccountIds]; },
        get primedTransferIds() { return [...current.primedTransferIds]; },
        accounts: () => current.accounts(),
        transfers: () => current.transfers(),
        historicalCaseGross: () => current.historicalCaseGross(),
        replace(nextDataset) {
          if (!nextDataset?.accounts || !nextDataset?.transfers) throw new TypeError("A valid transfer dataset is required.");
          current = nextDataset;
          return this;
        },
      };
    }

    function parseJson(text) {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (error) {
        throw new TypeError(`JSON could not be read: ${error.message}`);
      }
      return Array.isArray(parsed) ? parsed : parsed?.transfers;
    }

    function parseCsv(text) {
      const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) throw new TypeError("CSV needs a header and at least one transfer row.");
      const headers = csvCells(lines[0]).map((header) => header.trim());
      for (const column of REQUIRED_COLUMNS) {
        if (!headers.includes(column)) throw new TypeError(`CSV is missing the ${column} column.`);
      }
      return lines.slice(1).map((line) => {
        const values = csvCells(line);
        if (values.length !== headers.length) throw new TypeError("A CSV row has the wrong number of columns.");
        return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
      });
    }

    function csvCells(line) {
      const cells = [];
      let value = "";
      let quoted = false;
      for (let index = 0; index < line.length; index += 1) {
        const character = line[index];
        if (character === '"') {
          if (quoted && line[index + 1] === '"') {
            value += '"';
            index += 1;
          } else quoted = !quoted;
        } else if (character === "," && !quoted) {
          cells.push(value.trim());
          value = "";
        } else value += character;
      }
      if (quoted) throw new TypeError("A CSV row has an unclosed quote.");
      cells.push(value.trim());
      return cells;
    }

    function normaliseTransfer(row, index) {
      if (!row || typeof row !== "object" || Array.isArray(row)) throw new TypeError(`Transfer ${index + 1} is not an object.`);
      for (const key of REQUIRED_COLUMNS) {
        if (row[key] === undefined || String(row[key]).trim() === "") throw new TypeError(`Transfer ${index + 1} is missing ${key}.`);
      }
      const from = cleanId(row.from, `Transfer ${index + 1} from`);
      const to = cleanId(row.to, `Transfer ${index + 1} to`);
      if (from === to) throw new TypeError(`Transfer ${index + 1} must move between two different accounts.`);
      const amount = Number(String(row.amount).replaceAll(",", ""));
      if (!Number.isFinite(amount) || amount <= 0) throw new TypeError(`Transfer ${index + 1} has an invalid amount.`);
      const parsedTime = Date.parse(row.timestamp);
      if (!Number.isFinite(parsedTime)) throw new TypeError(`Transfer ${index + 1} has an invalid timestamp.`);
      const timestamp = new Date(parsedTime).toISOString();
      const status = String(row.status ?? "settled").trim().toLowerCase();
      if (!new Set(["settled", "pending"]).has(status)) throw new TypeError(`Transfer ${index + 1} status must be settled or pending.`);
      return {
        id: cleanId(row.id ?? `tx-local-${String(index + 1).padStart(3, "0")}`, `Transfer ${index + 1} id`),
        timestamp,
        time: timestamp.slice(11, 16),
        from,
        to,
        amount: Math.round((amount + Number.EPSILON) * 100) / 100,
        currency: "USD",
        status,
        memo: cleanLabel(row.memo, "Imported transfer"),
      };
    }

    function datasetFrom({ caseId, anchorTime, flaggedTransferId, ringId, accounts, transfers, historicalCaseGross, primedAccountIds, primedTransferIds }) {
      return Object.freeze({
        caseId,
        anchorDate: anchorTime.slice(0, 10),
        anchorTime,
        flaggedTransferId,
        ringId,
        source: "local CSV/JSON file",
        primedAccountIds: [...primedAccountIds],
        primedTransferIds: [...primedTransferIds],
        accounts: () => accounts.map((account) => ({ ...account, dailyOutboundHistory: [...account.dailyOutboundHistory] })),
        transfers: () => transfers.map((transfer) => ({ ...transfer })),
        historicalCaseGross: () => [...historicalCaseGross],
      });
    }

    function cleanId(value, label) {
      const id = String(value).trim();
      if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/.test(id)) {
        throw new TypeError(`${label} must use letters, numbers, dots, underscores, colons, or hyphens.`);
      }
      return id;
    }

    function cleanLabel(value, fallback) {
      const label = String(value ?? "").trim();
      return label ? label.slice(0, 80) : fallback;
    }

    function compactLabel(id, index) {
      const cleaned = id.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      return cleaned.slice(0, 5) || `A${index + 1}`;
    }

    function stableHash(value) {
      let hash = 2166136261;
      for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619) >>> 0;
      }
      return hash;
    }
    return Object.freeze({ parseTransferText, createImportedDataset, createMutableDataset });
  })();
  __modules["src/analysis/math.js"] = (() => {
    function round(value, digits = 2) {
      const factor = 10 ** digits;
      return Math.round((value + Number.EPSILON) * factor) / factor;
    }

    function mean(values) {
      if (!Array.isArray(values) || values.length === 0) return null;
      return values.reduce((total, value) => total + Number(value), 0) / values.length;
    }

    function sampleStdDev(values) {
      if (!Array.isArray(values) || values.length < 2) return null;
      const average = mean(values);
      const variance = values.reduce((total, value) => total + (Number(value) - average) ** 2, 0) / (values.length - 1);
      return Math.sqrt(variance);
    }

    function zScore(value, baselineValues) {
      const average = mean(baselineValues);
      const deviation = sampleStdDev(baselineValues);
      if (average === null || deviation === null || deviation === 0) return null;
      return (Number(value) - average) / deviation;
    }

    function traceFlowMath(dataset, {
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

    function expandAccountMath(dataset, { accountId, depth = 1 } = {}) {
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

    function detectMoneyRing(dataset, { seedAccountId, minAccounts = 4 } = {}) {
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

    function scoreAccountRisk(dataset, accountId) {
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

    function scoreAccounts(dataset, accountIds) {
      return accountIds.map((accountId) => scoreAccountRisk(dataset, accountId));
    }

    function dollariseRingExposure(dataset, ring) {
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
    return Object.freeze({ round, mean, sampleStdDev, zScore, traceFlowMath, expandAccountMath, detectMoneyRing, scoreAccountRisk, scoreAccounts, dollariseRingExposure });
  })();
  __modules["src/app/store.js"] = (() => {
    const { createFraudDataset } = __modules["src/data/fraud-ring.js"];

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

    class RinglightStore {
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
    return Object.freeze({ RinglightStore });
  })();
  __modules["src/webmcp/event-bus.js"] = (() => {
    class EventBus {
      #listeners = new Map();

      on(eventName, listener) {
        if (!this.#listeners.has(eventName)) this.#listeners.set(eventName, new Set());
        this.#listeners.get(eventName).add(listener);
        return () => this.off(eventName, listener);
      }

      off(eventName, listener) {
        this.#listeners.get(eventName)?.delete(listener);
      }

      emit(eventName, detail = {}) {
        const event = Object.freeze({ type: eventName, detail });
        for (const listener of this.#listeners.get(eventName) ?? []) {
          try {
            listener(event);
          } catch (error) {
            queueMicrotask(() => { throw error; });
          }
        }
        for (const listener of this.#listeners.get("*") ?? []) {
          try {
            listener(event);
          } catch (error) {
            queueMicrotask(() => { throw error; });
          }
        }
        return event;
      }

      clear() {
        this.#listeners.clear();
      }
    }
    return Object.freeze({ EventBus });
  })();
  __modules["src/webmcp/schema.js"] = (() => {
    class ToolContractError extends TypeError {
      constructor(toolName, issues) {
        const detail = issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
        super(`Invalid arguments for ${toolName}: ${detail}`);
        this.name = "ToolContractError";
        this.code = "INVALID_TOOL_ARGUMENTS";
        this.toolName = toolName;
        this.issues = issues;
      }
    }

    function validateArgs(toolName, schema, args) {
      const issues = [];
      validateValue(schema ?? {}, args, "$", issues);
      if (issues.length > 0) throw new ToolContractError(toolName, issues);
      return args;
    }

    function validateValue(schema, value, path, issues) {
      if (!schema || typeof schema !== "object") return;

      if (Array.isArray(schema.enum) && !schema.enum.some((candidate) => Object.is(candidate, value))) {
        issues.push({ path, message: `must be one of ${schema.enum.map(formatValue).join(", ")}` });
        return;
      }
      if (Object.hasOwn(schema, "const") && !Object.is(schema.const, value)) {
        issues.push({ path, message: `must equal ${formatValue(schema.const)}` });
        return;
      }

      if (Array.isArray(schema.oneOf)) {
        const matches = schema.oneOf.filter((candidate) => {
          const candidateIssues = [];
          validateValue(candidate, value, path, candidateIssues);
          return candidateIssues.length === 0;
        });
        if (matches.length !== 1) issues.push({ path, message: "must match exactly one allowed shape" });
        return;
      }

      if (schema.type && !matchesType(schema.type, value)) {
        issues.push({ path, message: `must be ${schema.type}` });
        return;
      }

      if (schema.type === "object") validateObject(schema, value, path, issues);
      if (schema.type === "array") validateArray(schema, value, path, issues);
      if (schema.type === "string") validateString(schema, value, path, issues);
      if (schema.type === "number" || schema.type === "integer") validateNumber(schema, value, path, issues);
    }

    function validateObject(schema, value, path, issues) {
      const properties = schema.properties ?? {};
      for (const required of schema.required ?? []) {
        if (!Object.hasOwn(value, required)) {
          issues.push({ path: `${path}.${required}`, message: "is required" });
        }
      }

      for (const [key, entry] of Object.entries(value)) {
        if (Object.hasOwn(properties, key)) {
          validateValue(properties[key], entry, `${path}.${key}`, issues);
        } else if (schema.additionalProperties === false) {
          issues.push({ path: `${path}.${key}`, message: "is not allowed" });
        } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
          validateValue(schema.additionalProperties, entry, `${path}.${key}`, issues);
        }
      }
    }

    function validateArray(schema, value, path, issues) {
      if (Number.isInteger(schema.minItems) && value.length < schema.minItems) {
        issues.push({ path, message: `must contain at least ${schema.minItems} item(s)` });
      }
      if (Number.isInteger(schema.maxItems) && value.length > schema.maxItems) {
        issues.push({ path, message: `must contain at most ${schema.maxItems} item(s)` });
      }
      if (schema.uniqueItems) {
        const unique = new Set(value.map((entry) => JSON.stringify(entry)));
        if (unique.size !== value.length) issues.push({ path, message: "must contain unique items" });
      }
      if (schema.items) {
        value.forEach((entry, index) => validateValue(schema.items, entry, `${path}[${index}]`, issues));
      }
    }

    function validateString(schema, value, path, issues) {
      if (Number.isInteger(schema.minLength) && value.length < schema.minLength) {
        issues.push({ path, message: `must be at least ${schema.minLength} character(s)` });
      }
      if (Number.isInteger(schema.maxLength) && value.length > schema.maxLength) {
        issues.push({ path, message: `must be at most ${schema.maxLength} character(s)` });
      }
      if (schema.pattern && !(new RegExp(schema.pattern).test(value))) {
        issues.push({ path, message: `must match ${schema.pattern}` });
      }
    }

    function validateNumber(schema, value, path, issues) {
      if (typeof schema.minimum === "number" && value < schema.minimum) {
        issues.push({ path, message: `must be at least ${schema.minimum}` });
      }
      if (typeof schema.maximum === "number" && value > schema.maximum) {
        issues.push({ path, message: `must be at most ${schema.maximum}` });
      }
      if (typeof schema.exclusiveMinimum === "number" && value <= schema.exclusiveMinimum) {
        issues.push({ path, message: `must be greater than ${schema.exclusiveMinimum}` });
      }
      if (typeof schema.exclusiveMaximum === "number" && value >= schema.exclusiveMaximum) {
        issues.push({ path, message: `must be less than ${schema.exclusiveMaximum}` });
      }
    }

    function matchesType(type, value) {
      if (Array.isArray(type)) return type.some((candidate) => matchesType(candidate, value));
      if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
      if (type === "array") return Array.isArray(value);
      if (type === "integer") return Number.isInteger(value);
      if (type === "number") return typeof value === "number" && Number.isFinite(value);
      if (type === "null") return value === null;
      return typeof value === type;
    }

    function formatValue(value) {
      return typeof value === "string" ? JSON.stringify(value) : String(value);
    }
    return Object.freeze({ ToolContractError, validateArgs });
  })();
  __modules["src/webmcp/polyfill.js"] = (() => {
    const TOOL_NAME_PATTERN = /^[A-Za-z0-9_.-]{1,128}$/;

    function createModelContextPolyfill({ origin = "local://ringlight" } = {}) {
      const tools = new Map();
      const eventTarget = typeof EventTarget === "function" ? new EventTarget() : createTinyEventTarget();

      const context = {
        __webmcpLocalPolyfill: true,

        async registerTool(tool, options = {}) {
          validateDescriptor(tool);
          if (tools.has(tool.name)) throw invalidState(`Tool ${tool.name} is already registered.`);
          if (options.signal?.aborted) throw options.signal.reason ?? abortError();

          tools.set(tool.name, tool);
          if (options.signal) {
            options.signal.addEventListener("abort", () => {
              if (tools.delete(tool.name)) dispatchToolChange(eventTarget);
            }, { once: true });
          }
          dispatchToolChange(eventTarget);
        },

        async getTools() {
          return [...tools.values()]
            .sort((left, right) => left.name.localeCompare(right.name))
            .map((tool) => ({
              name: tool.name,
              title: tool.title ?? "",
              description: tool.description,
              inputSchema: structuredClone(tool.inputSchema ?? {}),
              annotations: structuredClone(tool.annotations ?? {
                readOnlyHint: false,
                untrustedContentHint: false,
              }),
              origin,
              window: typeof window === "undefined" ? null : window,
            }));
        },

        async executeTool(toolOrName, inputObject = {}, options = {}) {
          if (options.signal?.aborted) throw options.signal.reason ?? abortError();
          const name = typeof toolOrName === "string" ? toolOrName : toolOrName?.name;
          const descriptor = tools.get(name);
          if (!descriptor) throw notFound(`Tool ${name ?? "(unknown)"} is not registered.`);
          const parsedInput = typeof inputObject === "string" ? JSON.parse(inputObject) : inputObject;
          const signal = options.signal ?? new AbortController().signal;
          return descriptor.execute(parsedInput, { signal });
        },

        addEventListener: eventTarget.addEventListener.bind(eventTarget),
        removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
        dispatchEvent: eventTarget.dispatchEvent.bind(eventTarget),
        ontoolchange: null,
      };

      context.addEventListener("toolchange", (event) => context.ontoolchange?.(event));
      return context;
    }

    function ensureModelContext(documentRef = globalThis.document) {
      if (typeof documentRef?.modelContext?.registerTool === "function") {
        return { context: documentRef.modelContext, mode: "native" };
      }
      const context = createModelContextPolyfill();
      if (documentRef) {
        try {
          Object.defineProperty(documentRef, "modelContext", {
            configurable: true,
            enumerable: false,
            value: context,
          });
        } catch {
          documentRef.modelContext = context;
        }
      }
      return { context, mode: "polyfill" };
    }

    function validateDescriptor(tool) {
      if (!tool || typeof tool !== "object") throw new TypeError("Tool descriptor must be an object.");
      if (!TOOL_NAME_PATTERN.test(tool.name ?? "")) throw invalidState("Tool name is invalid.");
      if (typeof tool.description !== "string" || tool.description.length === 0) {
        throw invalidState("Tool description must be a non-empty string.");
      }
      if (typeof tool.execute !== "function") throw new TypeError("Tool execute must be a function.");
      if (tool.inputSchema !== undefined) JSON.stringify(tool.inputSchema);
    }

    function createTinyEventTarget() {
      const listeners = new Map();
      return {
        addEventListener(name, listener) {
          if (!listeners.has(name)) listeners.set(name, new Set());
          listeners.get(name).add(listener);
        },
        removeEventListener(name, listener) { listeners.get(name)?.delete(listener); },
        dispatchEvent(event) {
          for (const listener of listeners.get(event.type) ?? []) listener(event);
          return true;
        },
      };
    }

    function dispatchToolChange(target) {
      const event = typeof Event === "function" ? new Event("toolchange") : { type: "toolchange" };
      target.dispatchEvent(event);
    }

    function invalidState(message) {
      return typeof DOMException === "function"
        ? new DOMException(message, "InvalidStateError")
        : Object.assign(new Error(message), { name: "InvalidStateError" });
    }

    function notFound(message) {
      return typeof DOMException === "function"
        ? new DOMException(message, "NotFoundError")
        : Object.assign(new Error(message), { name: "NotFoundError" });
    }

    function abortError() {
      return typeof DOMException === "function"
        ? new DOMException("The operation was aborted.", "AbortError")
        : Object.assign(new Error("The operation was aborted."), { name: "AbortError" });
    }
    return Object.freeze({ createModelContextPolyfill, ensureModelContext });
  })();
  __modules["src/webmcp/human-gate.js"] = (() => {
    class ApprovalRequiredError extends Error {
      constructor(toolName, message = `Human approval was not granted for ${toolName}.`) {
        super(message);
        this.name = "ApprovalRequiredError";
        this.code = "HUMAN_APPROVAL_REQUIRED";
        this.toolName = toolName;
      }
    }

    class HumanApprovalGate {
      #eventBus;
      #approvalProvider;
      #pending = new Map();
      #counter = 0;

      constructor({ eventBus, approvalProvider = null } = {}) {
        this.#eventBus = eventBus;
        this.#approvalProvider = approvalProvider;
      }

      get pendingCount() {
        return this.#pending.size;
      }

      async request({ toolName, title, description, args, scope }, { signal } = {}) {
        const requestId = `approval-${String(++this.#counter).padStart(3, "0")}`;
        const request = Object.freeze({
          requestId,
          toolName,
          title,
          description,
          args: structuredClone(args),
          scope: structuredClone(scope ?? {}),
        });

        this.#eventBus?.emit("approval:requested", request);

        if (this.#approvalProvider) {
          const approved = Boolean(await this.#approvalProvider(request));
          this.#eventBus?.emit(approved ? "approval:granted" : "approval:denied", {
            ...request,
            actor: approved ? "human" : null,
          });
          return { approved, requestId, actor: approved ? "human" : null };
        }

        return new Promise((resolve, reject) => {
          const onAbort = () => {
            this.#pending.delete(requestId);
            reject(signal.reason ?? new ApprovalRequiredError(toolName, "Approval request was cancelled."));
          };
          if (signal?.aborted) return onAbort();
          signal?.addEventListener("abort", onAbort, { once: true });
          this.#pending.set(requestId, {
            request,
            settle: (approved, actor) => {
              signal?.removeEventListener("abort", onAbort);
              this.#pending.delete(requestId);
              this.#eventBus?.emit(approved ? "approval:granted" : "approval:denied", {
                ...request,
                actor: approved ? actor : null,
              });
              resolve({ approved, requestId, actor: approved ? actor : null });
            },
          });
        });
      }

      approve(requestId, { actor = "human" } = {}) {
        const pending = this.#pending.get(requestId);
        if (!pending) return false;
        pending.settle(true, actor);
        return true;
      }

      deny(requestId) {
        const pending = this.#pending.get(requestId);
        if (!pending) return false;
        pending.settle(false, null);
        return true;
      }

      denyAll() {
        for (const requestId of [...this.#pending.keys()]) this.deny(requestId);
      }
    }
    return Object.freeze({ ApprovalRequiredError, HumanApprovalGate });
  })();
  __modules["src/webmcp/provenance.js"] = (() => {
    class DeterministicClock {
      #nextTimestamp;
      #stepMs;

      constructor({ start = "2026-08-24T19:42:00.000Z", stepMs = 11_000 } = {}) {
        this.#nextTimestamp = Date.parse(start);
        this.#stepMs = stepMs;
      }

      next() {
        const timestamp = new Date(this.#nextTimestamp).toISOString();
        this.#nextTimestamp += this.#stepMs;
        return timestamp;
      }

      reset(start = "2026-08-24T19:42:00.000Z") {
        this.#nextTimestamp = Date.parse(start);
      }
    }

    class ProvenanceRail {
      #entries = [];
      #eventBus;
      #clock;
      #caseId;

      #source;

      constructor({ eventBus, clock = new DeterministicClock(), caseId = "RL-2408", source = "seeded synthetic exercise" } = {}) {
        this.#eventBus = eventBus;
        this.#clock = clock;
        this.#caseId = caseId;
        this.#source = source;
      }

      record({ callId, name, args, result, error, status, humanApproved = null }) {
        const payload = error
          ? { error: error.message, code: error.code ?? error.name }
          : result;
        const entry = Object.freeze({
          id: `rcpt-${String(this.#entries.length + 1).padStart(3, "0")}`,
          callId,
          name,
          args: structuredClone(args ?? {}),
          argsDigest: digest(args ?? {}),
          resultDigest: digest(payload),
          timestamp: this.#clock.next(),
          status,
          humanApproved,
          error: error ? { message: error.message, code: error.code ?? error.name } : null,
        });
        this.#entries.push(entry);
        this.#eventBus?.emit("provenance:recorded", entry);
        return structuredClone(entry);
      }

      snapshot() {
        return structuredClone(this.#entries);
      }

      clear({ start, caseId, source } = {}) {
        this.#entries = [];
        this.#clock.reset(start);
        if (caseId) this.#caseId = caseId;
        if (source) this.#source = source;
        this.#eventBus?.emit("provenance:cleared", {});
      }

      async replay({ speed = "instant", excludeNames = [] } = {}) {
        const entries = this.snapshot().filter((entry) => !excludeNames.includes(entry.name));
        this.#eventBus?.emit("provenance:replay-started", { count: entries.length, speed });
        for (const [index, entry] of entries.entries()) {
          this.#eventBus?.emit("provenance:replay-entry", { entry, index, count: entries.length });
          if (speed === "cinematic") await delay(170);
        }
        const receiptDigest = digest(entries.map((entry) => entry.resultDigest));
        const result = {
          status: "replayed",
          replayed: entries.length,
          receiptIds: entries.map((entry) => entry.id),
          receiptDigest,
          sideEffectsRepeated: false,
        };
        this.#eventBus?.emit("provenance:replay-completed", result);
        return result;
      }

      bundle() {
        const receipts = this.snapshot();
        return {
          version: 1,
          caseId: this.#caseId,
          source: this.#source,
          receipts,
          bundleDigest: digest(receipts),
        };
      }
    }

    function stableStringify(value) {
      if (value === undefined) return '"[undefined]"';
      if (value === null || typeof value !== "object") return JSON.stringify(value);
      if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
      const entries = Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
      return `{${entries.join(",")}}`;
    }

    function digest(value) {
      const text = stableStringify(value);
      let hash = 0x811c9dc5;
      for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193) >>> 0;
      }
      return `fnv1a:${hash.toString(16).padStart(8, "0")}`;
    }

    function delay(milliseconds) {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }
    return Object.freeze({ DeterministicClock, ProvenanceRail, stableStringify, digest });
  })();
  __modules["src/webmcp/substrate.js"] = (() => {
    const { ensureModelContext } = __modules["src/webmcp/polyfill.js"];
    const { ApprovalRequiredError } = __modules["src/webmcp/human-gate.js"];
    const { validateArgs } = __modules["src/webmcp/schema.js"];

    const TOOL_NAME_PATTERN = /^[A-Za-z0-9_.-]{1,128}$/;

    class WebMCPSubstrate {
      #context;
      #mode;
      #eventBus;
      #provenance;
      #approvalGate;
      #registered = new Map();
      #callCounter = 0;

      constructor({ documentRef, eventBus, provenance, approvalGate, modelContext } = {}) {
        const host = modelContext
          ? { context: modelContext, mode: modelContext.__webmcpLocalPolyfill ? "polyfill" : "native" }
          : ensureModelContext(documentRef);
        this.#context = host.context;
        this.#mode = host.mode;
        this.#eventBus = eventBus;
        this.#provenance = provenance;
        this.#approvalGate = approvalGate;
      }

      get mode() {
        return this.#mode;
      }

      get size() {
        return this.#registered.size;
      }

      list() {
        return [...this.#registered.values()].map(({ definition }) => ({
          name: definition.name,
          title: definition.title,
          description: definition.description,
          inputSchema: structuredClone(definition.inputSchema),
          irreversible: definition.irreversible,
        }));
      }

      async registerTool({
        name,
        title,
        description,
        inputSchema,
        handler,
        irreversible = false,
        readOnly = !irreversible,
        approval,
      }) {
        validateDefinition({ name, description, inputSchema, handler });
        const controller = new AbortController();
        const definition = {
          name,
          title: title ?? humanizeName(name),
          description,
          inputSchema,
          handler,
          irreversible,
          readOnly,
          approval,
        };

        const execute = async (inputObject = {}, options = {}) => {
          const callId = `call-${String(++this.#callCounter).padStart(3, "0")}`;
          const signal = options.signal ?? new AbortController().signal;
          let humanApproved = irreversible ? false : null;
          this.#eventBus?.emit("tool:started", { callId, name, args: inputObject, irreversible });

          try {
            if (signal.aborted) throw signal.reason ?? new DOMException("Tool call cancelled.", "AbortError");
            validateArgs(name, inputSchema, inputObject);

            if (irreversible) {
              if (!this.#approvalGate) throw new ApprovalRequiredError(name);
              const decision = await this.#approvalGate.request({
                toolName: name,
                title: approval?.title ?? `Approve ${definition.title}?`,
                description: approval?.description ?? description,
                args: inputObject,
                scope: typeof approval?.scope === "function" ? approval.scope(inputObject) : approval?.scope,
              }, { signal });
              humanApproved = decision.approved;
              if (!decision.approved) throw new ApprovalRequiredError(name);
            }

            const result = await handler(structuredClone(inputObject), {
              signal,
              humanApproved,
              callId,
            });
            assertSerializableResult(name, result);
            const receipt = this.#provenance?.record({
              callId,
              name,
              args: inputObject,
              result,
              status: "success",
              humanApproved,
            });
            this.#eventBus?.emit("tool:completed", { callId, name, args: inputObject, result, receipt, humanApproved });
            return result;
          } catch (error) {
            const status = error instanceof ApprovalRequiredError ? "denied" : "error";
            const receipt = this.#provenance?.record({
              callId,
              name,
              args: inputObject,
              error,
              status,
              humanApproved,
            });
            this.#eventBus?.emit("tool:failed", { callId, name, args: inputObject, error, receipt, humanApproved });
            throw error;
          }
        };

        const descriptor = {
          name,
          title: definition.title,
          description,
          inputSchema,
          annotations: {
            readOnlyHint: Boolean(readOnly),
            untrustedContentHint: false,
          },
          execute,
        };

        await this.#context.registerTool(descriptor, { signal: controller.signal });
        this.#registered.set(name, { definition, descriptor, controller });
        this.#eventBus?.emit("tool:registered", { name, mode: this.#mode, irreversible });
        return () => this.unregister(name);
      }

      async registerAll(definitions) {
        for (const definition of definitions) await this.registerTool(definition);
        return this.list();
      }

      invoke(name, args = {}, options = {}) {
        const registered = this.#registered.get(name);
        if (!registered) throw new RangeError(`Tool ${name} is not registered.`);
        return registered.descriptor.execute(args, options);
      }

      unregister(name) {
        const registered = this.#registered.get(name);
        if (!registered) return false;
        registered.controller.abort();
        this.#registered.delete(name);
        this.#eventBus?.emit("tool:unregistered", { name });
        return true;
      }

      destroy() {
        for (const name of [...this.#registered.keys()]) this.unregister(name);
      }
    }

    function validateDefinition({ name, description, inputSchema, handler }) {
      if (!TOOL_NAME_PATTERN.test(name ?? "")) throw new TypeError(`Invalid tool name: ${name}`);
      if (typeof description !== "string" || description.trim().length === 0) {
        throw new TypeError(`Tool ${name} needs a non-empty description.`);
      }
      if (!inputSchema || inputSchema.type !== "object") {
        throw new TypeError(`Tool ${name} needs an object input schema.`);
      }
      if (typeof handler !== "function") throw new TypeError(`Tool ${name} needs a handler function.`);
    }

    function assertSerializableResult(name, result) {
      if (result === undefined) throw new TypeError(`Tool ${name} returned undefined.`);
      const serialized = JSON.stringify(result);
      if (serialized === undefined) throw new TypeError(`Tool ${name} returned a non-serializable value.`);
    }

    function humanizeName(name) {
      return name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (character) => character.toUpperCase());
    }
    return Object.freeze({ WebMCPSubstrate });
  })();
  __modules["src/app/tools.js"] = (() => {
    const { detectMoneyRing, dollariseRingExposure, expandAccountMath, scoreAccounts, traceFlowMath } = __modules["src/analysis/math.js"];
    const noExtras = { additionalProperties: false };
    const flexibleId = { type: "string", pattern: "^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$" };

    function createRinglightTools({ dataset, store, provenance, eventBus }) {
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
    return Object.freeze({ createRinglightTools });
  })();
  __modules["src/sim/guided-demo.js"] = (() => {
    const { CASE_ID, FLAGGED_TRANSFER_ID, RING_ID } = __modules["src/data/fraud-ring.js"];

    const RING_ACCOUNT_IDS = Object.freeze(
      Array.from({ length: 14 }, (_, index) => `mule-${String(index + 1).padStart(2, "0")}`),
    );

    const GUIDED_CALLS = Object.freeze([
      Object.freeze({ name: "traceFlow", args: { transferId: FLAGGED_TRANSFER_ID, maxHops: 3, direction: "outbound" } }),
      Object.freeze({ name: "expandAccount", args: { accountId: "mule-06", depth: 2 } }),
      Object.freeze({ name: "expandAccount", args: { accountId: "mule-08", depth: 2 } }),
      Object.freeze({ name: "expandAccount", args: { accountId: "mule-09", depth: 2 } }),
      Object.freeze({ name: "expandAccount", args: { accountId: "mule-12", depth: 2 } }),
      Object.freeze({ name: "scoreRisk", args: { accountIds: RING_ACCOUNT_IDS } }),
      Object.freeze({ name: "detectRing", args: { seedAccountId: "mule-01", minAccounts: 8, timeWindowHours: 24 } }),
      Object.freeze({ name: "dollariseExposure", args: { ringId: RING_ID, currency: "USD" } }),
      Object.freeze({ name: "buildCaseTimeline", args: { caseId: CASE_ID, includePendingExits: true } }),
      Object.freeze({
        name: "freezeAccounts",
        args: {
          caseId: CASE_ID,
          accountIds: RING_ACCOUNT_IDS,
          reason: "Rapid layering, circular flow, and seven pending cash-out attempts",
        },
      }),
      Object.freeze({ name: "fileSARreport", args: { caseId: CASE_ID, format: "markdown", includeReceipts: true } }),
      Object.freeze({ name: "notifyBank", args: { caseId: CASE_ID, reportId: "case-report-RL-2408", destination: "ACME fraud desk" } }),
      Object.freeze({ name: "replayInvestigation", args: { speed: "cinematic" } }),
    ]);

    class GuidedDemo {
      #substrate;
      #eventBus;
      #running = false;
      #controller = null;

      constructor({ substrate, eventBus }) {
        this.#substrate = substrate;
        this.#eventBus = eventBus;
      }

      get running() {
        return this.#running;
      }

      async run({ stepDelay = 280 } = {}) {
        if (this.#running) return { status: "already-running" };
        this.#running = true;
        this.#controller = new AbortController();
        this.#eventBus?.emit("demo:started", { steps: GUIDED_CALLS.length });
        const results = [];

        try {
          for (const [index, call] of GUIDED_CALLS.entries()) {
            this.#eventBus?.emit("demo:step", { ...call, index, steps: GUIDED_CALLS.length });
            const result = await this.#substrate.invoke(call.name, structuredClone(call.args), {
              signal: this.#controller.signal,
            });
            results.push({ name: call.name, result });
            if (index < GUIDED_CALLS.length - 1) await delay(stepDelay, this.#controller.signal);
          }
          const outcome = { status: "completed", steps: results.length, results };
          this.#eventBus?.emit("demo:completed", outcome);
          return outcome;
        } catch (error) {
          const outcome = {
            status: error.name === "AbortError" ? "cancelled" : "stopped",
            steps: results.length,
            error,
            results,
          };
          this.#eventBus?.emit("demo:stopped", outcome);
          throw error;
        } finally {
          this.#running = false;
          this.#controller = null;
        }
      }

      cancel() {
        this.#controller?.abort(new DOMException("Investigation reset.", "AbortError"));
      }
    }

    function delay(milliseconds, signal) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, milliseconds);
        const onAbort = () => {
          clearTimeout(timer);
          reject(signal.reason ?? new DOMException("Cancelled.", "AbortError"));
        };
        if (signal.aborted) onAbort();
        else signal.addEventListener("abort", onAbort, { once: true });
      });
    }
    return Object.freeze({ RING_ACCOUNT_IDS, GUIDED_CALLS, GuidedDemo });
  })();
  __modules["src/ui/controller.js"] = (() => {
    const { parseTransferText } = __modules["src/data/import-transfers.js"];

    const SVG_NS = "http://www.w3.org/2000/svg";
    const CASE_TOOL_NAMES = [
      "traceFlow", "expandAccount", "scoreRisk", "detectRing", "dollariseExposure",
      "buildCaseTimeline", "freezeAccounts", "fileSARreport", "notifyBank", "replayInvestigation",
    ];

    class RinglightUI {
      #store;
      #eventBus;
      #approvalGate;
      #provenance;
      #demo;
      #dataset;
      #seededDataset;
      #substrate;
      #els = {};
      #positions = new Map();
      #accountById = new Map();
      #transferById = new Map();
      #frames = [];
      #completedCalls = 0;
      #completionCounts = new Map();
      #activeNodes = new Set();
      #freezeAnimating = false;
      #frozenVisualIds = new Set();
      #replaying = false;
      #usingCustomData = false;

      constructor({ store, eventBus, approvalGate, provenance, demo, dataset, seededDataset, substrate }) {
        this.#store = store;
        this.#eventBus = eventBus;
        this.#approvalGate = approvalGate;
        this.#provenance = provenance;
        this.#demo = demo;
        this.#dataset = dataset;
        this.#seededDataset = seededDataset;
        this.#substrate = substrate;
        this.#accountById = new Map(dataset.accounts().map((account) => [account.id, account]));
        this.#transferById = new Map(dataset.transfers().map((transfer) => [transfer.id, transfer]));
      }

      bind() {
        this.#cacheElements();
        this.#buildGraph();
        this.#frames = [{ state: this.#store.state, receipt: null }];
        this.#render(this.#store.state);
        this.#wireControls();
        this.#wireEvents();
        this.#syncDatasetCopy();
        this.#store.subscribe((state) => {
          if (!this.#replaying) this.#render(state);
        });
      }

      hostReady({ mode, toolCount }) {
        this.#els.toolCount.textContent = String(toolCount);
        this.#els.hostChip.textContent = mode === "native" ? "native WebMCP" : "local polyfill";
        this.#els.hostChip.classList.toggle("native", mode === "native");
        this.#toast(mode === "native"
          ? "<strong>WebMCP ready.</strong> Your browser can discover all ten tools."
          : "<strong>Local mode ready.</strong> The guided bust uses the same tool handlers.");
      }

      #cacheElements() {
        const one = (selector) => document.querySelector(selector);
        this.#els = {
          run: one("[data-run-demo]"),
          copyPrompt: one("[data-copy-prompt]"),
          judgePrompt: one("[data-judge-prompt]"),
          reset: one("[data-reset-case]"),
          openData: one("[data-open-data]"),
          dataDialog: one("[data-data-dialog]"),
          closeData: one("[data-close-data]"),
          transferFile: one("[data-transfer-file]"),
          dataError: one("[data-data-error]"),
          dataStatus: one("[data-data-status]"),
          helpOpen: one("[data-open-help]"),
          helpDialog: one("[data-help-dialog]"),
          approvalDialog: one("[data-approval-dialog]"),
          approvalTitle: one("[data-approval-title]"),
          approvalDescription: one("[data-approval-description]"),
          approvalScope: one("[data-approval-scope]"),
          approve: one("[data-approve-action]"),
          deny: one("[data-deny-approval]"),
          toolCount: one("[data-tool-count]"),
          hostChip: one("[data-host-chip]"),
          ringCount: one("[data-ring-count]"),
          ringDetail: one("[data-ring-detail]"),
          grossFlow: one("[data-gross-flow]"),
          exposureDetail: one("[data-exposure-detail]"),
          pendingRisk: one("[data-pending-risk]"),
          confidence: one("[data-confidence]"),
          completedSteps: one("[data-completed-steps]"),
          graphEmpty: one("[data-graph-empty]"),
          graphStage: one("[data-graph-stage]"),
          graphNodes: one("[data-graph-nodes]"),
          graphEdges: one("[data-graph-edges]"),
          activeCall: one("[data-active-call]"),
          activeTool: one("[data-active-tool]"),
          activeArgs: one("[data-active-args]"),
          ringVerdict: one("[data-ring-verdict]"),
          activity: one("[data-activity-feed]"),
          provenance: one("[data-provenance-rail]"),
          exportRail: one("[data-export-rail]"),
          scrubber: one("[data-time-scrubber]"),
          scrubLabel: one("[data-scrub-label]"),
          replayTime: one("[data-replay-time]"),
          playReplay: one("[data-play-replay]"),
          timeline: one("[data-case-timeline]"),
          artifacts: one("[data-artifact-list]"),
          artifactCount: one("[data-artifact-count]"),
          resolved: one("[data-resolved-banner]"),
          finalReceipts: one("[data-final-receipts]"),
          resolvedCount: one("[data-resolved-count]"),
          resolvedMoney: one("[data-resolved-money]"),
          caseId: one("[data-case-id]"),
          sourceLabel: one("[data-source-label]"),
          flaggedAmount: one("[data-flagged-amount]"),
          flaggedRoute: one("[data-flagged-route]"),
          pendingCaption: one("[data-pending-caption]"),
          verdictCount: one("[data-verdict-count]"),
          verdictMoney: one("[data-verdict-money]"),
          verdictConfidence: one("[data-verdict-confidence]"),
          toastRegion: one("[data-toast-region]"),
        };
      }

      #wireControls() {
        this.#els.run.addEventListener("click", () => this.#runDemo());
        this.#els.copyPrompt.addEventListener("click", () => this.#copyJudgePrompt());
        this.#els.reset.addEventListener("click", () => this.#reset());
        this.#els.openData.addEventListener("click", () => this.#showDialog(this.#els.dataDialog));
        this.#els.closeData.addEventListener("click", () => this.#closeDialog(this.#els.dataDialog));
        this.#els.transferFile.addEventListener("change", () => this.#loadTransferFile());
        this.#els.helpOpen.addEventListener("click", () => this.#showDialog(this.#els.helpDialog));
        this.#els.approve.addEventListener("click", () => {
          const requestId = this.#els.approvalDialog.dataset.requestId;
          if (requestId) this.#approvalGate.approve(requestId, { actor: "person" });
        });
        this.#els.deny.addEventListener("click", () => {
          const requestId = this.#els.approvalDialog.dataset.requestId;
          if (requestId) this.#approvalGate.deny(requestId);
        });
        this.#els.exportRail.addEventListener("click", () => this.#download(
          `${this.#dataset.caseId}-call-receipts.json`,
          JSON.stringify(this.#provenance.bundle(), null, 2),
          "application/json",
        ));
        this.#els.playReplay.addEventListener("click", async () => {
          if (this.#replaying) return;
          await this.#provenance.replay({ speed: "cinematic", excludeNames: ["replayInvestigation"] });
        });
        this.#els.scrubber.addEventListener("input", () => {
          const index = Number(this.#els.scrubber.value);
          this.#replaying = index < this.#frames.length - 1;
          this.#renderFrame(index);
        });
        this.#els.artifacts.addEventListener("click", (event) => {
          const button = event.target.closest("[data-download-artifact]");
          if (!button) return;
          const artifact = this.#store.artifactById(button.dataset.downloadArtifact);
          if (artifact) this.#download(artifact.name, artifact.content, artifact.mimeType);
        });
        document.addEventListener("keydown", (event) => {
          if (event.key.toLowerCase() === "r" && !event.metaKey && !event.ctrlKey && !isTyping(event.target)) {
            event.preventDefault();
            this.#runDemo();
          }
        });
      }

      #wireEvents() {
        this.#eventBus.on("tool:started", ({ detail: { callId, name, args } }) => {
          this.#els.activeCall.hidden = false;
          this.#els.activeTool.textContent = name;
          this.#els.activeArgs.textContent = compactJson(args, 92);
          this.#setToolStep(name, "active");
          this.#appendActivity({ callId, name, args, status: "running" });
        });
        this.#eventBus.on("tool:completed", ({ detail: { callId, name, result } }) => {
          this.#completedCalls += 1;
          this.#completionCounts.set(name, (this.#completionCounts.get(name) ?? 0) + 1);
          this.#els.completedSteps.textContent = String(this.#completedCalls);
          this.#completeActivity(callId, result, "complete");
          this.#setToolStep(name, name === "expandAccount" && this.#completionCounts.get(name) < 4 ? "ready" : "done");
          this.#els.activeCall.hidden = true;
        });
        this.#eventBus.on("tool:failed", ({ detail: { callId, name, error } }) => {
          this.#completeActivity(callId, { message: error.message }, "failed");
          this.#setToolStep(name, "ready");
          this.#els.activeCall.hidden = true;
        });
        this.#eventBus.on("graph:trace", ({ detail }) => this.#animateTouched(detail.accountIds));
        this.#eventBus.on("graph:expand", ({ detail }) => this.#animateTouched(detail.accountIds));
        this.#eventBus.on("graph:risk", ({ detail: { scores } }) => this.#animateTouched(scores.map((score) => score.accountId)));
        this.#eventBus.on("graph:ring", () => {
          this.#els.ringVerdict.hidden = false;
          const ring = this.#store.state.ring;
          this.#els.verdictCount.textContent = String(ring?.size ?? 0);
          this.#els.verdictConfidence.textContent = `${Math.round((ring?.confidence ?? 0) * 100)}% link confidence`;
          this.#toast(`<strong>Linked network found.</strong> ${ring?.size ?? 0} accounts pass money around a closed loop.`);
        });
        this.#eventBus.on("approval:requested", ({ detail }) => this.#showApproval(detail));
        this.#eventBus.on("approval:granted", ({ detail: request }) => {
          if (request.toolName === "freezeAccounts") {
            this.#freezeAnimating = true;
            this.#frozenVisualIds.clear();
          }
          this.#closeDialog(this.#els.approvalDialog);
          this.#setToolStep(request.toolName, "active");
          this.#toast(`<strong>Approved once.</strong> ${escapeHtml(request.title)}`);
        });
        this.#eventBus.on("approval:denied", ({ detail: request }) => {
          this.#closeDialog(this.#els.approvalDialog);
          this.#toast(`<strong>Action held.</strong> ${escapeHtml(request.title)}`);
        });
        this.#eventBus.on("case:frozen", ({ detail }) => this.#animateFreeze(detail.accountIds));
        this.#eventBus.on("provenance:recorded", ({ detail: entry }) => {
          this.#frames.push({ state: this.#store.state, receipt: entry });
          this.#renderReceipts(this.#provenance.snapshot());
          this.#configureScrubber(this.#frames.length - 1);
        });
        this.#eventBus.on("provenance:cleared", () => {
          this.#frames = [{ state: this.#store.state, receipt: null }];
          this.#renderReceipts([]);
          this.#configureScrubber(0);
        });
        this.#eventBus.on("provenance:replay-started", () => {
          this.#replaying = true;
          this.#els.scrubLabel.textContent = "REPLAYING";
          this.#els.playReplay.textContent = "■";
        });
        this.#eventBus.on("provenance:replay-entry", ({ detail: { index } }) => {
          this.#renderFrame(Math.min(index + 1, this.#frames.length - 1));
        });
        this.#eventBus.on("provenance:replay-completed", () => {
          this.#renderFrame(this.#frames.length - 1);
          this.#replaying = false;
          this.#els.scrubLabel.textContent = "LIVE";
          this.#els.playReplay.textContent = "▶";
        });
      }

      async #runDemo() {
        if (this.#demo.running) return;
        if (this.#usingCustomData) this.#activateDataset(this.#seededDataset, { custom: false, announce: false });
        if (this.#provenance.snapshot().length > 0) this.#reset();
        this.#els.run.disabled = true;
        this.#els.run.innerHTML = '<span class="button-core" aria-hidden="true"></span> Tracing money now <kbd>R</kbd>';
        try {
          await this.#demo.run();
        } catch (error) {
          if (error.name !== "AbortError" && error.code !== "HUMAN_APPROVAL_REQUIRED") {
            this.#toast(`<strong>Investigation stopped.</strong> ${escapeHtml(error.message)}`);
          }
        } finally {
          this.#els.run.disabled = false;
          this.#setRunLabel();
        }
      }

      #reset() {
        this.#demo.cancel();
        this.#approvalGate.denyAll();
        this.#closeDialog(this.#els.approvalDialog);
        this.#store.reset();
        this.#provenance.clear({
          start: this.#dataset.anchorTime,
          caseId: this.#dataset.caseId,
          source: this.#dataset.source,
        });
        this.#completedCalls = 0;
        this.#completionCounts.clear();
        this.#activeNodes.clear();
        this.#frozenVisualIds.clear();
        this.#freezeAnimating = false;
        this.#replaying = false;
        this.#els.completedSteps.textContent = "0";
        this.#els.ringVerdict.hidden = true;
        this.#els.activeCall.hidden = true;
        this.#primeActivity();
        for (const name of CASE_TOOL_NAMES) this.#setToolStep(name, name === "traceFlow" ? "ready" : "queued");
        this.#render(this.#store.state);
        this.#syncDatasetCopy();
      }

      async #loadTransferFile() {
        const file = this.#els.transferFile.files?.[0];
        if (!file) return;
        this.#els.dataError.hidden = true;
        this.#els.dataStatus.textContent = "Reading the file locally...";
        try {
          const imported = parseTransferText(await file.text(), { filename: file.name });
          this.#activateDataset(imported, { custom: true, announce: true });
          this.#els.dataStatus.textContent = `${imported.transfers().length} transfers loaded. The same ten page tools now read this local file.`;
          setTimeout(() => this.#closeDialog(this.#els.dataDialog), 550);
        } catch (error) {
          this.#els.dataError.textContent = error.message;
          this.#els.dataError.hidden = false;
          this.#els.dataStatus.textContent = "Nothing was loaded.";
          this.#els.transferFile.value = "";
        }
      }

      #activateDataset(nextDataset, { custom, announce }) {
        this.#demo.cancel();
        this.#approvalGate.denyAll();
        this.#closeDialog(this.#els.approvalDialog);
        this.#dataset.replace(nextDataset);
        this.#usingCustomData = custom;
        this.#store.reset();
        this.#provenance.clear({
          start: this.#dataset.anchorTime,
          caseId: this.#dataset.caseId,
          source: this.#dataset.source,
        });
        this.#completedCalls = 0;
        this.#completionCounts.clear();
        this.#activeNodes.clear();
        this.#frozenVisualIds.clear();
        this.#freezeAnimating = false;
        this.#replaying = false;
        this.#els.completedSteps.textContent = "0";
        this.#els.ringVerdict.hidden = true;
        this.#els.activeCall.hidden = true;
        this.#els.graphNodes.innerHTML = "";
        this.#els.graphEdges.innerHTML = "";
        this.#accountById = new Map(this.#dataset.accounts().map((account) => [account.id, account]));
        this.#transferById = new Map(this.#dataset.transfers().map((transfer) => [transfer.id, transfer]));
        this.#buildGraph();
        this.#frames = [{ state: this.#store.state, receipt: null }];
        this.#primeActivity();
        for (const name of CASE_TOOL_NAMES) this.#setToolStep(name, name === "traceFlow" ? "ready" : "queued");
        this.#syncDatasetCopy();
        this.#render(this.#store.state);
        if (announce) {
          this.#toast(`<strong>Local transfers ready.</strong> ${this.#dataset.transfers().length} records now power the same ten page tools.`);
        }
      }

      #primeActivity() {
        const first = this.#dataset.transfers().find((transfer) => transfer.id === this.#dataset.flaggedTransferId)
          ?? this.#dataset.transfers()[0];
        this.#els.activity.innerHTML = `
          <div class="activity-item primed">
            <i>✓</i>
            <div>
              <strong>Case ready <code>${escapeHtml(this.#dataset.caseId)}</code></strong>
              <p>${escapeHtml(first ? `${moneyCompact(first.amount)} from ${first.from} is ready to trace.` : "The local case is ready to trace.")}</p>
              <code>${escapeHtml(this.#dataset.source)} · no network request</code>
            </div>
          </div>`;
      }

      #syncDatasetCopy() {
        const transfers = this.#dataset.transfers();
        const first = transfers.find((transfer) => transfer.id === this.#dataset.flaggedTransferId) ?? transfers[0];
        const prompt = first
          ? `Trace the suspicious transfer ${first.id} from account ${first.from}. Follow the money, show the linked accounts on the map, explain the total at risk, and pause before freezing anything.`
          : "Trace the suspicious transfer, show the linked accounts on the map, explain the total at risk, and pause before freezing anything.";
        this.#els.judgePrompt.textContent = prompt;
        this.#els.caseId.textContent = this.#dataset.caseId;
        this.#els.sourceLabel.textContent = this.#usingCustomData ? "LOCAL FILE" : "SEEDED EXERCISE";
        this.#els.flaggedAmount.textContent = moneyCompact(first?.amount ?? 0);
        this.#els.flaggedRoute.textContent = first ? `${first.from} → ${first.to}` : "No transfer";
        this.#setRunLabel();
      }

      #setRunLabel() {
        this.#els.run.innerHTML = this.#usingCustomData
          ? '<span class="button-core" aria-hidden="true"></span> Replay seeded investigation <kbd>R</kbd>'
          : '<span class="button-core" aria-hidden="true"></span> Run full investigation <kbd>R</kbd>';
      }

      async #copyJudgePrompt() {
        const prompt = this.#els.judgePrompt.textContent.trim();
        try {
          await navigator.clipboard.writeText(prompt);
          this.#toast("<strong>Prompt copied.</strong> Paste it into ChatGPT while this page is open.");
        } catch {
          const selection = getSelection();
          const range = document.createRange();
          range.selectNodeContents(this.#els.judgePrompt);
          selection.removeAllRanges();
          selection.addRange(range);
          this.#toast("<strong>Prompt selected.</strong> Copy it, then paste it into ChatGPT.");
        }
      }

      #render(state) {
        this.#renderMetrics(state);
        this.#renderGraph(state);
        this.#renderTimeline(state.timeline);
        this.#renderArtifacts(state.artifacts);
        const resolved = state.frozen && state.caseFiled;
        this.#els.resolved.hidden = !resolved;
        this.#els.finalReceipts.textContent = `${this.#provenance.snapshot().length} RECEIPTS`;
        if (state.ring) this.#els.resolvedCount.textContent = String(state.ring.size);
        if (state.exposure) this.#els.resolvedMoney.textContent = moneyCompact(state.exposure.pendingAtRisk);
        document.body.dataset.caseState = state.frozen ? "frozen" : "live";
      }

      #renderMetrics(state) {
        if (state.ring) {
          this.#els.ringCount.textContent = String(state.ring.size);
          this.#els.ringDetail.textContent = `${state.ring.internalTransferCount} internal transfers`;
          this.#els.confidence.textContent = `${Math.round(state.ring.confidence * 100)}%`;
        } else {
          this.#els.ringCount.textContent = String(state.visibleAccountIds.length);
          this.#els.ringDetail.textContent = "starting accounts visible";
          this.#els.confidence.textContent = "READY";
        }
        if (state.exposure) {
          this.#els.grossFlow.textContent = moneyCompact(state.exposure.grossSuspiciousFlow);
          this.#els.exposureDetail.textContent = `${state.exposure.layeringMultiple}× entry principal`;
          this.#els.pendingRisk.textContent = moneyCompact(state.exposure.pendingAtRisk);
        } else {
          const first = this.#dataset.transfers().find((transfer) => transfer.id === this.#dataset.flaggedTransferId)
            ?? this.#dataset.transfers()[0];
          const pending = this.#dataset.transfers().filter((transfer) => transfer.status === "pending");
          const pendingValue = pending.reduce((total, transfer) => total + transfer.amount, 0);
          this.#els.grossFlow.textContent = moneyCompact(first?.amount ?? 0);
          this.#els.exposureDetail.textContent = "flagged amount loaded";
          this.#els.pendingRisk.textContent = moneyCompact(pendingValue);
          this.#els.pendingCaption.textContent = pending.length ? `${pending.length} outgoing transfers can still be stopped` : "none marked pending";
        }
      }

      #buildGraph() {
        const transfers = this.#dataset.transfers().filter((transfer) => !transfer.id.startsWith("tx-bg-"));
        const graphIds = new Set(transfers.flatMap((transfer) => [transfer.from, transfer.to]));
        const accounts = this.#dataset.accounts().filter((account) => graphIds.has(account.id));
        this.#positions = forceLayout(accounts, transfers);
        const originId = transfers[0]?.from;
        const outgoingIds = new Set(transfers.map((transfer) => transfer.from));
        const exitIds = new Set(accounts.filter((account) => !outgoingIds.has(account.id)).map((account) => account.id));

        for (const [index, transfer] of transfers.entries()) {
          const path = document.createElementNS(SVG_NS, "path");
          const from = this.#positions.get(transfer.from);
          const to = this.#positions.get(transfer.to);
          path.setAttribute("d", curvedPath(from, to, transfer.id));
          path.setAttribute("class", "graph-edge");
          path.dataset.transferId = transfer.id;
          path.dataset.from = transfer.from;
          path.dataset.to = transfer.to;
          if (transfer.status === "pending") path.classList.add("is-exit");
          path.style.setProperty("--reveal-order", String(index));
          this.#els.graphEdges.append(path);
        }

        for (const [index, account] of accounts.entries()) {
          const position = this.#positions.get(account.id);
          const group = document.createElementNS(SVG_NS, "g");
          group.setAttribute("transform", `translate(${round(position.x)}, ${round(position.y)})`);
          group.setAttribute("class", "graph-node");
          group.dataset.accountId = account.id;
          if (account.id === originId) group.classList.add("is-origin");
          if (exitIds.has(account.id)) group.classList.add("is-exit");
          group.style.setProperty("--reveal-order", String(index));

          const halo = svg("circle", { class: "node-halo", r: "26" });
          const core = svg("circle", { class: "node-core", r: account.id === originId ? "21" : "18" });
          const pip = svg("circle", { class: "node-pip", cx: "13", cy: "-13", r: "2.5" });
          const code = svg("text", { class: "node-code", x: "0", y: "1" });
          code.textContent = account.shortLabel;
          const label = svg("text", { class: "node-label", x: "0", y: "34" });
          label.textContent = account.label.toUpperCase();
          group.append(halo, core, pip, code, label);
          this.#els.graphNodes.append(group);
        }
      }

      #renderGraph(state) {
        const visibleAccounts = new Set(state.visibleAccountIds);
        const visibleTransfers = new Set(state.visibleTransferIds);
        const ringAccounts = new Set(state.ring?.accountIds ?? []);
        const ringTransfers = new Set(state.ring?.transferIds ?? []);
        const frozenAccounts = this.#freezeAnimating ? this.#frozenVisualIds : new Set(state.frozenAccountIds);
        this.#els.graphEmpty.classList.toggle("is-hidden", visibleAccounts.size > 2 || state.phase !== "flagged");

        for (const node of this.#els.graphNodes.querySelectorAll(".graph-node")) {
          const id = node.dataset.accountId;
          node.classList.toggle("is-visible", visibleAccounts.has(id));
          node.classList.toggle("is-risk", Boolean(state.riskScores[id]) || ringAccounts.has(id));
          node.classList.toggle("is-ring", ringAccounts.has(id));
          node.classList.toggle("is-active", this.#activeNodes.has(id));
          node.classList.toggle("is-frozen", frozenAccounts.has(id));
        }
        for (const edge of this.#els.graphEdges.querySelectorAll(".graph-edge")) {
          const id = edge.dataset.transferId;
          const visible = visibleTransfers.has(id);
          const frozen = frozenAccounts.has(edge.dataset.from) || frozenAccounts.has(edge.dataset.to);
          edge.classList.toggle("is-visible", visible);
          edge.classList.toggle("is-hot", visible && !id.startsWith("tx-bg-"));
          edge.classList.toggle("is-ring", ringTransfers.has(id));
          edge.classList.toggle("is-frozen", frozen);
        }
      }

      #animateTouched(accountIds) {
        this.#activeNodes = new Set(accountIds);
        this.#renderGraph(this.#store.state);
        setTimeout(() => {
          this.#activeNodes.clear();
          if (!this.#replaying) this.#renderGraph(this.#store.state);
        }, 720);
      }

      #animateFreeze(accountIds) {
        const ordered = [...accountIds].sort();
        this.#els.graphStage.classList.add("is-freezing");
        ordered.forEach((id, index) => {
          setTimeout(() => {
            this.#frozenVisualIds.add(id);
            this.#renderGraph(this.#store.state);
            if (index === ordered.length - 1) {
              this.#freezeAnimating = false;
              this.#els.graphStage.classList.remove("is-freezing");
              this.#els.graphStage.classList.add("freeze-complete");
              setTimeout(() => this.#els.graphStage.classList.remove("freeze-complete"), 900);
              document.body.dataset.caseState = "frozen";
              this.#toast(`<strong>Money stopped.</strong> ${ordered.length} linked accounts are frozen in this simulation.`);
            }
          }, index * 74);
        });
      }

      #appendActivity({ callId, name, args, status }) {
        if (this.#els.activity.querySelector(".empty-state")) this.#els.activity.innerHTML = "";
        const item = document.createElement("div");
        item.className = `activity-item ${status}`;
        item.dataset.callId = callId;
        item.innerHTML = `
          <i>⌁</i>
          <div>
            <strong>${escapeHtml(humanToolName(name))} <code>${escapeHtml(name)}</code></strong>
            <p>Checking the request, then reading the same case shown on this page.</p>
            <code>${escapeHtml(compactJson(args, 130))}</code>
          </div>
        `;
        this.#els.activity.prepend(item);
      }

      #completeActivity(callId, result, status) {
        const item = this.#els.activity.querySelector(`[data-call-id="${callId}"]`);
        if (!item) return;
        item.className = `activity-item ${status}`;
        item.querySelector("i").textContent = status === "complete" ? "✓" : "!";
        item.querySelector("p").textContent = summarizeResult(result);
      }

      #renderReceipts(receipts) {
        if (receipts.length === 0) {
          this.#els.provenance.innerHTML = '<div class="rail-line" aria-hidden="true"></div><div class="empty-state small"><strong>No receipts yet</strong><p>Name, args, result digest, time, and approval land here.</p></div>';
          this.#els.exportRail.disabled = true;
          return;
        }
        this.#els.exportRail.disabled = false;
        this.#els.provenance.innerHTML = '<div class="rail-line" aria-hidden="true"></div>';
        for (const [index, receipt] of receipts.entries()) {
          const card = document.createElement("article");
          card.className = `receipt${receipt.humanApproved ? " is-approved" : ""}`;
          card.dataset.receiptIndex = String(index + 1);
          card.innerHTML = `
            <div class="receipt-head"><strong>${escapeHtml(receipt.name)}</strong><time>${receipt.timestamp.slice(11, 19)}</time></div>
            <code>args ${escapeHtml(receipt.argsDigest)} · result ${escapeHtml(receipt.resultDigest)}</code>
            <div class="receipt-meta"><span>${escapeHtml(receipt.id)}</span><b>${receipt.humanApproved ? "PERSON APPROVED" : receipt.status.toUpperCase()}</b></div>
          `;
          this.#els.provenance.append(card);
        }
        this.#els.provenance.scrollTop = this.#els.provenance.scrollHeight;
      }

      #renderTimeline(items) {
        if (!items.length) {
          this.#els.timeline.innerHTML = '<div class="timeline-zero"><i></i><span><b>READY</b><small>transfer loaded</small></span></div><p>Trace evidence will assemble here in event time.</p>';
          return;
        }
        this.#els.timeline.innerHTML = "";
        for (const item of items) {
          const event = document.createElement("div");
          event.className = `timeline-event ${item.type}`;
          event.innerHTML = `<i></i><span><b>${escapeHtml(item.time)}</b><small>${escapeHtml(item.title)}</small></span>`;
          event.title = item.detail;
          this.#els.timeline.append(event);
        }
      }

      #renderArtifacts(artifacts) {
        this.#els.artifactCount.textContent = `${artifacts.length} ${artifacts.length === 1 ? "FILE" : "FILES"}`;
        if (!artifacts.length) {
          this.#els.artifacts.innerHTML = '<div class="empty-state horizontal"><span>□</span><p><strong>No files yet</strong>Money map, freeze receipt, case report, and handoff will appear here.</p></div>';
          return;
        }
        this.#els.artifacts.innerHTML = "";
        for (const artifact of artifacts) {
          const card = document.createElement("article");
          card.className = "artifact-card";
          card.innerHTML = `
            <span class="artifact-icon">${escapeHtml(artifact.kind.slice(0, 3))}</span>
            <div><strong>${escapeHtml(artifact.name)}</strong><small>${escapeHtml(artifact.description)}</small></div>
            <button type="button" data-download-artifact="${escapeHtml(artifact.id)}">SAVE</button>
          `;
          this.#els.artifacts.append(card);
        }
      }

      #showApproval(request) {
        this.#els.approvalDialog.dataset.requestId = request.requestId;
        this.#els.approvalTitle.textContent = request.title;
        this.#els.approvalDescription.textContent = request.description;
        this.#els.approvalScope.innerHTML = "";
        for (const [key, value] of Object.entries(request.scope ?? {})) {
          const row = document.createElement("div");
          row.innerHTML = `<dt>${escapeHtml(humanize(key))}</dt><dd>${escapeHtml(String(value))}</dd>`;
          this.#els.approvalScope.append(row);
        }
        this.#setToolStep(request.toolName, "waiting");
        this.#showDialog(this.#els.approvalDialog);
      }

      #setToolStep(name, state) {
        const item = document.querySelector(`[data-tool-step="${name}"]`);
        if (!item) return;
        item.classList.remove("active", "done", "waiting");
        if (state === "active") item.classList.add("active");
        if (state === "done") item.classList.add("done");
        if (state === "waiting") item.classList.add("waiting");
        const status = item.querySelector("em");
        if (status) status.textContent = state === "done" ? "complete" : state === "active" ? "calling" : state === "waiting" ? "approve" : state;
      }

      #configureScrubber(index) {
        const max = Math.max(0, this.#frames.length - 1);
        this.#els.scrubber.max = String(max);
        this.#els.scrubber.value = String(index);
        this.#els.scrubber.disabled = max === 0;
        this.#els.playReplay.disabled = max === 0;
        this.#setScrubProgress(index, max);
      }

      #renderFrame(index) {
        const bounded = Math.max(0, Math.min(index, this.#frames.length - 1));
        const frame = this.#frames[bounded];
        this.#render(frame.state);
        this.#els.scrubber.value = String(bounded);
        this.#setScrubProgress(bounded, this.#frames.length - 1);
        this.#els.scrubLabel.textContent = bounded === this.#frames.length - 1 ? (this.#replaying ? "REPLAYING" : "LIVE") : `STEP ${bounded}`;
        this.#els.replayTime.textContent = frame.receipt?.timestamp.slice(11, 19) ?? "19:42:00";
        for (const receipt of this.#els.provenance.querySelectorAll(".receipt")) {
          const receiptIndex = Number(receipt.dataset.receiptIndex);
          receipt.classList.toggle("is-replaying", receiptIndex === bounded);
          receipt.classList.toggle("is-future", receiptIndex > bounded);
        }
      }

      #setScrubProgress(index, max) {
        const progress = max > 0 ? (index / max) * 100 : 0;
        this.#els.scrubber.style.setProperty("--scrub-progress", `${progress}%`);
      }

      #showDialog(dialog) {
        if (typeof dialog.showModal === "function") {
          if (!dialog.open) dialog.showModal();
        } else {
          dialog.setAttribute("open", "");
        }
      }

      #closeDialog(dialog) {
        if (typeof dialog.close === "function" && dialog.open) dialog.close();
        else dialog.removeAttribute("open");
      }

      #download(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }

      #toast(html) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = html;
        this.#els.toastRegion.append(toast);
        setTimeout(() => toast.remove(), 3_600);
      }
    }

    function forceLayout(accounts, transfers, { width = 1000, height = 590, iterations = 180 } = {}) {
      const originId = transfers[0]?.from;
      const outgoingIds = new Set(transfers.map((transfer) => transfer.from));
      const exitIds = accounts.filter((account) => !outgoingIds.has(account.id)).map((account) => account.id);
      let freeIndex = 0;
      const nodes = accounts.map((account, index) => {
        if (account.id === originId) return { id: account.id, x: 105, y: height / 2, vx: 0, vy: 0, anchor: "origin" };
        if (exitIds.includes(account.id)) {
          const exitIndex = exitIds.indexOf(account.id);
          const gap = height / (exitIds.length + 1);
          return { id: account.id, x: 895, y: gap * (exitIndex + 1), vx: 0, vy: 0, anchor: "exit" };
        }
        const ringIndex = freeIndex++;
        const freeCount = Math.max(1, accounts.length - exitIds.length - (originId ? 1 : 0));
        const angle = (ringIndex / freeCount) * Math.PI * 2 - Math.PI;
        const signature = hashString(account.id);
        const radiusX = 225 + (signature % 41);
        const radiusY = 178 + ((signature >>> 8) % 35);
        const targetX = 505 + Math.cos(angle) * radiusX;
        const targetY = height / 2 + Math.sin(angle) * radiusY;
        return {
          id: account.id,
          x: targetX,
          y: targetY,
          vx: 0,
          vy: 0,
          anchor: null,
          targetX,
          targetY,
          index,
        };
      });
      const byId = new Map(nodes.map((node) => [node.id, node]));
      const links = transfers.map((transfer) => ({ source: byId.get(transfer.from), target: byId.get(transfer.to) })).filter((link) => link.source && link.target);

      for (let tick = 0; tick < iterations; tick += 1) {
        for (let left = 0; left < nodes.length; left += 1) {
          for (let right = left + 1; right < nodes.length; right += 1) {
            const a = nodes[left];
            const b = nodes[right];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            const distanceSquared = Math.max(90, dx * dx + dy * dy);
            const distance = Math.sqrt(distanceSquared);
            dx /= distance;
            dy /= distance;
            const force = 760 / distanceSquared;
            if (!a.anchor) { a.vx -= dx * force; a.vy -= dy * force; }
            if (!b.anchor) { b.vx += dx * force; b.vy += dy * force; }
          }
        }
        for (const link of links) {
          const dx = link.target.x - link.source.x;
          const dy = link.target.y - link.source.y;
          const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const desired = link.source.anchor || link.target.anchor ? 150 : 112;
          const force = (distance - desired) * .006;
          const forceX = (dx / distance) * force;
          const forceY = (dy / distance) * force;
          if (!link.source.anchor) { link.source.vx += forceX; link.source.vy += forceY; }
          if (!link.target.anchor) { link.target.vx -= forceX; link.target.vy -= forceY; }
        }
        for (const node of nodes) {
          if (node.anchor) continue;
          node.vx += (node.targetX - node.x) * .0032;
          node.vy += (node.targetY - node.y) * .0032;
          node.vx *= .88;
          node.vy *= .88;
          node.x = clamp(node.x + node.vx, 175, 815);
          node.y = clamp(node.y + node.vy, 55, height - 55);
        }
      }
      return new Map(nodes.map((node) => [node.id, { x: node.x, y: node.y }]));
    }

    function curvedPath(from, to, id) {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const bend = ((hashString(id) % 19) - 9) * .75;
      const cx = (from.x + to.x) / 2 - (dy / length) * bend;
      const cy = (from.y + to.y) / 2 + (dx / length) * bend;
      return `M ${round(from.x)} ${round(from.y)} Q ${round(cx)} ${round(cy)} ${round(to.x)} ${round(to.y)}`;
    }

    function hashString(value) {
      let hash = 2166136261;
      for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619) >>> 0;
      }
      return hash;
    }

    function svg(name, attributes) {
      const element = document.createElementNS(SVG_NS, name);
      for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
      return element;
    }

    function round(value) {
      return Math.round(value * 10) / 10;
    }

    function clamp(value, minimum, maximum) {
      return Math.max(minimum, Math.min(maximum, value));
    }

    function compactJson(value, length) {
      const text = JSON.stringify(value);
      return text.length > length ? `${text.slice(0, length - 1)}…` : text;
    }

    function summarizeResult(result) {
      if (result?.ringId && result?.size) return `${result.size} linked accounts surfaced with ${Math.round(result.confidence * 100)}% confidence.`;
      if (result?.grossSuspiciousFlow) return `${moneyCompact(result.grossSuspiciousFlow)} gross flow, ${moneyCompact(result.pendingAtRisk)} pending.`;
      if (result?.accountCount && result?.status === "frozen") return `${result.accountCount} accounts frozen after human approval.`;
      if (result?.scores) return `${result.scores.length} accounts scored from z-score and network behavior.`;
      if (result?.accounts) return `${result.accounts.length} accounts and ${result.transfers.length} transfers returned.`;
      if (result?.items) return `${result.items.length} timestamped case events assembled.`;
      if (result?.reportId) return `${result.reportId} created locally with ${result.receiptCount ?? 0} receipts.`;
      if (result?.replayed !== undefined) return `${result.replayed} receipts replayed with no side effects.`;
      return result?.status ? `Result: ${result.status}.` : "Tool completed.";
    }

    function humanToolName(name) {
      return ({
        traceFlow: "Follow the money",
        expandAccount: "Open linked accounts",
        scoreRisk: "Score unusual behavior",
        detectRing: "Find the closed loop",
        dollariseExposure: "Calculate money at risk",
        buildCaseTimeline: "Build the timeline",
        freezeAccounts: "Freeze linked accounts",
        fileSARreport: "Draft the case report",
        notifyBank: "Prepare the handoff",
        replayInvestigation: "Replay every step",
      })[name] ?? humanize(name);
    }

    function moneyCompact(value) {
      return Number(value).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
      });
    }

    function humanize(value) {
      return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (character) => character.toUpperCase());
    }

    function escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function isTyping(element) {
      return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element?.isContentEditable;
    }
    return Object.freeze({ RinglightUI, forceLayout });
  })();
  __modules["src/main.js"] = (() => {
    const { createFraudDataset, CASE_ID } = __modules["src/data/fraud-ring.js"];
    const { createMutableDataset } = __modules["src/data/import-transfers.js"];
    const { RinglightStore } = __modules["src/app/store.js"];
    const { createRinglightTools } = __modules["src/app/tools.js"];
    const { GuidedDemo } = __modules["src/sim/guided-demo.js"];
    const { EventBus } = __modules["src/webmcp/event-bus.js"];
    const { HumanApprovalGate } = __modules["src/webmcp/human-gate.js"];
    const { DeterministicClock, ProvenanceRail } = __modules["src/webmcp/provenance.js"];
    const { WebMCPSubstrate } = __modules["src/webmcp/substrate.js"];
    const { RinglightUI } = __modules["src/ui/controller.js"];

    async function boot({ documentRef = document } = {}) {
      const eventBus = new EventBus();
      const seededDataset = createFraudDataset();
      const dataset = createMutableDataset(seededDataset);
      const store = new RinglightStore(dataset);
      const provenance = new ProvenanceRail({
        eventBus,
        caseId: CASE_ID,
        source: dataset.source,
        clock: new DeterministicClock({ start: dataset.anchorTime, stepMs: 11_000 }),
      });
      const approvalGate = new HumanApprovalGate({ eventBus });
      const substrate = new WebMCPSubstrate({
        documentRef,
        eventBus,
        provenance,
        approvalGate,
      });
      const tools = createRinglightTools({ dataset, store, provenance, eventBus });
      const demo = new GuidedDemo({ substrate, eventBus });
      const ui = new RinglightUI({
        store,
        eventBus,
        approvalGate,
        provenance,
        demo,
        dataset,
        seededDataset,
        substrate,
      });

      ui.bind();
      await substrate.registerAll(tools);
      ui.hostReady({ mode: substrate.mode, toolCount: substrate.size });

      const publicApi = Object.freeze({
        mode: substrate.mode,
        listTools: () => substrate.list(),
        invoke: (name, args) => substrate.invoke(name, args),
        snapshot: () => store.state,
        receipts: () => provenance.snapshot(),
        runDemo: () => demo.run(),
      });
      globalThis.ringlight = publicApi;
      return publicApi;
    }

    if (typeof document !== "undefined") {
      boot().catch((error) => {
        const region = document.querySelector("[data-toast-region]");
        if (region) {
          const toast = document.createElement("div");
          toast.className = "toast";
          toast.textContent = `Ringlight could not start: ${error.message}`;
          region.append(toast);
        }
        throw error;
      });
    }
    return Object.freeze({ boot });
  })();
})();
