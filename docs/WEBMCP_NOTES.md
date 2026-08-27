# WebMCP implementation notes

Verified 27 August 2026 against the current OpenAI documentation, Chrome developer guide, and WebMCP Community Group draft.

## The imperative API shape

The current browser surface is `document.modelContext`. A tool is registered with:

```js
const registration = new AbortController();

await document.modelContext.registerTool(
  {
    name: "queryMetric",
    title: "Query metric", // optional
    description: "Read a metric series from the current incident dataset.",
    inputSchema: {
      type: "object",
      properties: {
        metric: { type: "string", enum: ["revenue", "orders", "authorizationRate"] },
      },
      required: ["metric"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: false,
    },
    execute: async (inputObject, { signal }) => {
      signal.throwIfAborted();
      return { status: "success", metric: inputObject.metric };
    },
  },
  { signal: registration.signal }
);

// Unregister later.
registration.abort();
```

The normative Web IDL is:

```webidl
Promise<undefined> registerTool(ModelContextTool tool,
                                optional ModelContextRegisterToolOptions options = {});

dictionary ModelContextTool {
  required DOMString name;
  USVString title;
  required DOMString description;
  object inputSchema;
  required ToolExecuteCallback execute;
  ToolAnnotations annotations;
};

dictionary ModelContextRegisterToolOptions {
  sequence<USVString> exposedTo;
  AbortSignal signal;
};

callback ToolExecuteCallback = Promise<any>(object inputObject,
                                            ToolExecuteCallbackOptions options);
```

Key details:

- `name`, `description`, and `execute` are required. `title`, `inputSchema`, and `annotations` are optional.
- Names are 1 to 128 characters and may contain ASCII letters, digits, `_`, `-`, and `.`.
- `inputSchema` is a JSON Schema object.
- `execute` receives the parsed input object and `{ signal: AbortSignal }` as its second argument.
- The callback may be async. Its fulfilled value is JSON-serialized by the browser, so it must be JSON-serializable.
- `annotations.readOnlyHint` and `annotations.untrustedContentHint` both default to `false`.
- `registerTool()` returns a `Promise<undefined>` and rejects duplicate names, empty or invalid names/descriptions, and invalid schemas.
- There is no `unregisterTool()` method. Pass an `AbortSignal` in the second `registerTool` argument, then abort its controller to remove the tool. The draft also allows `exposedTo` in this registration-options object for explicit cross-origin exposure.
- `document.modelContext` is a secure-context API. The draft gates it behind the `tools` permissions-policy feature, whose default allowlist is `'self'`.
- The draft requires an origin-keyed agent cluster for non-`file` pages. Normal HTTPS pages satisfy this unless they opt into a site-keyed cluster with `document.domain`; `file` is explicitly exempted in the algorithm.
- Chrome notes that from Chrome 153 onward, unregistering a tool does not cancel an already running invocation. Execution cancellation uses the separate `signal` passed to `execute(inputObject, { signal })`.

## Discovery and invocation

### ChatGPT built-in browser

OpenAI calls its implementation "site tools." In the built-in browser in the ChatGPT desktop app, ChatGPT Work and Codex can discover tools owned by the open page. The address bar's **Site tools** menu shows **Available site tools**, while **Recently used** links to the calls in Sources. Each invocation gets a browser safety review before page code runs. Normal confirmation policy still applies to consequential actions.

Current availability notes from OpenAI:

- use GPT-5.6 Sol or GPT-5.6 Terra;
- GPT-5.6 Luna currently has WebMCP disabled;
- site tools are not currently available in Enterprise or Edu workspaces;
- discovery depends on rollout, the desktop app version, and the currently open page;
- navigating away from or closing the page makes its tools unavailable.

The browser agent uses an internal discovery path. A page does not need to call `getTools()` for ChatGPT to find its registrations.

### Chrome

Chrome documents WebMCP as a progressive enhancement and an origin trial beginning with Chrome 149. For local development, enable `chrome://flags/#enable-webmcp-testing` and relaunch Chrome. Chrome's Model Context Tool Inspector extension can list registered tools, manually invoke them, validate schemas, and display results. A compatible agent must visit the page before it can discover its tools.

For in-page inspection, `await document.modelContext.getTools()` returns an alphabetically ordered list of accessible tools. `document.modelContext.executeTool(...)` can execute a discovered tool and accepts an optional cancellation signal.

## Current ambiguity and compatibility choice

The Community Group draft IDL currently declares:

```webidl
Promise<DOMString> executeTool(RegisteredTool tool,
                               optional object inputObject = {},
                               optional ModelContextExecuteToolOptions options = {});
```

Chrome's imperative API guide currently demonstrates a valid JSON string as the second argument instead. This affects only manual, in-page execution through `executeTool`; it does not change the registered tool's `execute(inputObject, { signal })` callback.

Ringlight follows the documented registration shape exactly and keeps its own local shim tolerant of either an object or a JSON string. The shim returns the callback's structured value, which makes the guided demo convenient. A native browser host may return a serialized string from `executeTool`, as the draft IDL specifies.

## Local polyfill decision

Most stable browsers do not yet expose `document.modelContext`. A small local polyfill is therefore required for this project's offline guided demo and Node contract tests. The polyfill implements:

- `registerTool(tool, { signal })`;
- `getTools()`;
- `executeTool(toolOrName, objectOrJson, { signal })`;
- `toolchange` events when the host supplies `EventTarget`;
- unregister-on-abort.

The polyfill does **not** make tools discoverable to ChatGPT or Chrome's browser agent. It is a deterministic local harness. Native `document.modelContext` always wins when present.

The application itself also accounts for a separate browser constraint: external JavaScript modules commonly fail under `file://` because module fetches use CORS. Hosted pages load the ES-module source directly. Direct-file use loads the checked-in `src/file-runtime.js` compatibility copy, which is generated from those modules and needs no server or install. MDN documents the local-module restriction at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#troubleshooting.

## Primary sources

- OpenAI, Site tools: https://learn.chatgpt.com/docs/webmcp
- Web Machine Learning Community Group, WebMCP draft: https://webmachinelearning.github.io/webmcp/
- Chrome for Developers, WebMCP overview and local flag: https://developer.chrome.com/docs/ai/webmcp
- Chrome for Developers, Imperative API: https://developer.chrome.com/docs/ai/webmcp/imperative-api

The WebMCP document is a Draft Community Group Report, not a W3C Standard, and Chrome describes the API as subject to change. Keeping native registration behind one wrapper contains that compatibility risk.
