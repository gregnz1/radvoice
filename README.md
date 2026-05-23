# RadVoice

RadVoice is a clinician-controlled radiology dictation system for turning fragmented spoken observations into consistent draft reports.

The product pairs an iPhone dictation app with a synced web interface. The iPhone acts as a microphone and workflow controller. The web app shows the live transcript, structured report draft, quality flags, and copy-ready output for the RIS.

## Product Principles

- Dictation should match how radiologists actually think: fragmented, iterative, and case-driven.
- The LLM formats and checks. It does not invent findings.
- The raw transcript remains visible and auditable.
- The radiologist stays in control of the final report.
- Copy/paste into RIS is the first integration target; direct RIS writeback is deliberately out of scope for the MVP.

## MVP

- iPhone recording with pause/resume.
- Near-live speech transcription.
- Synced report session shared with web.
- Template selection by study type.
- LLM conversion from raw transcript to structured report draft.
- Ambiguity and consistency flags.
- Web editing and one-click copy.
- Local phrase/template configuration.

## Repository Structure

```text
apps/
  ios/                 SwiftUI iPhone app
  web/                 Web report workspace
services/
  api/                 Backend API, auth, sync, LLM orchestration
packages/
  prompts/             Shared report prompts, schemas, templates
docs/
  PRODUCT.md           Product vision and workflows
  ARCHITECTURE.md      System design
  REPORTING_PIPELINE.md Dictation-to-report pipeline
  SAFETY_PRIVACY.md    Clinical safety and privacy notes
  ROADMAP.md           Build plan
```

## Current Status

This repository currently contains the planning and documentation spine for the project. Implementation can start from the roadmap in [docs/ROADMAP.md](docs/ROADMAP.md).

