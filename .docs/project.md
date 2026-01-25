# Cactus OpenAI Server - Project Overview

## The Problem We Solve

### For Developers & Small Teams
Modern AI development requires running language models, but the options are limited:
- **Cloud APIs** are expensive, slow (network latency), and leak your data to third parties
- **Desktop inference** (Ollama, llama.cpp) ties up your workstation and burns through GPU/CPU cycles
- **Dedicated servers** cost hundreds of dollars per month and require DevOps expertise

Meanwhile, you probably have 2-5 idle Android phones sitting in a drawer, each with:
- 8-12GB RAM
- ARM CPUs optimized for mobile inference
- Always-on availability when plugged in
- Zero incremental cost

### The Gap
Nobody had built a **production-grade OpenAI-compatible server** that runs on Android phones using **Cactus's ARM-optimized kernels**. This project fills that gap.

## What Cactus OpenAI Server Does

Cactus OpenAI Server transforms any modern Android phone into a self-hosted, OpenAI-compatible inference endpoint that drops into existing AI toolchains with zero code changes.

### Core Value Propositions

1. **Drop-in OpenAI Compatibility**
   - Expose standard `/v1/chat/completions` and `/v1/models` endpoints
   - Works with n8n, LangChain, CrewAI, AutoGen, and any tool that supports custom OpenAI base URLs
   - No SDK wrappers, no custom clients—just change the `base_url`

2. **2-10× Faster Than Generic Solutions**
   - Cactus uses ARM-specific SIMD kernels and memory optimization
   - 16-75 tok/s depending on device (vs 3-8 tok/s with generic llama.cpp/Ollama on phones)
   - Optimized quantization (Q6_K, Q4_K_M) balances speed and quality

3. **True Multi-Device Architecture**
   - Run servers on 2-10 phones simultaneously
   - Client-side round-robin or intelligent routing based on phone availability
   - Horizontal scaling: add more phones = more throughput
   - Failover: if one phone dies, requests automatically go to others

4. **Zero Infrastructure Costs**
   - Use existing phones—no cloud bills, no new hardware
   - LAN-only by default (optionally expose via Tailscale/ngrok for remote access)
   - ~5W power draw per phone when idle, ~10W under load

5. **Privacy & Data Sovereignty**
   - All inference happens locally on your network
   - No data leaves your infrastructure
   - Perfect for sensitive workflows (customer data, proprietary code, medical/legal content)

## Target Use Cases

### 1. AI Automation Workflows (n8n, Make, Zapier)
Run complex multi-agent workflows without OpenAI API costs or rate limits:
- **Document processing**: Summarize PDFs, extract structured data, generate reports
- **Customer support**: Auto-triage tickets, draft responses, sentiment analysis
- **Content generation**: Blog posts, social media, product descriptions

### 2. Local Development & Testing
- Develop AI features without cloud API dependencies
- Fast iteration cycles (no network latency)
- Free unlimited usage for prototyping

### 3. Small Team "AI Clusters"
- 5-person startup deploys 3 phones as shared inference pool
- Each developer points their tools to the phone cluster
- ~100-200 tok/s aggregate throughput for $0/month

### 4. Edge AI / On-Premises Deployment
- Retail stores running inventory analysis locally
- Medical clinics processing patient notes without cloud upload
- Field operations where internet is unreliable

### 5. Learning & Experimentation
- Students learning LLM integration without API costs
- Hobbyists building agent systems
- Researchers testing prompt engineering techniques

## Key Features (Final Vision)

### Server Management
- **One-tap start/stop**: Launch inference server with a single button
- **Auto-discovery**: Broadcast server availability via mDNS for zero-config client setup
- **Health monitoring**: Real-time display of uptime, request count, tokens processed, current load
- **Wake lock management**: Keep phone awake during active inference, sleep when idle to save battery

### Model Management
- **Automatic model download**: First-run downloads optimized models (Qwen3-0.6B, Llama-3.2-1B, Phi-3-mini)
- **Model presets**: 
  - **Fast** (Q4_K_S, 0.5B-1B params): 50-75 tok/s, good for simple tasks
  - **Balanced** (Q6_K, 1B-3B params): 20-40 tok/s, best quality/speed ratio
  - **Quality** (Q8, 3B-7B params): 10-20 tok/s, maximum accuracy
- **Custom model support**: Load any GGUF via file picker or URL
- **Per-model settings**: Context length, temperature defaults, system prompts

### Network & Security
- **Flexible binding**: Listen on Wi-Fi, localhost-only, or specific interfaces
- **Optional API key authentication**: Simple bearer token for basic access control
- **HTTPS support**: Self-signed certs for encrypted LAN traffic
- **CORS configuration**: Enable/disable cross-origin requests for web apps

### Performance Tuning
- **Thread control**: 1-8 threads (default: CPU cores - 1)
- **Context length limits**: 512-8192 tokens (default: 2048)
- **Batch size tuning**: 128-512 tokens per batch
- **Power profiles**:
  - **Max Performance**: No throttling, maximum speed, high battery drain
  - **Balanced**: Moderate throttling, good speed, reasonable power
  - **Eco**: Aggressive throttling, slower but cool and efficient

### Telemetry & Analytics
- **Basic metrics**: Requests per minute, average latency, tokens per second
- **Error tracking**: Failed requests, timeout rates, OOM events
- **Device stats**: CPU temp, battery level, memory usage
- **Optional cloud sync**: Send anonymized metrics to Cactus telemetry for performance insights

### Developer Experience
- **Built-in test harness**: Send sample requests directly from the app
- **Request/response inspector**: View raw JSON for debugging
- **Curl/Python code snippets**: Copy-paste examples for common clients
- **Logs viewer**: Scroll through recent requests with timestamps and status codes

## Business & Solutions Perspective

### Cost Savings
**Scenario**: Small SaaS company processes 10M tokens/day
- **OpenAI GPT-4o-mini**: $0.15/1M input + $0.60/1M output = **$3,750/month**
- **Cactus on 3 phones**: $0 inference + ~$5/month electricity = **$5/month**
- **Annual savings**: ~$45,000

### Latency Reduction
- **Cloud API**: 200-500ms network RTT + 50-200ms inference = 250-700ms total
- **Local phone**: 0ms network + 50-200ms inference = **50-200ms total**
- **3-5× faster response times** improve user experience

### Compliance & Privacy
- HIPAA/GDPR: No patient/customer data sent to third parties
- Trade secrets: Proprietary prompts and data stay on-premises
- Audit logs: Full control over request history

### Scalability
- **Vertical**: Upgrade to newer phones for 2-3× speed boost (~$200/device every 2-3 years)
- **Horizontal**: Add more phones linearly (5 phones = 5× throughput)
- **Hybrid**: Use phones for fast/cheap tasks, cloud for complex reasoning

## Technical Foundation

### Cactus LLM Engine
- ARM NEON/SVE SIMD vectorization
- Custom GGML operators optimized for mobile memory hierarchy
- Flash Attention mobile implementation
- KV cache quantization and compression
- Metal (iOS) and Vulkan (Android) acceleration where available

### OpenAI API Compatibility
- Full chat completions schema (messages, roles, max_tokens, temperature, top_p, etc.)
- Streaming support via Server-Sent Events
- Model listing and metadata
- Error responses match OpenAI format

### Flutter App Architecture
- Dart-native HTTP server (no external dependencies like nginx)
- Background service keeps server running when app is backgrounded
- State management via Riverpod for reactive UI
- SQLite for persistent settings and logs

## Roadmap & Evolution

### Phase 1: Core Server (Current Focus)
- Basic `/v1/chat/completions` endpoint
- Single model support
- Manual IP entry for clients
- Minimal UI (start/stop + IP display)

### Phase 2: Model Management
- Multi-model selection in app
- Automatic model downloads
- Per-model presets (fast/balanced/quality)
- Model metadata API

### Phase 3: Advanced Features
- Streaming support (SSE)
- API key authentication
- HTTPS/self-signed certs
- Request logging and stats

### Phase 4: Multi-Device Orchestration
- mDNS auto-discovery
- Load balancing proxy mode (one phone proxies to others)
- Cluster health monitoring
- Automatic failover

### Phase 5: Enterprise Features
- LDAP/OAuth integration
- Usage quotas per API key
- Prometheus metrics export
- Docker sidecar for non-phone deployments

## Why This Matters

### For the AI Community
- Democratizes access to fast, private LLM inference
- Reduces dependence on OpenAI/Anthropic/Google
- Enables experimentation without financial barriers

### For Cactus
- Showcases Cactus SDK capabilities in a real product
- Drives adoption among developers who need drop-in OpenAI replacement
- Telemetry provides real-world performance data for optimization

### For Sustainability
- Repurposes e-waste (old phones) into useful compute
- Dramatically lower power consumption vs cloud data centers (10W vs ~300W per inference node)
- Reduces carbon footprint of AI workloads

## Success Metrics

### Adoption
- 1,000+ GitHub stars within 6 months
- 10,000+ downloads within first year
- Active community contributions (PRs, issues, feature requests)

### Performance
- 95th percentile latency < 300ms for 100-token outputs
- 99.9% uptime for 24-hour server runs
- < 1% OOM crash rate

### Ecosystem Integration
- Official n8n node/integration
- LangChain example in docs
- CrewAI tutorial
- Make.com template

## Competitive Landscape

| Solution | Speed | Cost | Privacy | Compatibility | Ease of Use |
|----------|-------|------|---------|---------------|-------------|
| **Cactus OpenAI Server** | ⭐⭐⭐⭐⭐ | Free | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| OpenAI API | ⭐⭐⭐⭐ | $$ | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Ollama (Desktop) | ⭐⭐⭐ | Free | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Ollama (Termux) | ⭐⭐ | Free | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| llama.cpp Server | ⭐⭐⭐ | Free | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Local LLaMA (iOS) | ⭐⭐⭐⭐ | Free | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ |

**Key Differentiator**: Only solution combining Cactus's ARM speed + OpenAI API compatibility + multi-device orchestration.

## Getting Started

See [README.md](../README.md) for installation and setup instructions.

For detailed screen-by-screen documentation, see [screens.md](screens.md).

For technical implementation details, see [specification.md](specification.md).
