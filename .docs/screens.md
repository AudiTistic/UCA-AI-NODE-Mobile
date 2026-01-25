# Cactus OpenAI Server - Screen Documentation

This document describes every screen in the Cactus OpenAI Server app, detailing the UI elements, user interactions, and how they customize the inference experience. All descriptions reflect the **final vision** of the product.

---

## Navigation Structure

The app uses a bottom navigation bar with 5 primary screens:
1. **Home** - Server status and quick actions
2. **Models** - Model management and selection
3. **Settings** - Configuration and performance tuning
4. **Logs** - Request history and debugging
5. **Info** - Documentation, examples, and about

---

## 1. Home Screen

### Purpose
Primary control center for starting/stopping the server and monitoring real-time performance.

### UI Elements

#### Status Card (Top)
- **Server Status Indicator**
  - Color-coded badge: Green (Running), Red (Stopped), Yellow (Starting/Error)
  - Large status text: "Server Running" / "Server Stopped"
  - Uptime counter (HH:MM:SS format)

- **Network Information**
  - Local IP address (e.g., "192.168.1.100")
  - Port number (default: 8080)
  - Full endpoint URL: `http://192.168.1.100:8080/v1/chat/completions`
  - Copy button next to URL (copies to clipboard)

- **Current Model Display**
  - Model name and quantization (e.g., "Qwen3-0.6B-Q6_K")
  - Tap to quick-switch models

#### Performance Metrics (Middle)
Real-time stats updated every second:
- **Tokens/Second**: Current inference speed (large font, prominent)
- **Requests**: Total count since server start
- **Active Requests**: Current concurrent requests (0-N)
- **Total Tokens**: Cumulative tokens processed
- **Average Latency**: Mean response time in milliseconds
- **Memory Usage**: RAM consumed by model + KV cache (e.g., "2.1 GB / 8 GB")

#### Mini Performance Graph
- Line chart showing last 60 seconds of tok/s
- Auto-scaling Y-axis
- Tap to expand to full-screen detailed stats

#### Primary Action Button (Bottom)
- **Start Server** (when stopped)
  - Large green button, centered
  - Initiates server startup sequence
  - Shows loading spinner during initialization
  
- **Stop Server** (when running)
  - Large red button, centered
  - Gracefully shuts down server
  - Waits for active requests to complete (timeout: 30s)

#### Quick Actions Row
- **Test Request** icon button
  - Sends sample "Hello" message to test server
  - Shows result in a toast notification
  
- **Share URL** icon button
  - Opens system share sheet with endpoint URL
  - Includes QR code for easy mobile scanning
  
- **Settings** icon button
  - Quick jump to Settings screen

### Interactions

**On Server Start:**
1. User taps "Start Server"
2. App requests wake lock to keep phone awake
3. Loads selected model into memory (shows progress)
4. Binds HTTP server to configured port
5. Status changes to "Running" + metrics start updating
6. Background notification appears ("Cactus OpenAI Server Running")

**On Server Stop:**
1. User taps "Stop Server"
2. Server stops accepting new requests
3. Waits for active requests to finish (shows countdown if >0)
4. Releases wake lock
5. Status changes to "Stopped"
6. Clears background notification

**On Model Tap:**
- Opens quick model switcher dialog
- Lists installed models with speed estimates
- Switching model requires server restart (warns user if running)

---

## 2. Models Screen

### Purpose
Manage installed models, download new ones, and configure per-model settings.

### UI Elements

#### Installed Models List
Scrollable list of downloaded models, each card showing:
- **Model Name** (e.g., "Qwen3-0.6B-Instruct")
- **Quantization** (Q4_K_M, Q6_K, Q8, etc.)
- **Size on Disk** (e.g., "450 MB")
- **Speed Estimate** (device-specific, e.g., "~60 tok/s on this device")
- **Status Badge**
  - "Active" if currently loaded
  - "Ready" if downloaded but not loaded
  
#### Actions per Model
- **Set as Default** - Makes this the auto-load model
- **Configure** - Opens model-specific settings
- **Delete** - Removes model from disk (confirmation dialog)

#### Model Configuration Dialog
Opened when tapping "Configure" on a model:
- **Context Length Slider**: 512 - 8192 tokens
- **Default Temperature**: 0.0 - 2.0 (slider)
- **Default Top-P**: 0.0 - 1.0 (slider)
- **System Prompt**: Multi-line text field for default system message
- **Max Tokens Default**: 50 - 4096 (slider)

These become the default values when this model is active (can still be overridden by API request).

#### Available Models Section
Expandable section showing models available for download:
- **Preset Collections**:
  - **Fast & Lite**: 0.5B-1B models, Q4_K_S quant, ~50-75 tok/s
    - Qwen3-0.6B-Q4_K_S (350 MB)
    - Llama-3.2-1B-Q4_K_S (580 MB)
  - **Balanced**: 1B-3B models, Q6_K quant, ~20-40 tok/s
    - Qwen3-1.8B-Q6_K (1.2 GB)
    - Phi-3-mini-Q6_K (2.1 GB)
  - **High Quality**: 3B-7B models, Q8 quant, ~10-20 tok/s
    - Llama-3.2-3B-Q8 (3.4 GB)
    - Mistral-7B-Q6_K (4.8 GB)

- Each model has:
  - Name, size, estimated speed
  - **Download** button
  - Description of use case ("Best for: summarization, chat, code, etc.")

#### Custom Model Section
- **Add Custom Model** button
- Opens dialog with:
  - **URL Input**: Direct link to GGUF file
  - **File Picker**: Select local GGUF file
  - **Model Name**: User-provided name
  - **Quantization**: Auto-detected or manual entry

### Interactions

**Downloading a Model:**
1. User taps "Download" on an available model
2. Progress bar appears showing download (%  and MB/s)
3. On completion, model auto-moves to "Installed Models"
4. Toast notification: "[Model Name] ready to use"

**Switching Active Model:**
1. User taps "Set as Default" on a different model
2. If server is running:
   - Warning dialog: "Changing models requires restarting the server. Active requests will be terminated. Continue?"
   - If "Yes": stops server, loads new model, restarts server
   - If "No": cancels action
3. If server is stopped:
   - Immediately sets as default (loads on next server start)

**Deleting a Model:**
1. User taps "Delete"
2. Confirmation dialog: "Delete [Model Name]? This will free [Size] of storage and cannot be undone."
3. If confirmed:
   - If model is active, requires stopping server first
   - Deletes model file
   - Updates UI immediately

---

## 3. Settings Screen

### Purpose
Configure network, performance, security, and advanced options.

### UI Sections

#### Network Settings
- **Port Number**
  - Text field, default: 8080
  - Valid range: 1024-65535
  - Requires server restart to apply

- **Bind Address**
  - Dropdown:
    - "All Interfaces (0.0.0.0)" - Accessible from any network device
    - "Wi-Fi Only" - Binds to current Wi-Fi IP
    - "Localhost Only (127.0.0.1)" - Only accessible from this device
  - Security indicator icon (shield for localhost, caution for 0.0.0.0)

- **Enable HTTPS**
  - Toggle switch
  - If enabled:
    - Auto-generates self-signed certificate
    - Shows certificate fingerprint for client verification
    - Endpoint becomes `https://...` instead of `http://...`

- **CORS Configuration**
  - Toggle: "Allow Cross-Origin Requests"
  - Text field: "Allowed Origins" (comma-separated, default: *)

#### Authentication Settings
- **API Key Authentication**
  - Toggle: "Require API Key"
  - If enabled:
    - **Generate New Key** button (creates random 32-char key)
    - **Current Key** display (masked, tap to reveal)
    - **Copy Key** button
  - Clients must include: `Authorization: Bearer <key>` header
  - Invalid/missing key returns 401 Unauthorized

#### Performance Settings
- **Thread Count**
  - Slider: 1-8 threads
  - Default: CPU cores - 1
  - Real-time impact preview: "Higher = faster, but hotter and more battery drain"

- **Context Length**
  - Slider: 512-8192 tokens
  - Shows RAM impact estimate: "~1.2 GB at 2048 tokens"
  - Warning if exceeds available RAM

- **Batch Size**
  - Slider: 128-512 tokens
  - Advanced setting, most users leave at default (256)
  - Tooltip: "Larger batches = better throughput, but longer latency spikes"

- **Power Profile**
  - Segmented control: Max Performance / Balanced / Eco
  - **Max Performance**:
    - No CPU throttling
    - Maximum thread usage
    - Best for short bursts (meetings, demos)
    - Warning: "Phone may get hot"
  - **Balanced**:
    - Moderate throttling
    - Good speed with reasonable temps
    - Best for continuous use (8+ hour workday)
  - **Eco**:
    - Aggressive throttling
    - Cool and battery-efficient
    - Best for overnight/background tasks

#### Battery & Wake Lock
- **Keep Screen On**
  - Toggle (default: off)
  - If on: screen stays on while server running (dims after 10s of no touch)

- **Wake Lock Policy**
  - Dropdown:
    - "Always (while server running)" - Prevents all sleep
    - "Only during active requests" - Sleep when idle
    - "Manual" - User controls via notification toggle

- **Battery Optimization Override**
  - Button: "Request Battery Optimization Exemption"
  - Opens system settings to disable battery optimization for app
  - Prevents Android from killing server in background

#### Telemetry Settings
- **Anonymous Usage Stats**
  - Toggle: "Send Anonymous Telemetry"
  - Description: "Helps Cactus improve performance. Data includes: device model, speeds, error rates. No requests/responses sent."
  
- **Telemetry Token** (if enabled)
  - Text field for optional Cactus telemetry token
  - Tooltip: "Get token at cactus.dev/telemetry"
  - Unlocks cloud dashboard with detailed stats

#### Advanced Settings
- **Request Timeout**
  - Slider: 30-600 seconds
  - Default: 120s
  - Requests exceeding this return 504 Gateway Timeout

- **Max Concurrent Requests**
  - Slider: 1-10
  - Default: 3
  - Higher = more throughput, but slower per-request

- **Log Level**
  - Dropdown: Error Only / Warnings / Info / Debug
  - Affects both UI logs and exported log files

- **Export Logs**
  - Button: generates .txt file of all logs
  - Shares via system share sheet

### Interactions

**Changing Port:**
1. User enters new port number
2. If server is running:
   - Warning: "Port change requires server restart"
   - User confirms
   - Server stops, rebinds to new port, restarts
3. If server is stopped:
   - Change is saved, applied on next start

**Enabling HTTPS:**
1. User toggles "Enable HTTPS"
2. App generates self-signed cert (takes ~2 seconds)
3. Displays fingerprint: "SHA-256: AB:CD:EF:..."
4. Tooltip: "Clients must accept self-signed cert or add this fingerprint to trust store"
5. Endpoint URL updates to https://

**Generating API Key:**
1. User toggles "Require API Key"
2. If first time: auto-generates key, displays in dialog
3. User must copy/save key (no recovery)
4. "Generate New Key" button appears
5. Tapping it:
   - Warning: "Old key will stop working immediately"
   - If confirmed: generates new key, displays it

---

## 4. Logs Screen

### Purpose
Debug requests, view errors, and analyze performance trends.

### UI Elements

#### Filters (Top Bar)
- **Time Range** dropdown
  - Last Hour / Last 24 Hours / All Time
  
- **Status Filter** chips (multi-select)
  - Success (green) / Error (red) / Timeout (yellow)
  
- **Search Bar**
  - Filters by: endpoint, model, client IP, or response content

#### Request Log List
Scrollable list of requests (newest first), each entry showing:
- **Timestamp**: HH:MM:SS (tap to see full date)
- **Method + Endpoint**: e.g., "POST /v1/chat/completions"
- **Status Code**: Color-coded badge (200=green, 4xx=yellow, 5xx=red)
- **Latency**: Response time in ms
- **Tokens**: Input/output token count (e.g., "15 / 87")
- **Client IP**: Requesting device's IP

#### Expanded Request Detail
Tapping a log entry opens detailed view:
- **Request Headers** (collapsible)
- **Request Body** (pretty-printed JSON)
- **Response Headers** (collapsible)
- **Response Body** (pretty-printed JSON)
- **Timing Breakdown**:
  - Model load: Xms
  - Inference: Xms
  - Total: Xms
- **Error Details** (if failed)
  - Error message
  - Stack trace (if available)

#### Actions per Log Entry
- **Copy Request** - Copies full request as curl command
- **Copy Response** - Copies response body to clipboard
- **Replay Request** - Re-sends same request to current server
- **Share** - Exports request/response as JSON file

#### Stats Summary Card (Bottom)
Sticky footer showing aggregate stats for filtered logs:
- **Total Requests**: Count
- **Success Rate**: % of 2xx responses
- **Avg Latency**: Mean response time
- **Total Tokens**: Sum of all processed tokens
- **Error Rate**: % of 5xx/timeout responses

### Interactions

**Filtering Logs:**
1. User selects time range + status filters
2. List updates in real-time
3. Stats card recalculates for filtered subset

**Replaying a Request:**
1. User taps "Replay Request" on a log entry
2. If server is stopped: error toast "Start server first"
3. If server is running:
   - Sends identical request
   - Shows loading spinner
   - On completion: highlights new log entry
   - Toast: "Request completed in [X]ms"

**Exporting Logs:**
1. User taps "Export" in top-right menu
2. Dialog: "Export format?"
   - JSON (full details)
   - CSV (summary only)
3. File is saved to Downloads or shared via system sheet

---

## 5. Info Screen

### Purpose
Provide documentation, code examples, and app metadata.

### UI Sections

#### Quick Start Guide
Expandable sections with step-by-step setup:
1. **Install Models** - Link to Models screen
2. **Start Server** - Link to Home screen
3. **Test with curl** - Copy-paste curl example
4. **Integrate with Tools** - Links to n8n/LangChain sections

#### Code Examples
Tabs for different languages/tools:
- **Python (OpenAI SDK)**
  ```python
  from openai import OpenAI
  client = OpenAI(
      base_url="http://192.168.1.100:8080/v1",
      api_key="local-key"
  )
  response = client.chat.completions.create(
      model="cactus-default",
      messages=[{"role": "user", "content": "Hello!"}]
  )
  ```
  - **Copy Code** button

- **JavaScript (OpenAI SDK)**
  ```javascript
  import OpenAI from 'openai';
  const client = new OpenAI({
      baseURL: 'http://192.168.1.100:8080/v1',
      apiKey: 'local-key'
  });
  ```
  - **Copy Code** button

- **curl**
  ```bash
  curl http://192.168.1.100:8080/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer local-key" \
    -d '{"model": "cactus-default", "messages": [{"role": "user", "content": "Hello"}]}'
  ```
  - **Copy Code** button

- **n8n**
  - Screenshot of n8n OpenAI node configuration
  - Step-by-step: "Change base URL to http://your-phone-ip:8080/v1"
  - **Open n8n Workflow Template** button (if n8n is installed)

- **LangChain**
  ```python
  from langchain_openai import ChatOpenAI
  llm = ChatOpenAI(
      base_url="http://192.168.1.100:8080/v1",
      api_key="local-key",
      model="cactus-default"
  )
  ```
  - **Copy Code** button

#### API Reference
- **Supported Endpoints** list
  - `POST /v1/chat/completions`
  - `GET /v1/models`
  - `GET /`
- **Request Schema** (expandable JSON)
- **Response Schema** (expandable JSON)
- **Error Codes** table

#### Multi-Device Setup Guide
Expandable section:
- How to run on multiple phones
- Round-robin load balancing example code
- Failover strategy tips

#### About Section
- **App Version**: e.g., "1.2.3"
- **Cactus SDK Version**: e.g., "0.9.5"
- **Build Date**: e.g., "2026-01-15"
- **GitHub Link**: Opens repo in browser
- **License**: MIT (shows full text in dialog)
- **Credits**: Cactus team + contributors

### Interactions

**Copying Code:**
1. User taps "Copy Code" button
2. Code is copied to clipboard
3. Toast: "Copied to clipboard"
4. If code contains placeholder IP:
   - Automatically replaces with current device IP before copying

**Opening External Links:**
- GitHub, n8n, LangChain links open in system browser
- User can long-press to copy URL instead

---

## Cross-Screen Features

### Background Notification (Android)
When server is running:
- **Persistent notification** in status bar
- Shows:
  - "Cactus OpenAI Server Running"
  - Current model name
  - Tokens/second (updates every 5s)
- Actions:
  - **Stop Server** - Stops server from notification
  - **Pause/Resume Wake Lock** - Toggle sleep prevention
- Tapping notification opens Home screen

### Deep Links
App supports deep links for remote control:
- `cactus://start` - Starts server
- `cactus://stop` - Stops server
- `cactus://switch-model?name=Qwen3-0.6B` - Switches model
- Useful for automation (Tasker, Shortcuts, etc.)

### Theming
- **Light/Dark Mode**: Follows system preference
- **Accent Color**: Configurable in Settings > Appearance (future)

### Accessibility
- Full screen reader support (TalkBack/VoiceOver)
- High contrast mode option
- Large text scaling support
- Keyboard navigation on external keyboards

---

## Future Screens (Roadmap)

### Cluster Screen
- Discover other Cactus OpenAI Server instances on LAN
- Configure as load balancer (proxy mode)
- Health checks and auto-failover
- Aggregate stats across all phones

### Dashboard Screen
- Real-time charts (requests/min, latency percentiles, error rate)
- Historical trends (daily/weekly/monthly)
- Export stats as CSV

### Tools Screen
- Built-in function calling support
- Define custom tools (JSON schema)
- Test tool execution in app

---

## Design Principles

### Simplicity First
- Home screen accessible with zero taps (app opens to Home)
- Most common action (Start/Stop) is largest button
- Advanced features hidden in Settings/Advanced

### Immediate Feedback
- All actions show instant visual response (spinner, toast, color change)
- Errors display helpful messages with "How to Fix" tips
- Progress indicators for all long-running operations

### Mobile-Optimized
- Large tap targets (48dp minimum)
- Scrollable content (never requires landscape mode)
- Works one-handed on 6"+ screens
- Optimized for OLED (dark UI saves battery)

### Informative by Default
- Performance metrics visible without extra taps
- Tooltips on hover (or long-press on mobile)
- Speed estimates shown before downloading models
- RAM impact previewed before changing settings

---

## Summary

Every screen is designed to give users **complete control** over their local inference server while **minimizing complexity**. The Home screen provides one-tap server management, Models screen enables easy model switching, Settings allow deep customization for advanced users, Logs provide debugging tools, and Info makes integration trivial. Together, these screens transform an Android phone into a production-grade OpenAI-compatible inference endpoint.
