import { formatDictation } from "./formatter.js?v=privacy-redaction";
import { detectPatientIdentifiers, redactPatientIdentifiers } from "./privacy.js?v=privacy-redaction";
import { samples, templates } from "./templates.js?v=privacy-redaction";

const API_BASE = "http://localhost:8787";
const templateSelect = document.querySelector("#templateSelect");
const dictationInput = document.querySelector("#dictationInput");
const privacyNotice = document.querySelector("#privacyNotice");
const reportOutput = document.querySelector("#reportOutput");
const jsonOutput = document.querySelector("#jsonOutput");
const finalReportInput = document.querySelector("#finalReportInput");
const flagList = document.querySelector("#flagList");
const flagCount = document.querySelector("#flagCount");
const wordCount = document.querySelector("#wordCount");
const sessionId = document.querySelector("#sessionId");
const pairingCode = document.querySelector("#pairingCode");
const apiStatus = document.querySelector("#apiStatus");
const providerStatus = document.querySelector("#providerStatus");
const pollStatus = document.querySelector("#pollStatus");
const lastSyncStatus = document.querySelector("#lastSyncStatus");
const formatButton = document.querySelector("#formatButton");
const clearButton = document.querySelector("#clearButton");
const copyButton = document.querySelector("#copyButton");
const newSessionButton = document.querySelector("#newSessionButton");
const mockStreamButton = document.querySelector("#mockStreamButton");

let activeSessionId = "";
let streamTimer = 0;
let pollTimer = 0;
let privacyTimer = 0;
let finalReportDirty = false;
let lastGeneratedReport = "";

for (const template of templates) {
  const option = document.createElement("option");
  option.value = template.id;
  option.textContent = template.name;
  templateSelect.append(option);
}

formatButton.addEventListener("click", render);
templateSelect.addEventListener("change", render);
dictationInput.addEventListener("input", () => {
  updateWordCount();
  schedulePrivacyRedaction();
  renderLocalPreview();
});

newSessionButton.addEventListener("click", async () => {
  await createSession({ clearText: true });
});

mockStreamButton.addEventListener("click", async () => {
  await toggleMockStream();
});

clearButton.addEventListener("click", () => {
  dictationInput.value = "";
  clearPrivacyNotice();
  activeSessionId = "";
  sessionId.textContent = "No session";
  pairingCode.textContent = "----";
  finalReportInput.value = "";
  finalReportDirty = false;
  stopPolling();
  stopMockStream();
  render();
});

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(finalReportInput.value);
  copyButton.textContent = "Copied";
  setTimeout(() => {
    copyButton.textContent = "Copy Final";
  }, 1200);
});

finalReportInput.addEventListener("input", () => {
  finalReportDirty = finalReportInput.value !== lastGeneratedReport;
});

document.querySelectorAll(".sample").forEach((button) => {
  button.addEventListener("click", () => {
    dictationInput.value = samples[button.dataset.sample] ?? "";
    if (button.dataset.sample === "cthead") templateSelect.value = "ct-head";
    if (button.dataset.sample === "cxr") templateSelect.value = "chest-xray";
    if (button.dataset.sample === "ctap") templateSelect.value = "ct-abdomen-pelvis";
    if (button.dataset.sample === "generic") templateSelect.value = "generic-report";
    if (button.dataset.sample === "ctchest") templateSelect.value = "ct-chest";
    if (button.dataset.sample === "ctpa") templateSelect.value = "ctpa";
    if (button.dataset.sample === "mribrain") templateSelect.value = "mri-brain";
    if (button.dataset.sample === "usabdo") templateSelect.value = "us-abdomen";
    render();
  });
});

document.querySelectorAll(".scenario").forEach((button) => {
  button.addEventListener("click", () => {
    applyScenario(button.dataset.scenario);
  });
});

function getTemplate() {
  return templates.find((template) => template.id === templateSelect.value) ?? templates[0];
}

function updateWordCount() {
  const words = dictationInput.value.trim().split(/\s+/).filter(Boolean).length;
  wordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;
}

function render() {
  updateWordCount();
  void renderFromApi();
}

function renderLocalPreview() {
  const result = formatDictation(dictationInput.value, getTemplate());
  showResult({
    ...result,
    provider: "browser-local-preview",
  });
}

async function renderFromApi() {
  try {
    const safeText = redactPatientIdentifiers(dictationInput.value).text;
    const response = await fetch(`${API_BASE}/format`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        templateId: getTemplate().id,
        text: safeText,
      }),
    });

    if (!response.ok) throw new Error(`Formatter API returned ${response.status}`);

    const result = await response.json();
    showResult(result);
    markApiConnected();
  } catch {
    const result = formatDictation(dictationInput.value, getTemplate());
    showResult({
      ...result,
      provider: "browser-local-fallback",
      flags: [
        ...result.flags,
        {
          severity: "warning",
          category: "api",
          message: "Backend formatter unavailable. Showing browser-local fallback output.",
        },
      ],
    });
    apiStatus.textContent = "Disconnected";
  }
}

async function refreshHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) throw new Error("health failed");
    const health = await response.json();
    apiStatus.textContent = "Connected";
    const enabled = health.llm?.enabled ? "on" : "off";
    const configured = health.llm?.configured ? "configured" : "no key";
    providerStatus.textContent = `LLM ${enabled}, ${configured}`;
  } catch {
    apiStatus.textContent = "Disconnected";
    providerStatus.textContent = "Browser fallback";
  }
}

async function createSession({ clearText }) {
  const response = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ templateId: getTemplate().id }),
  });

  if (!response.ok) {
    renderLocalPreview();
    sessionId.textContent = "API unavailable";
    return null;
  }

  const session = await response.json();
  activeSessionId = session.id;
  showSessionIdentity(session);
  startPolling();

  if (clearText) {
    dictationInput.value = "";
    finalReportDirty = false;
    finalReportInput.value = "";
  }

  showSession(session);
  return session;
}

async function appendSegment(text) {
  if (!activeSessionId) {
    const session = await createSession({ clearText: true });
    if (!session) return;
  }

  const response = await fetch(`${API_BASE}/sessions/${activeSessionId}/segments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ source: "iphone-mock", text: redactPatientIdentifiers(text).text }),
  });

  if (!response.ok) {
    sessionId.textContent = "Session sync failed";
    stopMockStream();
    return;
  }

  const session = await response.json();
  showSession(session);
}

function showSession(session) {
  activeSessionId = session.id;
  showSessionIdentity(session);
  dictationInput.value = session.segments.map((segment) => segment.text).join(" ");
  clearPrivacyNotice();
  updateWordCount();
  showResult({
    ...session.draft,
    provider: "session-api",
    sessionId: session.id,
    segmentCount: session.segments.length,
    updatedAt: session.updatedAt,
  });
}

async function pollSession() {
  if (!activeSessionId) return;

  try {
    const response = await fetch(`${API_BASE}/sessions/${activeSessionId}`);
    if (!response.ok) return;
    const session = await response.json();
    showSession(session);
  } catch {
    // Keep the current draft visible if polling temporarily fails.
  }
}

function startPolling() {
  stopPolling();
  pollTimer = window.setInterval(pollSession, 1500);
  pollStatus.textContent = "Active";
}

function stopPolling() {
  window.clearInterval(pollTimer);
  pollTimer = 0;
  pollStatus.textContent = "Idle";
}

function showSessionIdentity(session) {
  pairingCode.textContent = session.pairingCode ?? "----";
  sessionId.textContent = session.id;
}

async function toggleMockStream() {
  if (streamTimer) {
    stopMockStream();
    return;
  }

  const fragments = getMockFragments();
  let index = 0;
  mockStreamButton.textContent = "Stop Mock";
  const session = await createSession({ clearText: true });

  if (!session) {
    stopMockStream();
    return;
  }

  streamTimer = window.setInterval(async () => {
    await appendSegment(fragments[index]);
    index += 1;

    if (index >= fragments.length) {
      stopMockStream();
    }
  }, 850);
}

function stopMockStream() {
  window.clearInterval(streamTimer);
  streamTimer = 0;
  mockStreamButton.textContent = "Mock iPhone";
}

function getMockFragments() {
  if (templateSelect.value === "generic-report") {
    return [
      "indication pain",
      "technique ultrasound performed",
      "findings no focal abnormality",
      "impression no acute abnormality",
    ];
  }

  if (templateSelect.value === "ct-head") {
    return [
      "ct head",
      "no bleed no mass effect",
      "ventricles normal",
      "chronic small vessel change",
      "impression no acute",
    ];
  }

  if (templateSelect.value === "chest-xray") {
    return [
      "chest xray",
      "heart size normal",
      "lungs clear",
      "no pleural effusion no pneumothorax",
      "impression no acute cardiopulmonary disease",
    ];
  }

  if (templateSelect.value === "ct-chest") return splitSample(samples.ctchest);
  if (templateSelect.value === "ctpa") return splitSample(samples.ctpa);
  if (templateSelect.value === "mri-brain") return splitSample(samples.mribrain);
  if (templateSelect.value === "us-abdomen") return splitSample(samples.usabdo);

  return [
    "ct abdomen pelvis with contrast",
    "liver fine gallbladder removed",
    "pancreas normal spleen okay",
    "kidneys no hydronephrosis",
    "mild diverticular disease no obstruction",
    "no free air no free fluid",
    "impression nothing acute",
  ];
}

function showResult(result) {
  reportOutput.textContent = result.report;
  providerStatus.textContent = result.provider ?? "Unknown";
  lastSyncStatus.textContent = new Date().toLocaleTimeString();
  lastGeneratedReport = result.report;
  if (!finalReportDirty) {
    finalReportInput.value = result.report;
  }
  jsonOutput.textContent = JSON.stringify(result, null, 2);
  renderFlags(result.flags);
}

function schedulePrivacyRedaction() {
  window.clearTimeout(privacyTimer);
  const detections = detectPatientIdentifiers(dictationInput.value);

  if (detections.length === 0) {
    clearPrivacyNotice();
    return;
  }

  privacyNotice.hidden = false;
  privacyNotice.textContent = `Possible patient identifier detected (${detections
    .map((item) => item.category)
    .join(", ")}). Offending text will be redacted in 5 seconds.`;

  privacyTimer = window.setTimeout(() => {
    const redacted = redactPatientIdentifiers(dictationInput.value);
    if (redacted.redacted) {
      dictationInput.value = redacted.text;
      updateWordCount();
      render();
    }
    clearPrivacyNotice();
  }, 5000);
}

function clearPrivacyNotice() {
  window.clearTimeout(privacyTimer);
  privacyTimer = 0;
  privacyNotice.hidden = true;
  privacyNotice.textContent = "";
}

function renderFlags(flags) {
  flagList.replaceChildren();
  flagCount.textContent = String(flags.length);

  if (flags.length === 0) {
    const item = document.createElement("li");
    item.className = "empty";
    item.textContent = "No flags for this draft.";
    flagList.append(item);
    return;
  }

  for (const flag of flags) {
    const item = document.createElement("li");
    item.className = `flag-item flag-${flag.severity}`;
    item.textContent = `${flag.category}: ${flag.message}`;
    flagList.append(item);
  }
}

function markApiConnected() {
  apiStatus.textContent = "Connected";
}

function applyScenario(scenario) {
  finalReportDirty = false;

  if (scenario === "privacy") {
    templateSelect.value = "generic-report";
    dictationInput.value = "patient name jane smith dob 01/02/1950 indication cough technique chest xray findings lungs clear impression no acute disease";
    render();
    return;
  }

  if (scenario === "ctchest") {
    templateSelect.value = "ct-chest";
    dictationInput.value = samples.ctchest;
    render();
    return;
  }

  if (scenario === "ctpa") {
    templateSelect.value = "ctpa";
    dictationInput.value = samples.ctpa;
    render();
    return;
  }

  if (scenario === "mribrain") {
    templateSelect.value = "mri-brain";
    dictationInput.value = samples.mribrain;
    render();
    return;
  }

  if (scenario === "usabdo") {
    templateSelect.value = "us-abdomen";
    dictationInput.value = samples.usabdo;
    render();
    return;
  }

  if (scenario === "ambiguity") {
    templateSelect.value = "ct-abdomen-pelvis";
    dictationInput.value = samples.ambiguity;
    render();
    return;
  }

  if (scenario === "ctap") {
    templateSelect.value = "ct-abdomen-pelvis";
    dictationInput.value = samples.ctap;
    render();
    return;
  }

  templateSelect.value = "generic-report";
  dictationInput.value = samples.generic;
  render();
}

function splitSample(sample) {
  return sample
    .split(/\s+(?=(?:lungs|pleura|mediastinum|heart|bones|impression|pulmonary|brain|ventricles|diffusion|liver|gallbladder|bile|pancreas|spleen|kidneys|aorta)\b)/i)
    .filter(Boolean);
}

templateSelect.value = "generic-report";
dictationInput.value = samples.generic;
void refreshHealth();
window.setInterval(refreshHealth, 5000);
render();
