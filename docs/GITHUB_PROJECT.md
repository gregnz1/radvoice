# GitHub Project Setup

## Suggested Repository Name

`radvoice`

## Suggested Description

LLM-assisted radiology dictation for fragmented speech, structured draft reports, and synced web review.

## Suggested Labels

- `clinical-safety`
- `dictation`
- `frontend`
- `ios`
- `backend`
- `llm`
- `sync`
- `templates`
- `privacy`
- `documentation`
- `good-first-issue`

## Milestones

## Milestone 1: Web Formatting Demo

Goal: prove the report-generation loop in the browser.

Issues:

- Build basic web report workspace.
- Add fragmented dictation input.
- Add report template selector.
- Create formatter API contract.
- Display raw transcript, draft report, and quality flags.
- Add copy-ready final report panel.

## Milestone 2: Realtime Sync

Goal: support a live session shared across devices.

Issues:

- Define report session schema.
- Add transcript segment persistence.
- Add draft revision persistence.
- Add realtime subscriptions.
- Show active session state on web.

## Milestone 3: iPhone Dictation MVP

Goal: use the iPhone as the dictation source.

Issues:

- Create SwiftUI recording screen.
- Add pause/resume/stop controls.
- Integrate speech transcription.
- Pair iPhone session with web session.
- Stream transcript segments to backend.

## Milestone 4: Radiology Intelligence

Goal: make the app report like a radiology tool, not a generic summarizer.

Issues:

- Add CT abdomen/pelvis template.
- Add CT head template.
- Add chest x-ray template.
- Add phrase preference library.
- Add impression-generation rules.
- Add ambiguity flags.

## Milestone 5: Safety Hardening

Goal: reduce clinically meaningful reporting errors.

Issues:

- Add laterality consistency checker.
- Add measurement consistency checker.
- Add unsupported-claim detector.
- Add findings/impression consistency checker.
- Add report revision history.
- Add final approval state.

## First GitHub Project Board Columns

- Backlog
- Ready
- In Progress
- Review
- Done

