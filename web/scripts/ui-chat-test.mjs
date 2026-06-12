// Drives the live chat panel end-to-end in headless Chrome via CDP.
// Usage: node scripts/ui-chat-test.mjs [url]   (default http://localhost:3000)
// Requires the dev server running. Exits non-zero on failure.

import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const URL_UNDER_TEST = process.argv[2] ?? "http://localhost:3000";
const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
].find((p) => {
  try { return require("node:fs").existsSync(p); } catch { return false; }
}) ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const PORT = 9333;
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  "--window-size=1280,900",
  "--no-first-run",
  "--user-data-dir=" + path.join(process.env.TEMP ?? "/tmp", "bsa-cdp-profile"),
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" });
      const tab = await res.json();
      return tab.webSocketDebuggerUrl;
    } catch { await sleep(500); }
  }
  throw new Error("Chrome CDP endpoint never came up");
}

let msgId = 0;
const pending = new Map();
let ws;

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const { result, exceptionDetails } = await send("Runtime.evaluate", {
    expression, awaitPromise: true, returnByValue: true,
  });
  if (exceptionDetails) throw new Error("page JS error: " + JSON.stringify(exceptionDetails.exception?.description ?? exceptionDetails.text));
  return result.value;
}

/** Set a React-controlled input's value properly, then submit its form. */
async function typeAndSubmit(selector, value) {
  await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) throw new Error("input not found: " + ${JSON.stringify(selector)});
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.form.requestSubmit();
  })()`);
}

async function waitForText(text, timeoutMs = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const found = await evaluate(
      `document.body.innerText.toLowerCase().includes(${JSON.stringify(text.toLowerCase())})`
    );
    if (found) return;
    await sleep(400);
  }
  throw new Error(`timed out waiting for text: "${text}"`);
}

const PANEL_INPUT = "div.fixed.inset-0 form input";

try {
  ws = new WebSocket(await getWsUrl());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  };

  await send("Page.enable");
  await send("Page.navigate", { url: URL_UNDER_TEST });
  await waitForText("Design your own Himalayan trek", 30000);
  console.log("✓ homepage loaded");

  // Open the chat via the hero chat bar. SSR text appears before React
  // hydrates, so retry the submit until the panel actually mounts.
  let panelOpen = false;
  for (let attempt = 0; attempt < 6 && !panelOpen; attempt++) {
    await typeAndSubmit("section#plan form input", "Plan Kedarkantha for me");
    panelOpen = await waitForText("what's your name", 3000).then(() => true).catch(() => false);
  }
  if (!panelOpen) throw new Error("chat panel never opened after 6 submit attempts");
  console.log("✓ chat panel opened (ASK_NAME)");

  const phone = String(9000000000 + Math.floor(Math.random() * 999999999)).slice(0, 10);
  await typeAndSubmit(PANEL_INPUT, "UI Test User");
  await waitForText("10-digit mobile");
  console.log("✓ name accepted (ASK_PHONE)");

  await typeAndSubmit(PANEL_INPUT, phone);
  await waitForText("email address");
  console.log("✓ phone accepted (ASK_EMAIL)");

  await typeAndSubmit(PANEL_INPUT, `ui-test-${phone}@example.com`);
  await waitForText("free messages left");
  console.log("✓ lead banked — meter visible (FREE_CHAT)");

  // initialMessage auto-send means message 1 may already be in flight
  await waitForText("Kedarkantha", 25000);
  console.log("✓ message 1 streamed (auto-sent destination)");

  await sleep(1500);
  await typeAndSubmit(PANEL_INPUT, "Two people, fit, 6 days available");
  await waitForText("1 of 3", 25000);
  console.log("✓ message 2 — meter at 1 of 3");

  await sleep(1000);
  await typeAndSubmit(PANEL_INPUT, "December works, build the plan");
  await waitForText("Your free itinerary", 40000);
  console.log("✓ message 3 — ITINERARY CARD RENDERED");

  await waitForText("verified local guide", 5000);
  console.log("✓ provider teaser rail present (no phone numbers)");

  const { data } = await send("Page.captureScreenshot", { format: "png" });
  const shot = path.join(process.env.TEMP ?? "/tmp", "bsa-ui-chat-test.png");
  writeFileSync(shot, Buffer.from(data, "base64"));
  console.log("✓ screenshot: " + shot);

  console.log("\nALL UI CHECKS PASSED");
  process.exit(0);
} catch (err) {
  console.error("\n✗ UI TEST FAILED: " + err.message);
  try {
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    const shot = path.join(process.env.TEMP ?? "/tmp", "bsa-ui-chat-FAIL.png");
    writeFileSync(shot, Buffer.from(data, "base64"));
    console.error("  failure screenshot: " + shot);
  } catch {}
  process.exit(1);
} finally {
  chrome.kill();
}
