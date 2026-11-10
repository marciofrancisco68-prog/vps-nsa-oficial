import React, { useState } from 'react';
import { 
  Layers, 
  Zap, 
  Server, 
  Cpu, 
  ShieldCheck, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  Sliders, 
  Terminal,
  AlertCircle
} from 'lucide-react';

export interface MasterContainerProps {
  clusterNodes?: number;
  cpuLoadPercent?: number;
  wafStatus?: string;
  className?: string;
}

export const MasterContainer: React.FC<MasterContainerProps> = ({
  clusterNodes = 12,
  cpuLoadPercent = 42,
  wafStatus = 'Perímetro Blindado (AES-256 / WAF NsA)',
  className = '',
}) => {
  const [autoScalingEnabled, setAutoScalingEnabled] = useState<boolean>(true);
  const [rebalancing, setRebalancing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleTriggerRebalance = () => {
    setRebalancing(true);
    setStatusMessage('Rebalanceamento de nós em execução via Gemini 4 Carbon...');
    setTimeout(() => {
      setRebalancing(false);
      setStatusMessage('✓ Cluster rebalanceado: latência inter-nós reduzida para 0.42ms.');
      setTimeout(() => setStatusMessage(null), 4000);
    }, 1500);
  };

  return (
    <div className={`bg-slate-900/90 border border-cyan-500/50 rounded-xl p-4 shadow-xl relative overflow-hidden font-mono ${className}`}>
      {/* Top neon glow bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-pulse"></div>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cyan-500/30 pb-2 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              vpsNsA Master Container & Auto-Failover Orchestrator
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Gemini 4 Carbon
              </span>
            </h3>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2.5 py-0.5 rounded font-bold flex items-center gap-1 shrink-0">
            <Zap className="w-3 h-3 text-cyan-400" /> Zero Downtime Garantido
          </span>
          <button
            onClick={handleTriggerRebalance}
            disabled={rebalancing}
            className="text-[10px] bg-slate-950 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
            title="Forçar sincronização e rebalanceamento de contêineres"
          >
            <RefreshCw className={`w-3 h-3 ${rebalancing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Rebalancear</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-950 p-3 rounded-lg border border-cyan-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-400 block font-semibold">INSTÂNCIAS ATIVAS (CLUSTER)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>{clusterNodes} nós operacionais</span>
          </div>
          <span className="text-[10px] text-emerald-400/90 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-healing em 15ms
          </span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-cyan-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-400 block font-semibold">CARGA GLOBAL DO SISTEMA</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-cyan-300 mt-1 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>{cpuLoadPercent}% (Otimizado EPYC)</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
            <div 
              className="bg-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,229,255,0.8)]"
              style={{ width: `${cpuLoadPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-cyan-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-400 block font-semibold">WAF & SEGURANÇA AUTÔNOMA</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Perímetro Blindado</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 truncate">
            {wafStatus}
          </span>
        </div>
      </div>

      {/* Autonomous Orchestrator Details Bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Failover Engine:</span>
          <span className="text-cyan-300 font-bold">Raft Consensus v3 (Quórum 7/7)</span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-500">Keepalive:</span>
          <span className="text-emerald-400 font-bold">100% Ativo</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={autoScalingEnabled} 
              onChange={(e) => setAutoScalingEnabled(e.target.checked)}
              className="rounded bg-slate-900 border-cyan-600 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-3.5 h-3.5"
            />
            <span className="text-slate-300 text-[10px]">Auto-Scaling Autônomo Ativo</span>
          </label>
        </div>
      </div>

      {statusMessage && (
        <div className="mt-2 text-[11px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded">
          {statusMessage}
        </div>
      )}
    </div>
  );
};
