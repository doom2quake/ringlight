const REQUIRED_COLUMNS = Object.freeze(["from", "to", "amount", "timestamp"]);

export function parseTransferText(text, { filename = "transfers.json" } = {}) {
  if (typeof text !== "string" || text.trim().length === 0) {
    throw new TypeError("Choose a non-empty CSV or JSON file.");
  }
  const rows = filename.toLowerCase().endsWith(".json") || /^[\s]*[\[{]/.test(text)
    ? parseJson(text)
    : parseCsv(text);
  return createImportedDataset(rows);
}

export function createImportedDataset(rows) {
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

export function createMutableDataset(initialDataset) {
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
