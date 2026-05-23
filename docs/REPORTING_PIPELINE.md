# Reporting Pipeline

## Layers

RadVoice should keep three separate text layers.

## 1. Raw Transcript

The raw transcript is the closest available representation of what was spoken. It should not be silently overwritten by the LLM.

Example:

```text
ct abdomen pelvis contrast liver fine gallbladder removed pancreas ok mild diverticular disease no obstruction no free air impression nothing acute
```

## 2. Structured Draft

The structured draft is the LLM-formatted report.

```text
CT ABDOMEN AND PELVIS WITH CONTRAST

Findings:
Liver: Unremarkable.
Gallbladder: Surgically absent.
Pancreas: Unremarkable.
Bowel: Mild colonic diverticulosis. No bowel obstruction.
Peritoneum: No free intraperitoneal air.

Impression:
No acute intra-abdominal or pelvic abnormality.
```

## 3. Final Report Text

The final report text is the clinician-approved version copied into the RIS.

## Update Strategy

- Transcription updates continuously.
- Draft formatting runs every few seconds during active dictation.
- Final polish runs on pause, stop, or manual request.
- Quality checks run whenever a new draft is produced.

## Voice Commands

Voice commands should be parsed before report formatting.

Examples:

- "new impression"
- "replace mild with moderate"
- "delete last sentence"
- "normal CT head"
- "add comparison CT from March fifth"
- "make impression shorter"
- "flag this for follow up"

## Prompt Contract

The formatter prompt must require:

- no invented findings
- preserve laterality and measurements exactly
- flag uncertainty instead of guessing
- keep findings and impression consistent
- use the selected template style
- return machine-readable flags

## Example Formatter Output

```json
{
  "findings": "Liver: Unremarkable.\nGallbladder: Surgically absent.",
  "impression": "No acute intra-abdominal or pelvic abnormality.",
  "quality_flags": [],
  "unresolved_questions": [],
  "unsupported_claims": []
}
```

