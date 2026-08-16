export const CASE_ID = "RL-2408";
export const ANCHOR_DATE = "2026-08-24";
export const ANCHOR_TIME = "2026-08-24T19:42:00.000Z";
export const FLAGGED_TRANSFER_ID = "tx-flag-001";
export const RING_ID = "ring-ember-14";

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

export const ACCOUNTS = Object.freeze([
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

export const TRANSFERS = Object.freeze([
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

export const HISTORICAL_CASE_GROSS = Object.freeze([
  420_000, 610_000, 370_000, 790_000, 560_000, 680_000, 450_000,
  520_000, 880_000, 640_000, 590_000, 730_000, 470_000, 810_000,
]);

export function createFraudDataset() {
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
