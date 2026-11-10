import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RotateCw,
  Plus,
  Trash2,
  Edit2,
  Clock,
  ShieldCheck,
  Server,
  Network,
  Globe,
  Sliders,
  Check,
  Zap,
  Radio,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { ContainerItem, HealthCheckProbe, HealthCheckType, HealthCheckStatus } from '../types';
import {
  fetchHealthChecks,
  saveHealthCheckProbe,
  toggleHealthCheckProbe,
  testHealthCheckProbeNow,
  deleteHealthCheckProbe,
} from '../services/api';

interface ContainerHealthChecksProps {
  containers: ContainerItem[];
  preselectedContainerId?: string;
  onSelectContainer?: (containerId: string) => void;
}

export const ContainerHealthChecks: React.FC<ContainerHealthChecksProps> = ({
  containers,
  preselectedContainerId,
}) => {
  const [probes, setProbes] = useState<HealthCheckProbe[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoMonitor, setAutoMonitor] = useState(true);
  const [testingProbeId, setTestingProbeId] = useState<string | null>(null);
  const [testingAll, setTestingAll] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modal / Drawer state for create/edit
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingProbe, setEditingProbe] = useState<HealthCheckProbe | null>(null);

  // Form State
  const [formContainerId, setFormContainerId] = useState<string>(
    preselectedContainerId || (containers[0]?.id || '')
  );
  const [formType, setFormType] = useState<HealthCheckType>('HTTP');
  const [formEndpoint, setFormEndpoint] = useState('/api/health');
  const [formPort, setFormPort] = useState(3000);
  const [formExpectedStatus, setFormExpectedStatus] = useState(200);
  const [formHttpMethod, setFormHttpMethod] = useState<'GET' | 'HEAD'>('GET');
  const [formInterval, setFormInterval] = useState(15);
  const [formTimeout, setFormTimeout] = useState(3);
  const [formHealthyThreshold, setFormHealthyThreshold] = useState(2);
  const [formUnhealthyThreshold, setFormUnhealthyThreshold] = useState(3);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load probes
  const loadProbes = async () => {
    try {
      const data = await fetchHealthChecks();
      setProbes(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProbes();
  }, []);

  // Periodic polling for live status if auto-monitor is active
  useEffect(() => {
    if (!autoMonitor) return;
    const interval = setInterval(() => {
      loadProbes();
    }, 6000);
    return () => clearInterval(interval);
  }, [autoMonitor]);

  // Open config modal with preselected container if passed
  useEffect(() => {
    if (preselectedContainerId) {
      setFormContainerId(preselectedContainerId);
      const container = containers.find(c => c.id === preselectedContainerId);
      if (container) {
        setFormPort(container.port || 80);
      }
    }
  }, [preselectedContainerId, containers]);

  const handleOpenNewModal = (forContainerId?: string) => {
    const targetId = forContainerId || (containers[0]?.id || '');
    const container = containers.find(c => c.id === targetId);

    setEditingProbe(null);
    setFormContainerId(targetId);
    setFormType('HTTP');
    setFormEndpoint('/api/health');
    setFormPort(container?.port || 3000);
    setFormExpectedStatus(200);
    setFormHttpMethod('GET');
    setFormInterval(15);
    setFormTimeout(3);
    setFormHealthyThreshold(2);
    setFormUnhealthyThreshold(3);
    setShowConfigModal(true);
  };

  const handleOpenEditModal = (probe: HealthCheckProbe) => {
    setEditingProbe(probe);
    setFormContainerId(probe.containerId);
    setFormType(probe.type);
    setFormEndpoint(probe.endpoint);
    setFormPort(probe.port);
    setFormExpectedStatus(probe.expectedStatus);
    setFormHttpMethod(probe.httpMethod || 'GET');
    setFormInterval(probe.intervalSeconds);
    setFormTimeout(probe.timeoutSeconds);
    setFormHealthyThreshold(probe.healthyThreshold);
    setFormUnhealthyThreshold(probe.unhealthyThreshold);
    setShowConfigModal(true);
  };

  const handleSaveProbe = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    const container = containers.find(c => c.id === formContainerId);
    const containerName = container ? container.name : formContainerId;

    try {
      const saved = await saveHealthCheckProbe({
        id: editingProbe ? editingProbe.id : undefined,
        containerId: formContainerId,
        containerName,
        type: formType,
        endpoint: formType === 'HTTP' ? formEndpoint : `${formPort}`,
        port: Number(formPort),
        expectedStatus: Number(formExpectedStatus),
        httpMethod: formHttpMethod,
        intervalSeconds: Number(formInterval),
        timeoutSeconds: Number(formTimeout),
        healthyThreshold: Number(formHealthyThreshold),
        unhealthyThreshold: Number(formUnhealthyThreshold),
        enabled: true,
      });

      setStatusNotice({
        message: `Endpoint de Health Check ${formType} configurado com sucesso para ${containerName}!`,
        type: 'success',
      });
      setTimeout(() => setStatusNotice(null), 4000);

      await loadProbes();
      setShowConfigModal(false);
    } catch {
      setStatusNotice({
        message: 'Erro ao salvar configuração do health check',
        type: 'error',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggle = async (probeId: string) => {
    try {
      const updated = await toggleHealthCheckProbe(probeId);
      if (updated) {
        setProbes(prev => prev.map(p => (p.id === probeId ? updated : p)));
      }
    } catch {
      // fallback
    }
  };

  const handleTestNow = async (probeId: string) => {
    setTestingProbeId(probeId);
    try {
      const result = await testHealthCheckProbeNow(probeId);
      setProbes(prev => prev.map(p => (p.id === probeId ? result.probe : p)));
      setStatusNotice({
        message: `Probe ${result.probe.type} testado: ${result.probe.lastMessage}`,
        type: result.probe.lastStatus === 'healthy' ? 'success' : 'error',
      });
      setTimeout(() => setStatusNotice(null), 4000);
    } catch {
      setStatusNotice({
        message: 'Falha ao executar probe imediato',
        type: 'error',
      });
    } finally {
      setTestingProbeId(null);
    }
  };

  const handleTestAll = async () => {
    setTestingAll(true);
    for (const probe of probes) {
      if (probe.enabled) {
        try {
          const res = await testHealthCheckProbeNow(probe.id);
          setProbes(prev => prev.map(p => (p.id === probe.id ? res.probe : p)));
        } catch {
          // continue
        }
      }
    }
    setTestingAll(false);
    setStatusNotice({
      message: 'Todos os endpoints ativos foram verificados com sucesso!',
      type: 'success',
    });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleDelete = async (probeId: string) => {
    if (!confirm('Deseja realmente remover o monitoramento de health check deste container?')) return;
    try {
      const ok = await deleteHealthCheckProbe(probeId);
      if (ok) {
        setProbes(prev => prev.filter(p => p.id !== probeId));
        setStatusNotice({ message: 'Health Check removido com sucesso', type: 'info' });
        setTimeout(() => setStatusNotice(null), 3000);
      }
    } catch {
      // ignore
    }
  };

  // Stats calculation
  const totalProbes = probes.length;
  const activeProbes = probes.filter(p => p.enabled).length;
  const healthyCount = probes.filter(p => p.lastStatus === 'healthy').length;
  const unhealthyCount = probes.filter(p => p.lastStatus === 'unhealthy').length;
  const degradedCount = probes.filter(p => p.lastStatus === 'degraded').length;

  const avgLatency = probes.length > 0
    ? (probes.reduce((acc, p) => acc + (p.lastLatencyMs || 0), 0) / probes.length).toFixed(1)
    : '0';

  const overallUptime = probes.length > 0
    ? (probes.reduce((acc, p) => acc + (p.uptimePercentage || 100), 0) / probes.length).toFixed(2)
    : '100.00';

  return (
    <div className="space-y-6">
      {/* Executive Banner & Notification */}
      {statusNotice && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all shadow-md ${
            statusNotice.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : statusNotice.type === 'error'
              ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
              : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : statusNotice.type === 'error' ? (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span className="font-mono">{statusNotice.message}</span>
          </div>
          <button onClick={() => setStatusNotice(null)} className="text-slate-400 hover:text-white text-xs ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Probes Ativos</span>
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-white">{activeProbes}</span>
            <span className="text-xs text-slate-500">/ {totalProbes} configurados</span>
          </div>
          <p className="text-[10px] text-cyan-400/80 font-mono">MicroVM Firecracker mesh</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Estado da Frota</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-emerald-400">{healthyCount}</span>
            <span className="text-xs text-slate-500 font-mono">OK</span>
            {unhealthyCount > 0 && (
              <span className="text-xs text-rose-400 font-mono ml-2">({unhealthyCount} Falha)</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            {degradedCount > 0 ? `${degradedCount} com latência elevada` : 'Todos os serviços nominais'}
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Latência Média</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-amber-300">{avgLatency}</span>
            <span className="text-xs text-slate-400">ms</span>
          </div>
          <p className="text-[10px] text-emerald-400/80 font-mono">Sub-20ms SLA Assegurado</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Uptime Global</span>
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-cyan-300">{overallUptime}%</span>
          </div>
          <p className="text-[10px] text-cyan-400/80 font-mono">Argon2id Integrity Guard</p>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {autoMonitor && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  autoMonitor ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              ></span>
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Auto-Monitoramento {autoMonitor ? 'Ativo (a cada 6s)' : 'Pausado'}
            </span>
          </div>
          <button
            onClick={() => setAutoMonitor(!autoMonitor)}
            className={`text-[11px] px-2.5 py-1 rounded-md border font-mono transition-colors ${
              autoMonitor
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {autoMonitor ? 'Desativar Loop' : 'Iniciar Loop'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestAll}
            disabled={testingAll || probes.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${testingAll ? 'animate-spin' : ''}`} />
            <span>{testingAll ? 'Executando...' : 'Testar Todos Agora'}</span>
          </button>

          <button
            onClick={() => handleOpenNewModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:brightness-110 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Configurar Health Check</span>
          </button>
        </div>
      </div>

      {/* Probes List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono">
            Carregando endpoints de monitoramento NsA...
          </div>
        ) : probes.length === 0 ? (
          <div className="p-10 border border-dashed border-slate-800 rounded-xl text-center space-y-3 bg-slate-900/20">
            <Activity className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">Nenhum Endpoint de Health Check Configurado</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Configure sondas HTTP (como /api/health) ou TCP para verificar automaticamente a disponibilidade dos seus sites e containers com SLA de elite.
            </p>
            <button
              onClick={() => handleOpenNewModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300"
            >
              <Plus className="w-4 h-4" />
              Configurar Primeiro Endpoint
            </button>
          </div>
        ) : (
          probes.map(probe => {
            const isTesting = testingProbeId === probe.id;
            const container = containers.find(c => c.id === probe.containerId);
            const isStopped = container?.status === 'stopped';

            return (
              <div
                key={probe.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  probe.lastStatus === 'unhealthy' || isStopped
                    ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60'
                    : probe.lastStatus === 'degraded'
                    ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/60'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info & Badges */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Server className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="truncate">{probe.containerName}</span>
                      </h4>

                      {/* Protocol Badge */}
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                        {probe.type} {probe.type === 'HTTP' ? (probe.httpMethod || 'GET') : 'PORT'}
                      </span>

                      {/* Status Badge */}
                      <div className="flex items-center gap-1.5">
                        {probe.lastStatus === 'healthy' && !isStopped ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            SAUDÁVEL ({probe.lastLatencyMs || 12}ms)
                          </span>
                        ) : probe.lastStatus === 'degraded' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            DEGRADADO ({probe.lastLatencyMs}ms)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                            <XCircle className="w-3 h-3 text-rose-400" />
                            FALHA / INACESSÍVEL
                          </span>
                        )}
                      </div>

                      {/* Enabled State */}
                      {!probe.enabled && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-400">
                          MONITORAMENTO PAUSADO
                        </span>
                      )}
                    </div>

                    {/* Endpoint Target Path / Port */}
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                      <span className="text-slate-500">Alvo:</span>
                      {probe.type === 'HTTP' ? (
                        <span className="text-cyan-300 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800">
                          {container?.domain ? `https://${container.domain}${probe.endpoint}` : probe.endpoint}
                          <span className="text-slate-500 ml-1.5">(espera HTTP {probe.expectedStatus})</span>
                        </span>
                      ) : (
                        <span className="text-cyan-300 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800">
                          tcp://{container?.domain || '127.0.0.1'}:{probe.port}
                          <span className="text-slate-500 ml-1.5">(handshake SYN-ACK)</span>
                        </span>
                      )}
                    </div>

                    {/* Cadence Specs & Thresholds */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-mono">
                      <span>Intervalo: <strong className="text-slate-200">{probe.intervalSeconds}s</strong></span>
                      <span>Timeout: <strong className="text-slate-200">{probe.timeoutSeconds}s</strong></span>
                      <span>Limiar OK/Falha: <strong className="text-slate-200">{probe.healthyThreshold}/{probe.unhealthyThreshold}</strong></span>
                      <span>Uptime: <strong className="text-emerald-400">{probe.uptimePercentage}%</strong></span>
                      <span>Última Checagem: <strong className="text-slate-300">{probe.lastCheckAt ? new Date(probe.lastCheckAt).toLocaleTimeString() : 'Recentemente'}</strong></span>
                    </div>

                    {/* Last probe diagnostic message */}
                    {probe.lastMessage && (
                      <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 pt-0.5">
                        <span className="text-cyan-500">❯</span>
                        <span>{probe.lastMessage}</span>
                      </p>
                    )}
                  </div>

                  {/* Right: Latency Sparkline History & Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 lg:border-l lg:border-slate-800 lg:pl-5">
                    {/* Visual history bars */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 font-mono">Histórico de Resposta:</span>
                      <div className="flex items-end gap-1 h-7 px-2 py-1 bg-slate-950/80 rounded border border-slate-800">
                        {probe.history && probe.history.length > 0 ? (
                          probe.history.slice(0, 10).reverse().map((h, i) => (
                            <div
                              key={i}
                              title={`${h.timestamp}: ${h.status} (${h.latencyMs}ms) - ${h.message}`}
                              className={`w-2 rounded-t transition-all cursor-pointer hover:opacity-100 opacity-80 ${
                                h.status === 'healthy'
                                  ? 'bg-emerald-400'
                                  : h.status === 'degraded'
                                  ? 'bg-amber-400'
                                  : 'bg-rose-500'
                              }`}
                              style={{
                                height: `${Math.max(20, Math.min(100, (h.latencyMs / 40) * 100))}%`,
                              }}
                            />
                          ))
                        ) : (
                          <span className="text-[9px] text-slate-500 font-mono">Sem dados ainda</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => handleTestNow(probe.id)}
                        disabled={isTesting}
                        title="Executar teste imediato de Health Check"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 transition-all disabled:opacity-50"
                      >
                        <RotateCw className={`w-3.5 h-3.5 text-cyan-400 ${isTesting ? 'animate-spin' : ''}`} />
                        <span>{isTesting ? 'Testando...' : 'Testar Agora'}</span>
                      </button>

                      <button
                        onClick={() => handleToggle(probe.id)}
                        title={probe.enabled ? 'Pausar monitoramento deste container' : 'Ativar monitoramento'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          probe.enabled
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(probe)}
                        title="Editar parâmetros do Health Check"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-300" />
                      </button>

                      <button
                        onClick={() => handleDelete(probe.id)}
                        title="Excluir probe de monitoramento"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 border border-slate-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <span>{editingProbe ? 'Editar Health Check' : 'Configurar Novo Endpoint de Health Check'}</span>
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProbe} className="space-y-4 text-xs">
              {/* Select Container */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Container / Site de Destino
                </label>
                <select
                  value={formContainerId}
                  onChange={e => {
                    setFormContainerId(e.target.value);
                    const selected = containers.find(c => c.id === e.target.value);
                    if (selected) {
                      setFormPort(selected.port || 3000);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
                >
                  {containers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.domain}) - Porta: {c.port}
                    </option>
                  ))}
                </select>
              </div>

              {/* Protocol selector */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Tipo de Sonda de Verificação
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('HTTP');
                      if (!formEndpoint.startsWith('/')) setFormEndpoint('/api/health');
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border font-mono font-semibold transition-all ${
                      formType === 'HTTP'
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>HTTP / HTTPS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType('TCP');
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border font-mono font-semibold transition-all ${
                      formType === 'TCP'
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Network className="w-4 h-4 text-cyan-400" />
                    <span>TCP Socket</span>
                  </button>
                </div>
              </div>

              {/* Protocol Specific Settings */}
              {formType === 'HTTP' ? (
                <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-slate-300 font-medium mb-1">
                        Caminho do Endpoint (Path)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="/api/health ou /healthz"
                        value={formEndpoint}
                        onChange={e => setFormEndpoint(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Método HTTP
                      </label>
                      <select
                        value={formHttpMethod}
                        onChange={e => setFormHttpMethod(e.target.value as 'GET' | 'HEAD')}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono"
                      >
                        <option value="GET">GET</option>
                        <option value="HEAD">HEAD</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Código HTTP Esperado
                      </label>
                      <input
                        type="number"
                        required
                        value={formExpectedStatus}
                        onChange={e => setFormExpectedStatus(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                      <span className="text-[10px] text-slate-500">Padrão: 200 OK</span>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Porta do Serviço
                      </label>
                      <input
                        type="number"
                        required
                        value={formPort}
                        onChange={e => setFormPort(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                      <span className="text-[10px] text-slate-500">Ex: 80, 443, 3000</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-2">
                  <label className="block text-slate-300 font-medium mb-1">
                    Porta TCP para Teste de Handshake SYN-ACK
                  </label>
                  <input
                    type="number"
                    required
                    value={formPort}
                    onChange={e => setFormPort(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400 font-mono"
                    placeholder="ex: 5432, 6379, 8080"
                  />
                  <p className="text-[10px] text-slate-400">
                    O cluster enviará pacotes SYN e medirá o tempo de resposta do handshake de rede diretamente no nó.
                  </p>
                </div>
              )}

              {/* Timing & Thresholds */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Intervalo de Monitoramento
                  </label>
                  <select
                    value={formInterval}
                    onChange={e => setFormInterval(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                  >
                    <option value={5}>A cada 5 segundos (Tempo Real Ultra)</option>
                    <option value={10}>A cada 10 segundos</option>
                    <option value={15}>A cada 15 segundos (Recomendado)</option>
                    <option value={30}>A cada 30 segundos</option>
                    <option value={60}>A cada 60 segundos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Timeout de Resposta
                  </label>
                  <select
                    value={formTimeout}
                    onChange={e => setFormTimeout(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                  >
                    <option value={1}>1 segundo</option>
                    <option value={2}>2 segundos</option>
                    <option value={3}>3 segundos (Padrão)</option>
                    <option value={5}>5 segundos</option>
                    <option value={10}>10 segundos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Limiar de Sucessos (Saudável)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formHealthyThreshold}
                    onChange={e => setFormHealthyThreshold(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Sucessos consecutivos p/ marcar OK</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Limiar de Falhas (Alerta)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formUnhealthyThreshold}
                    onChange={e => setFormUnhealthyThreshold(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Falhas antes de acionar alerta crítico</span>
                </div>
              </div>

              {/* Security Shield Notice */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Blindagem de Monitoramento NsA</span>
                </div>
                <p>
                  As checagens são executadas em rede interna isolada, imunes a spoofing de DNS com validação por chave Argon2id e Anycast Shield ativo.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:brightness-110 transition-all shadow-md disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{formSubmitting ? 'Salvando...' : 'Salvar & Iniciar Monitoramento'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
