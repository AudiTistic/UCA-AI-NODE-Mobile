#include <spdlog/spdlog.h>
#include <nlohmann/json.hpp>

extern "C" {
    // FFI entry point for Flutter
    __declspec(dllexport) const char* get_mobile_status() {
        return "AIVR Mobile Backend (C++ Native) Active";
    }

    __declspec(dllexport) void initialize_mobile_service() {
        spdlog::info("Mobile Host Service initializing...");
    }
}
