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

## Current Features

- Select report template.
- Create a backend report session.
- Send dictated fragments.
- Send a mock CT abdomen/pelvis fragment stream.
- Show live transcript fragments.
- Show backend-generated draft report.
- Show quality flags.

## Next iPhone Work

- Add Apple Speech framework transcription.
- Add microphone permission flow.
- Stream partial transcript segments while recording.
- Add pause/resume/stop controls.
- Add session pairing with the web app.

## Manual Test

1. Start the API:

```powershell
cd C:\Claude\RadVoice\services\api
node .\src\server.js
```

2. Run the iOS app in the simulator.
3. Tap `New Session`.
4. Tap `Mock iPhone`.
5. Confirm the transcript and draft report populate.
