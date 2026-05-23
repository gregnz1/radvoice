const rules = [
  {
    section: "Liver",
    patterns: [/liver (fine|normal|ok|okay|unremarkable)/i],
    text: "Unremarkable.",
  },
  {
    section: "Gallbladder",
    patterns: [/gallbladder (removed|absent)/i, /cholecystectomy/i],
    text: "Surgically absent.",
  },
  {
    section: "Pancreas",
    patterns: [/pancreas (fine|normal|ok|okay|unremarkable)/i],
    text: "Unremarkable.",
  },
  {
    section: "Spleen",
    patterns: [/spleen (fine|normal|ok|okay|unremarkable)/i],
    text: "Unremarkable.",
  },
  {
    section: "Kidneys",
    patterns: [/no hydronephrosis/i],
    text: "No hydronephrosis.",
  },
  {
    section: "Bowel",
    patterns: [/mild diverticular/i, /mild colonic diverticul/i],
    text: "Mild colonic diverticulosis.",
  },
  {
    section: "Bowel",
    patterns: [/no obstruction/i, /no bowel obstruction/i],
    text: "No bowel obstruction.",
  },
  {
    section: "Peritoneum",
    patterns: [/no free air/i],
    text: "No free intraperitoneal air.",
  },
  {
    section: "Peritoneum",
    patterns: [/no free fluid/i],
    text: "No free fluid.",
  },
  {
    section: "Bones",
    patterns: [/no aggressive (osseous )?lesion/i],
    text: "No aggressive osseous lesion.",
  },
  {
    section: "Brain",
    patterns: [/no bleed/i, /no hemorrhage/i],
    text: "No acute intracranial hemorrhage.",
  },
  {
    section: "Brain",
    patterns: [/no mass effect/i],
    text: "No mass effect.",
  },
  {
    section: "Brain",
    patterns: [/chronic small vessel/i, /microangiopath/i],
    text: "Chronic small vessel ischemic change.",
  },
  {
    section: "Ventricles",
    patterns: [/ventricles normal/i],
    text: "Ventricular size is within normal limits.",
  },
  {
    section: "Calvarium",
    patterns: [/no skull fracture/i],
    text: "No calvarial fracture.",
  },
  {
    section: "Paranasal sinuses",
    patterns: [/sinuses clear/i],
    text: "Clear where imaged.",
  },
  {
    section: "Cardiomediastinal silhouette",
    patterns: [/heart size normal/i, /cardiomediastinal (silhouette )?normal/i],
    text: "Cardiomediastinal silhouette is not enlarged.",
  },
  {
    section: "Lungs",
    patterns: [/lungs clear/i],
    text: "Clear lungs.",
  },
  {
    section: "Pleura",
    patterns: [/no pleural effusion/i],
    text: "No pleural effusion.",
  },
  {
    section: "Pleura",
    patterns: [/no pneumothorax/i],
    text: "No pneumothorax.",
  },
  {
    section: "Bones",
    patterns: [/no acute osseous abnormality/i],
    text: "No acute osseous abnormality.",
  },
];

const findingTerms = [
  "mass",
  "lesion",
  "nodule",
  "fracture",
  "hemorrhage",
  "bleed",
  "collection",
  "abscess",
  "appendicitis",
  "obstruction",
  "pneumothorax",
  "effusion",
];

const lateralityTerms = ["left", "right", "bilateral"];

export function formatDictation(input, template) {
  const normalized = normalize(input);
  const sectionFindings = new Map(template.sections.map((section) => [section, []]));

  for (const rule of rules) {
    if (!sectionFindings.has(rule.section)) continue;

    if (rule.patterns.some((pattern) => pattern.test(normalized))) {
      addUnique(sectionFindings.get(rule.section), rule.text);
    }
  }

  const flags = buildFlags(normalized, sectionFindings);
  const impression = buildImpression(normalized, template, sectionFindings);
  const report = buildReport(template, sectionFindings, impression, flags);

  return {
    templateId: template.id,
    findings: Object.fromEntries(sectionFindings),
    impression,
    flags,
    report,
  };
}

function normalize(input) {
  return input
    .replace(/[.,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function addUnique(items, value) {
  if (!items.includes(value)) items.push(value);
}

function buildImpression(text, template, sectionFindings) {
  if (/\b(nothing acute|no acute|normal)\b/i.test(text)) {
    return template.normalImpression;
  }

  const positives = [];

  for (const findings of sectionFindings.values()) {
    for (const finding of findings) {
      if (!finding.toLowerCase().startsWith("no ")) positives.push(finding);
    }
  }

  if (positives.length > 0) return positives.slice(0, 3).join(" ");

  return "No acute abnormality identified on this draft.";
}

function buildFlags(text, sectionFindings) {
  const flags = [];
  const hasLaterality = lateralityTerms.some((term) => text.includes(term));
  const hasMeasure = /\b\d+(\.\d+)?\s*(mm|cm)\b/i.test(text);
  const mentionsFinding = findingTerms.some((term) => text.includes(term));

  if (mentionsFinding && !hasLaterality) {
    flags.push({
      severity: "warning",
      category: "laterality",
      message: "A potentially localizable finding is mentioned without clear laterality.",
    });
  }

  if (mentionsFinding && !hasMeasure && /\b(mass|lesion|nodule|collection)\b/i.test(text)) {
    flags.push({
      severity: "warning",
      category: "measurement",
      message: "A measurable finding may need a size.",
    });
  }

  if (/\b(no|without)\b.*\b(fracture|bleed|hemorrhage|pneumothorax)\b/i.test(text) && /\b(fracture|bleed|hemorrhage|pneumothorax)\b.*\bpresent\b/i.test(text)) {
    flags.push({
      severity: "critical",
      category: "contradiction",
      message: "Possible contradiction involving a negated and positive acute finding.",
    });
  }

  const anyFindings = Array.from(sectionFindings.values()).some((items) => items.length > 0);
  if (text.length > 0 && !anyFindings) {
    flags.push({
      severity: "warning",
      category: "unsupported",
      message: "No local rule matched this dictation. An LLM formatter should preserve the text and flag uncertainty.",
    });
  }

  return flags;
}

function buildReport(template, sectionFindings, impression, flags) {
  const lines = [template.title, "", "Findings:"];

  for (const [section, findings] of sectionFindings.entries()) {
    if (findings.length > 0) {
      lines.push(`${section}: ${findings.join(" ")}`);
    }
  }

  if (lines.length === 3) {
    lines.push("No structured findings generated from the current dictation.");
  }

  lines.push("", "Impression:", impression);

  if (flags.length > 0) {
    lines.push("", "Draft Flags:");
    for (const flag of flags) {
      lines.push(`[${flag.severity.toUpperCase()}] ${flag.message}`);
    }
  }

  return lines.join("\n");
}

