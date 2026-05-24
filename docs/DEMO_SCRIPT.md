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
5. Show that `Copy Final` is disabled until `Approve Final` is clicked.
6. Click `Approve Final`, then show `Copy Final` becoming available.
7. Click `New Session`.
8. Show the six-character pairing code.
9. Click `Mock iPhone`.
10. Show transcript fragments, report updates, and revision count changes.
11. Restore a prior generated draft from `Revision History` and point out that this clears approval.
12. Click `Privacy Copy Block`.
13. Show the critical privacy flag and blocked copy state.
14. Show the targeted redaction after 5 seconds, then re-approve once the privacy flag clears.
15. Click `Consistency Warning`.
16. Show the warning flag for a finding/impression mismatch.

## Notes

- No patient identifiers should be entered during real use.
- The current demo uses in-memory sessions.
- OpenAI formatting is optional. If it is disabled or unavailable, the local rule formatter is used.
