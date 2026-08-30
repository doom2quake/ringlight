# Ringlight

> Watch your browser agent trace a fraud ring across a live money map, and freeze it with one click.

Ringlight is a zero-setup WebMCP investigation console. Open `index.html` and the seeded `RL-2408` case is already live: seven starting accounts are visible, a suspicious $187,500 transfer from `acct-acme-004` is ready, and one primary button runs the complete thirteen-call investigation. No upload, key, configuration, install, build, or network connection is needed.

The browser follows each transfer on a force-directed money map, finds fourteen accounts passing money around a closed loop, and totals $2,318,750 in case flow. Before the simulated freeze changes local state, Ringlight pauses and shows the exact scope for a person to approve. The final replay recreates every call in order without freezing or notifying twice.

Ringlight is an original build by the doom2quake collective. Every account, transfer, dollar, filing, and notification in the seeded case is synthetic.

## Try it now

Double-click `index.html`. The checked-in compatibility runtime works directly from `file://` in a normal browser.

Or serve the same static files locally:

~~~bash
python3 -m http.server 8000
~~~

Open `http://localhost:8000` and click **Run full investigation**. The browser pauses twice for explicit approval: once before the simulated freeze, and once before the simulated case handoff.

There are zero runtime dependencies and no build step.

## Exact judge prompt

Open the deployed page in ChatGPT's in-app browser, open **Site tools**, then type:

> Trace the suspicious transfer tx-flag-001 from account acct-acme-004. Follow the money, show the linked accounts on the map, explain the total at risk, and pause before freezing anything.

The page also shows this prompt with a copy button. If site tools are unavailable, **Run full investigation** invokes the same registered handlers through the local compatibility layer.

## Optional local CSV or JSON

The seeded case is always the default. The small **or load your own transfers (CSV/JSON)** link opens an optional local file picker. Required fields are:

~~~text
from,to,amount,timestamp
~~~

Optional fields are `id`, `status` (`settled` or `pending`), `fromLabel`, `toLabel`, and `memo`. JSON may be an array of transfer objects or an object with a `transfers` array.

The file stays in the browser. Ringlight validates it, builds deterministic account fixtures, refreshes the money map, and switches the same ten registered WebMCP tool handlers to the local dataset. Nothing is uploaded.

Two synthetic samples ship in `samples/`: a CSV with a small closed loop, and JSON with a fan-out and convergence pattern. The seeded case is the third ready-to-use dataset.

## Tool surface

| Tool | Plain-language action | Effect |
| --- | --- | --- |
| `traceFlow` | Follow one suspicious transfer | Reveals accounts and transfers |
| `expandAccount` | Open one account's neighbors | Extends the visible map |
| `scoreRisk` | Score unusual movement | Adds reproducible behavior scores |
| `detectRing` | Find a closed money loop | Identifies the linked network |
| `dollariseExposure` | Calculate money at risk | Totals flow once and isolates pending outgoing money |
| `buildCaseTimeline` | Put the evidence in time order | Builds the case timeline |
| `freezeAccounts` | Freeze the exact linked set locally | Requires a person's approval |
| `fileSARreport` | Draft a local case report | Creates a suspicious activity report draft, submits nothing |
| `notifyBank` | Record a simulated handoff | Requires a separate approval and makes no request |
| `replayInvestigation` | Replay every receipt | Repeats no handler or side effect |

## What the numbers mean

A fraud ring is a group of accounts used to pass money in a loop and hide where it came from. A mule is a middle account used to receive and quickly pass on suspicious money. Exposure means money that is still moving and may still be stopped. SAR means suspicious activity report; Ringlight drafts one locally and sends nothing.

The seeded case contains 27 relevant transfers and six ordinary background transfers. The fourteen linked accounts have nineteen internal transfers and six independent cycles. Exact transfer accounting produces:

- total suspicious flow: **$2,318,750**
- original suspicious transfer: **$187,500**
- pending outgoing money: **$665,450** across seven transfers
- historical-case z-score: **10.98**

The analysis is deterministic. There is no random number, wall-clock input, remote model, or network API.

## Architecture

~~~mermaid
flowchart LR
  Browser[ChatGPT in-app browser] --> MC[document.modelContext]
  Button[Run full investigation] --> Substrate[WebMCP substrate]
  MC --> Substrate
  Substrate --> Schema[JSON Schema validation]
  Schema --> Gate{Changes local state?}
  Gate -->|No| Tools[Ringlight tools]
  Gate -->|Yes| Approval[Visible person approval]
  Approval --> Tools
  Tools --> Math[Deterministic graph and risk math]
  Tools --> State[Shared case state]
  Tools --> Rail[Call receipts]
  State --> Graph[Live force-directed map]
  Rail --> Replay[Scrubber and safe replay]
  LocalFile[Optional local CSV or JSON] --> State
~~~

See `docs/ARCHITECTURE.md` for the call lifecycle and safety boundaries. See `docs/WEBMCP_NOTES.md` for the researched WebMCP contract and primary sources.

## Test

~~~bash
npm test
~~~

The suite covers deterministic analysis math, force layout bounds, local CSV and JSON validation, the tool schemas, both approval boundaries, every call receipt, safe replay, static hosting, direct-file compatibility, and the complete thirteen-call guided investigation.

## Limits

Ringlight is an investigation aid, not a certified anti-money-laundering system or a connection to a bank core. The seeded exercise uses invented data. It does not move funds, freeze a real account, file a report, contact a fraud desk, or use personal data. Optional files remain inside the current browser session.

## Citation

~~~bibtex
@software{sarkar_ringlight_2026,
  author = {Dipankar Sarkar},
  title = {Ringlight},
  year = {2026},
  url = {https://github.com/doom2quake/ringlight}
}
~~~

MIT licensed. Copyright 2026 doom2quake.
