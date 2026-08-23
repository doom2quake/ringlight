import { parseTransferText } from "../data/import-transfers.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const CASE_TOOL_NAMES = [
  "traceFlow", "expandAccount", "scoreRisk", "detectRing", "dollariseExposure",
  "buildCaseTimeline", "freezeAccounts", "fileSARreport", "notifyBank", "replayInvestigation",
];

export class RinglightUI {
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

export function forceLayout(accounts, transfers, { width = 1000, height = 590, iterations = 180 } = {}) {
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
