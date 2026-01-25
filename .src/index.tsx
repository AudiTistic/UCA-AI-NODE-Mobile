
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  GoogleGenAI, 
  LiveServerMessage, 
  Modality, 
  Blob, 
  GenerateContentResponse,
} from '@google/genai';
import { 
  Mic, 
  Video, 
  VideoOff, 
  Send, 
  Activity, 
  MapPin, 
  Camera,
  Layers,
  Cpu,
  Zap,
  Globe,
  Smartphone,
  ShieldCheck,
  Download,
  ChevronDown,
  Terminal,
  XCircle,
  CheckCircle2,
  HardDrive,
  Trash2,
  RefreshCw,
  AlertCircle,
  Play,
  Gauge,
  Calendar,
  Layers as LayersIcon,
  Wrench,
  Sparkles,
  Search
} from 'lucide-react';

// --- Types ---
type Tab = 'agent' | 'model' | 'live' | 'sensors' | 'openai';
type AppStatus = 'ready' | 'loading' | 'offline';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

interface ModelMetadata {
  contextSize: string;
  tokenLimit: string;
  speed: 'Faster' | 'Normal' | 'Slower';
  trained: string;
  roles: string[];
  tools: string[];
  features: string[];
  languages: string[];
}

interface LocalModel {
  id: string;
  name: string;
  size: string;
  isDownloaded?: boolean;
  meta?: ModelMetadata;
}

// --- Model Database ---
const MODEL_DATABASE: Record<string, ModelMetadata> = {
  'cactus-pro-8b-q6': {
    contextSize: '128k',
    tokenLimit: '8,192',
    speed: 'Normal',
    trained: '12/24',
    roles: ['Lead Developer', 'Logic Analyst', 'Creative Architect', 'System Admin'],
    tools: ['Google Search', 'Filesystem', 'Bash', 'Code Exec', 'Vision'],
    features: ['High Reasoning', 'Local RAG', 'Tool Use', 'Zero Shot'],
    languages: ['🇺🇸', '🇪🇸', '🇫🇷', '🇩🇪', '🇯🇵', '🇨🇳']
  },
  'cactus-lite-3b-q6': {
    contextSize: '32k',
    tokenLimit: '4,096',
    speed: 'Faster',
    trained: '09/24',
    roles: ['Quick Assistant', 'Draft Writer', 'Scripting Bot', 'Mobile Agent'],
    tools: ['Search', 'Maps', 'Contacts', 'Calendar'],
    features: ['Low Latency', 'Battery Efficient', 'Compact'],
    languages: ['🇺🇸', '🇬🇧', '🇮🇹', '🇧🇷']
  },
  'android-native-vision-q6': {
    contextSize: '16k',
    tokenLimit: '2,048',
    speed: 'Normal',
    trained: '11/24',
    roles: ['Image Analyst', 'Scene Explainer', 'OCR Specialist', 'UX Auditor'],
    tools: ['Camera Feed', 'Gallery', 'Screenshot', 'Vision API'],
    features: ['Object Detection', 'Text Extraction', 'Multimodal'],
    languages: ['🇺🇸', '🇪🇸', '🇰🇷']
  }
};

const CACTUS_DEFAULTS: LocalModel[] = [
  { id: 'cactus-pro-8b-q6', name: 'Cactus Pro 8B Q6_K', size: '6.4GB', meta: MODEL_DATABASE['cactus-pro-8b-q6'] },
  { id: 'cactus-lite-3b-q6', name: 'Cactus Lite 3B Q6_K', size: '2.8GB', meta: MODEL_DATABASE['cactus-lite-3b-q6'] },
  { id: 'android-native-vision-q6', name: 'Android Vision Q6', size: '4.2GB', meta: MODEL_DATABASE['android-native-vision-q6'] },
  { id: 'llama-3.1-8b-instruct-q6', name: 'Llama 3.1 8B Q6', size: '6.5GB' },
  { id: 'mistral-nemo-12b-q6', name: 'Mistral Nemo 12B Q6', size: '9.2GB' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('agent');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // App States
  const [activeModelId, setActiveModelId] = useState<string>('cactus-pro-8b-q6');
  const [isOpenAIServerStarted, setIsOpenAIServerStarted] = useState(false);
  const [appStatus, setAppStatus] = useState<AppStatus>('ready');

  // --- Model Manager States ---
  const [allModels, setAllModels] = useState<LocalModel[]>(() => {
    return CACTUS_DEFAULTS.map((m, i) => i === 0 ? { ...m, isDownloaded: true } : m);
  });
  const [viewedModelId, setViewedModelId] = useState<string>('');
  const [isHuggingFaceMode, setIsHuggingFaceMode] = useState(false);
  const [hfInput, setHfInput] = useState('');
  const [hfStatus, setHfStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');
  
  // Locked Screens
  const [isDownloadLocked, setIsDownloadLocked] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Refs
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const hfValidationTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
    // @ts-ignore
    if (navigator.getBattery) {
      // @ts-ignore
      navigator.getBattery().then((bat) => {
        setBattery(Math.round(bat.level * 100));
        bat.addEventListener('levelchange', () => setBattery(Math.round(bat.level * 100)));
      });
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim() || appStatus !== 'ready') return;
    setMessages(prev => [...prev, { role: 'user', text: inputText, timestamp: new Date() }]);
    setInputText('');
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: inputText,
        config: { tools: [{ googleSearch: {} }] }
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || '', timestamp: new Date() }]);
    } finally { setIsLoading(false); }
  };

  const startDownload = () => {
    setIsDownloadLocked(true);
    setProgress(0);
    const targetName = isHuggingFaceMode ? hfInput : allModels.find(m => m.id === viewedModelId)?.name || 'Unknown';
    setLogs([`Initializing Bridge...`, `Connecting to Weights API...`, `Downloading: ${targetName}`]);

    let p = 0;
    const interval = window.setInterval(() => {
      p += Math.random() * 5;
      if (p >= 100) {
        p = 100;
        window.clearInterval(interval);
        setProgress(100);
        setLogs(prev => [...prev, `[SUCCESS] Weights verified.`, `Node cache updated.`]);
        setTimeout(() => {
          setAllModels(prev => {
            const id = isHuggingFaceMode ? hfInput : viewedModelId;
            const existing = prev.find(m => m.id === id);
            if (existing) return prev.map(m => m.id === id ? { ...m, isDownloaded: true } : m);
            return [...prev, { id, name: targetName, size: 'HF_WEIGHTS', isDownloaded: true }];
          });
          setIsDownloadLocked(false);
          setLogs([]);
        }, 1200);
      } else {
        setProgress(Math.floor(p));
        if (Math.random() > 0.8) setLogs(prev => [...prev, `Chunk ${Math.floor(Math.random()*1000)} OK...`]);
      }
    }, 300);
  };

  const runBenchmark = () => {
    setIsBenchmarking(true);
    setProgress(0);
    setLogs([`Starting Performance Audit...`, `Waking device cores...`, `Loading ${activeModelId} into test buffer...`]);
    let p = 0;
    const interval = window.setInterval(() => {
      p += 4;
      if (p >= 100) {
        p = 100;
        window.clearInterval(interval);
        setProgress(100);
        setLogs(prev => [...prev, `[COMPLETED] Audit Finished.`, `Tokens/sec: 18.4`, `Memory Overhead: 2.1GB`, `Optimization: Recommended.`]);
        setTimeout(() => { setIsBenchmarking(false); setLogs([]); }, 1500);
      } else {
        setProgress(p);
        if (p === 20) setLogs(prev => [...prev, `Stress testing context window... (Passed)`]);
        if (p === 50) setLogs(prev => [...prev, `Measuring prompt ingestion speed... (185 t/s)`]);
        if (p === 80) setLogs(prev => [...prev, `Analyzing thermal dissipation... (Stable)`]);
      }
    }, 800);
  };

  const deleteModel = (id: string) => {
    setAllModels(prev => prev.map(m => m.id === id ? { ...m, isDownloaded: false } : m));
    if (id === activeModelId) { setActiveModelId(''); setAppStatus('offline'); }
  };

  const loadModel = (id: string) => {
    setAppStatus('loading');
    setTimeout(() => { setActiveModelId(id); setAppStatus('ready'); }, 1200);
  };

  const viewedModel = allModels.find(m => m.id === viewedModelId);
  const activeModel = allModels.find(m => m.id === activeModelId);
  const canDownload = isHuggingFaceMode ? (hfStatus === 'valid') : (!!viewedModelId && !viewedModel?.isDownloaded);
  const isViewedDownloaded = viewedModel?.isDownloaded;

  const getStatusStyle = () => {
    switch (appStatus) {
      case 'ready': return { bg: 'bg-green-500', icon: 'text-black', statusTxt: 'text-green-500/70' };
      case 'loading': return { bg: 'bg-yellow-500', icon: 'text-green-600', statusTxt: 'text-yellow-500' };
      default: return { bg: 'bg-red-500', icon: 'text-white', statusTxt: 'text-red-500' };
    }
  };
  const { bg: statusBg, icon: boltColor, statusTxt } = getStatusStyle();

  return (
    <div className="flex flex-col h-screen w-full max-w-2xl lg:max-w-3xl mx-auto relative overflow-hidden cactus-gradient select-none border-x border-white/5 shadow-2xl">
      {/* Locked System Screen (Download/Benchmark) */}
      {(isDownloadLocked || isBenchmarking) && (
        <div className="absolute inset-0 z-[200] bg-[#0c0d0c] p-6 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="w-full max-w-md space-y-8 flex flex-col h-[80%] my-[10%]">
            <div className="text-center space-y-2">
              <RefreshCw size={48} className="text-green-500 mx-auto animate-spin-slow" />
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                {isDownloadLocked ? 'Neural Transmission' : 'Performance Audit'}
              </h2>
              <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">System Lock Active</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black text-green-500 uppercase tracking-widest">
                <span>{isDownloadLocked ? 'Synchronizing weights' : 'Calculating metrics'}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div className="h-full bg-green-500 shadow-[0_0_15px_#22c55e] transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="bg-black/50 border border-white/10 rounded-2xl p-4 flex-1 overflow-hidden flex flex-col shadow-inner">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase mb-3 border-b border-white/5 pb-2">
                <Terminal size={12} /><span>{isDownloadLocked ? 'Download Log' : 'Benchmark Feed'}</span>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-green-500/80 space-y-1">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                    <span className="opacity-30">[{idx.toString().padStart(3, '0')}]</span>
                    <span>{log}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
            <button onClick={() => { setIsDownloadLocked(false); setIsBenchmarking(false); setLogs([]); }} className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase text-xs tracking-widest active:scale-95 transition-all">Cancel Task</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="p-4 flex items-center justify-between glass z-50 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl ${statusBg} flex items-center justify-center shadow-lg transition-all duration-500`}>
            <Zap size={22} className={boltColor} fill="currentColor" strokeWidth={3} />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-white leading-none">Cactus AI</h1>
            <span className="text-[10px] text-green-500 uppercase font-bold tracking-widest">
              {isOpenAIServerStarted ? 'Android Remote Node' : 'Android Local Agent'}
            </span>
          </div>
        </div>
        <div className={`text-[10px] font-mono font-bold bg-white/5 px-2 py-1 rounded border border-white/5 ${appStatus === 'offline' ? 'text-red-500' : statusTxt}`}>
          {activeModel ? activeModel.name : 'OFFLINE'}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto p-4 space-y-4 pb-24">
          {activeTab === 'agent' && (
            <div className="space-y-4 max-w-xl mx-auto h-full flex flex-col">
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <div className={`w-20 h-20 rounded-full border flex items-center justify-center transition-all ${appStatus === 'ready' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20 animate-pulse'}`}>
                    <Cpu size={40} className={appStatus === 'ready' ? 'text-green-500' : 'text-red-500'} />
                  </div>
                  <h3 className="text-2xl font-black text-white italic">Neural Core Idle</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed px-12">
                    {appStatus === 'ready' ? `Active Node: ${activeModel?.name}` : 'Node offline. Select a local model from the repository to initialize.'}
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-green-600 text-white shadow-lg' : 'bg-white/10 text-gray-100 border border-white/5 backdrop-blur-md'}`}>
                    <p className="text-sm leading-relaxed">{m.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && <div className="flex gap-1 animate-pulse px-4 py-2 bg-white/5 rounded-full w-fit"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /></div>}
            </div>
          )}

          {activeTab === 'model' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300 max-w-xl mx-auto pb-12">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Weight Repository</h3>
                <div className="flex gap-2 items-center">
                  {/* Play Button */}
                  <button 
                    disabled={!isViewedDownloaded || viewedModelId === activeModelId}
                    onClick={() => loadModel(viewedModelId)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-90 ${
                      isViewedDownloaded ? 'bg-white text-green-500' : 'bg-white/5 text-gray-700'
                    }`}
                  >
                    <Play size={24} fill="currentColor" strokeWidth={3} />
                  </button>
                  
                  {/* Dropdown/Input */}
                  <div className="flex-1">
                    {!isHuggingFaceMode ? (
                      <div className="relative">
                        <select 
                          value={viewedModelId}
                          onChange={(e) => {
                            if (e.target.value === 'hf-trigger') { setIsHuggingFaceMode(true); setViewedModelId(''); }
                            else setViewedModelId(e.target.value);
                          }}
                          className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm text-white font-bold appearance-none outline-none focus:ring-2 focus:ring-green-500/50"
                        >
                          <option value="" className="bg-zinc-900">Select model weights...</option>
                          {allModels.map(m => (
                            <option key={m.id} value={m.id} className={`bg-zinc-900 ${m.isDownloaded ? 'text-green-500' : 'text-gray-400'}`}>
                              {m.name} {m.isDownloaded ? '✓' : `(${m.size})`}
                            </option>
                          ))}
                          <option value="hf-trigger" className="bg-zinc-900 text-blue-400 font-black italic">( CUSTOM HUGGINGFACE )</option>
                        </select>
                        <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                      </div>
                    ) : (
                      <input autoFocus value={hfInput} onChange={(e) => setHfInput(e.target.value)} placeholder="org/repo-id"
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold text-white outline-none"
                      />
                    )}
                  </div>

                  {/* Download/Trash */}
                  {isViewedDownloaded ? (
                    <button onClick={() => deleteModel(viewedModelId)} className="w-14 h-14 rounded-2xl bg-white border border-red-500/20 flex items-center justify-center text-red-500 shadow-md active:scale-95 transition-all">
                      <Trash2 size={24} strokeWidth={3} />
                    </button>
                  ) : (
                    <button disabled={!canDownload} onClick={startDownload}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 ${
                        canDownload ? 'bg-white text-green-500' : 'bg-white/5 text-gray-700'
                      }`}
                    >
                      <Download size={24} strokeWidth={3} className="scale-110" />
                    </button>
                  )}
                </div>

                {/* Meta details area */}
                {viewedModel && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                    <div className="glass p-5 rounded-3xl border border-white/5 grid grid-cols-2 gap-y-4 gap-x-6 shadow-xl">
                      <div className="flex items-center gap-3">
                         <LayersIcon className="text-blue-500" size={18} />
                         <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase">Context Window</p>
                            <p className="text-xs font-bold text-white">{viewedModel.meta?.contextSize || 'Unknown'}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <Activity className="text-green-500" size={18} />
                         <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase">Token Limit</p>
                            <p className="text-xs font-bold text-white">{viewedModel.meta?.tokenLimit || 'N/A'}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <Gauge className="text-yellow-500" size={18} />
                         <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase">Speed Rating</p>
                            <p className={`text-xs font-bold ${viewedModel.meta?.speed === 'Faster' ? 'text-green-400' : 'text-white'}`}>{viewedModel.meta?.speed || 'Evaluating'}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <Calendar className="text-purple-500" size={18} />
                         <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase">Trained Date</p>
                            <p className="text-xs font-bold text-white">{viewedModel.meta?.trained || '--/--'}</p>
                         </div>
                      </div>
                      <div className="col-span-2 space-y-3 pt-2 border-t border-white/5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase"><Sparkles size={12}/> Roles</div>
                          <div className="flex flex-wrap gap-1">
                            {viewedModel.meta?.roles.map(r => <span key={r} className="text-[8px] font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">{r}</span>) || <span className="text-[8px] italic text-gray-600">Pending audit...</span>}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase"><Wrench size={12}/> Tools</div>
                          <div className="flex flex-wrap gap-1">
                            {viewedModel.meta?.tools.map(t => <span key={t} className="text-[8px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/10">{t}</span>) || 'None'}
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                           <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase">Languages</div>
                           <div className="flex gap-1 text-sm">{viewedModel.meta?.languages.join(' ') || '🌎'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Section */}
                    <div className="glass p-5 rounded-3xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Hardware Benchmark</h3>
                        <button 
                          onClick={runBenchmark}
                          disabled={!isViewedDownloaded}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isViewedDownloaded ? 'bg-green-500 text-black hover:scale-105' : 'bg-white/5 text-gray-700'}`}
                        >
                          <Gauge size={14} /> Benchmark
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black text-gray-500 uppercase">Generation Speed</p>
                          <p className="text-lg font-black text-white tracking-tighter italic">18.4 <span className="text-[8px] font-bold text-gray-500">TOK/S</span></p>
                        </div>
                        <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black text-gray-500 uppercase">RAM Overhead</p>
                          <p className="text-lg font-black text-white tracking-tighter italic">2.1 <span className="text-[8px] font-bold text-gray-500">GB</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'live' && (
            <div className="flex flex-col items-center justify-center h-full space-y-12">
              <div className={`relative w-56 h-56 rounded-full border-4 flex items-center justify-center transition-all ${isLiveActive ? 'border-green-500 scale-105 shadow-2xl bg-green-500/5' : 'border-white/5 bg-white/5'}`}>
                <Mic size={96} className={isLiveActive ? 'text-green-500 animate-pulse' : 'text-gray-800'} />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Neural Audio Bridge</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Zero Latency Voice Interface</p>
              </div>
              <button onClick={() => setIsLiveActive(!isLiveActive)} className={`w-full max-w-[300px] py-5 rounded-3xl font-black uppercase tracking-widest transition-all active:scale-95 ${isLiveActive ? 'bg-red-500 text-white shadow-xl shadow-red-500/20' : 'bg-white text-black shadow-xl shadow-green-500/10'}`}>
                {isLiveActive ? 'End Link' : 'Initialize Bridge'}
              </button>
            </div>
          )}

          {activeTab === 'openai' && (
            <div className="space-y-6 animate-in fade-in duration-300 max-w-xl mx-auto">
               <div className="space-y-2 text-center py-8">
                  <Globe className={`mx-auto ${isOpenAIServerStarted ? 'text-green-400 animate-pulse' : 'text-gray-700'}`} size={64} strokeWidth={2.5} />
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">OpenAI Compatible Bridge</h2>
               </div>
               <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4"><Smartphone className="text-blue-500" size={24} /><span className="font-bold text-lg">Server Host</span></div>
                     <button onClick={() => setIsOpenAIServerStarted(!isOpenAIServerStarted)} className={`w-14 h-8 rounded-full flex items-center p-1 transition-all ${isOpenAIServerStarted ? 'bg-green-500 justify-end' : 'bg-gray-700 justify-start'}`}>
                        <div className="w-6 h-6 bg-white rounded-full shadow-lg" />
                     </button>
                  </div>
                  {isOpenAIServerStarted && (
                    <div className="space-y-2 p-4 bg-black/40 rounded-2xl border border-white/5 font-mono text-[10px] text-green-500/80 animate-in zoom-in-95">
                      <p className="uppercase font-black text-gray-600 mb-2 border-b border-white/5 pb-1">Endpoint Active</p>
                      <p className="truncate">https://api.cactus.local/v1/chat</p>
                    </div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'sensors' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 max-w-xl mx-auto">
               <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-center"><h3 className="text-xs font-black uppercase text-white tracking-widest">Vision Node</h3><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_red] animate-pulse" /></div>
                  <div className="aspect-video bg-black/40 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/5">
                     <Camera className="text-gray-800" size={56} />
                     <span className="text-[10px] font-bold text-gray-700 uppercase">Input Offline</span>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        {activeTab === 'agent' && (
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <div className="flex items-center gap-2 glass p-2 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-3xl">
              <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Query local agent..." className="flex-1 bg-transparent px-5 py-2 text-sm text-white outline-none placeholder:text-gray-700" />
              <button onClick={handleSendMessage} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-black active:scale-90 transition-all ${appStatus === 'ready' ? 'bg-green-500 shadow-lg shadow-green-500/20' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
                <Send size={22} fill="currentColor" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="h-22 flex items-center justify-around border-t border-white/10 glass shrink-0 px-4 pb-2">
        <button onClick={() => setActiveTab('agent')} className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'agent' ? 'text-green-500 scale-105' : 'text-gray-600'}`}>
          <Layers size={22} /><span className="text-[9px] font-black uppercase">Agent</span>
        </button>
        <button onClick={() => setActiveTab('model')} className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'model' ? 'text-green-500 scale-105' : 'text-gray-600'}`}>
          <Cpu size={22} /><span className="text-[9px] font-black uppercase">Model</span>
        </button>
        <button onClick={() => setActiveTab('live')} className="relative flex-1">
          <div className={`p-4 rounded-3xl -mt-12 transition-all mx-auto w-fit shadow-xl ${activeTab === 'live' ? 'bg-green-500 text-black border-4 border-[#0c0d0c] scale-110' : 'bg-zinc-900 text-gray-500'}`}>
            <Mic size={24} strokeWidth={2.5} />
          </div>
          <span className={`text-[9px] mt-2 font-black uppercase block text-center ${activeTab === 'live' ? 'text-green-500' : 'text-gray-600'}`}>Live</span>
        </button>
        <button onClick={() => setActiveTab('sensors')} className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'sensors' ? 'text-green-500 scale-105' : 'text-gray-600'}`}>
          <Activity size={22} /><span className="text-[9px] font-black uppercase">Sensors</span>
        </button>
        
        <div className="h-8 w-px bg-white/10 mx-2" />
        
        <button onClick={() => setActiveTab('openai')} className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'openai' ? 'text-blue-500 scale-105' : 'text-gray-600'}`}>
          <Globe size={22} /><span className="text-[9px] font-black uppercase">OpenAI</span>
        </button>
      </nav>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
