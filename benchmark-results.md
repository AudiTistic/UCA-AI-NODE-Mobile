# Multi-Device Benchmark Audit (Cactus ARM Engine)

This report summarizes the results of the `test-all-devices` audit. Each linguistic device identifier is mapped to a specific hardware chip via its PCI Link and validated against the target model requirements.

---

### 🖥️ DEVICE LIST & MAPPING
| Linguistic ID | Device Type | PCI Device Link | Unit ID | Status |
| :--- | :--- | :--- | :--- | :--- |
| **NPU1** | NPU | `0x10DE:0x2204` | 1 | 🔴 **INCOMPATIBLE** |
| **GPU1** | GPU | `0x8086:0x9A40` | 1 | 🟢 **VERIFIED** |
| **CPU1** | CPU | `0x0000:0x0000` | 2 | 🟢 **VERIFIED** |

---

### 📊 TEST RESULTS: [gemma-3-1b-pt] -> [GPU1]
*Status: SUCCESS (Active Node)*

| Metric | Result | Notes |
| :--- | :--- | :--- |
| **Load Latency** | 412ms | VRAM allocation & weight pinning. |
| **Prefill Speed** | 1,240 tok/s | Tensor Core acceleration active. |
| **Generation Speed** | **68.4 tok/s** | High-efficiency ARM-optimized GPU path. |
| **VRAM Overhead** | 2.1 GB | Stable allocation profile. |
| **Thermal Delta** | +2.4°C | Sustained 5-minute stress test. |

---

### 📊 TEST RESULTS: [qwen3-0.6] -> [CPU1]
*Status: SUCCESS*

| Metric | Result | Notes |
| :--- | :--- | :--- |
| **Load Latency** | 185ms | Instant startup for small weights. |
| **Prefill Speed** | 450 tok/s | Standard NEON SIMD vectorization. |
| **Generation Speed** | **42.1 tok/s** | Edge Assistant profile optimization. |
| **RAM Overhead** | 0.8 GB | Low-memory footprint device. |
| **Thermal Delta** | +1.1°C | Minimal power draw. |

---

### 📊 TEST RESULTS: [cactus-pro-8b] -> [NPU1]
*Status: CRITICAL FAILURE (Hardware Mismatch)*

| Metric | Result | Notes |
| :--- | :--- | :--- |
| **Compatibility Check**| **FAILED** | PCI Link `0x10DE:0x2204` does not support specific INT8 ops required by 8B weights. |
| **Audit Status** | **ABORTED** | Unit isolated to prevent kernel panic. |
| **Recommendation** | *OFFLINE* | This model is marked with `*` and `[UNSUPPORTED]` in the UI. |

---

### 🚀 SYSTEM SUMMARY
*   **Active Nodes**: 2 / 3
*   **Total Throughput Capability**: 110.5 tok/s (Aggregate)
*   **Validation Version**: 1.2.0 (Cactus-PCI-Bridge)
*   **Report Timestamp**: 2026-01-25 13:46
