import { createFraudDataset, CASE_ID } from "./data/fraud-ring.js";
import { createMutableDataset } from "./data/import-transfers.js";
import { RinglightStore } from "./app/store.js";
import { createRinglightTools } from "./app/tools.js";
import { GuidedDemo } from "./sim/guided-demo.js";
import { EventBus } from "./webmcp/event-bus.js";
import { HumanApprovalGate } from "./webmcp/human-gate.js";
import { DeterministicClock, ProvenanceRail } from "./webmcp/provenance.js";
import { WebMCPSubstrate } from "./webmcp/substrate.js";
import { RinglightUI } from "./ui/controller.js";

export async function boot({ documentRef = document } = {}) {
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

  // A real WebMCP host (for example ChatGPT's built-in browser) can inject its
  // native document.modelContext AFTER our scripts have already run. If we started
  // on the local polyfill, watch for the native host to appear and register the same
  // tools on it, so the agent can discover and call them.
  if (substrate.mode === "polyfill") {
    let ticks = 0;
    const watch = setInterval(async () => {
      ticks += 1;
      const native = documentRef.modelContext;
      if (native && !native.__webmcpLocalPolyfill && typeof native.registerTool === "function") {
        clearInterval(watch);
        try {
          const nativeSubstrate = new WebMCPSubstrate({ documentRef, eventBus, provenance, approvalGate, modelContext: native });
          await nativeSubstrate.registerAll(tools);
          ui.hostReady?.({ mode: nativeSubstrate.mode, toolCount: nativeSubstrate.size });
        } catch (err) { /* keep the polyfill if native registration fails */ }
      } else if (ticks >= 120) {
        clearInterval(watch);
      }
    }, 500);
  }

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
