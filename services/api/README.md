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
http://127.0.0.1:8787
```

By default the API is local-only. For a physical iPhone demo on a trusted LAN, set `API_HOST=0.0.0.0`, update the iPhone API URL to `http://<computer-lan-ip>:8787`, and stop the server after the demo.

## Local Security Configuration

Create `C:\Claude\RadVoice\.env` or set environment variables:

```text
API_PORT=8787
API_HOST=127.0.0.1
CORS_ORIGINS=http://localhost:5173
SESSION_TTL_MS=3600000
LOG_LEVEL=minimal
```

- `API_HOST=127.0.0.1` keeps the API on this computer only.
- `API_HOST=0.0.0.0` exposes the API to the local network for physical iPhone testing.
- `CORS_ORIGINS` is a comma-separated allowlist.
- `SESSION_TTL_MS` controls in-memory session expiry.
- `LOG_LEVEL=silent` suppresses startup logs. Raw dictation and reports are not logged.

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

Returns service health, non-secret LLM/network configuration state, active in-memory session count, and session TTL.

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

The in-memory store is for local prototype work only. Sessions expire automatically and persistent sync will move to the database layer.

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
