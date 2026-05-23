import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const port = 8791;
const server = spawn(process.execPath, ["./src/server.js"], {
  cwd: new URL("..", import.meta.url),
  env: { ...process.env, API_PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

try {
  await waitForHealth(port);

  const response = await fetch(`http://localhost:${port}/format`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      templateId: "ct-abdomen-pelvis",
      text: "ct abdomen liver fine gallbladder removed no free air impression nothing acute",
    }),
  });

  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.provider, "local-rule-engine");
  assert.match(result.report, /Liver: Unremarkable/);
  assert.match(result.report, /No acute intra-abdominal or pelvic abnormality/);

  console.log("api tests passed");
} finally {
  server.kill();
}

async function waitForHealth(portNumber) {
  const started = Date.now();

  while (Date.now() - started < 5000) {
    try {
      const response = await fetch(`http://localhost:${portNumber}/health`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  throw new Error("API did not become healthy in time.");
}

