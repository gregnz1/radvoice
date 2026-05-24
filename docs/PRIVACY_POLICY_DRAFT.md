# Privacy Policy Draft

This is a draft for private TestFlight preparation. It is not legal advice and must be reviewed before clinical deployment, commercial supply, or public App Store distribution.

## Product Boundary

RadVoice is a clinician-controlled radiology dictation, transcription, formatting, and text-transfer tool for draft report text.

RadVoice does not intentionally collect patient identifiers, store patient information, interpret medical images, make diagnoses, provide diagnostic recommendations, autonomously finalize reports, or submit reports directly to a RIS.

## Information The App Is Intended To Process

During private evaluation, RadVoice may process:

- dictated report fragments entered by the user
- generated draft report text
- report template selection
- temporary session and pairing identifiers
- app and backend status needed to run the local demo

Users must not enter patient names, dates of birth, medical record numbers, accession numbers, addresses, phone numbers, email addresses, or other patient-identifying information.

## Local Demo Processing

The local demo runs on the evaluator's own computer and uses temporary in-memory sessions. The API binds to the local computer by default. Physical iPhone LAN testing requires explicit local-network mode and should be used only on a trusted network.

In the local demo, sessions expire automatically and are not written to a persistent database.

## LLM Processing

OpenAI-backed formatting is optional. If enabled, dictated text sent to the backend may be sent to the configured model provider for report formatting. If OpenAI is disabled or unavailable, RadVoice uses the local rule formatter.

Before enabling any hosted model provider for real clinical use, data handling, retention, privacy, and contractual terms must be formally reviewed.

## Patient Information Controls

RadVoice includes no-PHI workflow controls:

- visible instructions not to enter patient identifiers
- warning flags for obvious identifier patterns
- targeted redaction of likely identifiers
- backend redaction before formatting or temporary session storage
- copy blocking while critical privacy flags are present

These controls are safeguards, not permission to enter patient information.

## Retention And Deletion

The current local demo uses temporary in-memory sessions with automatic expiry. Persistent storage must remain disabled until retention and deletion controls are formally designed, implemented, and reviewed.

## Data Sale And Advertising

RadVoice does not sell user data. The private evaluation build does not include advertising.

## Support Contact Placeholder

Support contact: `support@example.invalid`

Replace this placeholder with a real support contact before TestFlight submission.

## Clinical Deployment Boundary

RadVoice is not ready for clinical deployment. Formal privacy, security, legal, and regulatory review is required before using RadVoice with patient information or in a production clinical workflow.
