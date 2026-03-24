import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-mono overflow-hidden relative">
                    {/* Background Glitch Effect */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#ef4444_0,transparent_70%)] animate-pulse"></div>
                        <div className="absolute inset-0 bg-grid-white/[0.05]"></div>
                    </div>

                    <div className="relative z-10 w-full max-w-2xl bg-black/40 backdrop-blur-3xl border border-red-500/20 rounded-[2.5rem] p-12 shadow-[0_0_100px_rgba(239,68,68,0.1)]">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.5em] mb-2 animate-pulse">System Critical Failure</div>
                                <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Matrix Breach Detected</h1>
                            </div>
                            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 flex items-center justify-center rounded-2xl">
                                <span className="text-red-500 text-3xl font-black italic">!</span>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 max-h-[300px] overflow-auto custom-scrollbar">
                            <p className="text-red-400 text-xs font-black uppercase tracking-widest mb-4">Fault Diagnostics:</p>
                            <code className="text-[10px] text-slate-400 leading-relaxed block whitespace-pre-wrap">
                                {this.state.error && this.state.error.toString()}
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </code>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-500/20"
                            >
                                Initiate Hot Reload
                            </button>
                            <button
                                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                                className="py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10"
                            >
                                Force Reset Layer
                            </button>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Telemetry Port: {window.location.port || '80'}</p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
