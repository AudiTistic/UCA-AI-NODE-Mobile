import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Terminal, CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';

interface LoadingScreenProps {
    model: { id: string; name: string; size: string };
    onCancel: () => void;
    onComplete: () => void;
}

type LoadStatus = 'none' | 'loading' | 'success' | 'error';

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ model, onCancel, onComplete }) => {
    const [status, setStatus] = useState<LoadStatus>('none');
    const [logs, setLogs] = useState<string[]>([]);
    const [selectedContext, setSelectedContext] = useState(2048);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const startLoad = () => {
        setStatus('loading');
        setLogs([
            '[SYSTEM] Load Sequence Initialized',
            `[INFO] Target: ${model.name}`,
            `[INFO] Context: ${selectedContext}tk`,
            '[ERROR] Device Bridge Offline. Manual initialization required on hardware.',
            '[DONE] Synchronization Standby.'
        ]);
        // Set to error state or just leave in standby
        setTimeout(() => setStatus('error'), 1000);
    };

    const getHeaderStyle = () => {
        switch (status) {
            case 'loading': return { color: 'text-amber-500', icon: RefreshCw, text: 'LOADING NEURAL CORE...', animate: true };
            case 'success': return { color: 'text-green-500', icon: CheckCircle2, text: 'MODEL ACTIVE', animate: false };
            case 'error': return { color: 'text-red-500', icon: AlertCircle, text: 'LOAD FAILED', animate: false };
            default: return { color: 'text-amber-500', icon: Info, text: 'INITIALIZING LOAD SEQUENCE', animate: false };
        }
    };

    const { color, icon: Icon, text, animate } = getHeaderStyle();

    return (
        <div className="absolute inset-0 z-[100] bg-[#111] flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className={`p-6 border-b border-white/10 ${color.replace('text-', 'bg-')}/10 flex items-center gap-4`}>
                <Icon className={`${color} ${animate ? 'animate-spin' : ''}`} size={28} />
                <h2 className={`${color} text-lg font-black tracking-widest font-mono`}>{text}</h2>
            </div>

            <div className="flex-1 p-8 flex flex-col max-w-2xl mx-auto w-full overflow-hidden">
                {/* Model Info */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Target Model</p>
                    <h3 className="text-3xl font-black text-white mb-2">{model.name}</h3>
                    <div className="flex gap-2">
                        <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded border border-blue-500/20">{model.size}</span>
                        <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-1 rounded border border-purple-500/20">Q4_K_M</span>
                    </div>
                </div>

                {status === 'none' && (
                    <div className="mb-auto">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Context Window Size</p>
                        <div className="flex flex-wrap gap-2">
                            {[2048, 4096, 8192, 16384, 32768].map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedContext(size)}
                                    className={`px-4 py-3 rounded-xl border font-bold text-sm transition-all ${selectedContext === size
                                        ? 'bg-green-500 text-black border-green-500'
                                        : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    {size >= 1024 ? `${size / 1024}k` : size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {status !== 'none' && (
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-4 flex-1 mb-8 overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase mb-3 border-b border-white/5 pb-2">
                            <Terminal size={14} /> System Logs
                        </div>
                        <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2">
                            {logs.map((log, i) => (
                                <div key={i} className={`pb-1 ${log.includes('COMPLETE') ? 'text-green-500' : 'text-gray-400'}`}>
                                    {log}
                                </div>
                            ))}
                            <div ref={logEndRef} />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-8 flex gap-4">
                    {status === 'success' ? (
                        <button
                            onClick={onComplete}
                            className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black rounded-xl uppercase tracking-widest text-lg transition-all active:scale-95"
                        >
                            Enter Neural Interface
                        </button>
                    ) : (
                        <>
                            {status !== 'loading' && (
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-400 font-bold rounded-xl border border-white/5 uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={status === 'loading' ? onCancel : startLoad}
                                className={`flex-[2] py-4 font-black rounded-xl border uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 ${status === 'loading'
                                    ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                                    : 'bg-white text-black border-white hover:bg-gray-200'
                                    }`}
                            >
                                {status === 'loading' ? (
                                    <>Aborting Sequence...</>
                                ) : (
                                    <>Initialize Model</>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
