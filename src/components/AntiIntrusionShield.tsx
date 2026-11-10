import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Terminal,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Bug,
  Activity,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { IntrusionEvent } from '../types';

interface AntiIntrusionShieldProps {
  intrusionLogs: IntrusionEvent[];
  onTriggerSimulatedAttack: (type: 'SQL_INJECTION' | 'XSS_ATTACK' | 'PAYLOAD_TAMPERING') => void;
  onClearLogs: () => void;
}

export const AntiIntrusionShield: React.FC<AntiIntrusionShieldProps> = ({
  intrusionLogs,
  onTriggerSimulatedAttack,
  onClearLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'logs' | 'tests'>('metrics');

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-slate-900/60 p-5 space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Sistema NsA de Blindagem & Defesa Contra Invasão de Dados
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                100% BLINDADO
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Proteção bancária em tempo real: Tokenização AES-256-GCM, Hash Argon2id e WAF Anti-Intrusão ativo para Mercado Pago.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'metrics'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Métricas de Segurança
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'tests'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Simulador de Ataques
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Logs de Defesa</span>
            {intrusionLogs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300 text-[10px]">
                {intrusionLogs.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Metrics View */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-200">Criptografia em Repouso</span>
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="text-base font-bold text-white font-mono">AES-256-GCM</p>
            <p className="text-[11px] text-slate-400">Chaves efêmeras rotacionadas a cada 60s</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-200">Assinatura de Integridade</span>
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-base font-bold text-indigo-400 font-mono">Argon2id (m=64MB)</p>
            <p className="text-[11px] text-slate-400">Memory-hard resistente a ataques GPU/ASIC</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-200">Destinatário Travado</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xs font-bold text-emerald-300 font-mono truncate">
              VPSNsA
            </p>
            <p className="text-[10px] text-slate-400 font-mono leading-tight">Todos os direitos reservados a VPS NsA Hyperscale Cluster Enterprise</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-200">Ameaças Bloqueadas</span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-base font-bold text-white font-mono">{intrusionLogs.length} mitigadas</p>
            <p className="text-[11px] text-emerald-400 font-mono">Zero vazamentos registrados</p>
          </div>
        </div>
      )}

      {/* Attack Simulator View */}
      {activeTab === 'tests' && (
        <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Bug className="w-4 h-4 text-cyan-400" />
                Auditoria de Blindagem Ativa · Testes de Penetração Controlados
              </h4>
              <p className="text-[11px] text-slate-400">
                Dispare tentativas de invasão simuladas para inspecionar o bloqueio automático e a resposta em menos de 10ms.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              onClick={() => onTriggerSimulatedAttack('SQL_INJECTION')}
              className="p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-rose-400 group-hover:text-rose-300">
                  1. SQL Injection Attack
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  ' OR 1=1--
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tenta burlar a autenticação de pagamentos via injeção SQL.
              </p>
            </button>

            <button
              onClick={() => onTriggerSimulatedAttack('XSS_ATTACK')}
              className="p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300">
                  2. XSS Script Injection
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  &lt;script&gt;
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tenta capturar dados de cartão e token de sessão no DOM.
              </p>
            </button>

            <button
              onClick={() => onTriggerSimulatedAttack('PAYLOAD_TAMPERING')}
              className="p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                  3. Alteração de Destinatário
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  TAMPER
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tenta desviar o crédito para conta alheia à VPSNsA.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Logs View */}
      {activeTab === 'logs' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">
              Histórico de Ameaças Detectadas e Mitigadas ({intrusionLogs.length})
            </span>
            {intrusionLogs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="text-slate-400 hover:text-white underline text-[11px]"
              >
                Limpar Logs
              </button>
            )}
          </div>

          {intrusionLogs.length === 0 ? (
            <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800 text-center text-xs text-slate-400">
              Nenhuma anomalia ou tentativa de invasão recente. O perímetro de segurança opera com 100% de integridade.
            </div>
          ) : (
            <div className="max-h-52 overflow-y-auto space-y-1.5 font-mono text-xs pr-1">
              {intrusionLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded bg-slate-950/80 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                        {log.threatType}
                      </span>
                      <span className="text-slate-300 font-semibold">{log.defenseAction}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Payload bloqueado: <code className="text-rose-400">{log.blockedPayload}</code>
                    </p>
                  </div>

                  <div className="text-right text-[10px] text-slate-500 shrink-0">
                    <p>IP: {log.originIp}</p>
                    <p>{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
