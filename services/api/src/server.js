import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { templates } from "../../../apps/web/src/templates.js";
import { formatReport } from "./formatterService.js";
import { redactPatientIdentifiers } from "../../../apps/web/src/privacy.js";

loadEnvFile(new URL("../../../.env", import.meta.url));
loadEnvFile(new URL("../.env", import.meta.url));

const port = Number.parseInt(process.env.API_PORT ?? "8787", 10);
const host = process.env.API_HOST || "127.0.0.1";
const allowedOrigins = parseCsv(process.env.CORS_ORIGINS || "http://localhost:5173");
const sessionTtlMs = Number.parseInt(process.env.SESSION_TTL_MS || "3600000", 10);
const logLevel = process.env.LOG_LEVEL || "minimal";
const sessions = new Map();
const pairings = new Map();

const server = createServer(async (request, response) => {
  cleanupExpiredSessions();
  setCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      ok: true,
      service: "radvoice-api",
      version: "demo",
      llm: {
        enabled: process.env.LLM_ENABLED === "true",
        provider: "openai",
        configured: typeof process.env.OPENAI_API_KEY === "string" && process.env.OPENAI_API_KEY.trim().length > 0,
        model: process.env.LLM_MODEL || "gpt-4.1-mini",
      },
      network: {
        host,
        port,
        allowedOrigins: allowedOrigins.length,
      },
      privacy: {
        logLevel,
        rawTextLogging: false,
      },
      sessions: {
        active: sessions.size,
        ttlMs: sessionTtlMs,
      },
    });
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

  const pairingMatch = request.url?.match(/^\/sessions\/pair\/([A-Z0-9-]+)$/);
  if (request.method === "GET" && pairingMatch) {
    handlePairSession(response, pairingMatch[1]);
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

const cleanupTimer = setInterval(cleanupExpiredSessions, Math.min(sessionTtlMs, 5 * 60 * 1000));
cleanupTimer.unref?.();

server.listen(port, host, () => {
  logStartup(`RadVoice API listening on http://${host}:${port}`);
  if (host === "0.0.0.0") {
    logStartup("WARNING: LAN API exposure is enabled. Use only on a trusted network and stop the server after the demo.");
  }
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

    const privacy = redactPatientIdentifiers(body.text);
    const result = await formatReport(privacy.text, template);
    sendJson(response, 200, result);
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
  const pairingCode = createPairingCode();
  const session = {
    id: crypto.randomUUID(),
    pairingCode,
    status: "active",
    templateId,
    segments: [],
    draft: await formatReport("", template),
    createdAt: now,
    updatedAt: now,
  };
  Object.defineProperty(session, "expiresAt", {
    value: new Date(Date.now() + sessionTtlMs).toISOString(),
    enumerable: false,
    writable: true,
  });

  sessions.set(session.id, session);
  pairings.set(pairingCode, session.id);
  sendJson(response, 201, session);
}

function handlePairSession(response, rawPairingCode) {
  const pairingCode = normalizePairingCode(rawPairingCode);
  const sessionId = pairings.get(pairingCode);

  if (!sessionId || !getActiveSession(sessionId)) {
    pairings.delete(pairingCode);
    sendJson(response, 404, { error: "pairing_not_found" });
    return;
  }

  handleGetSession(response, sessionId);
}

function handleGetSession(response, sessionId) {
  const session = getActiveSession(sessionId);

  if (!session) {
    sendJson(response, 404, { error: "session_not_found" });
    return;
  }

  sendJson(response, 200, session);
}

function createPairingCode() {
  let code = "";

  do {
    code = Math.random().toString(36).slice(2, 8).toUpperCase();
  } while (pairings.has(code));

  return code;
}

function normalizePairingCode(code) {
  return code.replace(/-/g, "").trim().toUpperCase();
}

async function handleAddSegment(request, response, sessionId) {
  const session = getActiveSession(sessionId);

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
  const privacy = redactPatientIdentifiers(body.text.trim());
  session.segments.push({
    id: crypto.randomUUID(),
    text: privacy.text,
    source: typeof body.source === "string" ? body.source : "iphone",
    sequence: session.segments.length + 1,
    createdAt: now,
    redacted: privacy.redacted,
  });

  const template = templates.find((item) => item.id === session.templateId) ?? templates[0];
  const fullText = session.segments.map((segment) => segment.text).join(" ");
  session.draft = await formatReport(fullText, template);
  session.updatedAt = now;

  sendJson(response, 201, session);
}

function setCorsHeaders(request, response) {
  const origin = request.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }

  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "content-type");
}

function getActiveSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;

  if (isExpired(session)) {
    deleteSession(session);
    return null;
  }

  return session;
}

function cleanupExpiredSessions() {
  for (const session of sessions.values()) {
    if (isExpired(session)) {
      deleteSession(session);
    }
  }
}

function isExpired(session) {
  return typeof session.expiresAt === "string" && Date.parse(session.expiresAt) <= Date.now();
}

function deleteSession(session) {
  sessions.delete(session.id);
  pairings.delete(session.pairingCode);
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

function loadEnvFile(fileUrl) {
  if (!existsSync(fileUrl)) return;

  const lines = readFileSync(fileUrl, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function parseCsv(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function logStartup(message) {
  if (logLevel !== "silent") {
    console.log(message);
  }
}
