# RadVoice iPhone App

This folder contains the SwiftUI source for the iPhone dictation client.

The repo includes a lightweight Xcode project at `RadVoice.xcodeproj`. It talks to the local RadVoice API and can send manual, mock, and speech-recognition fragments into a live report session.

Product boundary: draft only; no patient identifiers; clinician review required; no image interpretation; no diagnosis or recommendations; no RIS submission.

RadVoice is for clinician-controlled draft report formatting only; it does not accept patient identifiers, interpret medical images, make diagnoses, recommend findings, or submit reports directly to a RIS.

## Open The Xcode Project

1. Open Xcode on a Mac.
2. Choose `File > Open`.
3. Open:

```text
apps/ios/RadVoice.xcodeproj
```

4. Select the `RadVoice` scheme.
5. Choose an iPhone simulator and run.

The project uses:

- Product name: `RadVoice`
- Bundle identifier: `com.radvoice.demo`
- Version: `0.1.0`
- Build: `1`
- iOS deployment target: `17.0`
- Signing team: blank, to be selected locally in Xcode if needed

## Permissions And Development Networking

The app target uses `RadVoiceApp/Info.plist`, which includes microphone, speech recognition, and local HTTP development permissions. `Info-development.plist.snippet` is retained as a reference.

Do not ship a production app with broad arbitrary HTTP loads enabled.

## Command Line Build Check

On a Mac with Xcode installed:

```bash
cd apps/ios
xcodebuild -project RadVoice.xcodeproj -scheme RadVoice -destination 'platform=iOS Simulator,name=iPhone 15' build
```

If that simulator name is unavailable, list installed simulators with:

```bash
xcrun simctl list devices available
```

## Local API URL

The app defaults to:

```text
http://localhost:8787
```

For an iPhone simulator, this usually works when the API is running on the same Mac. For a physical iPhone, use the computer's LAN IP address instead, for example:

```text
http://192.168.1.25:8787
```

Find the computer LAN IP on Windows with:

```powershell
ipconfig
```

Use the IPv4 address for the Wi-Fi or Ethernet adapter that is on the same network as the iPhone.

## Current Features

- Select report template.
- Create a backend report session.
- Join a web-created session by short pairing code.
- Record, pause, and stop native speech recognition.
- Send dictated fragments.
- Send a mock CT abdomen/pelvis fragment stream.
- Show live transcript fragments.
- Show backend-generated draft report.
- Show quality flags.
- Disable recording until the app has joined a web-created pairing code.
- Keep unsent manual or speech text visible if the API send fails.
- Block obvious patient identifiers before sending and keep the text visible for editing.

## Next iPhone Work

- Compile and verify this committed Xcode project on a Mac.
- Tune speech chunking behavior for real reporting cadence.
- Add QR pairing.
- Add offline/network retry handling.

## Simulator Demo Checklist

1. Start the full local demo from `C:\Claude\RadVoice`:

```powershell
.\scripts\start-demo.ps1
```

2. Open `http://localhost:5173` in the browser.
3. Click `New Session` in the web app and note the large pairing code.
4. Run the iOS app in the simulator.
5. Keep the API URL as `http://localhost:8787`.
6. Enter the pairing code and tap `Join`.
7. Type a manual fragment, tap `Send Fragment`, and confirm the web transcript/report update.
8. Tap `Record`, grant microphone and speech permissions, speak a short fragment, then tap `Stop`.
9. Confirm the spoken fragment appears in the web session without duplicates.

## Physical iPhone Demo Checklist

1. Start the demo with `.\scripts\start-demo.ps1`.
2. Make sure the iPhone and computer are on the same network.
3. Set `API_HOST=0.0.0.0` in `C:\Claude\RadVoice\.env`, then restart the demo.
4. Replace the API URL in the app with `http://<computer-lan-ip>:8787`.
5. Create a web session, enter its pairing code on the iPhone, and tap `Join`.
6. Send a manual fragment first to confirm networking.
7. Record a short speech fragment, stop, and confirm the web app updates.
8. Stop the demo server when finished.

## Troubleshooting

- If templates do not load, confirm the API is running and the API URL includes `http://` and port `8787`.
- If the simulator cannot connect, restart the demo script and keep the API URL as `http://localhost:8787`.
- If a physical iPhone cannot connect, check Windows firewall and confirm both devices are on the same LAN.
- If recording is disabled, create a web session, enter the pairing code, and tap `Join` first.
- If speech does not start, grant both microphone and speech recognition permissions in iOS Settings.
- If sending fails, the unsent text stays visible so it can be retried after fixing the API URL or network.
- If the app shows `Remove patient identifiers before sending.`, edit the fragment to remove obvious name, DOB, MRN, accession, email, or phone text.
