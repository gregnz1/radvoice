import { formatDictation } from "./formatter.js";
import { samples, templates } from "./templates.js";

const templateSelect = document.querySelector("#templateSelect");
const dictationInput = document.querySelector("#dictationInput");
const reportOutput = document.querySelector("#reportOutput");
const jsonOutput = document.querySelector("#jsonOutput");
const flagList = document.querySelector("#flagList");
const flagCount = document.querySelector("#flagCount");
const wordCount = document.querySelector("#wordCount");
const formatButton = document.querySelector("#formatButton");
const clearButton = document.querySelector("#clearButton");
const copyButton = document.querySelector("#copyButton");

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

clearButton.addEventListener("click", () => {
  dictationInput.value = "";
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
    const response = await fetch("http://localhost:8787/format", {
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
