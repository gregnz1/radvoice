# RadVoice Web Demo

This is the first local prototype for the report workspace.

It runs as a static app and currently uses a rule-based formatter so it works without API keys or network access. The formatter is intentionally separated in `src/formatter.js` so it can later be replaced by a backend LLM endpoint.

## Run

From the repository root:

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
- Fragmented dictation input.
- Rule-based structured draft generation.
- Quality flags for laterality, measurement, contradiction, and unsupported text.
- Copy-ready report output.
- JSON formatter contract preview.

