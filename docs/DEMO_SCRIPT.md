# RadVoice Demo Script

Product boundary: draft only; no patient identifiers; clinician review required; no image interpretation; no diagnosis or recommendations; no RIS submission.

## Start

From `C:\Claude\RadVoice`:

```powershell
.\scripts\start-demo.ps1
```

Open:

```text
http://localhost:5173
```

For LAN API testing, use:

```text
http://localhost:5173/?api=http://<computer-lan-ip>:8787
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

## iPhone Demo

1. Start the demo with `.\scripts\start-demo.ps1`.
2. Open `http://localhost:5173`.
3. Click `New Session` and read out the six-character pairing code.
4. Run the iPhone app in Xcode.
5. Use `http://localhost:8787` in the simulator, or `http://<computer-lan-ip>:8787` on a physical iPhone.
6. Enter the pairing code and tap `Join`.
7. Send a manual fragment first, such as `lungs clear no pleural effusion impression no acute cardiopulmonary abnormality`.
8. Confirm the web transcript and generated draft update automatically.
9. Tap `Record`, grant microphone and speech permissions, speak a short fragment, then tap `Stop`.
10. Confirm the speech fragment appears once in the web session.
11. If speech permissions or simulator audio are awkward, use manual fragment entry or `Mock iPhone`.

For a physical iPhone, set `API_HOST=0.0.0.0` in `.env` before starting the demo. Use this only on a trusted network and stop the server after the walkthrough.

## Notes

- No patient identifiers should be entered during real use.
- The current demo uses in-memory sessions.
- OpenAI formatting is optional. If it is disabled or unavailable, the local rule formatter is used.
