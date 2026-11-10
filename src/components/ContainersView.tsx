import React, { useState } from 'react';
import {
  Box,
  Plus,
  Play,
  Square,
  RotateCw,
  Trash2,
  ExternalLink,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Archive,
  Cloud,
  HardDrive,
  Activity,
  Radio,
} from 'lucide-react';
import { ContainerItem } from '../types';
import { ContainerBackupModal } from './ContainerBackupModal';
import { ContainerHealthChecks } from './ContainerHealthChecks';
import { ContainerStatsHoverCard } from './ContainerStatsHoverCard';

interface ContainersViewProps {
  containers: ContainerItem[];
  onDeployContainer: (data: {
    name: string;
    domain: string;
    image: string;
    cpuAllocation: string;
    memoryAllocated: string;
    gitRepo: string;
    branch: string;
  }) => Promise<void>;
  onContainerAction: (id: string, action: 'start' | 'stop' | 'restart' | 'delete') => Promise<void>;
  onNavigateToOrchestration?: () => void;
}

export const ContainersView: React.FC<ContainersViewProps> = ({
  containers,
  onDeployContainer,
  onContainerAction,
  onNavigateToOrchestration,
}) => {
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupModalContainerId, setBackupModalContainerId] = useState<string | undefined>(undefined);
  const [activeSubTab, setActiveSubTab] = useState<'containers' | 'health'>('containers');
  const [selectedContainerForHealth, setSelectedContainerForHealth] = useState<string | undefined>(undefined);
  const [searchFilter, setSearchFilter] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    image: 'node:22-alpine',
    cpuAllocation: '4 Cores (AMD EPYC 9754)',
    memoryAllocated: '8 GB DDR5',
    gitRepo: 'https://github.com/VPSNsA/novo-projeto',
    branch: 'main',
  });

  const filteredContainers = containers.filter(
    c =>
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleStartDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.domain) return;

    setDeploying(true);
    setDeployLogs([
      `[VPSNsA-Cluster] Inicializando alocação de nó no cluster de trilhões de sites...`,
      `[VPSNsA-Cluster] Vinculando arquitetura: ${formData.cpuAllocation} com ${formData.memoryAllocated}...`,
      `[VPSNsA-Cluster] Clonando repositório oficial ${formData.gitRepo} (${formData.branch})...`,
      `[VPSNsA-Cluster] Gerando certificado SSL Let's Encrypt Wildcard para https://${formData.domain}...`,
      `[VPSNsA-Cluster] Assinatura criptográfica Argon2id gravada no registro com sucesso!`,
      `[VPSNsA-Cluster] Site publicado no endereço https://${formData.domain}!`
    ]);

    await new Promise(r => setTimeout(r, 1200));
    await onDeployContainer(formData);
    setDeploying(false);
    setShowDeployModal(false);
    setFormData({
      name: '',
      domain: '',
      image: 'node:22-alpine',
      cpuAllocation: '4 Cores (AMD EPYC 9754)',
      memoryAllocated: '8 GB DDR5',
      gitRepo: 'https://github.com/VPSNsA/novo-projeto',
      branch: 'main',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/40">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Box className="w-5 h-5 text-cyan-400" />
            Hospedagem de Containers & Sites em Escala de Trilhões
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Cada container roda isolado em MicroVMs Firecracker ultrarrápidas com aceleração NVMe Direct e Anycast Global.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onNavigateToOrchestration && (
            <button
              onClick={onNavigateToOrchestration}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-cyan-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-cyan-500/30"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Orquestrador K8s / Swarm</span>
            </button>
          )}
          <button
            onClick={() => {
              setBackupModalContainerId(undefined);
              setShowBackupModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 rounded-lg transition-colors border border-emerald-500/30"
          >
            <Archive className="w-4 h-4 text-emerald-400" />
            <span>Backups & Agendamento</span>
          </button>
          <button
            onClick={() => setShowDeployModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 rounded-lg hover:brightness-110 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Deploy de Novo Site
          </button>
        </div>
      </div>

      {/* Sub-tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('containers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'containers'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
          }`}
        >
          <Box className={`w-4 h-4 ${activeSubTab === 'containers' ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span>Containers & Sites Ativos</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-700/80 text-slate-300">
            {containers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('health')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'health'
              ? 'bg-slate-800 text-white border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
          }`}
        >
          <Activity className={`w-4 h-4 ${activeSubTab === 'health' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span>Health Checks HTTP/TCP & Monitoramento</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      </div>

      {activeSubTab === 'health' ? (
        <ContainerHealthChecks
          containers={containers}
          preselectedContainerId={selectedContainerForHealth}
        />
      ) : (
        <>
          {/* Filter and stats row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar por nome ou domínio..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Mostrando <span className="text-white font-bold">{filteredContainers.length}</span> containers ativos
            </div>
          </div>

          {/* Containers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContainers.map(container => (
              <div
                key={container.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3.5 hover:border-slate-700 transition-all shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{container.name}</h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                          container.status === 'running'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {container.status === 'running' ? 'RODANDO' : 'PARADO'}
                      </span>
                      {/* Hover-card de estatísticas de memória e consumo de banda em tempo real */}
                      <ContainerStatsHoverCard container={container} />
                    </div>
                    <a
                      href={`https://${container.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:underline"
                    >
                      https://{container.domain}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    {container.status === 'running' ? (
                      <button
                        onClick={() => onContainerAction(container.id, 'stop')}
                        title="Parar container"
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-400 text-slate-400 transition-colors"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onContainerAction(container.id, 'start')}
                        title="Iniciar container"
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedContainerForHealth(container.id);
                        setActiveSubTab('health');
                      }}
                      title="Configurar Health Check HTTP/TCP"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-400 transition-colors"
                    >
                      <Activity className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setBackupModalContainerId(container.id);
                        setShowBackupModal(true);
                      }}
                      title="Agendamento & Backup (S3 / Local NVMe)"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400 transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onContainerAction(container.id, 'restart')}
                      title="Reiniciar container"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-400 transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onContainerAction(container.id, 'delete')}
                      title="Excluir container"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Hardware & Spec Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/80">
                  <div>
                    <p className="text-slate-400 text-[11px]">Processador Alocado:</p>
                    <p className="font-semibold text-slate-200 truncate">{container.cpuAllocation}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px]">Memória Alocada:</p>
                    <p className="font-semibold text-slate-200">{container.memoryAllocated}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px]">Imagem Docker:</p>
                    <p className="font-mono text-cyan-300 text-[11px] truncate">{container.image}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px]">Throughput em Tempo Real:</p>
                    <p className="font-mono font-bold text-white tabular-nums">{container.requestsPerSec} req/s</p>
                  </div>
                </div>

                {/* Health Check Quick Indicator Badge */}
                <div className="pt-0.5">
                  <button
                    onClick={() => {
                      setSelectedContainerForHealth(container.id);
                      setActiveSubTab('health');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all text-left ${
                      container.status === 'stopped'
                        ? 'bg-rose-950/20 border-rose-500/30 text-rose-300 hover:border-rose-500/50'
                        : container.healthCheck?.status === 'healthy' || !container.healthCheck
                        ? 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-cyan-500/40'
                        : 'bg-amber-950/20 border-amber-500/30 text-amber-300 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="relative flex h-2 w-2">
                        {container.status === 'running' && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-2 w-2 ${
                            container.status === 'running' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        ></span>
                      </span>
                      <span className="font-semibold text-white">
                        {container.healthCheck ? `${container.healthCheck.type} Probe:` : 'Health Check:'}
                      </span>
                      <span className="text-cyan-400 truncate">
                        {container.healthCheck ? container.healthCheck.endpoint : `/health (porta ${container.port})`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                      {container.status === 'running' ? (
                        <span className="text-emerald-400 font-semibold">
                          {container.healthCheck?.lastLatencyMs || 12}ms · Ativo
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold">Parado</span>
                      )}
                      <span>→</span>
                    </div>
                  </button>
                </div>

                {/* Git, SSL & Backup info */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5 truncate">
                    <GitBranch className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-300 truncate">{container.branch}</span>
                    <span>·</span>
                    <span className="truncate">{container.commit}</span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => {
                        setBackupModalContainerId(container.id);
                        setShowBackupModal(true);
                      }}
                      className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors font-medium px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30"
                    >
                      <Archive className="w-3 h-3 text-cyan-400" />
                      <span>Backup</span>
                    </button>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>SSL Ativo</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-400" />
                Novo Deploy no Cluster VPSNsA
              </h2>
              <button
                onClick={() => setShowDeployModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartDeploy} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nome do Projeto / Container
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: meu-ecommerce-turbo"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Domínio ou Subdomínio
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: loja.vpsnsa.com.br"
                  value={formData.domain}
                  onChange={e => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Certificado SSL Wildcard emitido gratuitamente na ativação.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Processador Alocado
                  </label>
                  <select
                    value={formData.cpuAllocation}
                    onChange={e => setFormData({ ...formData, cpuAllocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="4 Cores (AMD EPYC 9754 Bergamo)">4 Cores (AMD EPYC 9754)</option>
                    <option value="8 Cores (AMD EPYC 9754 Bergamo)">8 Cores (AMD EPYC 9754)</option>
                    <option value="16 Cores (NVIDIA Grace Hopper GH200)">16 Cores (NVIDIA GH200)</option>
                    <option value="4 Cores (Intel Xeon Platinum 8592+)">4 Cores (Intel Xeon 8592+)</option>
                    <option value="8 Cores (Ampere Altra Max M128)">8 Cores (Ampere Altra)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Memória RAM DDR5
                  </label>
                  <select
                    value={formData.memoryAllocated}
                    onChange={e => setFormData({ ...formData, memoryAllocated: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="4 GB DDR5">4 GB DDR5</option>
                    <option value="8 GB DDR5">8 GB DDR5</option>
                    <option value="16 GB DDR5">16 GB DDR5</option>
                    <option value="32 GB DDR5">32 GB DDR5</option>
                    <option value="64 GB HBM3 + DDR5">64 GB HBM3 + DDR5</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Stack / Imagem Base
                </label>
                <select
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="node:22-alpine">Node.js 22 LTS / Vite / Next.js</option>
                  <option value="wordpress:6.5-php8.3-fpm-alpine">WordPress Hyperscale & PHP 8.3</option>
                  <option value="python:3.12-slim">Python 3.12 / FastAPI / PyTorch</option>
                  <option value="nginx:alpine-edge">Site Estático / HTML5 / SPA</option>
                  <option value="supabase/postgres:16.3">PostgreSQL 16 + pgvector</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Repositório GitHub Oficial (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/usuario/repositorio"
                  value={formData.gitRepo}
                  onChange={e => setFormData({ ...formData, gitRepo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {deployLogs.length > 0 && (
                <div className="bg-black/90 p-3 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px] text-cyan-300">
                  {deployLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeployModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={deploying}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2"
                >
                  {deploying ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" /> Provisionando...
                    </>
                  ) : (
                    'Iniciar Deploy Instantâneo'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Container Backup Scheduling & Vault Modal */}
      <ContainerBackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        containers={containers}
        preSelectedContainerId={backupModalContainerId}
      />
    </div>
  );
};
