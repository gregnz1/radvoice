import { detectPatientIdentifiers } from "./privacy.js";

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
    section: "Mediastinum",
    patterns: [/no lymphadenopathy/i, /no mediastinal lymphadenopathy/i],
    text: "No lymphadenopathy.",
  },
  {
    section: "Heart",
    patterns: [/heart size normal/i, /cardiomediastinal (silhouette )?normal/i],
    text: "Heart size is not enlarged.",
  },
  {
    section: "Pulmonary arteries",
    patterns: [/no pulmonary embolus/i, /no pulmonary embolism/i, /no pe\b/i],
    text: "No pulmonary embolus.",
  },
  {
    section: "Bones",
    patterns: [/no acute osseous abnormality/i],
    text: "No acute osseous abnormality.",
  },
  {
    section: "Diffusion",
    patterns: [/no acute infarct/i, /no restricted diffusion/i],
    text: "No acute infarct.",
  },
  {
    section: "Extra-axial spaces",
    patterns: [/no extra axial collection/i, /no extra-axial collection/i],
    text: "No extra-axial collection.",
  },
  {
    section: "Biliary tree",
    patterns: [/bile ducts not dilated/i, /no biliary dilatation/i],
    text: "No biliary dilatation.",
  },
  {
    section: "Pancreas",
    patterns: [/pancreas obscured/i],
    text: "Obscured by bowel gas.",
  },
  {
    section: "Aorta",
    patterns: [/aorta normal/i, /no aortic aneurysm/i],
    text: "No abdominal aortic aneurysm.",
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
const siteTerms = [
  "renal",
  "kidney",
  "liver",
  "hepatic",
  "lung",
  "pulmonary",
  "adrenal",
  "ovarian",
  "adnexal",
  "pancreatic",
  "splenic",
  "bone",
  "osseous",
  "breast",
  "thyroid",
  "bowel",
  "colon",
  "brain",
];
const lateralityRequiredTerms = [
  "mass",
  "lesion",
  "nodule",
  "collection",
  "abscess",
  "appendicitis",
  "fracture",
];
const measurementRequiredTerms = ["mass", "lesion", "nodule", "collection"];
const consistencyTerms = [
  "mass",
  "lesion",
  "nodule",
  "fracture",
  "hemorrhage",
  "infarct",
  "embolus",
  "pneumothorax",
  "effusion",
  "obstruction",
  "collection",
  "abscess",
  "appendicitis",
];
export function formatDictation(input, template) {
  const normalized = normalize(input);
  const sectionFindings = new Map(template.sections.map((section) => [section, []]));
  const genericSections = template.generic ? extractGenericSections(normalized) : null;

  if (genericSections) {
    addUnique(sectionFindings.get("Indication"), genericSections.indication);
    addUnique(sectionFindings.get("Technique"), genericSections.technique);
    addUnique(sectionFindings.get("Findings"), genericSections.findings);
  } else {
    for (const rule of rules) {
      if (!sectionFindings.has(rule.section)) continue;

      if (rule.patterns.some((pattern) => pattern.test(normalized))) {
        addUnique(sectionFindings.get(rule.section), rule.text);
      }
    }
  }

  const impression = genericSections?.impression ?? buildImpression(normalized, template, sectionFindings);
  const flags = buildFlags(normalized, sectionFindings, template, genericSections, impression);
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
  if (!value) return;
  if (!items.includes(value)) items.push(value);
}

function extractGenericSections(text) {
  const dictatedImpression = cleanGenericSection(extractBetween(text, "impression", []));
  return {
    indication: cleanGenericSection(extractBetween(text, "indication", ["technique", "findings", "impression"])),
    technique: cleanGenericSection(extractBetween(text, "technique", ["findings", "impression"])),
    findings: cleanGenericSection(extractBetween(text, "findings", ["impression"])) || cleanGenericSection(text),
    impression: dictatedImpression || "No impression provided in dictation.",
    hasDictatedImpression: dictatedImpression.length > 0,
  };
}

function extractBetween(text, startLabel, endLabels) {
  const startMatch = new RegExp(`\\b${startLabel}\\b`, "i").exec(text);
  if (!startMatch) return "";

  const startIndex = startMatch.index + startMatch[0].length;
  let endIndex = text.length;

  for (const endLabel of endLabels) {
    const endMatch = new RegExp(`\\b${endLabel}\\b`, "i").exec(text.slice(startIndex));
    if (endMatch) {
      endIndex = Math.min(endIndex, startIndex + endMatch.index);
    }
  }

  return text.slice(startIndex, endIndex);
}

function cleanGenericSection(text) {
  const cleaned = text.trim();
  if (!cleaned) return "";
  return sentenceCase(cleaned);
}

function sentenceCase(text) {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`.replace(/\s+/g, " ");
}

function buildImpression(text, template, sectionFindings) {
  if (template.id === "ctpa" && /\b(no pulmonary embolus|no pulmonary embolism|no pe)\b/i.test(text)) {
    return template.normalImpression;
  }

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

function buildFlags(text, sectionFindings, template, genericSections, impression) {
  const flags = [];
  const hasLaterality = lateralityTerms.some((term) => text.includes(term));
  const hasMeasure = /\b\d+(\.\d+)?\s*(mm|cm)\b/i.test(text);
  const mentionsFinding = findingTerms.some((term) => text.includes(term));
  const hasPositiveLateralizableFinding = hasPositiveCandidate(text, lateralityRequiredTerms);
  const hasPositiveMeasurableFinding = hasPositiveCandidate(text, measurementRequiredTerms);
  const hasUnspecifiedSiteFinding = hasPositiveCandidate(text, ["mass", "lesion", "nodule"]) && !hasNearbySite(text);
  const hasComparisonWithoutDate = /\b(comparison|compared|prior|previous)\b/i.test(text) && !hasComparisonDate(text);
  const hasPossiblePatientIdentifier = detectPatientIdentifiers(text).length > 0;

  if (hasPossiblePatientIdentifier) {
    flags.push({
      severity: "critical",
      category: "privacy",
      message: "Possible patient identifier detected. RadVoice should not receive patient information.",
    });
  }

  if (hasPositiveLateralizableFinding && !hasLaterality) {
    flags.push({
      severity: "warning",
      category: "laterality",
      message: "A potentially localizable finding is mentioned without clear laterality.",
    });
  }

  if (hasPositiveMeasurableFinding && !hasMeasure) {
    flags.push({
      severity: "warning",
      category: "measurement",
      message: "A measurable finding may need a size.",
    });
  }

  if (hasUnspecifiedSiteFinding) {
    flags.push({
      severity: "warning",
      category: "site",
      message: "A lesion, mass, or nodule is mentioned without a clear organ or site.",
    });
  }

  if (hasComparisonWithoutDate) {
    flags.push({
      severity: "warning",
      category: "comparison",
      message: "A comparison is mentioned without a clear date or source.",
    });
  }

  if (template.generic && genericSections && !genericSections.hasDictatedImpression) {
    flags.push({
      severity: "warning",
      category: "impression",
      message: "No dictated impression was identified for this generic report.",
    });
  }

  addConsistencyFlags(flags, text, sectionFindings, impression);

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

function addConsistencyFlags(flags, sourceText, sectionFindings, impression) {
  const findingText = Array.from(sectionFindings.values()).flat().join(" ").toLowerCase();
  const impressionText = impression.toLowerCase();

  for (const term of consistencyTerms) {
    const findingPositive = hasPositiveCandidate(findingText, [term]);
    const impressionPositive = hasPositiveCandidate(impressionText, [term]);

    if (findingPositive && !impressionText.includes(term)) {
      flags.push({
        severity: "warning",
        category: "consistency",
        message: `A positive ${term} finding may be absent from the impression.`,
      });
    }

    if (impressionPositive && !findingText.includes(term)) {
      flags.push({
        severity: "warning",
        category: "consistency",
        message: `The impression mentions ${term}, but the generated findings may not support it.`,
      });
    }
  }

  if (hasLateralityMismatch(sourceText, findingText, impressionText)) {
    flags.push({
      severity: "warning",
      category: "laterality-mismatch",
      message: "Dictated laterality may not match the generated report laterality.",
    });
  }
}

function hasLateralityMismatch(sourceText, findingText, impressionText) {
  const findingsLeft = /\bleft\b/i.test(findingText);
  const findingsRight = /\bright\b/i.test(findingText);
  const impressionLeft = /\bleft\b/i.test(impressionText);
  const impressionRight = /\bright\b/i.test(impressionText);

  if ((findingsLeft && impressionRight) || (findingsRight && impressionLeft)) return true;

  const sourceLeft = /\bleft\b/i.test(sourceText);
  const sourceRight = /\bright\b/i.test(sourceText);
  const reportText = `${findingText} ${impressionText}`;
  const reportLeft = /\bleft\b/i.test(reportText);
  const reportRight = /\bright\b/i.test(reportText);

  return (sourceLeft && !sourceRight && reportRight && !reportLeft) || (sourceRight && !sourceLeft && reportLeft && !reportRight);
}

function hasNearbySite(text) {
  for (const term of ["mass", "lesion", "nodule"]) {
    const pattern = new RegExp(`\\b${term}\\b`, "gi");
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const surroundingText = text.slice(Math.max(0, match.index - 30), match.index + term.length + 30);
      if (siteTerms.some((site) => new RegExp(`\\b${site}\\b`, "i").test(surroundingText))) {
        return true;
      }
    }
  }

  return false;
}

function hasComparisonDate(text) {
  return (
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/.test(text) ||
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(text) ||
    /\b\d{4}\b/.test(text)
  );
}

function hasPositiveCandidate(text, terms) {
  for (const term of terms) {
    const pattern = new RegExp(`\\b${term}\\b`, "gi");
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const precedingText = text.slice(Math.max(0, match.index - 40), match.index);
      if (!/\b(no|without|absent|negative for|no evidence of)\b[\w\s-]{0,40}$/i.test(precedingText)) {
        return true;
      }
    }
  }

  return false;
}

function buildReport(template, sectionFindings, impression, flags) {
  if (template.generic) {
    return buildGenericReport(template, sectionFindings, impression, flags);
  }

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

function buildGenericReport(template, sectionFindings, impression, flags) {
  const lines = [template.title, ""];

  for (const [section, findings] of sectionFindings.entries()) {
    lines.push(`${section}:`);
    lines.push(findings.length > 0 ? findings.join(" ") : "Not specified.");
    lines.push("");
  }

  lines.push("Impression:", impression);

  if (flags.length > 0) {
    lines.push("", "Draft Flags:");
    for (const flag of flags) {
      lines.push(`[${flag.severity.toUpperCase()}] ${flag.message}`);
    }
  }

  return lines.join("\n");
}
