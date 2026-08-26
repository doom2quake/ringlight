import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(projectRoot, relativePath), "utf8");

test("static shell contains the cinematic graph, approvals, receipts, artifacts, and time machine", async () => {
  const html = await read("index.html");
  for (const marker of [
    "data-run-demo",
    "data-money-graph",
    "data-graph-nodes",
    "data-graph-edges",
    "data-activity-feed",
    "data-provenance-rail",
    "data-time-scrubber",
    "data-case-timeline",
    "data-artifact-list",
    "data-approval-dialog",
    "data-resolved-banner",
  ]) {
    assert.match(html, new RegExp(marker), `missing ${marker}`);
  }
  assert.equal((html.match(/data-tool-step=/g) ?? []).length, 10);
});

test("zero-setup shell opens populated with one primary flow and a secondary local-data path", async () => {
  const html = await read("index.html");

  assert.match(html, /Watch your browser agent trace a/);
  assert.match(html, /across a live money map, and freeze it with one click\./);
  assert.match(html, /Here is what is happening/);
  assert.match(html, /Run full investigation/);
  assert.match(html, /data-ring-count>7</);
  assert.match(html, /data-flagged-amount>\$187\.5K</);
  assert.match(html, /data-open-data>or load your own transfers \(CSV\/JSON\)</);
  assert.match(html, /type="file"[^>]+data-transfer-file/);
  assert.ok(html.indexOf("data-run-demo") < html.indexOf("data-open-data"));
});

test("judge instructions and finance definitions are visible in plain language", async () => {
  const html = await read("index.html");
  const prompt = "Trace the suspicious transfer tx-flag-001 from account acct-acme-004. Follow the money, show the linked accounts on the map, explain the total at risk, and pause before freezing anything.";

  assert.match(html, new RegExp(prompt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(html, /data-copy-prompt/);
  assert.equal((html.match(/role="tooltip"/g) ?? []).length, 4);
  assert.match(html, /A group of linked accounts used to move money through a loop/);
  assert.match(html, /an account used to receive and quickly pass on suspicious money/);
  assert.match(html, /money that is still moving and may still be stopped/);
  assert.match(html, /suspicious activity report, often shortened to SAR/);
});

test("Ringlight is the only product identity in code and public project material", async () => {
  const files = [
    "index.html",
    "styles.css",
    "README.md",
    "DEMO.md",
    "CITATION.cff",
    "docs/ARCHITECTURE.md",
    "docs/WEBMCP_NOTES.md",
    "src/main.js",
    "src/app/store.js",
    "src/app/tools.js",
    "src/ui/controller.js",
    "src/file-runtime.js",
  ];
  const source = (await Promise.all(files.map(read))).join("\n");

  const retiredName = new RegExp(["over", "watch"].join(""), "i");
  assert.doesNotMatch(source, retiredName);
  assert.match(source, /Ringlight/);
});

test("runtime loader selects checked-in file compatibility or hosted ES modules", async () => {
  const html = await read("index.html");
  const fileRuntime = await read("src/file-runtime.js");

  assert.match(html, /location\.protocol === "file:"/);
  assert.match(html, /runtime\.src = "\.\/src\/file-runtime\.js"/);
  assert.match(html, /runtime\.type = "module"/);
  assert.match(html, /runtime\.src = "\.\/src\/main\.js"/);
  assert.doesNotMatch(fileRuntime, /^\s*(?:import|export)\s/m);
  assert.match(fileRuntime, /class WebMCPSubstrate/);
  assert.match(fileRuntime, /class RinglightUI/);
});

test("page has no remote runtime dependency or network API", async () => {
  const html = await read("index.html");
  const css = await read("styles.css");
  const modules = (await Promise.all([
    "src/main.js",
    "src/app/tools.js",
    "src/ui/controller.js",
    "src/data/fraud-ring.js",
  ].map(read))).join("\n");

  assert.doesNotMatch(html, /(?:src|href)=["']https?:\/\//i);
  assert.doesNotMatch(css, /url\(["']?https?:\/\//i);
  assert.doesNotMatch(modules, /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon/);
});

test("fraud source avoids randomness and wall-clock drift", async () => {
  const files = [
    "src/data/fraud-ring.js",
    "src/analysis/math.js",
    "src/app/store.js",
    "src/webmcp/provenance.js",
    "src/ui/controller.js",
  ];
  const source = (await Promise.all(files.map(read))).join("\n");

  assert.doesNotMatch(source, /Math\.random\s*\(/);
  assert.doesNotMatch(source, /Date\.now\s*\(/);
  assert.match(source, /2026-08-24/);
});

test("judge-facing copy keeps the collective voice and avoids banned writing tells", async () => {
  const copy = (await Promise.all([
    read("index.html"),
    read("README.md"),
    read("DEMO.md"),
  ])).join("\n");
  const disallowed = [
    /—/,
    /\bautonom(?:ous|y)\b/i,
    /\bAI engine\b/i,
    /\bLLM\b/i,
    /\bdelve\b/i,
    /\bseamless\b/i,
    /\bleverage\b/i,
  ];

  for (const pattern of disallowed) assert.doesNotMatch(copy, pattern);
  assert.match(copy, /doom2quake collective/i);
});

test("the wrapper uses the verified imperative registration lifecycle", async () => {
  const substrate = await read("src/webmcp/substrate.js");
  const notes = await read("docs/WEBMCP_NOTES.md");

  assert.match(substrate, /registerTool\(descriptor, \{ signal: controller\.signal \}\)/);
  assert.match(substrate, /annotations:/);
  assert.match(notes, /document\.modelContext\.registerTool/);
  assert.match(notes, /registration\.abort\(\)/);
  assert.match(notes, /https:\/\/learn\.chatgpt\.com\/docs\/webmcp/);
  assert.match(notes, /https:\/\/webmachinelearning\.github\.io\/webmcp\//);
});

test("static-host manifests publish the same directory without a build command", async () => {
  const netlify = await read("netlify.toml");
  const vercel = JSON.parse(await read("vercel.json"));
  const packageJson = JSON.parse(await read("package.json"));

  assert.match(netlify, /publish = "\."/);
  assert.equal(vercel.cleanUrls, false);
  assert.equal(packageJson.scripts.test, "node --test");
  assert.ok(!Object.hasOwn(packageJson, "dependencies"));
  assert.ok(!Object.hasOwn(packageJson.scripts, "build"));
});
