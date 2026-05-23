# RadVoice API

This service exposes the formatter API boundary used by the web app.

The formatter uses OpenAI when `LLM_ENABLED=true` and `OPENAI_API_KEY` is configured. If OpenAI is disabled or unavailable, it falls back to the local rule-based formatter.

## Run

```powershell
cd C:\Claude\RadVoice\services\api
node .\src\server.js
```

The API listens on:

```text
http://localhost:8787
```

## LLM Configuration

Create `C:\Claude\RadVoice\.env` or set environment variables:

```text
LLM_ENABLED=true
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4.1-mini
```

Leave `LLM_ENABLED=false` to use the local rule formatter.

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

## `POST /sessions`

Creates an in-memory report session with a short pairing code.

Request:

```json
{
  "templateId": "ct-head"
}
```

## `GET /sessions/:id`

Returns the report session, transcript segments, and latest draft.

## `GET /sessions/pair/:code`

Returns the report session associated with a short pairing code.

## `POST /sessions/:id/segments`

Appends a transcript segment and regenerates the draft.

Request:

```json
{
  "source": "iphone",
  "text": "ct head no bleed no mass effect"
}
```

The in-memory store is for local prototype work only. Persistent sync will move to the database layer.

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
