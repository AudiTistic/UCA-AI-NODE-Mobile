# AI-Mobile-Host — TROUBLESHOOTING.md

## 1. "Host PC Not Found"
- **Cause:** Phone is on a different Wi-Fi subnet or mDNS is blocked.
- **Fix:** Ensure both devices are on 2.4/5GHz of the same router; restart mDNS in Hub Settings.

## 2. "Authentication Failed"
- **Cause:** QR Code was scanned with a stale hub key.
- **Fix:** Regenerate QR code in Hub Dashboard and re-scan.

## 3. Laggy Sensor Data in VR
- **Cause:** Interference on Wi-Fi or "Power Saving" mode active.
- **Fix:** Disable Battery Saver; move closer to router; check `jitter` in Mesh Tab.

## 4. App Crashes on Startup
- **Cause:** C++ library (`libaivr_core.so`) missing or incompatible ABI.
- **Fix:** Re-install the app version matching the PC Host version.

## 5. Biometric Auth Fails
- **Cause:** Fingerprint not registered with the OS or sensor dirty.
- **Fix:** Unlock phone once with PIN to reset OS auth state.

## 6. No Audio from Agents
- **Cause:** Volume muted in app or `Service-Relay` blocking mobile subscriber.
- **Fix:** Check Media Volume; verify "Mobile Audio" toggle is ON in Hub.

## 7. Camera cannot focus / Black screen
- **Cause:** Permission denied or camera hardware busy.
- **Fix:** Grant Camera Permission in App Info; close other camera apps (e.g. TikTok/Snapchat).

## 8. "Background Service Killed"
- **Cause:** Android OOM Killer.
- **Fix:** Change AIVR battery setting to "Unrestricted".

## 9. GPS drift
- **Cause:** Indoor interference.
- **Fix:** Use Wi-Fi assist for location.

## 10. "Port 12000 Conflict" (Rare)
- **Cause:** Another mesh satellite running on the same hardware ID.
- **Fix:** Reset App Data.
