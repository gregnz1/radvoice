# RadVoice Demo Script

## Start

From `C:\Claude\RadVoice`:

```powershell
.\scripts\start-demo.ps1
```

Open:

```text
http://localhost:5173
```

Optional smoke test:

```powershell
& 'C:\Users\PC\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\smoke-demo.mjs
```

## Presenter Flow

1. Point out the status strip:
   - API connected
   - formatter provider
   - polling state
   - last sync time
2. Click `Generic Report`.
3. Show raw dictation becoming a structured draft.
4. Edit the `Final Report` panel.
5. Click `Copy Final`.
6. Click `New Session`.
7. Show the six-character pairing code.
8. Click `Mock iPhone`.
9. Show transcript fragments and the report updating.
10. Click `Privacy Guardrail`.
11. Show the critical privacy flag.
12. Type or paste a phrase such as `patient name Jane Smith dob 01/02/1950 indication cough`.
13. Show the warning, then the targeted redaction after 5 seconds.

## Notes

- No patient identifiers should be entered during real use.
- The current demo uses in-memory sessions.
- OpenAI formatting is optional. If it is disabled or unavailable, the local rule formatter is used.
