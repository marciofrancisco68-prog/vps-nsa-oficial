import React from 'react';
import { AlertTriangle, Cpu, Layers, X, ArrowUpRight, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { TelemetryAlert } from '../types';

interface TelemetryAlertToastProps {
  alerts: TelemetryAlert[];
  onDismiss: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  onNormalize: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TelemetryAlertToast: React.FC<TelemetryAlertToastProps> = ({
  alerts,
  onDismiss,
  onNavigateTab,
  onNormalize,
  soundEnabled,
  onToggleSound,
}) => {
  if (alerts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed top-20 right-4 z-50 max-w-md w-full flex flex-col gap-3 pointer-events-none"
    >
      {alerts.map((alert) => {
        const isCpu = alert.metric === 'cpu' || alert.metric === 'container-cpu';
        const isContainer = alert.metric === 'container-cpu' || alert.metric === 'container-memory';
        const metricLabel = isContainer 
          ? (alert.metric === 'container-cpu' ? 'Container · Limiar CPU' : 'Container · Limiar RAM') 
          : (isCpu ? 'CPU Global' : 'Memória RAM DDR5');
        const formattedTime = new Date(alert.timestamp).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        return (
          <div
            key={alert.id}
            className="pointer-events-auto rounded-xl border border-rose-500/70 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4"
            role="alert"
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  {isCpu ? <Cpu className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-400 tracking-wide uppercase">
                      Alerta de Limiar · {metricLabel}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      &gt; {alert.threshold}%
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400">
                    Disparado às {formattedTime}
                  </p>
                </div>
              </div>

              {/* Dismiss button */}
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
                title="Descartar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Alert Message & Metric Gauge Highlight */}
            <div className="mt-3 p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 flex items-center justify-between">
              <div className="text-xs text-slate-200">
                <p className="font-semibold text-rose-200">{alert.message}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Uso atual atingiu <span className="font-mono font-bold text-rose-400 tabular-nums">{alert.currentValue}%</span> (Limite crítico: {alert.threshold}%)
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-rose-400 tabular-nums">
                  {alert.currentValue}%
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('orchestration')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <span>Auto-Escalar K8s</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onNormalize}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                  title="Reduzir carga e normalizar métricas"
                >
                  Normalizar
                </button>
              </div>

              {/* Sound indicator toggle */}
              <button
                onClick={onToggleSound}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
                title={soundEnabled ? 'Silenciar bipes de alerta' : 'Ativar aviso sonoro'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
