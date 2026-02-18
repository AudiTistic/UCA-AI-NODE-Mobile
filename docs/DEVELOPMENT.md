# AI-Mobile-Host — DEVELOPMENT.md

## 1. Technical Stack
- **UI:** Flutter (Dart).
- **Core Logic:** C++20 (AIVR-Core).
- **Native Bridge:** MethodChannels (Method-based), FFI (Performance data).
- **Build Tool:** `flutter_build` + `CMake`.

## 2. Building logic
```bash
cd d:/AIVR/AIVR-AI-Mobile-Host
# For Android
flutter build apk --release
# For iOS (Requires Mac/CocoaPods)
flutter build ios --release
```

## 3. Core Class Structure (Dart)
- `MeshService`: Manages connectivity state.
- `SensorStreamer`: Polling logic for IMU/GPS.
- `IdentityPortal`: UI for login and tier viewing.
- `NativeBridge`: Static class for MethodChannel calls.

## 4. Implementing a new Native Feature
1. Add method to `NativeBridge.dart`.
2. Implement listener in `MainActivity.java` (Android) and `AppDelegate.mm` (iOS).
3. Connect native code to the C++ AIVR-Core library handles.

## 5. Dependencies
- **Flutter:** `provider`, `ffi`, `sensors_plus`, `local_auth`.
- **C++:** Same as AIVR-Core (Boost, MessagePack).

## 6. Performance Checklist
- Are sensor events throttled to < 100Hz?
- Is the C++ networking thread running on a separate platform thread to avoid UI jank?
- Is image compression active for camera uploads?

## 7. Mocking the Hub on Mobile
Use `-Duse_mock_hub=true` in Flutter build args to test the UI without a physical PC.

## 8. Debugging
- Use `adb logcat | grep AIVR` for Android native logs.
- Use `flutter logs` for Dart-specific errors.

## 9. Coding Standards
- No business logic in Dart; keep it UI-only.
- All sensitive tokens must be wiped from memory after the native handshake.

## 10. Versioning
Sync `pubspec.yaml` version with the `AIVR-Core` version in `CMakeLists.txt`.
