# AI-Mobile-Host — SCHEMA.md

## 1. IMU Sensor Packet (JSON/MessagePack)
```json
{
  "timestamp": 123456789,
  "acc": [0.0, 9.81, 0.0],
  "gyro": [0.01, -0.02, 0.0],
  "mag": [45.1, 12.3, -8.0]
}
```

## 2. GPS Location Schema
| Field | Type | Description |
|---|---|---|
| `lat` | `double` | Latitude |
| `lng` | `double` | Longitude |
| `alt` | `float` | Altitude (meters) |

## 3. Mobile UI Configuration
```json
{
  "active_tabs": ["agents", "mesh", "settings"],
  "theme": "AIVR_NEON_BLUE",
  "haptic_feedback": true
}
```

## 4. Biometric Handshake Object
- `device_id`: `string`
- `auth_timestamp`: `uint64`
- `sig`: `ECDSA_P256`

## 5. Device Capabilities Bitmask
- `CAP_GPS = 0x01`
- `CAP_IMU = 0x02`
- `CAP_CAM = 0x04`
- `CAP_MIC = 0x08`

## 6. Performance Telemetry (Mobile)
- `frame_latency_ms`: `float`
- `socket_dropped`: `int`
- `memory_mb`: `int`

## 7. Push Message Schema
- `title`: `string`
- `body`: `string`
- `severity`: `enum`

## 8. FFI Data Mapping
- `Dart_Handle` -> `C_Struct` conversion logic.

## 9. Registry Entry (Mobile)
Cached info about the PC Host:
- `host_ip`: `string`
- `last_seen`: `uint64`
- `trust_score`: `int`

## 10. UUID Format (Device)
`dev:<hardware_hash_8>` (e.g., `dev:f1e2d3c4`).
