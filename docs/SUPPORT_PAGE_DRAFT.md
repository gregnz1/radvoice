# Support Page Draft

This is draft support-page content for private TestFlight preparation. Replace placeholders before distribution.

## RadVoice Support

RadVoice is a private evaluation build for clinician-controlled radiology dictation, transcription, formatting, and draft report review.

Support contact: `support@example.invalid`

## What RadVoice Does

RadVoice helps a qualified radiologist or authorized clinical user dictate report fragments, format them into a draft report, review flags, approve final text, and manually copy that text into the RIS.

## What RadVoice Does Not Do

RadVoice does not accept patient identifiers, store patient information, interpret medical images, make diagnoses, provide diagnostic recommendations, autonomously finalize reports, or submit reports directly to a RIS.

RadVoice is not for emergencies, urgent clinical communication, diagnosis, image interpretation, or autonomous reporting.

## Private Evaluation Setup

1. Start the local demo backend and web app.
2. Open the web app and create a session.
3. Join the session from the iPhone app using the pairing code.
4. Send manual or speech fragments.
5. Review, edit, approve, and copy the final draft text manually.

## Troubleshooting

- If templates do not load, confirm the API URL is correct and the backend is running.
- If a physical iPhone cannot connect, confirm `API_HOST=0.0.0.0` is enabled only on a trusted LAN.
- If recording is disabled, join a web-created pairing code first.
- If speech does not start, grant microphone and speech recognition permissions in iOS Settings.
- If sending fails, unsent text should remain visible for retry.
- If privacy flags appear, remove the offending identifier text before approving or copying.

## Privacy And Safety Summary

- Do not enter patient names, dates of birth, medical record numbers, accession numbers, addresses, phone numbers, email addresses, or free-text identifiers.
- Generated reports are draft text only.
- Clinician review and explicit final approval are required before copy.
- Privacy flags block copy.
- Safety flags are workflow warnings, not clinical recommendations.

## Clinical Deployment Boundary

This private evaluation build is not ready for clinical deployment. Formal privacy, security, legal, and regulatory review is required before clinical or commercial use.
