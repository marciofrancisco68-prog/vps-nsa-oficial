import React, { useState } from 'react';
import { 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Filter, 
  Search, 
  Download, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Server, 
  ExternalLink,
  Code2,
  RefreshCw,
  GitCommit
} from 'lucide-react';

export interface KernelUpdateLog {
  id: string;
  kernelVersion: string;
  component: string;
  category: 'kernel' | 'hardware' | 'security' | 'network' | 'ai';
  appliedAt: string;
  targetNodes: string[];
  rebootRequired: boolean;
  status: 'Concluído (Live Patch)' | 'Validado' | 'Ativo';
  sha256: string;
  description: string;
  kpatchStdout: string[];
}

export const OniUiKernelLogCard: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>('klog-1');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const kernelLogs: KernelUpdateLog[] = [
    {
      id: 'klog-1',
      kernelVersion: 'Linux 6.12.18-rt22-nsa-enterprise',
      component: 'Kernel Core & RT-Preempt',
      category: 'kernel',
      appliedAt: '31/10/2026 03:45:12 BRT',
      targetNodes: ['SP1 (São Paulo)', 'VA1 (Virginia)', 'FRA1 (Frankfurt)', 'TYO1 (Tokyo)'],
      rebootRequired: false,
      status: 'Concluído (Live Patch)',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      description: 'Ativação de Live Patching (kpatch) com escalabilidade para 128 núcleos por socket AMD EPYC Bergamo e redução de jitter de escalonamento para < 0.8µs em nós Anycast B3.',
      kpatchStdout: [
        '[+0.000000] kpatch: loading patch module nsa_rt_sched_6_12_18...',
        '[+0.004120] kpatch: inspecting 128 active cores on node SP1...',
        '[+0.012840] kpatch: stop_machine() latency: 42 microseconds.',
        '[+0.015210] kpatch: patching function __schedule and pick_next_task_fair.',
        '[+0.018900] kpatch: success. 0 threads disrupted. RT-Preempt active.'
      ]
    },
    {
      id: 'klog-2',
      kernelVersion: 'AMD SEV-SNP & Confidential Compute v4.2',
      component: 'Hardware Isolation & AMD Secure Encrypted Virtualization',
      category: 'security',
      appliedAt: '30/10/2026 21:18:04 BRT',
      targetNodes: ['SP1 (São Paulo)', 'VA1 (Virginia)'],
      rebootRequired: false,
      status: 'Validado',
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      description: 'Criptografia de memória em hardware com chaves geradas em silício. Isolamento total de instâncias de clientes contra dumps de memória no hipervisor.',
      kpatchStdout: [
        '[+0.000000] sev-snp: verifying AMD Secure Processor firmware version 1.54.21',
        '[+0.002810] sev-snp: RMP (Reverse Map Table) initialization completed across 1.5TB DDR5 ECC.',
        '[+0.009400] sev-snp: Virtual Machine Privilege Level (VMPL) hardware isolation enforced.'
      ]
    },
    {
      id: 'klog-3',
      kernelVersion: 'NVIDIA GH200 NVLink-C2C & CUDA 12.8.1',
      component: 'Acelerador IA Grace Hopper & Kernel Module',
      category: 'hardware',
      appliedAt: '29/10/2026 14:02:50 BRT',
      targetNodes: ['SP1 (São Paulo)', 'TYO1 (Tokyo)'],
      rebootRequired: false,
      status: 'Ativo',
      sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      description: 'Otimização de barramento NVLink-C2C com 900 GB/s de largura de banda unificada entre CPU ARM Neoverse e GPU Hopper para inferência ultrarrápida do modelo Gemini 4 Carbon.',
      kpatchStdout: [
        '[+0.000000] nvidia-nvlink: link 0-3 initialized at 900 GB/s bidirectional.',
        '[+0.003100] nvidia-uvm: Unified Memory registered 480GB LPDDR5X + 96GB HBM3.',
        '[+0.007420] nvidia-smi: 0 error frames detected. Ready for tensor execution.'
      ]
    },
    {
      id: 'klog-4',
      kernelVersion: 'eBPF / XDP Anycast Firewall v5.14',
      component: 'Sub-sistema de Rede de Alta Velocidade',
      category: 'network',
      appliedAt: '28/10/2026 09:30:15 BRT',
      targetNodes: ['SP1 (São Paulo)', 'VA1 (Virginia)', 'FRA1 (Frankfurt)', 'TYO1 (Tokyo)'],
      rebootRequired: false,
      status: 'Concluído (Live Patch)',
      sha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
      description: 'Carregamento de programas XDP direto na NIC ConnectX-7 de 40 Gbps, filtrando pacotes SYN-flood e DDoS com consumo de menos de 2% de CPU.',
      kpatchStdout: [
        '[+0.000000] xdp: attaching program nsa_xdp_antiddos to interface eth0 (mlx5_core)...',
        '[+0.001920] xdp: native driver mode active. Max throughput: 38.8 Mpps per port.',
        '[+0.004110] xdp: 0 packet drops in control plane. Security rules synced.'
      ]
    },
    {
      id: 'klog-5',
      kernelVersion: 'Argon2id Crypto Subsystem v3.2-SoV',
      component: 'Criptografia Soberana & Root Security',
      category: 'security',
      appliedAt: '27/10/2026 18:04:33 BRT',
      targetNodes: ['SP1 (São Paulo)', 'VA1 (Virginia)', 'FRA1 (Frankfurt)', 'TYO1 (Tokyo)'],
      rebootRequired: false,
      status: 'Validado',
      sha256: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
      description: 'Implementação de aceleração por instruções AVX-512 para o algoritmo Argon2id (Memory=65536KB, Time=3, Threads=4) com assinatura da autoridade Root Soberana VPSNsA.',
      kpatchStdout: [
        '[+0.000000] crypto: argon2id-avx512 registered with priority 500.',
        '[+0.002200] crypto: self-test vectors passed for Argon2id variant.',
        '[+0.005100] crypto: Root credential authorization secured with Sovereign Hash.'
      ]
    }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  const handleExportLogs = () => {
    const textData = JSON.stringify(kernelLogs, null, 2);
    const blob = new Blob([textData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oni-ui-17-kernel-consolidated-log-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const filteredLogs = kernelLogs.filter(log => {
    const matchesCategory = activeCategory === 'all' || log.category === activeCategory;
    const matchesSearch = log.kernelVersion.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden transition-all duration-200 font-sans">
      
      {/* 1. CABEÇALHO DO CARD ONI UI 17 */}
      <div className="p-4 sm:p-5 border-b border-slate-200/70 dark:border-slate-800/80 bg-gradient-to-r from-slate-50/80 via-white/40 to-slate-100/60 dark:from-slate-950/70 dark:via-slate-900/40 dark:to-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                  Oni UI 17 · Log Consolidado de Kernel & Software
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Zero-Downtime
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Auditoria de atualizações em tempo real com Live Patching (kpatch) em todos os clusters de servidores.
              </p>
            </div>
          </div>

          {/* Botões de Ação do Cabeçalho */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-xs cursor-pointer"
              title="Atualizar Logs de Kernel"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExportLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition-all shadow-md active:scale-95 cursor-pointer"
              title="Exportar logs consolidados em formato JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadSuccess ? 'Exportado!' : 'Exportar Log'}</span>
            </button>
          </div>

        </div>

        {/* 2. FILTROS POR CATEGORIA & BARRA DE BUSCA */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
          
          {/* Botões de Filtro */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos ({kernelLogs.length})
            </button>

            <button
              onClick={() => setActiveCategory('kernel')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeCategory === 'kernel'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kernel Core
            </button>

            <button
              onClick={() => setActiveCategory('security')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeCategory === 'security'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Segurança & Cripto
            </button>

            <button
              onClick={() => setActiveCategory('hardware')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeCategory === 'hardware'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Hardware & NVLink
            </button>

            <button
              onClick={() => setActiveCategory('network')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeCategory === 'network'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Rede & eBPF
            </button>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar versão, SHA ou patch..."
              className="w-full pl-8 pr-3 py-1 bg-slate-100/90 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
            />
          </div>

        </div>

      </div>

      {/* 3. LISTAGEM CONSOLIDADA DE ATUALIZAÇÕES */}
      <div className="p-4 sm:p-5 space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-mono text-xs">
            Nenhuma atualização de kernel encontrada com o filtro selecionado.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div 
                key={log.id}
                className="bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800/80 rounded-xl overflow-hidden hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all shadow-xs"
              >
                {/* Linha Principal do Log */}
                <div 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 dark:bg-cyan-950/80 border border-cyan-500/30 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-mono">
                          {log.kernelVersion}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold">
                          {log.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block truncate mt-0.5">
                        {log.component} · Aplicado em: <strong className="text-slate-700 dark:text-slate-300">{log.appliedAt}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="hidden md:flex flex-wrap items-center gap-1">
                      {log.targetNodes.slice(0, 2).map((node, i) => (
                        <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-300/80 dark:border-slate-800">
                          {node}
                        </span>
                      ))}
                      {log.targetNodes.length > 2 && (
                        <span className="text-[9px] font-mono text-slate-400">
                          +{log.targetNodes.length - 2} nós
                        </span>
                      )}
                    </div>

                    <div className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Conteúdo Detalhado & Terminal Stdout (Acordeão) */}
                {isExpanded && (
                  <div className="px-3 sm:px-4 pb-4 pt-1 border-t border-slate-200/60 dark:border-slate-800/80 bg-slate-100/40 dark:bg-slate-950/40 text-xs font-mono">
                    <p className="text-slate-700 dark:text-slate-300 font-sans leading-relaxed pt-2">
                      {log.description}
                    </p>

                    {/* Metadados Técnicos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800/60 text-[11px]">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Assinatura Criptográfica SHA-256:</span>
                        <code className="text-cyan-700 dark:text-cyan-400 text-[10px] break-all select-all font-mono">
                          {log.sha256}
                        </code>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Nós Alvo Sincronizados:</span>
                        <span className="text-slate-800 dark:text-slate-200 text-[11px] font-medium">
                          {log.targetNodes.join(' · ')}
                        </span>
                      </div>
                    </div>

                    {/* Terminal dmesg / kpatch stdout */}
                    <div className="mt-3 bg-slate-950 text-slate-200 rounded-lg p-3 border border-slate-800 font-mono text-[10px] shadow-inner space-y-1">
                      <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-800 text-[9px]">
                        <span className="flex items-center gap-1">
                          <Terminal className="w-3 h-3 text-cyan-400" /> kpatch-live-patch.log
                        </span>
                        <span>kpatch version 0.9.9-nsa</span>
                      </div>
                      {log.kpatchStdout.map((line, idx) => (
                        <div key={idx} className="font-mono text-cyan-300/90 leading-tight">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. RODAPÉ DO CARD COM METADADOS DE INTEGRIDADE */}
      <div className="p-3 sm:p-4 bg-slate-100/60 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Integridade de Patching: <strong className="text-slate-700 dark:text-slate-200">100% Verificado via Argon2id Root</strong></span>
        </div>
        <div className="text-[11px]">
          <span>Reboot de Servidor: <strong className="text-emerald-600 dark:text-emerald-400">0 Reboots Necessários (Live Kernel Patcher)</strong></span>
        </div>
      </div>

    </div>
  );
};
