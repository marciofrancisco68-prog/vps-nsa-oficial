import React, { useState } from 'react';
import {
  Layers,
  Box,
  Cpu,
  RefreshCw,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCode,
  Sliders,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { K8sDeployment, K8sPod, CiCdPipelineRun } from '../types';

interface OrchestrationViewProps {
  deployments: K8sDeployment[];
  pipelines: CiCdPipelineRun[];
  onScaleDeployment: (id: string, replicas: number) => Promise<void>;
  onToggleHpa: (id: string, enabled: boolean, min: number, max: number, targetCpu: number) => Promise<void>;
  onTriggerRollingUpdate: (id: string) => Promise<void>;
  onTriggerGitHubCiCd: (deploymentName: string, repo: string, branch: string) => Promise<void>;
}

export const OrchestrationView: React.FC<OrchestrationViewProps> = ({
  deployments,
  pipelines,
  onScaleDeployment,
  onToggleHpa,
  onTriggerRollingUpdate,
  onTriggerGitHubCiCd,
}) => {
  const [selectedOrchestrator, setSelectedOrchestrator] = useState<'all' | 'Kubernetes v1.31' | 'Docker Swarm'>('all');
  const [expandedDeploymentId, setExpandedDeploymentId] = useState<string | null>('k8s-dep-01');
  const [activeModal, setActiveModal] = useState<{
    type: 'scale' | 'yaml' | 'logs' | 'pipeline';
    deployment?: K8sDeployment;
    pod?: K8sPod;
    pipeline?: CiCdPipelineRun;
  } | null>(null);

  // Scale Modal State
  const [scaleReplicas, setScaleReplicas] = useState<number>(6);
  const [hpaActive, setHpaActive] = useState<boolean>(true);
  const [hpaMinReplicas, setHpaMinReplicas] = useState<number>(4);
  const [hpaMaxReplicas, setHpaMaxReplicas] = useState<number>(32);
  const [hpaTargetCpuPercent, setHpaTargetCpuPercent] = useState<number>(70);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  const filteredDeployments = deployments.filter(d => {
    if (selectedOrchestrator === 'all') return true;
    return d.orchestrator === selectedOrchestrator;
  });

  const totalPods = deployments.reduce((acc, d) => acc + d.pods.length, 0);

  const openScaleModal = (dep: K8sDeployment) => {
    setScaleReplicas(dep.replicas);
    setHpaActive(dep.hpaEnabled);
    setHpaMinReplicas(dep.hpaMin);
    setHpaMaxReplicas(dep.hpaMax);
    setHpaTargetCpuPercent(dep.hpaTargetCpu);
    setActiveModal({ type: 'scale', deployment: dep });
  };

  const handleApplyScale = async () => {
    if (!activeModal?.deployment) return;
    setIsProcessingAction(true);
    await onScaleDeployment(activeModal.deployment.id, scaleReplicas);
    await onToggleHpa(
      activeModal.deployment.id,
      hpaActive,
      hpaMinReplicas,
      hpaMaxReplicas,
      hpaTargetCpuPercent
    );
    setIsProcessingAction(false);
    setActiveModal(null);
  };

  const handleQuickRollingUpdate = async (dep: K8sDeployment) => {
    setIsProcessingAction(true);
    await onTriggerRollingUpdate(dep.id);
    setIsProcessingAction(false);
  };

  const handleQuickCiCdTrigger = async (dep: K8sDeployment) => {
    setIsProcessingAction(true);
    await onTriggerGitHubCiCd(dep.name, dep.gitRepo.replace('https://github.com/', ''), dep.gitBranch);
    setIsProcessingAction(false);
  };

  return (
    <div className="space-y-6">
      {/* Cluster Overview Banner */}
      <div className="p-6 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900/80 to-slate-950 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>ORQUESTRADOR DE CONTÊINERES ENTERPRISE · KUBERNETES & DOCKER SWARM</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              Gestão Automatizada de Pods, Serviços e Auto-Scaling
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Provisione, escale e monitore milhares a trilhões de instâncias em tempo real. Compatibilidade total com manifestos Kubernetes v1.31 e Docker Swarm Stacks integrados com CI/CD oficial do GitHub.
            </p>
          </div>

          {/* Orchestrator Filter Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => setSelectedOrchestrator('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedOrchestrator === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({deployments.length})
            </button>
            <button
              onClick={() => setSelectedOrchestrator('Kubernetes v1.31')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedOrchestrator === 'Kubernetes v1.31'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kubernetes v1.31
            </button>
            <button
              onClick={() => setSelectedOrchestrator('Docker Swarm')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedOrchestrator === 'Docker Swarm'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Docker Swarm
            </button>
          </div>
        </div>

        {/* Quick Cluster Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px]">Pods / Tarefas Ativas</span>
            <p className="text-xl font-bold text-cyan-400 tabular-nums">{totalPods} Réplicas</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px]">Nós de Computação</span>
            <p className="text-xl font-bold text-white tabular-nums">4 Nós Ativos</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px]">Auto-Scaling HPA</span>
            <p className="text-xl font-bold text-emerald-400">Ativo (70% CPU)</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px]">Estratégia de Deploy</span>
            <p className="text-xl font-bold text-indigo-300">Rolling Update (0 Down)</p>
          </div>
        </div>
      </div>

      {/* Deployments / Swarm Services List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Box className="w-4 h-4 text-cyan-400" />
            Serviços e Deployments em Execução no Cluster
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Mostrando {filteredDeployments.length} deployments
          </span>
        </div>

        <div className="space-y-4">
          {filteredDeployments.map(dep => {
            const isExpanded = expandedDeploymentId === dep.id;
            return (
              <div
                key={dep.id}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4 transition-all hover:border-slate-700"
              >
                {/* Header Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white font-mono">{dep.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {dep.orchestrator}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono text-slate-300 bg-slate-800">
                        namespace: {dep.namespace}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          dep.status === 'Healthy'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {dep.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                      <a
                        href={`https://${dep.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
                      >
                        https://{dep.domain} <ExternalLink className="w-3 h-3" />
                      </a>
                      <span>·</span>
                      <span className="truncate max-w-xs text-slate-300">img: {dep.image}</span>
                      <span>·</span>
                      <span>{dep.lastDeployedAt}</span>
                    </div>
                  </div>

                  {/* Quick Action Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => openScaleModal(dep)}
                      disabled={isProcessingAction}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                      title="Configurar réplicas e auto-scaling HPA"
                    >
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Auto-Scale ({dep.replicas} pods)</span>
                    </button>

                    <button
                      onClick={() => handleQuickRollingUpdate(dep)}
                      disabled={isProcessingAction}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                      title="Reiniciar pods em modo Zero-Downtime"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Rolling Update</span>
                    </button>

                    <button
                      onClick={() => handleQuickCiCdTrigger(dep)}
                      disabled={isProcessingAction}
                      className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-xs font-bold text-slate-950 flex items-center gap-1.5 transition-colors"
                      title="Disparar pipeline CI/CD do GitHub"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Trigger CI/CD</span>
                    </button>

                    <button
                      onClick={() => setActiveModal({ type: 'yaml', deployment: dep })}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Ver Manifesto YAML / Compose"
                    >
                      <FileCode className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setExpandedDeploymentId(isExpanded ? null : dep.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title={isExpanded ? 'Recolher detalhes' : 'Expandir pods'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Metrics & Resource Usage Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 text-[10px]">Réplicas Disponíveis</span>
                    <p className="font-bold text-white tabular-nums">
                      {dep.availableReplicas} / {dep.replicas} Pods Ativos
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">CPU Request / Limit</span>
                    <p className="font-bold text-cyan-400 tabular-nums">
                      {dep.cpuRequest} / {dep.cpuLimit}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Memória RAM Alocada</span>
                    <p className="font-bold text-indigo-300 tabular-nums">
                      {dep.memoryRequest} / {dep.memoryLimit}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">HPA Auto-Scale</span>
                    <p className="font-bold text-emerald-400 tabular-nums">
                      {dep.hpaEnabled ? `Min: ${dep.hpaMin} · Max: ${dep.hpaMax} (Alvo ${dep.hpaTargetCpu}%)` : 'Desativado'}
                    </p>
                  </div>
                </div>

                {/* Expanded Pods / Tasks List */}
                {isExpanded && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">
                        Instâncias de Pods / Tarefas em Execução ({dep.pods.length}):
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Distribuição Anycast entre os nós AMD EPYC, Grace Hopper e Ampere
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-800">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="text-[10px] uppercase bg-slate-950 text-slate-400 font-mono">
                          <tr>
                            <th className="px-3 py-2">Nome do Pod</th>
                            <th className="px-3 py-2">Nó Host</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">IP Cluster</th>
                            <th className="px-3 py-2">CPU</th>
                            <th className="px-3 py-2">Memória</th>
                            <th className="px-3 py-2">Restarts</th>
                            <th className="px-3 py-2">Uptime</th>
                            <th className="px-3 py-2">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-mono">
                          {dep.pods.map(pod => (
                            <tr key={pod.id} className="hover:bg-slate-900/60">
                              <td className="px-3 py-2 text-cyan-300 font-semibold">{pod.name}</td>
                              <td className="px-3 py-2 text-slate-400">{pod.node}</td>
                              <td className="px-3 py-2">
                                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                                  {pod.status}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-slate-300">{pod.ip}</td>
                              <td className="px-3 py-2 text-white font-bold">{pod.cpuUsage}</td>
                              <td className="px-3 py-2 text-slate-200">{pod.memoryUsage}</td>
                              <td className="px-3 py-2 text-slate-400">{pod.restarts}</td>
                              <td className="px-3 py-2 text-slate-400">{pod.uptime}</td>
                              <td className="px-3 py-2">
                                <button
                                  onClick={() => setActiveModal({ type: 'logs', pod })}
                                  className="text-[11px] text-cyan-400 hover:underline"
                                >
                                  Logs
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* GitHub CI/CD Automated Pipelines Stream */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              Execuções Recentes do Pipeline CI/CD GitHub
            </h2>
            <p className="text-xs text-slate-400">
              Gatilhos automáticos disparados via push no GitHub oficial da VPSNsA.
            </p>
          </div>

          <button
            onClick={() => handleQuickCiCdTrigger(deployments[0])}
            disabled={isProcessingAction}
            className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Disparar Webhook GitHub (Simular Push)
          </button>
        </div>

        <div className="space-y-3">
          {pipelines.map(pipe => (
            <div
              key={pipe.id}
              className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3 font-mono text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300 font-bold">{pipe.repo}</span>
                  <span className="text-slate-400">({pipe.branch})</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                    PASSED ({pipe.duration})
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Comitente: <span className="text-slate-200">{pipe.committer}</span> · {pipe.startedAt}
                </div>
              </div>

              <p className="text-slate-300 text-xs font-sans">
                Commit <span className="font-mono text-cyan-400 font-semibold">{pipe.commitSha}</span>: {pipe.commitMessage}
              </p>

              {/* 5 Stages Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800/80">
                {pipe.stages.map((stage, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium truncate">{stage.name}</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-slate-500 font-mono">{stage.duration}</p>
                  </div>
                ))}
              </div>

              {/* Collapsible log view button */}
              <button
                onClick={() => setActiveModal({ type: 'pipeline', pipeline: pipe })}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Terminal className="w-3.5 h-3.5" />
                Inspecionar Logs de Compilação do Container
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Scale Deployment & Auto-Scaling HPA */}
      {activeModal?.type === 'scale' && activeModal.deployment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Auto-Scaling & Réplicas de Contêineres
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <p className="text-slate-300">Deployment Alvo:</p>
                <p className="text-sm font-bold text-white font-mono">{activeModal.deployment.name}</p>
                <p className="text-[11px] text-slate-500">Orquestrador: {activeModal.deployment.orchestrator}</p>
              </div>

              {/* Replica Manual Scale */}
              <div className="space-y-2 p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-200">Número de Réplicas Estáticas:</label>
                  <span className="text-base font-bold text-cyan-400 font-mono">{scaleReplicas} Pods</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="48"
                  value={scaleReplicas}
                  onChange={e => setScaleReplicas(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 réplica</span>
                  <span>12 réplicas</span>
                  <span>24 réplicas</span>
                  <span>48 réplicas</span>
                </div>
              </div>

              {/* HPA Toggle */}
              <div className="space-y-3 p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-200">Horizontal Pod Autoscaler (HPA)</p>
                    <p className="text-[11px] text-slate-400">Escalamento dinâmico baseado no uso de CPU/RAM</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={hpaActive}
                    onChange={e => setHpaActive(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>

                {hpaActive && (
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                    <div>
                      <label className="text-[11px] text-slate-400">Min Pods:</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={hpaMinReplicas}
                        onChange={e => setHpaMinReplicas(parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Max Pods:</label>
                      <input
                        type="number"
                        min="2"
                        max="128"
                        value={hpaMaxReplicas}
                        onChange={e => setHpaMaxReplicas(parseInt(e.target.value, 10) || 10)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Alvo CPU (%):</label>
                      <input
                        type="number"
                        min="20"
                        max="95"
                        value={hpaTargetCpuPercent}
                        onChange={e => setHpaTargetCpuPercent(parseInt(e.target.value, 10) || 70)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyScale}
                disabled={isProcessingAction}
                className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                {isProcessingAction ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Aplicar no Cluster'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: YAML / Compose Manifest */}
      {activeModal?.type === 'yaml' && activeModal.deployment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                Manifesto Declarativo: {activeModal.deployment.name}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto bg-black/90 p-4 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 select-all">
              <pre className="whitespace-pre-wrap">{activeModal.deployment.yamlManifest}</pre>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">
                Assinado com Argon2id para implantação no nó {activeModal.deployment.namespace}
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Pod Logs */}
      {activeModal?.type === 'logs' && activeModal.pod && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Logs em Tempo Real: {activeModal.pod.name}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto bg-black/95 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
              <p className="text-cyan-400">[SYSTEM] Stream iniciado em {activeModal.pod.ip} no nó {activeModal.pod.node}</p>
              <p className="text-slate-400">2026-10-27T08:50:11.492Z [HTTP] GET /api/health 200 OK - 0.4ms</p>
              <p className="text-slate-400">2026-10-27T08:50:18.110Z [AUTH] Argon2id session verified for token k8s_session</p>
              <p className="text-slate-400">2026-10-27T08:50:24.019Z [CONTAINER] Handled 1,420 requests/sec with zero memory leaks</p>
              <p className="text-emerald-400">2026-10-27T08:50:30.984Z [INGRESS] TLS 1.3 Let's Encrypt Wildcard Handshake nominal</p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800 shrink-0">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Fechar Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Pipeline Run Logs */}
      {activeModal?.type === 'pipeline' && activeModal.pipeline && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                Pipeline Run: {activeModal.pipeline.repo} ({activeModal.pipeline.commitSha})
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto bg-black/95 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
              {activeModal.pipeline.logs.map((log, idx) => (
                <p key={idx} className="leading-relaxed">
                  <span className="text-cyan-400 mr-2">❯</span>
                  <span>{log}</span>
                </p>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800 shrink-0">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
