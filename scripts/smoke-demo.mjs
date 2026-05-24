const API_BASE = process.env.API_BASE ?? "http://localhost:8787";

const health = await getJson("/health");
assert(health.ok === true, "health endpoint should be ok");
assert(typeof health.llm?.enabled === "boolean", "health should expose llm.enabled");

const templates = await getJson("/templates");
assert(Array.isArray(templates.templates), "templates should be an array");
assert(templates.templates.some((template) => template.id === "generic-report"), "generic template should exist");

const formatted = await postJson("/format", {
  templateId: "generic-report",
  text: "indication pain technique ultrasound performed findings no focal abnormality impression no acute abnormality",
});
assert(typeof formatted.report === "string" && formatted.report.includes("Indication:"), "format should return generic report");
assert(typeof formatted.provider === "string", "format should include provider");

const session = await postJson("/sessions", { templateId: "generic-report" });
assert(typeof session.id === "string", "session should include id");
assert(typeof session.pairingCode === "string" && session.pairingCode.length === 6, "session should include pairing code");

const updatedSession = await postJson(`/sessions/${session.id}/segments`, {
  source: "smoke-test",
  text: "indication cough technique chest xray findings lungs clear impression no acute disease",
});
assert(updatedSession.segments.length === 1, "updated session should include appended segment");
assert(typeof updatedSession.draft?.report === "string", "updated session should include draft report");
assert(typeof updatedSession.updatedAt === "string", "updated session should include updatedAt for polling");

console.log("smoke demo passed");
console.log(`provider: ${formatted.provider}`);
console.log(`session: ${session.id}`);
console.log(`pairing: ${session.pairingCode}`);

async function getJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  assert(response.ok, `${path} returned ${response.status}`);
  return response.json();
}

async function postJson(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  assert(response.ok, `${path} returned ${response.status}`);
  return response.json();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

