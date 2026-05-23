import { formatDictation } from "./formatter.js";
import { samples, templates } from "./templates.js";

const API_BASE = "http://localhost:8787";
const templateSelect = document.querySelector("#templateSelect");
const dictationInput = document.querySelector("#dictationInput");
const reportOutput = document.querySelector("#reportOutput");
const jsonOutput = document.querySelector("#jsonOutput");
const flagList = document.querySelector("#flagList");
const flagCount = document.querySelector("#flagCount");
const wordCount = document.querySelector("#wordCount");
const sessionId = document.querySelector("#sessionId");
const pairingCode = document.querySelector("#pairingCode");
const formatButton = document.querySelector("#formatButton");
const clearButton = document.querySelector("#clearButton");
const copyButton = document.querySelector("#copyButton");
const newSessionButton = document.querySelector("#newSessionButton");
const mockStreamButton = document.querySelector("#mockStreamButton");

let activeSessionId = "";
let streamTimer = 0;

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
  activeSessionId = "";
  sessionId.textContent = "No session";
  pairingCode.textContent = "----";
  stopMockStream();
  render();
});

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(reportOutput.textContent);
  copyButton.textContent = "Copied";
  setTimeout(() => {
    copyButton.textContent = "Copy";
  }, 1200);
});

document.querySelectorAll(".sample").forEach((button) => {
  button.addEventListener("click", () => {
    dictationInput.value = samples[button.dataset.sample] ?? "";
    if (button.dataset.sample === "cthead") templateSelect.value = "ct-head";
    if (button.dataset.sample === "cxr") templateSelect.value = "chest-xray";
    if (button.dataset.sample === "ctap") templateSelect.value = "ct-abdomen-pelvis";
    render();
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
    const response = await fetch(`${API_BASE}/format`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        templateId: getTemplate().id,
        text: dictationInput.value,
      }),
    });

    if (!response.ok) throw new Error(`Formatter API returned ${response.status}`);

    const result = await response.json();
    showResult(result);
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

  if (clearText) dictationInput.value = "";

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
    body: JSON.stringify({ source: "iphone-mock", text }),
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
  showSessionIdentity(session);
  dictationInput.value = session.segments.map((segment) => segment.text).join(" ");
  updateWordCount();
  showResult({
    ...session.draft,
    provider: "session-api",
    sessionId: session.id,
    segmentCount: session.segments.length,
    updatedAt: session.updatedAt,
  });
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
  jsonOutput.textContent = JSON.stringify(result, null, 2);
  renderFlags(result.flags);
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

dictationInput.value = samples.ctap;
render();
