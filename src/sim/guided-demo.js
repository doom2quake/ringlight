import { CASE_ID, FLAGGED_TRANSFER_ID, RING_ID } from "../data/fraud-ring.js";

export const RING_ACCOUNT_IDS = Object.freeze(
  Array.from({ length: 14 }, (_, index) => `mule-${String(index + 1).padStart(2, "0")}`),
);

export const GUIDED_CALLS = Object.freeze([
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

export class GuidedDemo {
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
