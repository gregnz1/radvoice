# No Patient Information Policy

RadVoice is designed as a no-PHI prototype and should not accept patient-identifying information.

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
- Logs should not contain dictated text.
- Sessions should be treated as temporary.
- Persistent storage must remain disabled until retention and deletion controls are implemented.

## Future Strict Mode

Strict mode should block sync/copy when obvious identifiers are detected.
