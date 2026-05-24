# Safety And Privacy

## Clinical Safety Position

RadVoice generates draft reports only. The radiologist must review and approve all output before use in the RIS.

RadVoice is positioned as a dictation, transcription, formatting, and text-transfer tool. It is not intended to interpret images, make diagnoses, recommend findings, autonomously finalize reports, or submit reports directly to a RIS.

RadVoice should not accept patient identifiers or store patient information.

## Safety Requirements

- Show raw transcript alongside generated draft.
- Keep generated report text editable.
- Require explicit final approval before copy.
- Clear approval whenever a generated draft changes or the final text is edited.
- Track recent generated draft revisions in the active browser session.
- Do not auto-submit to RIS.
- Do not accept patient identifiers.
- Block copy when a critical privacy flag is present.
- Do not invent normal findings unless explicitly permitted by a selected normal template.
- Flag uncertainty rather than resolving it silently.
- Highlight laterality, measurement, and contradiction risks.
- Keep an audit trail of transcript segments, draft revisions, and final edits.

## High-Risk Error Classes

- Left/right reversal.
- Incorrect lesion size.
- Incorrect modality or body part.
- Impression statement not supported by findings.
- Negated finding converted into positive finding.
- Positive finding omitted from impression when clinically important.
- Prior comparison date misstated.

## Privacy Requirements

- Minimize patient identifiers in the app.
- In the intended workflow, patient identifiers should not be entered at all.
- Prefer accession/session labels over patient names in MVP.
- Encrypt data in transit.
- Encrypt persisted report sessions.
- Add configurable retention and deletion.
- Support local or private-cloud deployment if patient data is included.

## Regulatory Note

This documentation is not legal or regulatory advice. Before clinical deployment, the project needs formal review for local privacy law, institutional policy, medical device implications, and vendor risk requirements.
