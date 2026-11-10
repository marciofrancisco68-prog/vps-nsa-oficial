import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  Clock, 
  Copy, 
  Check, 
  RotateCw, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  GitBranch, 
  Fingerprint, 
  Activity, 
  Layers,
  Zap,
  Play,
  Pause
} from 'lucide-react';
import { 
  getWebhookLogs, 
  simulateRealTimeDeliveryStatus, 
  redeliverWebhook, 
  sendTestPing, 
  WebhookLog, 
  WebhookStatus 
} from '../services/webhookLogsService';

export type { WebhookLog, WebhookStatus };

interface WebhookLogsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  repoId?: string;
  repoName?: string;
}

export const WebhookLogsDrawer: React.FC<WebhookLogsDrawerProps> = ({
  isOpen,
  onClose,
  repoId,
  repoName: initialRepoName,
}) => {
  const repoName = repoId || initialRepoName || 'vpsnsa/ecommerce-enterprise';
  const [filter, setFilter] = useState<'all' | 'success' | 'fail'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [redeliveringId, setRedeliveringId] = useState<string | null>(null);
  const [testingPing, setTestingPing] = useState(false);
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);
  const [lastLiveUpdatedId, setLastLiveUpdatedId] = useState<string | null>(null);

  // Deliveries loaded from mock service: getWebhookLogs(repoName) returns exactly 10 entries
  const [deliveries, setDeliveries] = useState<WebhookLog[]>(() => {
    return getWebhookLogs(repoName);
  });

  // Reload 10 entries whenever the drawer opens or repository changes
  useEffect(() => {
    if (isOpen) {
      const logs = getWebhookLogs(repoName);
      setDeliveries(logs);
    }
  }, [isOpen, repoName]);

  // Real-time delivery status simulation helper
  useEffect(() => {
    if (!isOpen || !isLiveSimulating) return;

    // Use the helper to simulate real-time delivery status updates
    const unsubscribe = simulateRealTimeDeliveryStatus(
      repoName,
      (updatedLogs, latestChanged) => {
        setDeliveries(updatedLogs);
        setLastLiveUpdatedId(latestChanged.id);
        setTimeout(() => setLastLiveUpdatedId(null), 2500);
      },
      5000 // interval of simulated events
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen, repoName, isLiveSimulating]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRedeliver = async (eventItem: WebhookLog) => {
    setRedeliveringId(eventItem.id);
    await new Promise((r) => setTimeout(r, 550));
    const updated = redeliverWebhook(repoName, eventItem.id);
    setDeliveries((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setRedeliveringId(null);
  };

  const handleTriggerTestPing = async () => {
    setTestingPing(true);
    await new Promise((r) => setTimeout(r, 600));
    const newPing = sendTestPing(repoName);
    setDeliveries((prev) => [newPing, ...prev.slice(0, 9)]);
    setTestingPing(false);
  };

  const summary = useMemo(() => {
    const total = deliveries.length;
    const success = deliveries.filter((d) => d.status === 'success').length;
    const fail = deliveries.filter((d) => d.status === 'fail').length;
    const avgLatency =
      total > 0
        ? Math.round(deliveries.reduce((a, b) => a + (b.durationMs || 100), 0) / total)
        : 0;
    return { total, success, fail, avgLatency };
  }, [deliveries]);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      if (filter === 'success') return d.status === 'success';
      if (filter === 'fail') return d.status === 'fail';
      return true;
    });
  }, [deliveries, filter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-In Drawer */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[540px] md:w-[650px] bg-[#0c0414] border-l border-cyan-500/40 shadow-[-15px_0_40px_rgba(0,0,0,0.85)] z-50 flex flex-col font-sans text-slate-100 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-purple-500/30 bg-gradient-to-r from-[#150726] via-[#10051e] to-[#0c0414] shrink-0 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 p-[1.5px] shadow-lg shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <div className="min-w-0 truncate">
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 truncate">
                  <span>GitHub Webhook Deliveries</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">
                    10 Entregas
                  </span>
                </h2>
                <p className="text-xs text-slate-400 truncate font-mono">
                  Repositório: <strong className="text-cyan-300">{repoName}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Real-time simulation toggle */}
              <button
                onClick={() => setIsLiveSimulating(!isLiveSimulating)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isLiveSimulating
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
                title={isLiveSimulating ? 'Pausar simulação em tempo real' : 'Ativar simulação em tempo real'}
              >
                {isLiveSimulating ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Live Simulação ON</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-2.5 h-2.5" />
                    <span>Live Pausado</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0 cursor-pointer"
                title="Fechar painel (Esc)"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Metrics summary cards */}
          <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl text-center">
              <div className="text-slate-400 text-[9px] uppercase font-bold flex items-center justify-center gap-1">
                <Layers className="w-2.5 h-2.5 text-cyan-400" />
                Total
              </div>
              <div className="text-white font-bold text-xs mt-0.5">{summary.total}</div>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-800/50 p-2 rounded-xl text-center">
              <div className="text-emerald-400 text-[9px] uppercase font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                Sucesso
              </div>
              <div className="text-emerald-300 font-bold text-xs mt-0.5">{summary.success}</div>
            </div>
            <div className="bg-rose-950/40 border border-rose-800/50 p-2 rounded-xl text-center">
              <div className="text-rose-400 text-[9px] uppercase font-bold flex items-center justify-center gap-1">
                <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
                Falha
              </div>
              <div className="text-rose-300 font-bold text-xs mt-0.5">{summary.fail}</div>
            </div>
            <div className="bg-indigo-950/40 border border-indigo-800/50 p-2 rounded-xl text-center">
              <div className="text-indigo-300 text-[9px] uppercase font-bold flex items-center justify-center gap-1">
                <Activity className="w-2.5 h-2.5 text-indigo-400" />
                Latência
              </div>
              <div className="text-cyan-300 font-bold text-xs mt-0.5">{summary.avgLatency}ms</div>
            </div>
          </div>

          {/* Webhook Endpoint Info Box */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2 text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-2 truncate">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-400">Payload URL:</span>
              <span className="text-cyan-300 truncate font-semibold">https://api.vpsnsa.cloud/v1/webhooks/github</span>
            </div>
            <button
              onClick={() => handleCopy('payload-url', 'https://api.vpsnsa.cloud/v1/webhooks/github')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 shrink-0 transition-colors cursor-pointer text-[10px]"
              title="Copiar URL do Webhook"
            >
              {copiedId === 'payload-url' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Filter Pills and Test Button */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-mono mr-1">Filtrar por Status:</span>
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                Todos ({summary.total})
              </button>
              <button
                onClick={() => setFilter('success')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  filter === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Sucesso ({summary.success})</span>
              </button>
              <button
                onClick={() => setFilter('fail')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  filter === 'fail'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-400 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                <AlertCircle className="w-3 h-3 text-rose-400" />
                <span>Falha ({summary.fail})</span>
              </button>
            </div>

            <button
              onClick={handleTriggerTestPing}
              disabled={testingPing}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Disparar ping test imediato via mock service"
            >
              <Send className={`w-3 h-3 ${testingPing ? 'animate-spin' : ''}`} />
              <span>{testingPing ? 'Disparando...' : 'Test Ping'}</span>
            </button>
          </div>
        </div>

        {/* Deliveries List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 font-mono text-xs no-scrollbar">
          {filteredDeliveries.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
              <Radio className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-slate-300 font-bold">Nenhum evento corresponde ao filtro selecionado.</p>
              <p className="text-[11px] text-slate-500">Altere o filtro acima para ver todas as 10 entregas.</p>
            </div>
          ) : (
            filteredDeliveries.map((d) => {
              const isExpanded = expandedId === d.id;
              const isSuccess = d.status === 'success';
              const isJustUpdated = lastLiveUpdatedId === d.id;

              return (
                <div
                  key={d.id}
                  className={`rounded-2xl border transition-all ${
                    isJustUpdated
                      ? 'ring-2 ring-cyan-400 scale-[1.01]'
                      : ''
                  } ${
                    isSuccess
                      ? 'border-slate-800 hover:border-emerald-500/50 bg-[#120722]/80'
                      : 'border-rose-900/60 hover:border-rose-500/70 bg-rose-950/20'
                  }`}
                >
                  {/* Delivery Item Header Bar: id + deliveryTime + status */}
                  <div className="px-3.5 pt-3 pb-2 border-b border-slate-800/60 flex items-center justify-between gap-2 flex-wrap bg-slate-950/40 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-[11px] text-slate-400">ID:</span>
                      <span className="text-[11px] font-bold text-cyan-300 font-mono select-all">
                        {d.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Delivery Time */}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span title={`Horário de entrega exato: ${d.deliveryTime}`}>
                          {d.deliveryTime}
                        </span>
                      </div>

                      {/* Status Field: 'success' | 'fail' */}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                          isSuccess
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/60'
                            : 'bg-rose-950/80 text-rose-300 border border-rose-600/60'
                        }`}
                      >
                        {isSuccess ? (
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
                        )}
                        <span>status: {d.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Delivery Item Summary */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {isSuccess ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{d.statusText || '200 OK'}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-400 font-bold text-xs">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>{d.statusText || 'Falha na Entrega'}</span>
                          </span>
                        )}

                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold uppercase">
                          {d.event || 'push'}
                        </span>

                        {d.branch && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                            <GitBranch className="w-3 h-3 text-slate-500" />
                            {d.branch}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        {d.durationMs && <span className="text-cyan-400 font-bold">{d.durationMs}ms</span>}
                        {d.relativeTime && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">{d.relativeTime}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-slate-300 font-sans text-xs">
                      <span className="font-semibold text-white">{d.commitMessage || 'Webhook delivery payload event'}</span>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                        {d.commitSha && <span>Commit: <strong className="text-cyan-300">{d.commitSha}</strong></span>}
                        {d.sender && (
                          <>
                            <span>•</span>
                            <span>Sender: <strong className="text-purple-300">{d.sender}</strong></span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quick actions for this delivery */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 truncate max-w-[260px]">
                        <span className="truncate">UUID: {d.deliveryId || d.id}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRedeliver(d)}
                          disabled={redeliveringId === d.id}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer text-[10px] disabled:opacity-50"
                          title="Reenviar este payload de webhook para simular entrega via mock service"
                        >
                          <RotateCw className={`w-3 h-3 ${redeliveringId === d.id ? 'animate-spin text-cyan-400' : ''}`} />
                          <span>{redeliveringId === d.id ? 'Reenviando...' : 'Redeliver'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : d.id)}
                          className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer text-[10px]"
                        >
                          <span>{isExpanded ? 'Ocultar Detalhes' : 'Ver Headers & Payload'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Payload & Headers Accordion */}
                  {isExpanded && (
                    <div className="p-3.5 border-t border-slate-800 bg-black/60 rounded-b-2xl space-y-3 animate-in fade-in duration-150">
                      <div>
                        <div className="flex items-center justify-between pb-1 text-[10px] text-slate-400 uppercase font-bold">
                          <span>Request Headers</span>
                          {d.headers && (
                            <button
                              onClick={() => handleCopy(`headers-${d.id}`, JSON.stringify(d.headers, null, 2))}
                              className="text-cyan-400 hover:underline flex items-center gap-1 text-[9px] cursor-pointer"
                            >
                              <Copy className="w-2.5 h-2.5" /> Copiar Headers
                            </button>
                          )}
                        </div>
                        <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-cyan-300 overflow-x-auto leading-relaxed">
                          {d.headers
                            ? Object.entries(d.headers).map(([k, v]) => `${k}: ${v}\n`)
                            : 'content-type: application/json\nx-github-delivery: ' + d.id}
                        </pre>
                      </div>

                      <div>
                        <div className="flex items-center justify-between pb-1 text-[10px] text-slate-400 uppercase font-bold">
                          <span>Response Body ({d.statusText || d.status})</span>
                          {d.responsePayload && (
                            <button
                              onClick={() => handleCopy(`payload-${d.id}`, JSON.stringify(d.responsePayload, null, 2))}
                              className="text-cyan-400 hover:underline flex items-center gap-1 text-[9px] cursor-pointer"
                            >
                              <Copy className="w-2.5 h-2.5" /> Copiar Resposta
                            </button>
                          )}
                        </div>
                        <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-emerald-300 overflow-x-auto leading-relaxed">
                          {JSON.stringify(d.responsePayload || { status: d.status, id: d.id, time: d.deliveryTime }, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 border-t border-purple-500/30 bg-[#0c0414] shrink-0 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLiveSimulating ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
            <span>
              {isLiveSimulating ? 'Simulação em tempo real ativa (Polling/Auto-heal 5s)' : 'Simulação em tempo real pausada'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Fechar Painel
          </button>
        </div>

      </div>
    </div>
  );
};

export default WebhookLogsDrawer;
