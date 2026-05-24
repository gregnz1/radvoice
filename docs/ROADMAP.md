# Roadmap

## Phase 0: Project Spine

- Create product documentation.
- Define data model.
- Define report pipeline.
- Define safety rules.
- Set up GitHub project labels and issue templates.

## Phase 1: Local Prototype

- [x] Build web report workspace.
- [x] Add mock iPhone transcript stream.
- [x] Add template selector.
- [x] Add generic fallback report template.
- [x] Add formatter API boundary.
- [x] Display raw transcript and formatted draft side by side.
- [x] Add copy button.
- [x] Add OpenAI formatter provider with local fallback.

## Phase 2: iPhone Dictation MVP

- [x] SwiftUI app scaffold.
- [x] Session pairing by short code.
- [x] SwiftUI recording screen.
- [x] Speech-to-text integration scaffold.
- Session pairing with web.
- [x] Pause/resume/stop controls.
- [x] Live transcript sync scaffold.

## Phase 3: Radiology Formatting

- [x] CT abdomen/pelvis template.
- [x] CT head template.
- [x] Chest x-ray template.
- [x] CT chest template.
- [x] CT pulmonary angiogram template.
- [x] MRI brain template.
- [x] Ultrasound abdomen template.
- [x] Personal phrase library.
- [x] Impression generator baseline.
- [x] Ambiguity flags.

## Phase 4: Safety And QA

- [x] Laterality checker.
- [x] Measurement checker.
- [x] Findings/impression consistency checker.
- [x] Unsupported claim detector.
- [x] Revision history.
- [x] Final approval state.
- [x] Strict privacy copy blocking.

## Phase 5: Clinical Hardening

- Authentication.
- Encryption and retention settings.
- Deployment documentation.
- Institutional review checklist.
- Optional private model endpoint.

## First Build Target

The first useful demo should be a web app that accepts typed or pasted fragmented dictation, formats it into a radiology report, shows flags, and provides a copy-ready output panel.
