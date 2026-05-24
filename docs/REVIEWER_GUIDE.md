# Private Reviewer Guide

This guide is for trusted private reviewers evaluating RadVoice before TestFlight or clinical deployment.

## What RadVoice Is

RadVoice is a clinician-controlled radiology dictation, transcription, formatting, and text-transfer tool. It helps turn fragmented dictated observations into a structured draft report that the radiologist reviews, edits, approves, and copies into the RIS.

## What RadVoice Is Not

RadVoice is not intended to:

- accept patient identifiers
- store patient information
- interpret medical images or perform image interpretation
- make diagnoses or provide diagnostic recommendations
- recommend findings
- autonomously finalize reports
- submit reports directly to a RIS

This repository is not ready for clinical deployment. It is a private local evaluation build.

## Run The Web And Backend Demo

From `C:\Claude\RadVoice`:

```powershell
.\scripts\start-demo.ps1
```

Open:

```text
http://localhost:5173
```

Run:

```powershell
& 'C:\Users\PC\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\smoke-demo.mjs
```

Expected result:

- API shows connected.
- Formatter shows OpenAI or local fallback.
- Scenario buttons populate draft reports.
- Final report copy is disabled until approval.
- Privacy scenarios block copy while critical privacy flags are present.

## Test The iPhone Flow

Simulator:

1. Start the demo.
2. Open the web app and click `New Session`.
3. Run the iPhone app in Xcode.
4. Keep API URL as `http://localhost:8787`.
5. Enter the web pairing code and tap `Join`.
6. Send a manual fragment and confirm the web app updates.
7. Record a short speech fragment, stop, and confirm it appears once.

Physical iPhone:

1. Set `API_HOST=0.0.0.0` in `.env`.
2. Restart the demo.
3. Set the iPhone API URL to `http://<computer-lan-ip>:8787`.
4. Use only a trusted LAN and stop the server after review.

## Safety And Privacy Controls To Inspect

- No-PHI wording is visible in the web app.
- Targeted privacy redaction removes only offending text.
- Backend redacts identifiers before session storage.
- Copy is blocked until the final report is approved.
- Copy is blocked while critical privacy flags are present.
- Generated drafts are tracked in revision history.
- New drafts and manual edits clear approval.
- Consistency, laterality, measurement, comparison, and unsupported-text flags are visible.
- API defaults to local-only binding and allowlisted CORS.
- In-memory sessions expire automatically.

## Known Non-Production Gaps

- No production authentication.
- No persistent encrypted storage.
- No TLS deployment.
- No formal HIPAA, Privacy Act, or TGA review.
- No App Store/TestFlight metadata package.
- No direct RIS integration.
- No Xcode build artifact is committed.

## Reviewer Feedback To Capture

- Does the workflow match radiology dictation habits?
- Is the no-PHI boundary clear enough?
- Are safety flags helpful without becoming noisy?
- Is approval-before-copy understandable?
- Does iPhone pairing feel reliable enough for a demo?
- Which templates or phrase preferences would make the next version more convincing?
