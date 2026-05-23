# RadVoice API

This service exposes the formatter API boundary used by the web app.

The current implementation uses the local rule-based formatter from the web demo. This keeps the endpoint runnable without API keys while preserving the shape needed for an LLM formatter.

## Run

```powershell
cd C:\Claude\RadVoice\services\api
node .\src\server.js
```

The API listens on:

```text
http://localhost:8787
```

## Endpoints

## `GET /health`

Returns service health.

## `GET /templates`

Returns available report templates.

## `POST /format`

Request:

```json
{
  "templateId": "ct-abdomen-pelvis",
  "text": "ct abdomen liver fine gallbladder removed impression nothing acute"
}
```

Response:

```json
{
  "templateId": "ct-abdomen-pelvis",
  "findings": {},
  "impression": "",
  "flags": [],
  "report": "",
  "provider": "local-rule-engine",
  "generatedAt": "2026-05-23T00:00:00.000Z"
}
```

