# TestFlight Readiness Checklist

This checklist prepares RadVoice for private TestFlight evaluation. It is not public App Store submission guidance and is not legal or regulatory advice.

## Product Positioning

- [x] App name, subtitle, and screenshot checklist describe dictation, transcription, formatting, and draft report review only.
- [x] App metadata draft avoids diagnostic, image interpretation, triage, clinical decision support, or autonomous reporting claims.
- [x] Reviewer notes draft states that RadVoice is draft text only and clinician review is required.
- [x] Intended user is limited to qualified radiologists or authorized clinical users.
- [ ] App text states not to enter patient identifiers.

## Apple Developer Setup

- [ ] Apple Developer Program account is active.
- [ ] Bundle ID is created.
- [ ] Signing team is configured in Xcode.
- [ ] App icon and launch screen are present.
- [ ] Build number and version number are set.
- [ ] Microphone and speech recognition permission strings are present.
- [ ] Local HTTP exception is removed or narrowed before external TestFlight unless using a controlled development build.

## Privacy And Support

- [ ] Privacy policy URL exists.
- [ ] Support URL exists.
- [x] Privacy policy draft explains what is collected, what is not collected, processing location, retention, deletion, and support contact.
- [x] App Privacy draft notes match current intended behavior.
- [ ] No patient identifiers are intentionally collected.
- [ ] No raw dictation or generated reports are logged.
- [ ] Any future persistence has retention and deletion controls before release.

## Demo Backend

- [ ] Backend deployment target is chosen for TestFlight.
- [ ] API uses HTTPS for any network outside local development.
- [ ] Authentication or invitation gating is defined before external testers use it.
- [ ] CORS is allowlisted.
- [ ] Session expiry is enabled.
- [ ] OpenAI or private model data handling is reviewed.
- [ ] No secrets are stored in the repository.

## iPhone Build Verification

- [x] Xcode project skeleton is committed.
- [ ] Xcode project builds on a Mac.
- [ ] App loads templates from the configured API.
- [ ] Pairing code joins a web session.
- [ ] Manual fragment sends successfully.
- [ ] Mock stream sends repeated fragments.
- [ ] Apple Speech permission flow works.
- [ ] Pause/resume/stop does not duplicate fragments.
- [ ] Failed API sends keep unsent text visible.

## Current Xcode Project Settings

- Project: `apps/ios/RadVoice.xcodeproj`
- Scheme: `RadVoice`
- Bundle identifier: `com.radvoice.demo`
- Version: `0.1.0`
- Build: `1`
- Deployment target: iOS `17.0`
- Signing team: intentionally blank for local/private configuration
- Info plist: `apps/ios/RadVoiceApp/Info.plist`

Mac verification command:

```bash
cd apps/ios
xcodebuild -project RadVoice.xcodeproj -scheme RadVoice -destination 'platform=iOS Simulator,name=iPhone 15' build
```

This command has not been run in the Windows workspace.

## TestFlight Draft Materials

- Privacy policy draft: [PRIVACY_POLICY_DRAFT.md](PRIVACY_POLICY_DRAFT.md)
- Support page draft: [SUPPORT_PAGE_DRAFT.md](SUPPORT_PAGE_DRAFT.md)
- App metadata draft: [APP_STORE_METADATA_DRAFT.md](APP_STORE_METADATA_DRAFT.md)

## Safety Review

- [ ] Draft-only language is visible.
- [ ] Final copy requires explicit approval.
- [ ] Privacy flags block copy.
- [ ] Targeted redaction works.
- [ ] Raw transcript remains visible.
- [ ] Revision history is visible.
- [ ] Safety flags are warnings, not clinical recommendations.
- [ ] Formal legal/regulatory review is scheduled before clinical deployment or commercial supply.

## TestFlight Submission Notes

Suggested reviewer note:

```text
RadVoice is a private evaluation build for clinician-controlled radiology dictation and report-formatting workflow testing. It does not interpret images, make diagnoses, recommend findings, autonomously finalize reports, collect patient identifiers, or submit to a RIS. The reviewer can use the demo backend instructions in the repository to pair the iPhone app with the web review interface.
```
