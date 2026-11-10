import React from 'react';
import { 
  Globe, 
  Activity, 
  RefreshCw, 
  Zap, 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Radio, 
  Cpu, 
  Lock, 
  CheckCircle2, 
  Flame,
  Terminal,
  Server,
  HardDrive,
  Network,
  Layers,
  Box,
  Workflow,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { 
  RealMarketData, 
  TelemetryData, 
  ContainerItem, 
  K8sDeployment, 
  N8nWorkflow, 
  CpuItem 
} from '../types';
import { CarbonShieldModule } from './CarbonShieldModule';
import { OniUiUpdateCard } from './OniUiUpdateCard';
import { OniUiKernelLogCard } from './OniUiKernelLogCard';
import { GlobalLatencyHeatmapWidget } from './GlobalLatencyHeatmapWidget';
import { SystemForecastWidget } from './SystemForecastWidget';
import { CardCornerMarks } from './CardCornerMarks';
import { StudioMarketTickers } from './StudioMarketTickers';
import { CeoMasterDashboard } from './CeoMasterDashboard';
import { LiveMarketTickerAndClock } from './LiveMarketTickerAndClock';
import { LiveRealMarketTicker } from './LiveRealMarketTicker';
import { LiveSovereignFeed } from './LiveSovereignFeed';

interface BroadcastStudioViewProps {
  marketData: RealMarketData;
  loading: boolean;
  lastUpdate: string;
  onRefresh: () => void;
  onNavigateTab: (tab: string) => void;
  telemetry?: TelemetryData | null;
  containers?: ContainerItem[];
  deployments?: K8sDeployment[];
  workflows?: N8nWorkflow[];
  cpus?: CpuItem[];
  onExecuteCliCommand?: (cmd: string) => void;
  scrollSpeed?: import('../types').TickerScrollSpeed;
  onChangeSpeed?: (speed: import('../types').TickerScrollSpeed) => void;
}

export const BroadcastStudioView: React.FC<BroadcastStudioViewProps> = ({
  marketData,
  loading,
  lastUpdate,
  onRefresh,
  onNavigateTab,
  telemetry,
  containers = [],
  deployments = [],
  workflows = [],
  cpus = [],
  onExecuteCliCommand,
  scrollSpeed = 'normal',
  onChangeSpeed,
}) => {
  // Cores de variação de cotação
  const getChangeColor = (val: string) => {
    return parseFloat(val) >= 0 ? 'text-emerald-400' : 'text-rose-400';
  };

  return (
    <div className="w-full flex flex-col gap-3.5 select-none font-sans pb-6">
      
      {/* 0. PAINEL MESTRE DO CEO & ADMINMASTER: CONTAINER AUTO-FAILOVER, PROXIES, 70% OFF & CARTEIRA BITCOIN */}
      <CeoMasterDashboard
        onNavigateTab={onNavigateTab}
        externalMarketData={marketData}
        loadingExternalMarket={loading}
        onSyncMarketExternal={onRefresh}
      />

      {/* Relógio Vivo em Tempo Real & Cotações Globais Dinâmicas (Ciclo de 10 Minutos) */}
      <LiveMarketTickerAndClock realMarketData={marketData} />

      {/* Cotações em Tempo Real AwesomeAPI & Relógio Vivo Oficial */}
      <LiveRealMarketTicker />

      {/* Feed em Tempo Real Otimizado para Marcio_francisco com Integridade Argon2id */}
      <LiveSovereignFeed
        realMarketData={marketData}
        onNavigateTab={onNavigateTab}
        onExecuteCliCommand={onExecuteCliCommand}
      />

      {/* 1. TOPO: BARRA DE STATUS MASTER & ESTÚDIO AO VIVO */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 backdrop-blur-md shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-red-600 via-rose-500 via-amber-500 to-cyan-500"></div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Identificação do Canal & Cluster */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.6)] shrink-0 bg-slate-950 flex items-center justify-center">
              <img 
                src="/src/assets/images/neon_play_logo_1793532470803.jpg" 
                alt="NsA Broadcast Logo" 
                className="w-full h-full object-cover scale-105" 
              />
            </div>
            <span className="bg-red-600 text-white font-black text-xs px-3 py-1 rounded-md tracking-widest uppercase flex items-center gap-2 shadow-md shadow-red-950/50">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              AO VIVO
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight font-mono">
                  VPS NsA Global Broadcast & Centro de Comando Unificado
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                  <CheckCircle className="w-3 h-3" /> 100% OPERACIONAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Cluster Hyperscale Enterprise · Nó Central: <span className="text-cyan-400 font-semibold">B3 SP1 GRU (São Paulo) · 1.8ms</span> · Root: <span className="text-indigo-400 font-semibold">VPSNsA Root (Argon2id)</span>
              </p>
            </div>
          </div>

          {/* Controles de Sincronização & Acesso Rápido */}
          <div className="flex items-center gap-2">
            {/* Elemento com Azul Neon Intenso */}
            <div className="hidden xl:flex items-center gap-2 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.6)] text-cyan-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-950/90 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Elemento com Azul Neon Intenso</span>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 transition-all shadow-sm cursor-pointer"
              title="Atualizar cotações comerciais da AwesomeAPI REST"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-red-500 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sincronizar APIs</span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">({lastUpdate || 'Tempo Real'})</span>
            </button>

            <button
              onClick={() => onNavigateTab('terminal')}
              className="flex items-center gap-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Terminal CLI</span>
            </button>
          </div>
        </div>

        {/* COTAÇÕES COMERCIAIS CENTRAIS EM CARDS ALINHADOS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-3 pt-3 border-t border-slate-800/80">
          {/* CARD USD */}
          <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 hover:border-red-500/50 transition-all shadow-inner group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono font-bold block">DÓLAR COMERCIAL</span>
              <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-900 ${getChangeColor(marketData.usd.pctChange)}`}>
                {marketData.usd.pctChange}%
              </span>
            </div>
            <div className="my-1.5 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight group-hover:text-red-400 transition-colors">
                R$ {marketData.usd.bid}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Compra</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1.5 border-t border-slate-900">
              <span>Venda: <strong className="text-slate-300">R$ {marketData.usd.ask}</strong></span>
              <span>Máx: <strong className="text-slate-300">R$ {marketData.usd.high}</strong></span>
            </div>
          </div>

          {/* CARD EUR */}
          <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 hover:border-red-500/50 transition-all shadow-inner group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono font-bold block">EURO COMERCIAL</span>
              <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-900 ${getChangeColor(marketData.eur.pctChange)}`}>
                {marketData.eur.pctChange}%
              </span>
            </div>
            <div className="my-1.5 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight group-hover:text-red-400 transition-colors">
                R$ {marketData.eur.bid}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Compra</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1.5 border-t border-slate-900">
              <span>Venda: <strong className="text-slate-300">R$ {marketData.eur.ask}</strong></span>
              <span>Máx: <strong className="text-slate-300">R$ {marketData.eur.high}</strong></span>
            </div>
          </div>

          {/* CARD CHF */}
          <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 hover:border-red-500/50 transition-all shadow-inner group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono font-bold block">FRANCO SUÍÇO</span>
              <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-900 ${getChangeColor(marketData.chf.pctChange)}`}>
                {marketData.chf.pctChange}%
              </span>
            </div>
            <div className="my-1.5 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight group-hover:text-red-400 transition-colors">
                R$ {marketData.chf.bid}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Compra</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1.5 border-t border-slate-900">
              <span>Venda: <strong className="text-slate-300">R$ {marketData.chf.ask}</strong></span>
              <span>Máx: <strong className="text-slate-300">R$ {marketData.chf.high}</strong></span>
            </div>
          </div>

          {/* CARD GBP */}
          <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 hover:border-red-500/50 transition-all shadow-inner group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono font-bold block">LIBRA ESTERLINA</span>
              <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-900 ${getChangeColor(marketData.gbp.pctChange)}`}>
                {marketData.gbp.pctChange}%
              </span>
            </div>
            <div className="my-1.5 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight group-hover:text-red-400 transition-colors">
                R$ {marketData.gbp.bid}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Compra</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1.5 border-t border-slate-900">
              <span>Venda: <strong className="text-slate-300">R$ {marketData.gbp.ask}</strong></span>
              <span>Máx: <strong className="text-slate-300">R$ {marketData.gbp.high}</strong></span>
            </div>
          </div>
        </div>

        {/* TARJA DE PLANTÃO DO DINHEIRO & TELEMETRIA GLOBAL */}
        <div className="bg-red-950/80 border border-red-600/60 rounded-lg p-2.5 mt-3 flex items-center gap-3 shadow-lg">
          <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-xs">
            <Flame className="w-3.5 h-3.5 animate-pulse" /> PLANTÃO DO DINHEIRO
          </span>
          <p className="text-xs text-slate-200 font-medium truncate flex-1">
            Cluster Enterprise VPS NsA operando em capacidade máxima: 128 Cores AMD EPYC Bergamo, tráfego Anycast 40 Gbps e proteção autônoma Gemini 4 Carbon ativa em todos os nós.
          </p>
          <span className="text-[10px] text-red-300 font-mono font-bold hidden md:inline shrink-0">
            Argon2id Verified · Zero-Trust
          </span>
        </div>
      </section>

      {/* 1.5. ESTÚDIO DE TELEMETRIA VPSNsA — TICKERS AO VIVO (FAIXA 1: CÂMBIO COMERCIAL LTR / FAIXA 2: B3 & ADrs RTL) */}
      <StudioMarketTickers scrollSpeed={scrollSpeed} onChangeSpeed={onChangeSpeed} />

      {/* 2. MATRIZ DE OPERAÇÕES PRINCIPAIS (3 COLUNAS PERFEITAMENTE ALINHADAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        
        {/* COLUNA 1: TELEMETRIA DE HARDWARE & CLUSTER HYPERSCALE */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-xl backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-950/80 border border-cyan-800 rounded-lg text-cyan-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Cluster Telemetry & Hardware
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">AMD EPYC™ 9754 Bergamo 128C</span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('telemetry')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
              >
                Detalhes <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Métricas de Hardware */}
            <div className="grid grid-cols-2 gap-2 mt-3 font-mono">
              <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>CARGA CPU</span>
                  <span className="text-cyan-400 font-bold">{telemetry?.cpu.overallLoadPercent || 14.8}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, (telemetry?.cpu.overallLoadPercent || 14.8))}%` }}
                  ></div>
                </div>
                <span className="text-[9px] text-slate-500 block mt-1">
                  {telemetry?.cpu.totalCores || 128} Cores · {telemetry?.cpu.clockSpeedGHz || '3.10 GHz'}
                </span>
              </div>

              <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>RAM ECC DDR5</span>
                  <span className="text-indigo-400 font-bold">{telemetry?.memory.usagePercent || 23.4}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${Math.min(100, (telemetry?.memory.usagePercent || 23.4))}%` }}
                  ></div>
                </div>
                <span className="text-[9px] text-slate-500 block mt-1">
                  {telemetry?.memory.usedGB || 384} GB / {telemetry?.memory.totalGB || 1536} GB
                </span>
              </div>

              <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>STORAGE NVME</span>
                  <span className="text-emerald-400 font-bold">{(telemetry?.storage.currentIops || 428900).toLocaleString()} IOPS</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-200 font-bold mt-1">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{telemetry?.storage.usedTB || 4.2} TB / {telemetry?.storage.totalTB || 64} TB NVMe</span>
                </div>
              </div>

              <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>REDE ANYCAST</span>
                  <span className="text-sky-400 font-bold">{telemetry?.network.throughputInGbps || '12.4'} Gbps</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-200 font-bold mt-1">
                  <Network className="w-3.5 h-3.5 text-sky-400" />
                  <span>DDoS Anycast Mitigated</span>
                </div>
              </div>
            </div>

            {/* Pontos de Borda Globais (Edge Nodes) */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                Nós Globais de Baixa Latência (Edge Nodes)
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <div className="flex items-center justify-between bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    SP1 São Paulo
                  </span>
                  <span className="text-emerald-400 font-bold">1.8ms</span>
                </div>
                <div className="flex items-center justify-between bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    VA1 Virginia
                  </span>
                  <span className="text-emerald-400 font-bold">118ms</span>
                </div>
                <div className="flex items-center justify-between bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    FRA1 Frankfurt
                  </span>
                  <span className="text-emerald-400 font-bold">142ms</span>
                </div>
                <div className="flex items-center justify-between bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    TYO1 Tokyo
                  </span>
                  <span className="text-emerald-400 font-bold">210ms</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('cpus')}
            className="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ver Catálogo de CPUs Dedicados (GH200 & EPYC)</span>
          </button>
        </section>

        {/* COLUNA 2: CONTAINERS, TRILHÕES DE SITES & KUBERNETES SWARM */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-xl backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-950/80 border border-indigo-800 rounded-lg text-indigo-400">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Containers & K8s Deployments
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {containers.length} Containers Ativos · Orquestração Pronta
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('containers')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
              >
                Gerenciar <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Resumo de Containers */}
            <div className="space-y-2 mt-3 font-mono">
              {containers.slice(0, 3).map((c) => (
                <div 
                  key={c.id}
                  className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-xs font-bold text-white truncate block">{c.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {c.domain} · Porta {c.port}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] bg-slate-900 text-cyan-300 px-1.5 py-0.5 rounded border border-slate-800 font-bold block">
                      {c.cpuAllocation.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-emerald-400 block mt-0.5">SSL Ativo</span>
                  </div>
                </div>
              ))}

              {/* Status do Orquestrador Kubernetes & Swarm */}
              <div className="bg-slate-950/90 p-2.5 rounded-lg border border-indigo-900/40 mt-2">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5 text-indigo-300">
                    <Layers className="w-3.5 h-3.5" /> Kubernetes & Docker Swarm
                  </span>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800">
                    HPA Auto-Scale
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-2 text-[10px] text-center">
                  <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
                    <span className="text-slate-400 block">Deployments</span>
                    <strong className="text-white text-xs">{deployments.length || 3}</strong>
                  </div>
                  <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
                    <span className="text-slate-400 block">Pods Vivos</span>
                    <strong className="text-emerald-400 text-xs">48 / 48</strong>
                  </div>
                  <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
                    <span className="text-slate-400 block">Rolling Update</span>
                    <strong className="text-cyan-400 text-xs">Zero-Downtime</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('orchestration')}
            className="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Escalar Pods Kubernetes & Swarm</span>
          </button>
        </section>

        {/* COLUNA 3: BOLSAS GLOBAIS & ÍNDICES FINANCEIROS AO VIVO */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-xl backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-950/80 border border-red-800 rounded-lg text-red-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Bolsas & Índices Globais
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Mercados em Streaming Contínuo</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                MERCADO ABERTO
              </span>
            </div>

            {/* Índices Globais com Mini Histogramas */}
            <div className="space-y-2 mt-3 font-mono">
              {/* B3 IBOVESPA */}
              <div className="bg-slate-950/90 p-2 rounded-lg border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-center gap-1 text-xs font-bold text-white">
                    <Globe className="w-3 h-3 text-cyan-400" />
                    <span>B3 IBOVESPA</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-100">{marketData.ibovespa.points} pts</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    {marketData.ibovespa.pctChange}%
                  </span>
                  <div className="flex items-end gap-0.5 h-3.5 mt-1">
                    <div className="w-1 h-1.5 bg-emerald-500/60 rounded-xs"></div>
                    <div className="w-1 h-2 bg-emerald-500/80 rounded-xs"></div>
                    <div className="w-1 h-3 bg-emerald-500 rounded-xs"></div>
                    <div className="w-1 h-3.5 bg-emerald-400 rounded-xs animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* S&P 500 */}
              <div className="bg-slate-950/90 p-2 rounded-lg border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-center gap-1 text-xs font-bold text-white">
                    <Globe className="w-3 h-3 text-sky-400" />
                    <span>S&P 500 (EUA)</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-100">{marketData.sp500.points} pts</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    {marketData.sp500.pctChange}%
                  </span>
                  <div className="flex items-end gap-0.5 h-3.5 mt-1">
                    <div className="w-1 h-1 bg-emerald-500/60 rounded-xs"></div>
                    <div className="w-1 h-2.5 bg-emerald-500/80 rounded-xs"></div>
                    <div className="w-1 h-3 bg-emerald-500 rounded-xs"></div>
                    <div className="w-1 h-3.5 bg-emerald-400 rounded-xs animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* NASDAQ */}
              <div className="bg-slate-950/90 p-2 rounded-lg border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-center gap-1 text-xs font-bold text-white">
                    <Globe className="w-3 h-3 text-indigo-400" />
                    <span>NASDAQ COMPOSITE</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-100">{marketData.nasdaq.points} pts</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    {marketData.nasdaq.pctChange}%
                  </span>
                  <div className="flex items-end gap-0.5 h-3.5 mt-1">
                    <div className="w-1 h-1.5 bg-emerald-500/60 rounded-xs"></div>
                    <div className="w-1 h-2 bg-emerald-500/80 rounded-xs"></div>
                    <div className="w-1 h-3 bg-emerald-500 rounded-xs"></div>
                    <div className="w-1 h-3.5 bg-emerald-400 rounded-xs animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* PETRÓLEO BRENT */}
              <div className="bg-slate-950/90 p-2 rounded-lg border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-center gap-1 text-xs font-bold text-white">
                    <Globe className="w-3 h-3 text-amber-400" />
                    <span>PETRÓLEO BRENT</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-100">${marketData.brent.price} / barril</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    {marketData.brent.pctChange}%
                  </span>
                  <div className="flex items-end gap-0.5 h-3.5 mt-1">
                    <div className="w-1 h-2 bg-amber-500/60 rounded-xs"></div>
                    <div className="w-1 h-2.5 bg-amber-500/80 rounded-xs"></div>
                    <div className="w-1 h-3 bg-amber-500 rounded-xs"></div>
                    <div className="w-1 h-3.5 bg-amber-400 rounded-xs animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('payments')}
            className="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Assinar Plano Enterprise (Mercado Pago & Pix)</span>
          </button>
        </section>

      </div>

      {/* 3. PARTE INFERIOR: DEFESA CIBERNÉTICA GEMINI 4 CARBON & CENTRO DE EXECUÇÃO CLI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        
        {/* DEFESA AUTÔNOMA GEMINI 4 CARBON */}
        <div>
          <CarbonShieldModule />
        </div>

        {/* PAINEL DE CONTROLE RÁPIDO: CLI, AUTOMAÇÕES N8N & BANCO DE DADOS */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Comandos de Diagnóstico Imediato (CLI)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">vpsnsa-cli v4.2</span>
            </div>

            <p className="text-xs text-slate-300 mt-2.5 font-sans">
              Execute testes e diagnósticos do cluster com um único clique. Os comandos são enviados diretamente para o terminal com credenciais de Root:
            </p>

            {/* BOTÕES DE COMANDO CLI RÁPIDO */}
            <div className="grid grid-cols-2 gap-2 mt-3 font-mono">
              <button
                type="button"
                onClick={() => onExecuteCliCommand ? onExecuteCliCommand('vps cluster status') : onNavigateTab('terminal')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-colors cursor-pointer group"
              >
                <span className="text-[10px] text-cyan-400 font-bold block group-hover:underline">
                  $ vps cluster status
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Verifica saúde dos nós e latência
                </span>
              </button>

              <button
                type="button"
                onClick={() => onExecuteCliCommand ? onExecuteCliCommand('vps containers list') : onNavigateTab('terminal')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-colors cursor-pointer group"
              >
                <span className="text-[10px] text-cyan-400 font-bold block group-hover:underline">
                  $ vps containers list
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Lista portas, uptime e status Docker
                </span>
              </button>

              <button
                type="button"
                onClick={() => onExecuteCliCommand ? onExecuteCliCommand('vps k8s pods') : onNavigateTab('terminal')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-colors cursor-pointer group"
              >
                <span className="text-[10px] text-cyan-400 font-bold block group-hover:underline">
                  $ vps k8s pods
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Inspeciona pods ativos no Swarm/K8s
                </span>
              </button>

              <button
                type="button"
                onClick={() => onExecuteCliCommand ? onExecuteCliCommand('vps security audit') : onNavigateTab('terminal')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-colors cursor-pointer group"
              >
                <span className="text-[10px] text-cyan-400 font-bold block group-hover:underline">
                  $ vps security audit
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Auditoria Zero-Trust Argon2id
                </span>
              </button>
            </div>

            {/* STATUS DAS AUTOMAÇÕES N8N */}
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-xs font-bold text-white font-mono block">
                    n8n Workflow Automation
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {workflows.length || 3} fluxos ativos · Webhooks síncronos
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('n8n')}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 font-mono"
              >
                Abrir Workflows →
              </button>
            </div>
          </div>

          {/* RODAPÉ DO MÓDULO COM AUTENTICAÇÃO ARGON2ID */}
          <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Argon2id Sovereign Key Active
            </span>
            <span>VPSNsA · Root Superadmin</span>
          </div>
        </section>

      </div>

      {/* 3.5 CATÁLOGO DE SERVIÇOS & HOSPEDAGENS GLOBAIS (VPS, SITES, DOMÍNIOS, E-MAIL, IA) */}
      <section className="bg-slate-900/95 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden transition-all">
        <CardCornerMarks showLaserBeam={true} showGlare={true} glowColor="cyan" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-600 via-sky-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white font-mono tracking-tight">
                  Serviços Oficiais & Soluções em Nuvem NsA Enterprise
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  23 Serviços Ativos
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Hospedagens VPS AMD EPYC 128C, Sites & Web Apps, Domínios Anycast em 0.8s, E-mail com SPF/DKIM/DMARC e Agentes de IA 24/7.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('services')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer shrink-0"
          >
            <span>Acessar Todos os 23 Serviços</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Mini-Cards de Destaque dos Pilares */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3.5 font-sans">
          {[
            { cat: 'Hospedagem VPS', name: 'EPYC Bergamo 128C', spec: 'NVMe Gen5 · 40 Gbps', price: 'R$ 89,90/mês', color: 'text-cyan-400' },
            { cat: 'Sites & Web', name: 'WordPress & Jamstack', spec: 'Deploy Git · Cache Edge', price: 'R$ 19,90/mês', color: 'text-emerald-400' },
            { cat: 'Domínios & DNS', name: '.com.br e Globais', spec: 'Anycast em 0.8s · SSL', price: 'R$ 42,90/ano', color: 'text-sky-400' },
            { cat: 'E-mail & Mkt', name: 'ONI Mail Corporativo', spec: 'SPF/DKIM · 500k envios/h', price: 'R$ 14,90/mês', color: 'text-amber-400' },
            { cat: 'IA Autônomo', name: 'NsA Sentinel & Vendas', spec: 'Combate 24/7 · WhatsApp', price: 'Incluso / R$ 89,90', color: 'text-indigo-400' },
            { cat: 'Outros & Segurança', name: 'CDN Edge & Postgres', spec: 'Backup Imutável NVMe', price: 'R$ 19,90/mês', color: 'text-rose-400' },
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => onNavigateTab('services')}
              className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800/90 hover:border-cyan-500/50 p-2.5 rounded-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className={`text-[9px] font-mono font-bold uppercase ${item.color} block`}>
                  {item.cat}
                </span>
                <div className="text-xs font-bold text-white mt-0.5 group-hover:text-cyan-300 transition-colors">
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {item.spec}
                </div>
              </div>
              <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-slate-200">{item.price}</span>
                <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SHOWCASE DATACENTER MUNDIAL & CARD ONI UI 17 COM ATUALIZAÇÕES DO SOFTWARE */}
      <OniUiUpdateCard />

      {/* 5. LOG CONSOLIDADO DE KERNEL & SOFTWARE ONI UI 17 (TRANSLÚCIDO E MODERNO) */}
      <OniUiKernelLogCard />

      {/* 6. SYSTEM FORECAST: PREDIÇÃO DE CAPACIDADE DE RECURSOS VPS */}
      <SystemForecastWidget 
        telemetry={telemetry} 
        onNavigateTab={onNavigateTab} 
      />

      {/* 7. GLOBAL LATENCY HEATMAP & BORDA ANYCAST D3.JS (SVG INTERATIVO) */}
      <GlobalLatencyHeatmapWidget onNavigateTelemetry={() => onNavigateTab('telemetry')} />

      {/* 7. RODAPÉ INSTITUCIONAL GLOBAL DA PLATAFORMA */}
      <footer className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span className="text-slate-300 font-medium">
            Todos os direitos reservados a VPS NsA Hyperscale Cluster Enterprise
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>SLA 99.999% Garantido</span>
          <span>Bancos Cloud PostgreSQL & Supabase</span>
          <span className="text-cyan-400 font-semibold">Gemini 4 Carbon AI Shield</span>
        </div>
      </footer>

    </div>
  );
};
