const identifierMatchers = [
  {
    category: "patient-name",
    pattern: /\b(?:patient name|name is|patient is)\s+[a-z][a-z' -]{1,40}(?=\s+(?:dob|date of birth|mrn|ur|urn|accession|indication|technique|findings|impression|ct|mri|ultrasound|xray|x-ray)|$)/gi,
  },
  {
    category: "dob",
    pattern: /\b(?:dob|date of birth)\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/gi,
  },
  {
    category: "medical-record",
    pattern: /\b(?:mrn|medical record|ur number|urn)\s*[a-z0-9-]{4,}\b/gi,
  },
  {
    category: "accession",
    pattern: /\b(?:accession|acc number)\s*[a-z0-9-]{4,}\b/gi,
  },
  {
    category: "medicare",
    pattern: /\b(?:medicare number|medicare)\s*\d[\d\s-]{7,}\d\b/gi,
  },
  {
    category: "email",
    pattern: /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi,
  },
  {
    category: "phone",
    pattern: /\b(?:phone|mobile|tel)\s*\+?\d[\d\s().-]{7,}\d\b/gi,
  },
  {
    category: "long-id",
    pattern: /\b(?:id|number)\s*\d{6,}\b/gi,
  },
];

export function detectPatientIdentifiers(text) {
  const detections = [];

  for (const matcher of identifierMatchers) {
    for (const match of text.matchAll(matcher.pattern)) {
      detections.push({
        category: matcher.category,
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  return dedupeDetections(detections).sort((a, b) => a.start - b.start);
}

export function redactPatientIdentifiers(text) {
  const detections = detectPatientIdentifiers(text);
  if (detections.length === 0) {
    return { text, detections, redacted: false };
  }

  let redactedText = "";
  let cursor = 0;

  for (const detection of detections) {
    redactedText += text.slice(cursor, detection.start);
    redactedText += `[REDACTED ${detection.category.toUpperCase()}]`;
    cursor = detection.end;
  }

  redactedText += text.slice(cursor);

  return {
    text: redactedText.replace(/\s+/g, " ").trim(),
    detections,
    redacted: true,
  };
}

function dedupeDetections(detections) {
  const sorted = [...detections].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end;
  });
  const deduped = [];

  for (const detection of sorted) {
    const overlapsExisting = deduped.some(
      (existing) => detection.start < existing.end && detection.end > existing.start,
    );
    if (!overlapsExisting) deduped.push(detection);
  }

  return deduped;
}

