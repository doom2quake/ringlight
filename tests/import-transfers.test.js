import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { traceFlowMath } from "../src/analysis/math.js";
import { createFraudDataset } from "../src/data/fraud-ring.js";
import { createMutableDataset, parseTransferText } from "../src/data/import-transfers.js";

const csv = [
  "id,from,to,amount,timestamp,status,fromLabel,toLabel",
  "custom-1,ACME-004,bridge-1,12500,2026-08-27T10:00:00Z,settled,ACME 004,Bridge One",
  "custom-2,bridge-1,bridge-2,11900,2026-08-27T10:01:00Z,pending,Bridge One,Bridge Two",
].join("\n");
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("CSV transfers load into a deterministic local dataset", () => {
  const first = parseTransferText(csv, { filename: "transfers.csv" });
  const second = parseTransferText(csv, { filename: "transfers.csv" });

  assert.equal(first.caseId, second.caseId);
  assert.equal(first.flaggedTransferId, "custom-1");
  assert.equal(first.source, "local CSV/JSON file");
  assert.equal(first.transfers().length, 2);
  assert.equal(first.accounts().length, 3);
  assert.equal(first.accounts().find((account) => account.id === "ACME-004").label, "ACME 004");
});

test("JSON transfer objects use the same analysis math", () => {
  const dataset = parseTransferText(JSON.stringify({
    transfers: [
      { id: "j-1", from: "origin", to: "mid", amount: 500, timestamp: "2026-08-27T12:00:00Z" },
      { id: "j-2", from: "mid", to: "exit", amount: 450, timestamp: "2026-08-27T12:01:00Z", status: "pending" },
    ],
  }), { filename: "transfers.json" });

  const result = traceFlowMath(dataset, { transferId: "j-1", maxHops: 3, direction: "outbound" });
  assert.deepEqual(result.accountIds, ["exit", "mid", "origin"]);
  assert.deepEqual(result.transferIds, ["j-1", "j-2"]);
});

test("local transfer validation rejects missing fields, bad amounts, and duplicate ids", () => {
  assert.throws(() => parseTransferText("from,to,amount,timestamp\na,b,,2026-08-27T10:00:00Z", { filename: "bad.csv" }), /missing amount/);
  assert.throws(() => parseTransferText(JSON.stringify([
    { id: "same", from: "a", to: "b", amount: -1, timestamp: "2026-08-27T10:00:00Z" },
  ]), { filename: "bad.json" }), /invalid amount/);
  assert.throws(() => parseTransferText(JSON.stringify([
    { id: "same", from: "a", to: "b", amount: 1, timestamp: "2026-08-27T10:00:00Z" },
    { id: "same", from: "b", to: "c", amount: 1, timestamp: "2026-08-27T10:01:00Z" },
  ]), { filename: "bad.json" }), /more than once/);
});

test("the mutable dataset facade switches existing tool readers without re-registration", () => {
  const seeded = createFraudDataset();
  const mutable = createMutableDataset(seeded);
  const imported = parseTransferText(csv, { filename: "transfers.csv" });

  assert.equal(mutable.caseId, "RL-2408");
  mutable.replace(imported);
  assert.equal(mutable.caseId, imported.caseId);
  assert.equal(mutable.flaggedTransferId, "custom-1");
  assert.equal(mutable.transfers().length, 2);
});

test("both shipped synthetic sample files parse without setup", async () => {
  const csvText = await readFile(path.join(projectRoot, "samples/payments-loop.csv"), "utf8");
  const jsonText = await readFile(path.join(projectRoot, "samples/marketplace-payouts.json"), "utf8");
  const csvDataset = parseTransferText(csvText, { filename: "payments-loop.csv" });
  const jsonDataset = parseTransferText(jsonText, { filename: "marketplace-payouts.json" });

  assert.equal(csvDataset.transfers().length, 6);
  assert.equal(csvDataset.transfers().filter((transfer) => transfer.status === "pending").length, 2);
  assert.equal(jsonDataset.transfers().length, 4);
  assert.equal(jsonDataset.accounts().length, 4);
});
