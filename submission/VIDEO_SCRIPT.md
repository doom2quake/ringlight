# Ringlight demo video script (target 2:20, hard cap 3:00, audio required)

Human voice, calm and clear. Screen directions in [brackets]. The rules require the narration to
cover what you built and how you used WebMCP, so the WebMCP section is not optional.

---

**[0:00 - 0:12]  Hook**
[Screen: Ringlight open in ChatGPT's in-app browser, the money map idle.]

"Following dirty money is slow. An investigator clicks through accounts one at a time, building the
picture by hand, while the money keeps moving. We wanted your browser agent to do that tracing with
you, live, on the page you are looking at."

**[0:12 - 0:26]  What it is**
[Screen: point at the console, the graph, the case panel.]

"This is Ringlight. It opens in ChatGPT's browser with a real case already loaded, no setup, no
sign-in. You just tell your agent what to look at."

**[0:26 - 1:05]  The trace**
[Screen: type into the agent: "Trace the suspicious transfer from account ACME-004." The graph animates.]

"I ask it to trace one suspicious transfer. Watch the money map. The agent follows the money account
by account, and each hop lights up as it goes. In a few seconds it has pulled a cluster out of the
noise, fourteen accounts moving funds in a tight loop, and it puts a number on the exposure. That
cluster is the ring."

**[1:05 - 1:35]  The human-gated freeze**
[Screen: the agent proposes to freeze; a glowing Approve button appears; click it; the ring goes dark.]

"Now the important part. Freezing accounts is irreversible, so the agent cannot just do it. It asks.
I click approve, once, and the freeze ripples across the ring while every clean account stays
untouched. The person stays in control of the one action that matters."

**[1:35 - 1:55]  Replay**
[Screen: drag the scrubber; the whole investigation replays.]

"And because every step the agent took is recorded, I can scrub back and replay the entire
investigation, tool call by tool call. Nothing is hidden."

**[1:55 - 2:20]  How we used WebMCP**
[Screen: briefly show the tools list, or the README's registerTool snippet.]

"Here is how it works. Ringlight registers its tools on the page with WebMCP, using
document.modelContext.registerTool. Trace the flow, score risk, find the ring, freeze accounts,
replay. ChatGPT's agent discovers those tools and calls them with structured arguments, and our code
runs inside the page and drives the map. The agent is not clicking pixels or scraping. It is calling
real, typed functions we exposed. Freeze is marked irreversible, which is why it stops for a human.
That is the whole idea, an agent operating a real web app with you, safely. It runs from any static
host and you can drop in your own transactions. Thanks for watching."

---

Recording tips: open in ChatGPT's in-app browser for the real WebMCP path; if you record with the
fallback, click "Run the bust" instead of typing. 1280x800, dark theme. One silent timing pass, then
voice over. Keep under three minutes.
