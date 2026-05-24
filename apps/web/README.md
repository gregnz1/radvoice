# RadVoice Web Demo

This is the first local prototype for the report workspace.

It runs as a static app and currently uses a rule-based formatter so it works without API keys or network access. The formatter is intentionally separated in `src/formatter.js` so it can later be replaced by a backend LLM endpoint.

## Run

Start the optional backend formatter API:

```powershell
cd C:\Claude\RadVoice\services\api
node .\src\server.js
```

Then start the web app:

```powershell
cd C:\Claude\RadVoice\apps\web
python -m http.server 5173
```

Then open:

```text
http://localhost:5173
```

## Current Features

- Template selector.
- Generic fallback report format with Indication, Technique, Findings, and Impression.
- Fragmented dictation input.
- Visible no-patient-identifiers and draft-only positioning.
- Formatter API integration with browser-local fallback.
- Editable final report panel.
- Approval-gated copy workflow for the edited final report.
- Strict privacy copy block when identifier flags are present.
- Recent generated draft revision history with intentional restore.
- Active session polling for iPhone/web sync.
- Demo health status strip.
- Guided demo scenarios for generic report, CT abdomen/pelvis, and privacy guardrail.
- Additional radiology scenarios for CT chest, CTPA, MRI brain, ultrasound abdomen, and ambiguity flags.
- Live session creation.
- Short pairing code display for the iPhone client.
- Mock iPhone transcript streaming into the backend.
- Quality flags for laterality, measurement, consistency, contradiction, and unsupported text.
- Privacy flag for obvious patient identifiers.
- Targeted patient identifier redaction after a short warning delay.
- Copy-ready report output.
- JSON formatter contract preview.
