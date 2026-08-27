# Architecture

Ringlight has one execution path for native WebMCP calls and the local guided demo. Both invoke the same stored descriptor, validation, approval, handler, state, and receipt path.

## Call lifecycle

1. WebMCPSubstrate validates a reusable definition with name, description, inputSchema, handler, and optional irreversible.
2. It calls document.modelContext.registerTool(descriptor, { signal }).
3. A browser invokes descriptor.execute(inputObject, { signal }). The guided demo invokes that exact callback through substrate.invoke().
4. The substrate validates the input object against the checked-in JSON Schema.
5. If the tool is irreversible, HumanApprovalGate emits a visible request and leaves the call promise pending.
6. A person approves or holds the exact request in the page.
7. The handler reads deterministic local data, runs graph or risk math, updates RinglightStore, and emits live UI events.
8. The substrate checks that the result is JSON-serializable and records name, arguments, digests, timestamp, status, and approval.
9. The provenance replay emits receipt events only. It never invokes a handler.

## Reusable substrate

The src/webmcp/ directory is independent of the fraud case:

- substrate.js: native registration wrapper and one execution path
- schema.js: bounded JSON Schema validation
- human-gate.js: pending approval requests for irreversible tools
- provenance.js: deterministic receipts, export bundle, and safe replay
- event-bus.js: UI events with no product dependency
- polyfill.js: local registerTool, getTools, executeTool, and abort-to-unregister support

## Product layer

src/data/fraud-ring.js contains invented aliases and fixed transfers. src/analysis/math.js contains:

- bounded directed flow traversal
- account-neighborhood expansion
- Tarjan directed strongly connected components
- Atlas-style trailing mean, sample deviation, and z-score
- deterministic behavior risk scoring
- exact gross-flow and pending-exit accounting

src/ui/controller.js includes a deterministic hand-written force layout for the visible graph. src/app/tools.js exposes the product logic through ten WebMCP tools. src/app/store.js holds the browser-visible case state. The controller renders that same state as the graph, activity, timeline, artifacts, gates, receipts, freeze cascade, and replay frames.

src/data/import-transfers.js validates local CSV or JSON transfers and swaps them into a mutable dataset facade. The ten registered tool handlers keep the same identity and read the active dataset through that facade. Files stay in the browser and trigger no network request.

## Safety boundaries

- All account names and transfers are invented.
- The exercise clock is pinned to 24 August 2026.
- There is no Math.random() and no Date.now().
- Tool input is rejected before approval or handler execution when it misses the schema.
- freezeAccounts and notifyBank always require separate approvals.
- Their handlers change local case state only.
- The case-report tool drafts a local suspicious activity report artifact and explicitly reports submittedExternally: false.
- Notification explicitly reports networkRequests: 0.
- Replay reconstructs visible frames and never repeats a handler.
- Aborting the registration controller removes the tool through the documented WebMCP lifecycle.

## Direct-file compatibility

Common browsers restrict external ES modules loaded from file://. Hosted pages load src/main.js and its module graph directly. Direct-file use loads src/file-runtime.js, a checked-in classic script generated from the same modules by scripts/generate-file-runtime.mjs.

The compatibility copy is not a separate product implementation. It uses the same boot() function and still prefers native document.modelContext when a browser provides it.
