import { formatDictation } from "../../../apps/web/src/formatter.js";

const DEFAULT_MODEL = "gpt-4.1-mini";
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";

export async function formatReport(text, template) {
  const localResult = formatDictation(text, template);

  if (!shouldUseLLM()) {
    return withMetadata(localResult, "local-rule-engine");
  }

  try {
    const llmResult = await formatWithOpenAI(text, template, localResult);
    return withMetadata(
      {
        ...llmResult,
        flags: mergeFlags(localResult.flags, llmResult.flags),
      },
      "openai-responses",
    );
  } catch (error) {
    return withMetadata(localResult, "local-rule-engine", {
      fallbackReason: error instanceof Error ? error.message : "OpenAI formatter failed.",
    });
  }
}

function shouldUseLLM() {
  return (
    process.env.LLM_ENABLED === "true" &&
    typeof process.env.OPENAI_API_KEY === "string" &&
    process.env.OPENAI_API_KEY.trim().length > 0
  );
}

async function formatWithOpenAI(text, template, localResult) {
  const response = await fetch(`${process.env.OPENAI_BASE_URL ?? DEFAULT_OPENAI_BASE_URL}/responses`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL || DEFAULT_MODEL,
      instructions: buildInstructions(),
      input: buildInput(text, template, localResult),
      text: {
        format: {
          type: "json_schema",
          name: "radvoice_report",
          strict: true,
          schema: responseSchema(),
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI returned ${response.status}.`);
  }

  const payload = await response.json();
  const outputText = extractOutputText(payload);
  const parsed = JSON.parse(outputText);

  return normalizeLLMResult(parsed, template);
}

function buildInstructions() {
  return [
    "You format radiology dictation into draft report text only.",
    "Do not interpret images, diagnose, recommend findings, or add findings not dictated.",
    "Do not accept or preserve patient identifiers. If identifiers appear, include a critical privacy flag.",
    "Use the provided template. If generic, use Indication, Technique, Findings, and Impression.",
    "Preserve dictated negation, laterality, and measurements exactly.",
    "If information is unclear, flag uncertainty instead of guessing.",
    "Return only JSON matching the supplied schema.",
  ].join(" ");
}

function buildInput(text, template, localResult) {
  return JSON.stringify(
    {
      template,
      dictatedText: text,
      localGuardrailFlags: localResult.flags,
      localFallbackDraft: localResult.report,
      noPhiPolicy: "Patient identifiers are not accepted.",
    },
    null,
    2,
  );
}

function responseSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["findings", "impression", "flags", "report"],
    properties: {
      findings: {
        type: "object",
        additionalProperties: {
          type: "array",
          items: { type: "string" },
        },
      },
      impression: { type: "string" },
      flags: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["severity", "category", "message"],
          properties: {
            severity: { type: "string", enum: ["info", "warning", "critical"] },
            category: { type: "string" },
            message: { type: "string" },
          },
        },
      },
      report: { type: "string" },
    },
  };
}

function extractOutputText(payload) {
  if (typeof payload.output_text === "string") return payload.output_text;

  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  throw new Error("OpenAI response did not contain output text.");
}

function normalizeLLMResult(result, template) {
  const findings = result.findings && typeof result.findings === "object" ? result.findings : {};

  return {
    templateId: template.id,
    findings,
    impression: typeof result.impression === "string" ? result.impression : "",
    flags: Array.isArray(result.flags) ? result.flags.map(normalizeFlag).filter(Boolean) : [],
    report: typeof result.report === "string" ? result.report : "",
  };
}

function normalizeFlag(flag) {
  if (!flag || typeof flag !== "object") return null;

  return {
    severity: ["info", "warning", "critical"].includes(flag.severity) ? flag.severity : "warning",
    category: String(flag.category ?? "llm"),
    message: String(flag.message ?? "Formatter flag."),
  };
}

function mergeFlags(localFlags, llmFlags) {
  const merged = [];
  const seen = new Set();

  for (const flag of [...localFlags, ...llmFlags]) {
    const key = `${flag.severity}:${flag.category}:${flag.message}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(flag);
    }
  }

  return merged;
}

function withMetadata(result, provider, extra = {}) {
  return {
    ...result,
    provider,
    generatedAt: new Date().toISOString(),
    ...extra,
  };
}
