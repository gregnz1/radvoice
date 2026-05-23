import { createServer } from "node:http";
import { formatDictation } from "../../../apps/web/src/formatter.js";
import { templates } from "../../../apps/web/src/templates.js";

const port = Number.parseInt(process.env.API_PORT ?? "8787", 10);
const sessions = new Map();

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

  if (request.method === "POST" && request.url === "/sessions") {
    await handleCreateSession(request, response);
    return;
  }

  const sessionMatch = request.url?.match(/^\/sessions\/([^/]+)$/);
  if (request.method === "GET" && sessionMatch) {
    handleGetSession(response, sessionMatch[1]);
    return;
  }

  const segmentMatch = request.url?.match(/^\/sessions\/([^/]+)\/segments$/);
  if (request.method === "POST" && segmentMatch) {
    await handleAddSegment(request, response, segmentMatch[1]);
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

async function handleCreateSession(request, response) {
  const body = await readJson(request);
  const templateId = typeof body.templateId === "string" ? body.templateId : templates[0].id;
  const template = templates.find((item) => item.id === templateId);

  if (!template) {
    sendJson(response, 400, {
      error: "invalid_template",
      message: "templateId must match a known report template.",
    });
    return;
  }

  const now = new Date().toISOString();
  const session = {
    id: crypto.randomUUID(),
    status: "active",
    templateId,
    segments: [],
    draft: formatDictation("", template),
    createdAt: now,
    updatedAt: now,
  };

  sessions.set(session.id, session);
  sendJson(response, 201, session);
}

function handleGetSession(response, sessionId) {
  const session = sessions.get(sessionId);

  if (!session) {
    sendJson(response, 404, { error: "session_not_found" });
    return;
  }

  sendJson(response, 200, session);
}

async function handleAddSegment(request, response, sessionId) {
  const session = sessions.get(sessionId);

  if (!session) {
    sendJson(response, 404, { error: "session_not_found" });
    return;
  }

  const body = await readJson(request);
  if (typeof body.text !== "string" || body.text.trim().length === 0) {
    sendJson(response, 400, {
      error: "invalid_segment",
      message: "text must be a non-empty string.",
    });
    return;
  }

  const now = new Date().toISOString();
  session.segments.push({
    id: crypto.randomUUID(),
    text: body.text.trim(),
    source: typeof body.source === "string" ? body.source : "iphone",
    sequence: session.segments.length + 1,
    createdAt: now,
  });

  const template = templates.find((item) => item.id === session.templateId) ?? templates[0];
  const fullText = session.segments.map((segment) => segment.text).join(" ");
  session.draft = formatDictation(fullText, template);
  session.updatedAt = now;

  sendJson(response, 201, session);
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
