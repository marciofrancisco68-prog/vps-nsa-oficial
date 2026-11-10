import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Cpu, Lock, Terminal, Zap, CheckCircle2 } from 'lucide-react';

export function CarbonShieldModule() {
  const [threatLevel, setThreatLevel] = useState('Nível 0 - Perímetro Blindado');
  const [activeDefense, setActiveDefense] = useState(true);
  const [logs, setLogs] = useState<string[]>([
    '[Carbon Core] Inicializando motor de IA Gemini 4 Carbon...',
    '[Zero-Trust] Inspeção profunda de pacotes (DPI) ativa.',
    '[Firewall] Nenhum vetor de intrusão detectado no BR-EAST-1.'
  ]);

  // Simulação de telemetria de defesa em tempo real baseada em IA
  useEffect(() => {
    if (!activeDefense) return;
    
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString('pt-BR');
      const events = [
        `[${timestamp}] [Gemini 4 Carbon] Varredura heurística concluída: 0 ameaças.`,
        `[${timestamp}] [WAF Sovereign] Bloqueio preventivo de força bruta em porta 22 (IP isolado).`,
        `[${timestamp}] [Mitigação DDoS] Roteamento Anycast otimizado com sucesso.`
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      
      setLogs(prev => [randomEvent, ...prev.slice(0, 5)]);
    }, 12000);

    return () => clearInterval(interval);
  }, [activeDefense]);

  return (
    <div className="bg-slate-900/90 border border-cyan-500/40 p-3 sm:p-3.5 rounded-xl shadow-xl relative overflow-hidden font-mono flex flex-col justify-between h-full min-h-0">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-indigo-500 to-cyan-400"></div>

      {/* CABEÇALHO DO MÓDULO */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider truncate">
            Gemini 4 Carbon — Autonomous Cyber Defense (VPSNsA)
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700 font-bold flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" /> AI Neural Active
          </span>
        </div>
      </div>

      {/* PAINEL DE STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-2.5 shrink-0">
        <div className="bg-slate-950 p-2.5 rounded-lg border border-cyan-500/20 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-400 block">ESTADO DO PERÍMETRO</span>
            <span className="text-xs font-bold text-green-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Protegido
            </span>
          </div>
          <Lock className="w-4 h-4 text-cyan-400/60" />
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-cyan-500/20 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-400 block">MODELO DE DEFESA</span>
            <span className="text-xs font-bold text-cyan-300 mt-0.5 block">Gemini 4 Carbon Core</span>
          </div>
          <Cpu className="w-4 h-4 text-cyan-400/60" />
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-cyan-500/20 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-400 block">LATÊNCIA DO FIREWALL</span>
            <span className="text-xs font-bold text-white mt-0.5 block">&lt; 0.4ms</span>
          </div>
          <ShieldAlert className="w-4 h-4 text-cyan-400/60" />
        </div>
      </div>

      {/* TERMINAL DE LOGS DE SEGURANÇA */}
      <div className="bg-slate-950/90 rounded-lg border border-cyan-500/30 p-2.5 text-[11px] space-y-1 flex-1 min-h-[60px] max-h-40 overflow-y-auto">
        <div className="text-[9px] text-slate-500 uppercase font-bold border-b border-slate-800 pb-1 mb-1 flex items-center justify-between">
          <span>Live Security Audit Logs</span>
          <span className="text-cyan-400">Encrypted Stream</span>
        </div>
        {logs.map((log, index) => (
          <p key={index} className="text-slate-300 font-mono tracking-tight">
            <span className="text-cyan-400">▶</span> {log}
          </p>
        ))}
      </div>
    </div>
  );
}
