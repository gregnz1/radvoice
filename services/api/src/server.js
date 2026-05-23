import { createServer } from "node:http";
import { formatDictation } from "../../../apps/web/src/formatter.js";
import { templates } from "../../../apps/web/src/templates.js";

const port = Number.parseInt(process.env.API_PORT ?? "8787", 10);

const server = createServer(async (request, response) => {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { ok: true, service: "radvoice-api" });
    return;
  }

  if (request.method === "GET" && request.url === "/templates") {
    sendJson(response, 200, { templates });
    return;
  }

  if (request.method === "POST" && request.url === "/format") {
    await handleFormat(request, response);
    return;
  }

  sendJson(response, 404, { error: "not_found" });
});

server.listen(port, () => {
  console.log(`RadVoice API listening on http://localhost:${port}`);
});

async function handleFormat(request, response) {
  try {
    const body = await readJson(request);
    const template = templates.find((item) => item.id === body.templateId);

    if (!template) {
      sendJson(response, 400, {
        error: "invalid_template",
        message: "templateId must match a known report template.",
      });
      return;
    }

    if (typeof body.text !== "string") {
      sendJson(response, 400, {
        error: "invalid_text",
        message: "text must be a string.",
      });
      return;
    }

    const result = formatDictation(body.text, template);
    sendJson(response, 200, {
      ...result,
      provider: "local-rule-engine",
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    sendJson(response, 400, {
      error: "bad_request",
      message: error instanceof Error ? error.message : "Invalid request.",
    });
  }
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "content-type");
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(payload, null, 2));
}

async function readJson(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw.length > 0 ? JSON.parse(raw) : {};
}

