# AI-Mobile-Host — OPERATIONS.md

## 1. Startup & Discovery
1. Init Flutter Engine.
2. Call `AIVR_Core_Init` (C++).
3. Start mDNS Browse.
4. If PC found: Perform SECURE Handshake.
5. Else: Wait for "Cloud Proxy" or retry local scan.

## 2. Background Persistence
- Uses native "Foreground Services" on Android to keep the Wi-Fi socket open.
- iOS uses "Background Fetch" or "Push" triggers.

## 3. Monitoring
- App Dashboard: Shows link status, PC load, and active agents.
- Log: `Documents/logs/mobile_host.log`.

## 4. Disaster Recovery
If PC connection is lost:
1. Cache latest sensor data.
2. Notify user "PC Offline".
3. Disable real-time tracking to save battery.

## 5. Security & Isolation
- The app stores NO session data in plain text; all tokens are in the TEE/Keystore.

## 6. Resource Limits
- Max sensor rate: 100Hz.
- Max download bitrate (audio): 256kbps.

## 7. Deployment Environment
- Production builds are signed and obfuscated.
- Distributed via internal APK or TestFlight.

## 8. Log Management
- Mobile logs are synced to the PC Host whenever a stable Wi-Fi connection is established.

## 9. Update Procedure
1. App Store / Play Store update.
2. Hot-patch of C++ library via "Dynamic Loading" (if version-compatible).

## 10. Power Profile
- **Active:** 100% CPU on 1 core for C++ bus.
- **Sleep:** Polling every 60s for mDNS heartbeat.
