# AI-Mobile-Host — SECURITY.md

## 1. Device Handshake Security
Mobile devices are "Privileged Satellites". Security measures:
- **Challenge-Response:** PC sends a nonce -> Mobile signs with its Keystore-private-key.

## 2. Encrypted Sensor Streams
All IMU and GPS data is encrypted via the Mesh P2P tunnel (AES-256).

## 3. Biometric Verification
We rely on native OS-hardened biometrics. The AIVR app never sees your raw fingerprint or face data.

## 4. Keychain/Keystore Protection
All OAuth tokens and session keys are stored in the device's **Hardware-backed Secure Element**.

## 5. Network Sandboxing
The Mobile Host only attempts connections to the identified PC Host IP and the authorized AIVR Hub cloud proxy.

## 6. PII Masking
If the mobile app displays logs, all emails and keys are masked locally before rendering on the screen.

## 7. Audit Logging
Every mobile connection attempt and biome-auth success is logged in the central security vault on the PC.

## 8. Code Obfuscation
The Flutter app and C++ core are obfuscated (`--obfuscate`) during release builds to prevent reverse engineering of the Axon protocol.

## 9. Remote Lockout
The Hub Admin can "Revoke Device" immediately, causing the Mobile Host to wipe its local cache and log out.

## 10. SSL Pinning
Mobile-to-Cloud communication uses SSL Pinning to prevent man-in-the-middle attacks on the OIDC flow.
