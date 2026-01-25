# Cactus OpenAI Server - Technical Specification

This document outlines the technical architecture, implementation details, and fastest path to building Cactus OpenAI Server. It serves as the engineering blueprint for the project.

---

## Architecture Overview

### High-Level Components

```
┌─────────────────────────────────────────────┐
│          Flutter Mobile App (UI)           │
│  ┌──────────────────────────────────────┐  │
│  │   Screens (Home, Models, Settings)   │  │
│  └────────────┬─────────────────────────┘  │
│               │                             │
│  ┌────────────▼─────────────────────────┐  │
│  │      State Management (Riverpod)     │  │
│  └────────────┬─────────────────────────┘  │
│               │                             │
│  ┌────────────▼─────────────────────────┐  │
│  │        HTTP Server (Dart)            │  │
│  │     (shelf + shelf_router)           │  │
│  └────────────┬─────────────────────────┘  │
│               │                             │
│  ┌────────────▼─────────────────────────┐  │
│  │   OpenAI API Adapter (middleware)    │  │
│  │   - Parses /v1/chat/completions      │  │
│  │   - Translates to Cactus format      │  │
│  └────────────┬─────────────────────────┘  │
│               │                             │
│  ┌────────────▼─────────────────────────┐  │
│  │      Cactus LLM SDK (FFI/Plugin)     │  │
│  │   - Model loading                    │  │
│  │   - Inference execution              │  │
│  │   - Memory management                │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|--------|
| **UI Framework** | Flutter 3.x+ | Cross-platform mobile UI |
| **State Management** | Riverpod | Reactive state management |
| **HTTP Server** | shelf + shelf_router | Dart-native HTTP handling |
| **Background Service** | flutter_background_service | Keep server running when app backgrounded |
| **Inference Engine** | Cactus LLM SDK (FFI) | ARM-optimized language model execution |
| **Storage** | sqflite | Local database for settings/logs |
| **Wake Lock** | wakelock_plus | Prevent device sleep |
| **Network Info** | network_info_plus | Get device IP address |

---

## API Endpoints Specification

### 1. POST `/v1/chat/completions`

**Purpose**: OpenAI-compatible chat completion endpoint.

#### Request Schema
```json
{
  "model": "string",          // Model ID (e.g., "cactus-default", "Qwen3-0.6B")
  "messages": [               // Array of conversation messages
    {
      "role": "string",       // "system", "user", or "assistant"
      "content": "string"     // Message text
    }
  ],
  "temperature": 0.7,         // Optional: 0.0-2.0, default 1.0
  "top_p": 0.9,              // Optional: 0.0-1.0, default 1.0
  "max_tokens": 100,         // Optional: Max output tokens, default 512
  "stream": false,           // Optional: Enable streaming (SSE), default false
  "stop": ["string"],       // Optional: Stop sequences
  "presence_penalty": 0.0,   // Optional: -2.0 to 2.0, default 0
  "frequency_penalty": 0.0   // Optional: -2.0 to 2.0, default 0
}
```

#### Response Schema (Non-Streaming)
```json
{
  "id": "cmpl-abc123",       // Unique completion ID
  "object": "chat.completion",
  "created": 1234567890,      // Unix timestamp
  "model": "cactus-default",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "string"
      },
      "finish_reason": "stop"  // "stop", "length", or "error"
    }
  ],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 87,
    "total_tokens": 102
  }
}
```

#### Response Schema (Streaming)
Server-Sent Events (SSE) format:
```
data: {"id":"cmpl-abc123","object":"chat.completion.chunk","created":1234567890,"model":"cactus-default","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"cmpl-abc123","object":"chat.completion.chunk","created":1234567890,"model":"cactus-default","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"cmpl-abc123","object":"chat.completion.chunk","created":1234567890,"model":"cactus-default","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

#### Error Responses
```json
{
  "error": {
    "message": "string",      // Human-readable error
    "type": "string",         // "invalid_request_error", "server_error", etc.
    "code": "string"          // Error code (e.g., "model_not_found")
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid JSON or missing required fields
- `401 Unauthorized` - API key required but missing/invalid
- `404 Not Found` - Model not found
- `500 Internal Server Error` - Inference failure
- `504 Gateway Timeout` - Request exceeded timeout

---

### 2. GET `/v1/models`

**Purpose**: List available models.

#### Request
No body required.

#### Response Schema
```json
{
  "object": "list",
  "data": [
    {
      "id": "cactus-default",
      "object": "model",
      "created": 1234567890,
      "owned_by": "cactus",
      "permission": [],
      "root": "cactus-default",
      "parent": null
    },
    {
      "id": "Qwen3-0.6B-Q6_K",
      "object": "model",
      "created": 1234567890,
      "owned_by": "cactus",
      "permission": [],
      "root": "Qwen3-0.6B-Q6_K",
      "parent": null
    }
  ]
}
```

---

### 3. GET `/`

**Purpose**: Health check and server metadata.

#### Response Schema
```json
{
  "status": "running",          // "running", "idle", "error"
  "model": "Qwen3-0.6B-Q6_K",   // Currently loaded model
  "version": "1.0.0",          // App version
  "uptime": 3600,               // Seconds since server started
  "requests": 42,               // Total requests served
  "active_requests": 1,         // Current concurrent requests
  "tokens_per_second": 56.2,    // Current inference speed
  "device": {
    "model": "Pixel 9",
    "os": "Android 14",
    "ram_total": "8 GB",
    "ram_available": "5.9 GB"
  }
}
```

---

## Implementation Details

### Cactus SDK Integration

**Package**: `cactus` (pub.dev)

#### Initialization
```dart
import 'package:cactus/cactus.dart';

// Initialize Cactus with optional telemetry
void initCactus() {
  CactusConfig.init(
    telemetryToken: 'your-token-here', // Optional
    enableLogging: true,
  );
}
```

#### Model Loading
```dart
final model = await CactusModel.load(
  path: '/path/to/model.gguf',
  contextLength: 2048,
  threads: 6,
);
```

#### Inference Execution
```dart
final response = await model.complete(
  prompt: 'Hello, how are you?',
  maxTokens: 100,
  temperature: 0.7,
  topP: 0.9,
);

print(response.text);        // Generated text
print(response.tokensPerSec); // Inference speed
```

#### Streaming Support
```dart
await for (final chunk in model.completeStream(
  prompt: 'Hello',
  maxTokens: 100,
)) {
  print(chunk.text); // Incremental text
  yield chunk;       // Forward to SSE stream
}
```

---

### HTTP Server Setup

**Packages**: `shelf`, `shelf_router`

#### Basic Server
```dart
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;
import 'package:shelf_router/shelf_router.dart';

final router = Router()
  ..post('/v1/chat/completions', handleChatCompletion)
  ..get('/v1/models', handleListModels)
  ..get('/', handleHealthCheck);

final handler = Pipeline()
  .addMiddleware(logRequests())
  .addMiddleware(corsHeaders())
  .addMiddleware(authMiddleware()) // Optional
  .addHandler(router);

final server = await io.serve(handler, '0.0.0.0', 8080);
print('Server running on ${server.address.address}:${server.port}');
```

#### CORS Middleware
```dart
Middleware corsHeaders() {
  return (Handler handler) {
    return (Request request) async {
      if (request.method == 'OPTIONS') {
        return Response.ok('', headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        });
      }
      
      final response = await handler(request);
      return response.change(headers: {
        'Access-Control-Allow-Origin': '*',
      });
    };
  };
}
```

#### API Key Authentication
```dart
Middleware authMiddleware() {
  return (Handler handler) {
    return (Request request) async {
      if (!requireAuth) return handler(request);
      
      final authHeader = request.headers['authorization'];
      if (authHeader == null || !authHeader.startsWith('Bearer ')) {
        return Response.unauthorized(
          jsonEncode({'error': {'message': 'Missing or invalid API key'}}),
        );
      }
      
      final token = authHeader.substring(7);
      if (token != storedApiKey) {
        return Response.unauthorized(
          jsonEncode({'error': {'message': 'Invalid API key'}}),
        );
      }
      
      return handler(request);
    };
  };
}
```

---

### OpenAI Adapter Implementation

#### Chat Completions Handler
```dart
Future<Response> handleChatCompletion(Request request) async {
  try {
    // Parse request
    final body = await request.readAsString();
    final json = jsonDecode(body) as Map<String, dynamic>;
    
    // Extract parameters
    final messages = json['messages'] as List;
    final temperature = (json['temperature'] as num?)?.toDouble() ?? 1.0;
    final maxTokens = json['max_tokens'] as int? ?? 512;
    final stream = json['stream'] as bool? ?? false;
    
    // Build prompt from messages
    final prompt = messagesToPrompt(messages);
    
    // Non-streaming response
    if (!stream) {
      final response = await cactusModel.complete(
        prompt: prompt,
        maxTokens: maxTokens,
        temperature: temperature,
      );
      
      return Response.ok(
        jsonEncode({
          'id': 'cmpl-${uuid.v4()}',
          'object': 'chat.completion',
          'created': DateTime.now().millisecondsSinceEpoch ~/ 1000,
          'model': 'cactus-default',
          'choices': [{
            'index': 0,
            'message': {
              'role': 'assistant',
              'content': response.text,
            },
            'finish_reason': 'stop',
          }],
          'usage': {
            'prompt_tokens': response.promptTokens,
            'completion_tokens': response.completionTokens,
            'total_tokens': response.totalTokens,
          },
        }),
        headers: {'Content-Type': 'application/json'},
      );
    }
    
    // Streaming response (SSE)
    final controller = StreamController<String>();
    handleStreamingCompletion(prompt, maxTokens, temperature, controller);
    
    return Response.ok(
      controller.stream,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    );
    
  } catch (e) {
    return Response.internalServerError(
      body: jsonEncode({'error': {'message': e.toString()}}),
    );
  }
}
```

---

## Fastest Path to Implementation

### Phase 1: MVP (1-2 weeks)
**Goal**: Basic working server with single model support.

#### Week 1: Core Server
1. **Day 1-2**: Project setup
   - Create Flutter project
   - Add dependencies (shelf, cactus, sqflite)
   - Set up basic UI skeleton (Home screen only)

2. **Day 3-4**: HTTP server
   - Implement shelf server with Router
   - Add `/v1/chat/completions` POST handler
   - Add basic request parsing

3. **Day 5-7**: Cactus integration
   - Integrate Cactus SDK
   - Implement model loading from assets
   - Connect inference to HTTP handler
   - Test with curl/Postman

#### Week 2: UI & Polish
4. **Day 8-10**: Home screen UI
   - Server start/stop button
   - Display IP address + port
   - Show basic stats (requests, tok/s)

5. **Day 11-12**: Background service
   - Keep server running when app backgrounded
   - Add wake lock
   - Add persistent notification

6. **Day 13-14**: Testing & bug fixes
   - Test with OpenAI Python SDK
   - Test with n8n
   - Fix critical bugs

**Deliverable**: Functional app that runs a single model and serves OpenAI-compatible requests.

---

### Phase 2: Model Management (1 week)
**Goal**: Multi-model support with download UI.

1. **Day 15-16**: Models screen
   - List installed models
   - Model selection (changes default)
   - Delete model functionality

2. **Day 17-19**: Model downloads
   - Add HTTP download with progress
   - Implement model catalog (hardcoded JSON)
   - Download UI with progress bar

3. **Day 20-21**: Model switching
   - Stop/reload/restart logic
   - Persist selected model in settings

**Deliverable**: Users can download and switch between multiple models.

---

### Phase 3: Advanced Features (2 weeks)
**Goal**: Production-ready feature set.

1. **Week 4**: Settings + Auth
   - Settings screen (port, threads, context length)
   - API key generation + authentication
   - HTTPS support (self-signed certs)

2. **Week 5**: Logs + Streaming
   - Request logging to SQLite
   - Logs screen with filtering
   - SSE streaming support

**Deliverable**: Feature-complete app ready for public release.

---

## Key Integration Points

### OpenAI SDK Integration

**Python Example:**
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://192.168.1.100:8080/v1",
    api_key="your-key-or-dummy"  # Required by SDK but can be any value
)

response = client.chat.completions.create(
    model="cactus-default",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is 2+2?"}
    ],
    max_tokens=50
)

print(response.choices[0].message.content)
```

**JavaScript/TypeScript Example:**
```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://192.168.1.100:8080/v1',
  apiKey: 'dummy',
});

const response = await client.chat.completions.create({
  model: 'cactus-default',
  messages: [{ role: 'user', content: 'Hello!' }],
});

console.log(response.choices[0].message.content);
```

**n8n Integration:**
1. Add "OpenAI" node to workflow
2. In node settings:
   - Credential: Create new OpenAI credential
   - API Key: any non-empty string
   - Custom API URL: `http://192.168.1.100:8080/v1`
3. Configure model: `cactus-default`
4. Test connection

**LangChain Integration:**
```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    base_url="http://192.168.1.100:8080/v1",
    api_key="dummy",
    model="cactus-default"
)

response = llm.invoke("Tell me a joke")
print(response.content)
```

---

## Performance Optimization

### Cactus-Specific Optimizations

1. **Thread Count Tuning**
   - Use `Platform.numberOfProcessors - 1` as default
   - Allow user override (1-8 threads)
   - More threads = faster but hotter

2. **Batch Size**
   - Default: 256 tokens
   - Increase for higher throughput (more latency)
   - Decrease for lower latency (less throughput)

3. **Context Length**
   - Smaller context = less RAM, faster loading
   - Default: 2048 tokens
   - Only increase if user needs longer conversations

4. **Quantization Selection**
   - Q4_K_S: Fastest, lowest quality (~3-4 bits)
   - Q6_K: Balanced (default, ~6 bits)
   - Q8: Slowest, best quality (~8 bits)

### Memory Management

- **Model Unloading**: Unload model when server stops to free RAM
- **KV Cache**: Cactus auto-manages, but context length affects size
- **Leak Prevention**: Dispose Cactus instances properly in Flutter

---

## Testing Strategy

### Unit Tests
- OpenAI request parsing
- Message-to-prompt conversion
- Response formatting

### Integration Tests
- Full request/response cycle with mock Cactus SDK
- Streaming SSE output
- Error handling (invalid JSON, missing fields)

### End-to-End Tests
1. **curl Test**:
   ```bash
   curl http://localhost:8080/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{"model":"cactus-default","messages":[{"role":"user","content":"Hi"}]}'
   ```

2. **Python SDK Test**: Run script from integration examples above

3. **n8n Test**: Create simple workflow, verify output

### Performance Benchmarks
- Measure tok/s on Pixel 6a, Pixel 9, Galaxy S25
- Compare to Ollama on Termux (should be 2-5× faster)
- Stress test: 10 concurrent requests

---

## Deployment

### Build Process
```bash
# Android APK
flutter build apk --release

# Android App Bundle (for Play Store)
flutter build appbundle --release

# iOS (requires Mac)
flutter build ios --release
```

### Distribution
1. **GitHub Releases**: Attach APK to release tags
2. **Google Play**: Submit app bundle (requires developer account)
3. **F-Droid**: Submit recipe (open-source only)

### CI/CD (GitHub Actions)
```yaml
name: Build Release
on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
      - run: flutter pub get
      - run: flutter build apk --release
      - uses: actions/upload-artifact@v3
        with:
          name: app-release.apk
          path: build/app/outputs/flutter-apk/app-release.apk
```

---

## Security Considerations

1. **API Key Storage**: Use secure storage (flutter_secure_storage) for keys
2. **HTTPS**: Self-signed certs for LAN, proper certs for public exposure
3. **Input Validation**: Sanitize all user inputs, limit request sizes
4. **Rate Limiting**: Optional per-key rate limits
5. **Logging**: Never log API keys or sensitive prompt content

---

## Monitoring & Telemetry

### Local Metrics
- Requests per minute
- Average/P95/P99 latency
- Token throughput
- Error rates
- Memory usage

### Optional Cloud Telemetry
- Send anonymized stats to Cactus backend
- Helps improve performance optimizations
- User opt-in required

---

## Future Enhancements

1. **Function Calling**: Parse and execute tool calls
2. **Embeddings Endpoint**: `/v1/embeddings` support
3. **Multi-Device Load Balancer**: One phone proxies to others
4. **Model Fine-Tuning**: LoRA adapter support
5. **Voice Interface**: Whisper integration for STT
6. **Image Generation**: SD integration (very slow on mobile)

---

## Conclusion

Cactus OpenAI Server combines three key technologies:

1. **Flutter**: Cross-platform UI + HTTP server in Dart
2. **Cactus SDK**: ARM-optimized LLM inference
3. **OpenAI API**: Standard interface for ecosystem compatibility

The fastest path to a working MVP is:
- Week 1: Core server + Cactus integration
- Week 2: UI polish + background service
- Weeks 3-4: Model management + advanced features

Total time to production-ready app: **~1 month**.

For detailed UI/UX specifications, see [screens.md](screens.md).

For business context and use cases, see [project.md](project.md).
