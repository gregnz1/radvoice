# RadVoice iPhone App

This folder contains the SwiftUI source for the iPhone dictation client.

The first version is designed to be added to a fresh Xcode iOS App project named `RadVoice`. It talks to the local RadVoice API and can send simulated dictated fragments into a live report session.

## Create The Xcode Project

1. Open Xcode.
2. Choose `File > New > Project`.
3. Choose `iOS > App`.
4. Product Name: `RadVoice`.
5. Interface: `SwiftUI`.
6. Language: `Swift`.
7. Save it under:

```text
C:\Claude\RadVoice\apps\ios
```

8. Replace the generated Swift files with the files in `RadVoiceApp/`.
9. In the Xcode target, make sure all files in `RadVoiceApp/` are included in target membership.
10. Open the app target `Info.plist` and add the keys from `Info-development.plist.snippet`.

## Development Networking

The local prototype API uses plain HTTP. Add the contents of `Info-development.plist.snippet` to the app target's `Info.plist` for development builds.

Do not ship a production app with broad arbitrary HTTP loads enabled.

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

## Next iPhone Work

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
