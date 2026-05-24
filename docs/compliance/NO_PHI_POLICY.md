# No Patient Information Policy

RadVoice is designed as a no-PHI private evaluation prototype for draft report text and should not accept patient-identifying information.

The intended user is a qualified radiologist or authorized clinical user creating their own draft report text.

RadVoice does not interpret medical images, make diagnoses, provide diagnostic recommendations, or submit reports directly to a RIS.

## Do Not Enter

- patient name
- date of birth
- medical record number
- accession number
- Medicare number
- address
- phone number
- email address
- free-text identifiers

## Technical Controls

- The UI states that patient identifiers should not be entered.
- The formatter flags obvious identifier patterns.
- The web app warns immediately when likely identifiers are typed.
- The web app redacts only the offending identifier text after a short delay.
- The backend redacts likely identifiers before formatting or storing session segments.
- Copy is blocked while critical privacy flags are present.
- Final report copy requires explicit approval.
- The API binds to the local computer by default.
- In-memory sessions expire automatically.
- Logs should not contain dictated text.
- Sessions should be treated as temporary.
- Persistent storage must remain disabled until retention and deletion controls are implemented.

## Clinical Deployment Boundary

This prototype is not ready for clinical deployment. Any workflow that stores, processes, transmits, or intentionally accepts patient information requires formal privacy, security, legal, and regulatory review before use.
