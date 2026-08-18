export class DeterministicClock {
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

export class ProvenanceRail {
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

export function stableStringify(value) {
  if (value === undefined) return '"[undefined]"';
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const entries = Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
  return `{${entries.join(",")}}`;
}

export function digest(value) {
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
