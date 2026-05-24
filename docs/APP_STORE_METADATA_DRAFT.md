# App Store Metadata Draft

This draft is for private TestFlight preparation. It is not public App Store copy and must be reviewed before submission.

## App Name

RadVoice

## Subtitle

Radiology dictation draft formatter

## Short Description

RadVoice helps qualified radiologists and authorized clinical users capture dictated report fragments, format them into draft radiology reports, review safety/privacy flags, approve final text, and manually copy into the RIS.

## Product Positioning

Use:

- clinician-controlled dictation
- transcription and report formatting
- draft report review
- final approval before copy
- no patient identifiers

Avoid:

- diagnosis
- image interpretation
- finding detection
- triage
- clinical decision support
- autonomous reporting
- direct RIS submission
- claims that RadVoice catches missed findings

## Keywords Draft

radiology, dictation, transcription, reporting, report draft, clinician workflow, speech, formatting

## Private TestFlight Reviewer Notes

```text
RadVoice is a private evaluation build for clinician-controlled radiology dictation and report-formatting workflow testing. It does not interpret medical images, make diagnoses, recommend findings, autonomously finalize reports, collect patient identifiers, or submit to a RIS.

To test the app, run the local demo backend from the private repository, open the web review interface, create a session, and enter the displayed pairing code in the iPhone app. The reviewer can then send a manual fragment, mock stream, or speech fragment and observe the draft report update in the web interface.

All generated report text is draft text only. Clinician review and explicit final approval are required before copy.
```

## Screenshots Needed

- iPhone API/session pairing screen
- iPhone recording controls with draft-only/no-PHI context visible
- Web live transcript and generated draft
- Web final approval and copy-disabled state
- Web privacy flag copy block
- Web revision history

## App Privacy Notes Draft

- Patient identifiers: not intentionally collected
- Health information: not intentionally collected in private evaluation
- Audio: used locally by Apple Speech for dictation capture during testing
- User content: dictated draft report fragments may be processed by the configured backend/model provider during evaluation
- Data sale: none
- Advertising: none

Final App Privacy answers must match the actual TestFlight backend and model-provider configuration.

## Support And Privacy URLs

- Privacy policy URL: `https://example.invalid/radvoice/privacy`
- Support URL: `https://example.invalid/radvoice/support`

Replace these placeholders before TestFlight submission.
