# RadVoice

RadVoice is a clinician-controlled radiology dictation, transcription, formatting, and text-transfer tool for turning fragmented spoken observations into consistent draft reports.

The product pairs an iPhone dictation app with a synced web interface. The iPhone acts as a microphone and workflow controller. The web app shows the live transcript, structured draft report, quality flags, revision history, final approval state, and copy-ready text for manual RIS paste.

RadVoice does not accept patient identifiers, store patient information, interpret medical images, make diagnoses, recommend findings, autonomously finalize reports, or submit reports directly to a RIS.

## Repository Status

This is a private proprietary project. Do not publish, mirror, or open-source this repository without explicit owner approval.

Current status:

- Local web/backend demo is runnable with one command.
- OpenAI formatting is optional; local deterministic formatting remains the fallback.
- iPhone SwiftUI source supports pairing, manual fragments, mock stream, and Apple Speech scaffold.
- Backend defaults are local-only with opt-in LAN mode for physical iPhone testing.
- This is not ready for clinical deployment or public App Store submission.

## Quick Start

From the repository root:

```powershell
.\scripts\start-demo.ps1
```

Open:

```text
http://localhost:5173
```

Run the smoke test:

```powershell
& 'C:\Users\PC\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\smoke-demo.mjs
```

The demo starts the API on `127.0.0.1:8787` by default and the web app on `localhost:5173`.

## Optional OpenAI Formatting

The app works without API keys. To enable OpenAI-backed formatting, create `C:\Claude\RadVoice\.env`:

```text
LLM_ENABLED=true
OPENAI_API_KEY=your_api_key
LLM_MODEL=gpt-4.1-mini
```

If OpenAI is disabled, missing, or unavailable, the backend falls back to the local rule formatter.

## Physical iPhone Demo

For simulator testing, keep the iPhone app API URL as:

```text
http://localhost:8787
```

For a physical iPhone on a trusted LAN:

1. Set `API_HOST=0.0.0.0` in `.env`.
2. Restart `.\scripts\start-demo.ps1`.
3. Set the iPhone app API URL to `http://<computer-lan-ip>:8787`.
4. Stop the server when the demo is finished.

LAN mode is for local demos only. It is not production security.

## Product Principles

- Dictation should match how radiologists actually think: fragmented, iterative, and case-driven.
- The LLM formats and checks dictated text; it must not invent findings.
- The raw transcript remains visible and auditable.
- The radiologist stays in control of the final report.
- Patient identifiers are not accepted.
- Copy/paste into RIS is the first integration target; direct RIS writeback is deliberately out of scope for the MVP.

## Repository Structure

```text
apps/
  ios/                 SwiftUI iPhone app
  web/                 Web report workspace
services/
  api/                 Backend API, session sync, LLM orchestration
packages/
  prompts/             Shared report prompts, schemas, templates
docs/
  REVIEWER_GUIDE.md    Private reviewer walkthrough
  TESTFLIGHT_READINESS.md TestFlight preparation checklist
  PRODUCT.md           Product vision and workflows
  ARCHITECTURE.md      System design
  REPORTING_PIPELINE.md Dictation-to-report pipeline
  SAFETY_PRIVACY.md    Clinical safety and privacy notes
  ROADMAP.md           Build plan
```

## Current Limitations

- No production authentication or user management.
- No persistent report/session database.
- No direct RIS integration.
- No production TLS/deployment configuration.
- No App Store/TestFlight bundle metadata yet.
- Xcode project creation/build verification is still manual.
- Formal privacy, security, legal, and regulatory review is still required before clinical deployment.

## Reviewer Links

- Guided demo: [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)
- Private reviewer guide: [docs/REVIEWER_GUIDE.md](docs/REVIEWER_GUIDE.md)
- TestFlight checklist: [docs/TESTFLIGHT_READINESS.md](docs/TESTFLIGHT_READINESS.md)
- Intended use: [docs/compliance/INTENDED_USE.md](docs/compliance/INTENDED_USE.md)
- No patient information policy: [docs/compliance/NO_PHI_POLICY.md](docs/compliance/NO_PHI_POLICY.md)
