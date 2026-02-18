# AI-Mobile-Host — API_SPEC.md

## 1. Flutter-to-C++ (FFI) Interface

### `AIVR_Core_Init`
- **Params:** `{ "mesh_id": string, "log_path": string }`
- **Returns:** `int` Status.

### `AIVR_Core_Send_Sensor`
- **Params:** `{ "type": string, "values": float[] }`
- **Action:** Packages data into a Relay packet and emits it.

## 2. Platform Channel API (Native)

### `method: getBiometricAuth`
- **Output:** `{ "token": string, "error": string }`
- **Description:** Invokes Android BiometricPrompt or iOS LocalAuthentication.

### `method: startBackgroundService`
- **Description:** Keeps the Mesh thread alive when the app is minimized.

## 3. Remote Control Interface (REST/WS)
- `GET /api/remote/status`: Hub state for mobile visualization.
- `POST /api/remote/agent`: Commands an agent from the mobile UI.

## 4. Notification Hooks
- `method: pushNotification`: Receives security or task alerts from the Orchestrator.

## 5. Health & Battery
- `GET /health`: Mobile-specific metrics; includes `battery_level` and `signal_strength`.

## 6. Image Upload API
- `POST /api/upload/photo`: Directly uploads a camera snapshot to `AI-Codex` for analysis.

## 7. QR Handshake
- `method: scanHubQR`: Parses the Hub's connection string and auto-configures the Mesh service.

## 8. Error Codes (Mobile-Specific)
- `ERR_PLATFORM_CHANNEL_TIMEOUT`: Native side didn't respond.
- `ERR_PERMISSION_DENIED`: Camera/GPS permission missing.
- `ERR_MESH_LOST`: LAN connection dropped.

## 9. Packet Headers
Standard Axon `0xACE1` framing.

## 10. Authentication
Uses a `Mobile-Device-Secret` stored in the Android Keystore / iOS Keychain.
