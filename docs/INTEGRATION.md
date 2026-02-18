# AI-Mobile-Host — INTEGRATION.md

## 1. Integration: AI-Orchestrator (The Controller)
The Mobile Host acts as a "Secondary Input" for the Orchestrator. Remote agent commands are sent from Flutter -> Orchestrator.

## 2. Integration: App-Wifi-Mesh (Connectivity)
The mobile app is the primary "Satellite Node". It uses the C++ discovery engine to find the PC on Wi-Fi.

## 3. Integration: Service-Relay (Audio/Video Feed)
Mobile Host receives Opus audio streams from the Relay for "Agent Voice" playback on the phone speaker.

## 4. Integration: AI-Intel-Host (Biometric Auth)
Flutter calls the native biometric prompt, and the resulting cryptographic proof is passed to Intel-Host via the Mesh link for system unlocking.

## 5. Integration: AIVR Hub (Visual Sync)
Any setting changed in the Mobile UI is instantly synced to the Hub Dashboard via the WebSocket bus.

## 6. Integration: Rules of Harmony (Presence Rule)
Enforces the **Rule of Proximity**: "Sensory data is only valid if the node is within the trusted Mesh perimeter."

## 7. Integration: Service-OAuth (Social Account)
Mobile app uses the OIDC redirect flow to Patreon to ensure the user's tier is verified on the mobile device.

## 8. Flutter FFI Integration
The `libaivr_core.so` (Android) or `AIVRCore.framework` (iOS) is linked at build time and invoked via the Dart `ffi` library.

## 9. AIVR-VR-FBT (Mobile Tracking)
The phone can be used as a "Torsos Tracker" in VR by utilizing its IMU data piped through the Mobile Host to the FBT service.

## 10. Remote Logs
Mobile app logs are synced to the PC Host's `/archived/mobile/` folder periodically for debug purposes.
