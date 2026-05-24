import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";

await testLocalRuleFallback();
await testOpenAIFormatter();

console.log("api tests passed");

async function testLocalRuleFallback() {
  const port = 8791;
  const server = spawnServer(port, { LLM_ENABLED: "false", OPENAI_API_KEY: "" });

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

    const invalidTemplate = await fetch(`http://localhost:${port}/format`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateId: "missing", text: "test" }),
    });
    assert.equal(invalidTemplate.status, 400);

    const invalidText = await fetch(`http://localhost:${port}/format`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateId: "generic-report" }),
    });
    assert.equal(invalidText.status, 400);

    const sessionResponse = await fetch(`http://localhost:${port}/sessions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateId: "ct-head" }),
    });

    assert.equal(sessionResponse.status, 201);
    const session = await sessionResponse.json();
    assert.equal(session.status, "active");
    assert.equal(session.templateId, "ct-head");
    assert.equal(session.pairingCode.length, 6);

    const pairedResponse = await fetch(`http://localhost:${port}/sessions/pair/${session.pairingCode}`);
    assert.equal(pairedResponse.status, 200);
    const pairedSession = await pairedResponse.json();
    assert.equal(pairedSession.id, session.id);

    const segmentResponse = await fetch(`http://localhost:${port}/sessions/${session.id}/segments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "iphone",
        text: "ct head no bleed no mass effect impression no acute",
      }),
    });

    assert.equal(segmentResponse.status, 201);
    const updatedSession = await segmentResponse.json();
    assert.equal(updatedSession.segments.length, 1);
    assert.match(updatedSession.draft.report, /No acute intracranial hemorrhage/);

    const privacySessionResponse = await fetch(`http://localhost:${port}/sessions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateId: "generic-report" }),
    });
    const privacySession = await privacySessionResponse.json();
    const privacySegmentResponse = await fetch(
      `http://localhost:${port}/sessions/${privacySession.id}/segments`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source: "iphone",
          text: "patient name Jane Smith dob 01/02/1950 indication cough findings lungs clear impression normal",
        }),
      },
    );
    const privacyUpdatedSession = await privacySegmentResponse.json();
    assert.equal(privacyUpdatedSession.segments[0].redacted, true);
    assert.match(privacyUpdatedSession.segments[0].text, /\[REDACTED PATIENT-NAME\]/);
    assert.doesNotMatch(privacyUpdatedSession.segments[0].text, /Jane Smith/i);
  } finally {
    server.kill();
  }
}

async function testOpenAIFormatter() {
  const openAIPort = 8793;
  const apiPort = 8792;
  const openAI = createMockOpenAI(openAIPort);
  const server = spawnServer(apiPort, {
    LLM_ENABLED: "true",
    OPENAI_API_KEY: "test-key",
    OPENAI_BASE_URL: `http://localhost:${openAIPort}/v1`,
    LLM_MODEL: "test-model",
  });

  try {
    await listen(openAI, openAIPort);
    await waitForHealth(apiPort);

    const response = await fetch(`http://localhost:${apiPort}/format`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        templateId: "generic-report",
        text: "indication pain technique ct findings normal impression normal",
      }),
    });

    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.provider, "openai-responses");
    assert.match(result.report, /OPENAI FORMATTED REPORT/);

    const sessionResponse = await fetch(`http://localhost:${apiPort}/sessions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateId: "generic-report" }),
    });
    const session = await sessionResponse.json();
    const segmentResponse = await fetch(`http://localhost:${apiPort}/sessions/${session.id}/segments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "findings normal impression normal" }),
    });
    const updatedSession = await segmentResponse.json();
    assert.equal(updatedSession.draft.provider, "openai-responses");
  } finally {
    server.kill();
    await close(openAI);
  }
}

function spawnServer(port, env) {
  return spawn(process.execPath, ["./src/server.js"], {
    cwd: new URL("..", import.meta.url),
    env: {
      ...process.env,
      ...env,
      API_PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function createMockOpenAI(port) {
  return createServer(async (request, response) => {
    if (request.method !== "POST" || request.url !== "/v1/responses") {
      response.writeHead(404);
      response.end();
      return;
    }

    for await (const _chunk of request) {
      // Drain request body.
    }

    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        output_text: JSON.stringify({
          findings: { Findings: ["Mock normal findings."] },
          impression: "Mock normal impression.",
          flags: [],
          report: "OPENAI FORMATTED REPORT\n\nFindings:\nMock normal findings.\n\nImpression:\nMock normal impression.",
        }),
      }),
    );
  });
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

function listen(server, port) {
  return new Promise((resolve) => server.listen(port, resolve));
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
