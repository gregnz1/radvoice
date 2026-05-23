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
- Copy button copies the edited final report.
- Active session polling for iPhone/web sync.
- Live session creation.
- Short pairing code display for the iPhone client.
- Mock iPhone transcript streaming into the backend.
- Quality flags for laterality, measurement, contradiction, and unsupported text.
- Privacy flag for obvious patient identifiers.
- Copy-ready report output.
- JSON formatter contract preview.
