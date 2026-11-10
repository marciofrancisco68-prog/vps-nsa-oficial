import React from 'react';
import { 
  Globe, 
  Activity, 
  RefreshCw, 
  Zap, 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  CheckCircle2, 
  Terminal, 
  Server, 
  HardDrive, 
  Network, 
  Layers, 
  Box, 
  Workflow, 
  ArrowRight, 
  LayoutGrid, 
  X, 
  Plus, 
  Flame,
  CheckCircle,
  Eye,
  Sliders,
  DollarSign,
  Sparkles,
  ShieldCheck
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
import { AdvancedResourceMonitoringWidget } from './AdvancedResourceMonitoringWidget';
import { GlobalLatencyHeatmapWidget } from './GlobalLatencyHeatmapWidget';
import { SystemForecastWidget } from './SystemForecastWidget';
import { CardCornerMarks } from './CardCornerMarks';
import { StudioMarketTickers } from './StudioMarketTickers';
import { LiveSovereignFeed } from './LiveSovereignFeed';

interface AdaptiveDashboardGridProps {
  activeWidgets: string[];
  onToggleWidget: (id: string) => void;
  onSetWidgets: (ids: string[]) => void;
  marketData: RealMarketData;
  loadingMarket: boolean;
  lastMarketUpdate: string;
  onRefreshMarket: () => void;
  telemetry?: TelemetryData | null;
  containers?: ContainerItem[];
  deployments?: K8sDeployment[];
  workflows?: N8nWorkflow[];
  cpus?: CpuItem[];
  onNavigateTab: (tab: string) => void;
  onExecuteCliCommand?: (cmd: string) => void;
  scrollSpeed?: import('../types').TickerScrollSpeed;
  onChangeSpeed?: (speed: import('../types').TickerScrollSpeed) => void;
}

export const AdaptiveDashboardGrid: React.FC<AdaptiveDashboardGridProps> = ({
  activeWidgets,
  onToggleWidget,
  onSetWidgets,
  marketData,
  loadingMarket,
  lastMarketUpdate,
  onRefreshMarket,
  telemetry,
  containers = [],
  deployments = [],
  workflows = [],
  cpus = [],
  onNavigateTab,
  onExecuteCliCommand,
  scrollSpeed = 'normal',
  onChangeSpeed,
}) => {
  // Available widgets metadata
  const widgetList = [
    { id: 'sovereign-feed', label: 'Feed em Tempo Real Soberano (Marcio_francisco)', icon: ShieldCheck, color: 'text-emerald-400' },
    { id: 'broadcast-tickers', label: 'Estúdio de Telemetria — Tickers (Câmbio LTR / B3 RTL)', icon: Activity, color: 'text-cyan-400' },
    { id: 'services-hub', label: 'Catálogo de Serviços Globais (VPS, Sites, DNS, IA)', icon: Server, color: 'text-cyan-400' },
    { id: 'oni-ui', label: 'ONI UI 17 & Datacenter World-Class', icon: Sparkles, color: 'text-cyan-400' },
    { id: 'system-forecast', label: 'System Forecast · Predição de Capacidade VPS', icon: TrendingUp, color: 'text-purple-400' },
    { id: 'latency-map', label: 'Mapa Global de Latência', icon: Globe, color: 'text-sky-400' },
    { id: 'kernel-logs', label: 'Oni UI 17 Kernel Logs', icon: Terminal, color: 'text-emerald-400' },
    { id: 'd3-monitoring', label: 'Monitoramento D3.js CPU/RAM', icon: Activity, color: 'text-cyan-400' },
    { id: 'market', label: 'Cotações & Mercado Global', icon: DollarSign, color: 'text-red-400' },
    { id: 'hardware', label: 'Telemetria AMD EPYC 128C', icon: Cpu, color: 'text-cyan-400' },
    { id: 'containers', label: 'Containers & Trilhões de Sites', icon: Box, color: 'text-indigo-400' },
    { id: 'carbon', label: 'Gemini 4 Carbon Cyber Defense', icon: Shield, color: 'text-emerald-400' },
    { id: 'orchestration', label: 'Kubernetes & Docker Swarm', icon: Layers, color: 'text-sky-400' },
    { id: 'n8n', label: 'Automações de Workflows n8n', icon: Workflow, color: 'text-purple-400' },
    { id: 'terminal', label: 'Terminal CLI Diagnósticos', icon: Terminal, color: 'text-amber-400' },
  ];

  const totalActive = activeWidgets.length;

  // Presets
  const applyPreset = (preset: 'all' | 'infra' | 'finance' | 'security') => {
    if (preset === 'all') {
      onSetWidgets(['sovereign-feed', 'broadcast-tickers', 'services-hub', 'oni-ui', 'system-forecast', 'latency-map', 'kernel-logs', 'd3-monitoring', 'market', 'hardware', 'containers', 'carbon', 'orchestration', 'n8n', 'terminal']);
    } else if (preset === 'infra') {
      onSetWidgets(['sovereign-feed', 'broadcast-tickers', 'services-hub', 'oni-ui', 'system-forecast', 'latency-map', 'kernel-logs', 'd3-monitoring', 'hardware', 'containers', 'orchestration', 'terminal']);
    } else if (preset === 'finance') {
      onSetWidgets(['sovereign-feed', 'broadcast-tickers', 'market', 'hardware', 'containers']);
    } else if (preset === 'security') {
      onSetWidgets(['sovereign-feed', 'oni-ui', 'kernel-logs', 'carbon', 'hardware', 'terminal']);
    }
  };

  // Helper for grid column density class
  const getGridColsClass = () => {
    if (totalActive <= 1) return 'grid-cols-1 max-w-4xl mx-auto';
    if (totalActive === 2) return 'grid-cols-1 md:grid-cols-2';
    if (totalActive === 3) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
    if (totalActive === 4) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4';
    if (totalActive === 5) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
    if (totalActive === 6) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4';
  };

  return (
    <div className="w-full flex flex-col gap-3.5 select-none font-sans pb-8">
      
      {/* TOOLBAR SUPERIOR: CONTROLE DINÂMICO DE WIDGETS & CSS GRID */}
      <section className="bg-slate-900/95 border border-slate-800 rounded-xl p-3 sm:p-4 backdrop-blur-md shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-lg text-white shadow-md">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase font-mono tracking-wider">
                  Dashboard Adaptativo CSS Grid
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  {totalActive} {totalActive === 1 ? 'Widget Ativo' : 'Widgets Ativos'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Layout balanceado inteligente com auto-redimensionamento proporcional em qualquer tela.
              </p>

              {/* Linha de Badges de Status do Sistema (Verificação Instantânea de Saúde) */}
              <div className="flex flex-wrap items-center gap-2 mt-2 pt-1 font-mono text-[10px]">
                {/* Uptime Badge */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-slate-400">Uptime:</span>
                  <strong className="text-emerald-400 font-bold">{telemetry?.system.uptimePercentage || '99.99%'}</strong>
                </div>

                {/* Latency Badge */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-xs">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span className="text-slate-400">Latency:</span>
                  <strong className="text-cyan-300 font-bold">
                    {telemetry?.network.globalLatencyMs ? (telemetry.network.globalLatencyMs['SP1'] || '24ms') : '24ms'}
                  </strong>
                </div>

                {/* Security Badge */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 shadow-xs">
                  <Shield className="w-3 h-3 text-indigo-400" />
                  <span className="text-slate-400">Security:</span>
                  <strong className="text-indigo-300 font-bold">{telemetry?.system.securityStatus || 'Active'}</strong>
                </div>

                {/* Cluster Anycast Nodes Badge */}
                <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-700/80 text-slate-300 shadow-xs">
                  <Globe className="w-3 h-3 text-sky-400" />
                  <span className="text-slate-400">Nodes:</span>
                  <strong className="text-white font-bold">{telemetry?.system.activeNodes || 48} Ativos</strong>
                </div>

                {/* DDoS Protection Badge */}
                <div className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-700/80 text-slate-300 shadow-xs">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="text-slate-400">DDoS:</span>
                  <strong className="text-amber-300 font-bold">{telemetry?.system.networkDDoSProtection || '40 Gbps'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Predefinição Rápida */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-mono mr-1 hidden sm:inline">Presets:</span>
            <button
              onClick={() => applyPreset('all')}
              className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Todos ({widgetList.length})
            </button>
            <button
              onClick={() => applyPreset('infra')}
              className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 transition-colors"
            >
              Infraestrutura
            </button>
            <button
              onClick={() => applyPreset('finance')}
              className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 transition-colors"
            >
              Finanças
            </button>
            <button
              onClick={() => applyPreset('security')}
              className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors"
            >
              Segurança
            </button>
          </div>
        </div>

        {/* CHIPS DE ATIVAÇÃO / DESATIVAÇÃO DOS WIDGETS */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 pt-3 border-t border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider mr-1">
            Alternar Widgets:
          </span>
          {widgetList.map((w) => {
            const isActive = activeWidgets.includes(w.id);
            const Icon = w.icon;
            return (
              <button
                key={w.id}
                onClick={() => onToggleWidget(w.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-purple-950/70 text-white border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)] font-semibold'
                    : 'bg-black/40 text-slate-400 border-slate-800/80 hover:border-slate-700 hover:text-slate-200'
                }`}
                title={isActive ? `Desativar ${w.label}` : `Ativar ${w.label}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? w.color : 'text-slate-500'}`} />
                <span className="text-[11px]">{w.label.split(' ')[0]}</span>
                {isActive ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <Plus className="w-3 h-3 text-slate-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* CASO NENHUM WIDGET ESTEJA ATIVO */}
      {totalActive === 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
          <Eye className="w-8 h-8 text-slate-500" />
          <h3 className="text-base font-bold text-white">Nenhum widget ativo no momento</h3>
          <p className="text-xs text-slate-400 max-w-md">
            Selecione um ou mais widgets acima para compor seu dashboard personalizado com alinhamento CSS Grid responsivo automático.
          </p>
          <button
            onClick={() => applyPreset('all')}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold font-mono transition-colors shadow-md"
          >
            Ativar Todos os Widgets
          </button>
        </div>
      )}

      {/* CONTAINER CSS GRID RESPONSIVO PRINCIPAL */}
      {totalActive > 0 && (
        <div 
          className={`grid ${getGridColsClass()} gap-3.5 sm:gap-4 items-stretch transition-all duration-300`}
          style={{
            gridAutoRows: 'minmax(280px, auto)',
          }}
        >

          {/* WIDGET FEED EM TEMPO REAL SOBERANO (MARCIO_FRANCISCO & ARGON2ID) */}
          {activeWidgets.includes('sovereign-feed') && (
            <div className="col-span-full">
              <LiveSovereignFeed
                realMarketData={marketData}
                onNavigateTab={onNavigateTab}
                onExecuteCliCommand={onExecuteCliCommand}
              />
            </div>
          )}

          {/* WIDGET BROADCAST TICKERS (AWESOMEAPI LTR / B3 RTL) */}
          {activeWidgets.includes('broadcast-tickers') && (
            <div className="col-span-full">
              <StudioMarketTickers scrollSpeed={scrollSpeed} onChangeSpeed={onChangeSpeed} />
            </div>
          )}

          {/* WIDGET CATÁLOGO DE SERVIÇOS & HOSPEDAGENS GLOBAIS */}
          {activeWidgets.includes('services-hub') && (
            <div className="col-span-full bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all">
              <CardCornerMarks showLaserBeam={true} showGlare={true} glowColor="cyan" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-600 via-sky-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-white font-mono tracking-tight">
                        Catálogo de Soluções Soberanas NsA Cloud Enterprise
                      </h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        23 Serviços Disponíveis
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Hospedagens VPS de alta densidade, Sites, Domínios Anycast, E-mail com reputação máxima, IA Autônomo e Add-ons.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigateTab('services')}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
                  >
                    <span>Ver Catálogo Completo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleWidget('services-hub')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    title="Ocultar Widget"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 6 Pilares Principais em Grid com Efeitos Visuais */}
              <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3.5 font-sans">
                {[
                  {
                    title: 'Hospedagem VPS',
                    subtitle: 'AMD EPYC Bergamo 128C',
                    detail: 'NVMe Gen5 · 40 Gbps',
                    price: 'R$ 89,90/mês',
                    color: 'text-cyan-400',
                    border: 'hover:border-cyan-500/60'
                  },
                  {
                    title: 'Sites & Web',
                    subtitle: 'WordPress & Jamstack',
                    detail: 'Deploy Git · Cache Edge',
                    price: 'R$ 19,90/mês',
                    color: 'text-emerald-400',
                    border: 'hover:border-emerald-500/60'
                  },
                  {
                    title: 'Domínios & DNS',
                    subtitle: '.com.br e Globais',
                    detail: 'Anycast em 0.8s · SSL',
                    price: 'R$ 42,90/ano',
                    color: 'text-sky-400',
                    border: 'hover:border-sky-500/60'
                  },
                  {
                    title: 'E-mail & Mkt',
                    subtitle: 'SPF / DKIM / DMARC',
                    detail: '500k envios/h · Antispam',
                    price: 'R$ 14,90/mês',
                    color: 'text-amber-400',
                    border: 'hover:border-amber-500/60'
                  },
                  {
                    title: 'IA Autônomo',
                    subtitle: 'NsA Sentinel 24/7',
                    detail: 'Vendas WhatsApp · RAG',
                    price: 'Incluso / R$ 89,90',
                    color: 'text-indigo-400',
                    border: 'hover:border-indigo-500/60'
                  },
                  {
                    title: 'Outros & Segurança',
                    subtitle: 'CDN 300+ PoPs & Postgres',
                    detail: 'Backup Imutável NVMe',
                    price: 'R$ 19,90/mês',
                    color: 'text-rose-400',
                    border: 'hover:border-rose-500/60'
                  },
                ].map((col, idx) => (
                  <div
                    key={idx}
                    onClick={() => onNavigateTab('services')}
                    className={`bg-slate-950/80 p-3 rounded-lg border border-slate-800/90 ${col.border} transition-all cursor-pointer group/card flex flex-col justify-between`}
                  >
                    <div>
                      <span className={`text-[10px] font-mono font-bold uppercase ${col.color} block`}>
                        {col.title}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1 group-hover/card:text-cyan-300 transition-colors">
                        {col.subtitle}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {col.detail}
                      </p>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-slate-200">{col.price}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover/card:text-cyan-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WIDGET ONI UI 17 & DATACENTER WORLD-CLASS */}
          {activeWidgets.includes('oni-ui') && (
            <div className="col-span-full">
              <OniUiUpdateCard />
            </div>
          )}

          {/* WIDGET ONI UI 17 KERNEL & SOFTWARE CONSOLIDATED LOG */}
          {activeWidgets.includes('kernel-logs') && (
            <div className="col-span-full">
              <OniUiKernelLogCard />
            </div>
          )}

          {/* WIDGET SYSTEM FORECAST (PREDIÇÃO DE CAPACIDADE DE RECURSOS VPS) */}
          {activeWidgets.includes('system-forecast') && (
            <div className="col-span-full">
              <SystemForecastWidget
                telemetry={telemetry}
                onClose={() => onToggleWidget('system-forecast')}
                onNavigateTab={onNavigateTab}
              />
            </div>
          )}

          {/* WIDGET GLOBAL LATENCY HEATMAP D3 (SVG) */}
          {activeWidgets.includes('latency-map') && (
            <div className="col-span-full">
              <GlobalLatencyHeatmapWidget
                onClose={() => onToggleWidget('latency-map')}
                onNavigateTelemetry={() => onNavigateTab('telemetry')}
              />
            </div>
          )}

          {/* WIDGET ADVANCED RESOURCE MONITORING (D3.JS) */}
          {activeWidgets.includes('d3-monitoring') && (
            <div className="col-span-full xl:col-span-2">
              <AdvancedResourceMonitoringWidget
                containers={containers}
                onClose={() => onToggleWidget('d3-monitoring')}
                onNavigateContainers={() => onNavigateTab('containers')}
              />
            </div>
          )}

          {/* WIDGET 1: COTAÇÕES COMERCIAIS & MERCADO GLOBAL */}
          {activeWidgets.includes('market') && (
            <div className="bg-slate-900/90 border border-slate-800 hover:border-red-500/40 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between shadow-xl backdrop-blur-md transition-all group">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-950/80 border border-red-800 rounded-lg text-red-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                        Cotações & Mercado Global
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">AwesomeAPI REST Streaming</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={onRefreshMarket}
                      disabled={loadingMarket}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                      title="Atualizar Cotações"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingMarket ? 'animate-spin text-red-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => onToggleWidget('market')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors"
                      title="Ocultar Widget"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Grid dos Pares de Moedas */}
                <div className="grid grid-cols-2 gap-2 mt-3 font-mono">
                  <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>USD/BRL</span>
                      <span className={parseFloat(marketData.usd.pctChange) >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {marketData.usd.pctChange}%
                      </span>
                    </div>
                    <div className="text-lg font-black text-white mt-1">R$ {marketData.usd.bid}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Venda: R$ {marketData.usd.ask}</div>
                  </div>

                  <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>EUR/BRL</span>
                      <span className={parseFloat(marketData.eur.pctChange) >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {marketData.eur.pctChange}%
                      </span>
                    </div>
                    <div className="text-lg font-black text-white mt-1">R$ {marketData.eur.bid}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Venda: R$ {marketData.eur.ask}</div>
                  </div>

                  <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>CHF/BRL</span>
                      <span className={parseFloat(marketData.chf.pctChange) >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {marketData.chf.pctChange}%
                      </span>
                    </div>
                    <div className="text-lg font-black text-white mt-1">R$ {marketData.chf.bid}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Venda: R$ {marketData.chf.ask}</div>
                  </div>

                  <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>GBP/BRL</span>
                      <span className={parseFloat(marketData.gbp.pctChange) >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {marketData.gbp.pctChange}%
                      </span>
                    </div>
                    <div className="text-lg font-black text-white mt-1">R$ {marketData.gbp.bid}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Venda: R$ {marketData.gbp.ask}</div>
                  </div>
                </div>

                {/* Mini Índices Bolsas */}
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 font-mono text-[10px]">
                  <div className="flex justify-between items-center bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    <span className="text-slate-300">B3 IBOVESPA</span>
                    <span className="text-emerald-400 font-bold">{marketData.ibovespa.points} pts</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    <span className="text-slate-300">S&P 500</span>
                    <span className="text-emerald-400 font-bold">{marketData.sp500.points} pts</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('broadcast')}
                className="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Ver Estúdio Ao Vivo Completo</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          )}

          {/* WIDGET 2: TELEMETRIA DE HARDWARE & CLUSTER AMD EPYC */}
          {activeWidgets.includes('hardware') && (
            <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between shadow-xl backdrop-blur-md transition-all group">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-cyan-950/80 border border-cyan-800 rounded-lg text-cyan-400">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                        Hardware & Telemetria
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">AMD EPYC™ 9754 Bergamo</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleWidget('hardware')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors"
                    title="Ocultar Widget"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 font-mono">
                  <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">CPU CARGA</span>
                    <span className="text-xl font-bold text-cyan-400">{telemetry?.cpu.overallLoadPercent || 14.8}%</span>
                    <div className="w-full h-1 bg-slate-800 rounded mt-1.5 overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: `${telemetry?.cpu.overallLoadPercent || 14.8}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">RAM ECC DDR5</span>
                    <span className="text-xl font-bold text-indigo-400">{telemetry?.memory.usagePercent || 23.4}%</span>
                    <div className="w-full h-1 bg-slate-800 rounded mt-1.5 overflow-hidden">
                      <div className="h-full bg-indigo-400" style={{ width: `${telemetry?.memory.usagePercent || 23.4}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">STORAGE IOPS</span>
                    <span className="text-base font-bold text-emerald-400">{(telemetry?.storage.currentIops || 428900).toLocaleString()}</span>
                    <span className="text-[9px] text-slate-500 block">NVMe Gen5 Raided</span>
                  </div>

                  <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">REDE ANYCAST</span>
                    <span className="text-base font-bold text-sky-400">{telemetry?.network.throughputInGbps || '12.4'} Gbps</span>
                    <span className="text-[9px] text-slate-500 block">40 Gbps Uplink</span>
                  </div>
                </div>

                {/* Nó SP1 */}
                <div className="bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 mt-2.5 flex items-center justify-between text-[10px] font-mono">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Nó B3 SP1 (São Paulo)
                  </span>
                  <span className="text-emerald-400 font-bold">1.8ms Latência</span>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('telemetry')}
                className="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Abrir Telemetria Completa</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          )}

          {/* WIDGET 3: CONTAINERS & TRILHÕES DE SITES */}
          {activeWidgets.includes('containers') && (
            <div className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between shadow-xl backdrop-blur-md transition-all group">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-950/80 border border-indigo-800 rounded-lg text-indigo-400">
                      <Box className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                        Containers & Trilhões de Sites
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">{containers.length} Instâncias Vivas</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleWidget('containers')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors"
                    title="Ocultar Widget"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 mt-3 font-mono">
                  {containers.slice(0, 3).map((c) => (
                    <div key={c.id} className="bg-slate-950/90 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span className="font-bold text-white truncate">{c.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate block">{c.domain}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-cyan-400 font-bold">Porta {c.port}</span>
                        <span className="text-[9px] text-emerald-400 block">SSL 100%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('containers')}
                className="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Gerenciar Containers & Deploy</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>
          )}

          {/* WIDGET 4: GEMINI 4 CARBON CYBER DEFENSE */}
          {activeWidgets.includes('carbon') && (
            <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between shadow-xl backdrop-blur-md transition-all group">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-cyan-950/80 border border-cyan-800 rounded-lg text-cyan-400">
                      <Shield className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                        Gemini 4 Carbon Defense
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">Defesa Autônoma IA</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleWidget('carbon')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors"
                    title="Ocultar Widget"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-cyan-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 font-mono block">PERÍMETRO GLOBAL</span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Blindado Zero-Trust
                      </span>
                    </div>
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-mono font-bold">
                      DPI Ativo
                    </span>
                  </div>

                  {/* Logs de Defesa Recentes */}
                  <div className="bg-black/60 rounded-lg p-2 border border-slate-800/80 mt-2 font-mono text-[10px] text-slate-300 space-y-1">
                    <div className="text-cyan-400 truncate">[DPI Engine] Varredura heurística contínua: 0 ameaças.</div>
                    <div className="text-emerald-400 truncate">[WAF Sovereign] Bloqueio preventivo na porta 22 isolado.</div>
                    <div className="text-slate-400 truncate">[Anycast] Tráfego normalizado com sucesso.</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="text-emerald-400 font-bold">Argon2id Root Verified</span>
                <span>VPSNsA Sovereign Root</span>
              </div>
            </div>
          )}

          {/* WIDGET 5: KUBERNETES & DOCKER SWARM */}
          {activeWidgets.includes('orchestration') && (
            <div className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between shadow-xl backdrop-blur-md transition-all group">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-sky-950/80 border border-sky-800 rounded-lg text-sky-400">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                        Kubernetes & Swarm
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">Auto-Scaling & Pods</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleWidget('orchestration')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors"
                    title="Ocultar Widget"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 font-mono text-center">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Deployments</span>
                    <strong className="text-base text-white">{deployments.length || 3}</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Pods Vivos</span>
                    <strong className="text-base text-emerald-400">48 / 48</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">HPA Status</span>
                    <strong className="text-base text-cyan-400">Ativo</strong>
                  </div>
                </div>

                <div className="bg-slate-950/90 p-2 rounded-lg border border-slate-800 mt-2.5 text-[10px] font-mono text-slate-300 flex items-center justify-between">
                  <span>Rolling Updates:</span>
                  <span className="text-emerald-400 font-bold">Zero-Downtime Ativo</span>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('orchestration')}
                className="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Abrir Orquestrador K8s</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
              </button>
            </div>
          )}

          {/* WIDGET 6: N8N AUTOMAÇÕES DE WORKFLOW */}
          {activeWidgets.includes('n8n') && (
            <div className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between shadow-xl backdrop-blur-md transition-all group">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-950/80 border border-purple-800 rounded-lg text-purple-400">
                      <Workflow className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                        Automações n8n
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">Workflows & Webhooks</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleWidget('n8n')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors"
                    title="Ocultar Widget"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 mt-3 font-mono">
                  {workflows.slice(0, 3).map((w) => (
                    <div key={w.id} className="bg-slate-950/90 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-white truncate block">{w.name}</span>
                        <span className="text-[10px] text-slate-400">{w.nodes?.length || 0} nós · {w.triggerType}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        w.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {w.active ? 'Ativo' : 'Pausado'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('n8n')}
                className="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Gerenciar Fluxos n8n</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              </button>
            </div>
          )}

          {/* WIDGET 7: TERMINAL CLI DIAGNÓSTICOS RÁPIDOS */}
          {activeWidgets.includes('terminal') && (
            <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between shadow-xl backdrop-blur-md transition-all group">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-950/80 border border-amber-800 rounded-lg text-amber-400">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                        Terminal CLI Diagnóstico
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">vpsnsa-cli v4.2</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleWidget('terminal')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors"
                    title="Ocultar Widget"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 font-mono text-[10px]">
                  <button
                    onClick={() => onExecuteCliCommand ? onExecuteCliCommand('vps cluster status') : onNavigateTab('terminal')}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-lg text-left transition-colors"
                  >
                    <span className="text-amber-400 font-bold block">$ vps cluster status</span>
                    <span className="text-slate-500 block">Status geral nós</span>
                  </button>

                  <button
                    onClick={() => onExecuteCliCommand ? onExecuteCliCommand('vps containers list') : onNavigateTab('terminal')}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-lg text-left transition-colors"
                  >
                    <span className="text-amber-400 font-bold block">$ vps containers list</span>
                    <span className="text-slate-500 block">Listar portas Docker</span>
                  </button>

                  <button
                    onClick={() => onExecuteCliCommand ? onExecuteCliCommand('vps k8s pods') : onNavigateTab('terminal')}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-lg text-left transition-colors"
                  >
                    <span className="text-amber-400 font-bold block">$ vps k8s pods</span>
                    <span className="text-slate-500 block">Inspecionar Swarm</span>
                  </button>

                  <button
                    onClick={() => onExecuteCliCommand ? onExecuteCliCommand('vps security audit') : onNavigateTab('terminal')}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-lg text-left transition-colors"
                  >
                    <span className="text-amber-400 font-bold block">$ vps security audit</span>
                    <span className="text-slate-500 block">Argon2id Check</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('terminal')}
                className="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Abrir Terminal Bash Interativo</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          )}

        </div>
      )}

      {/* RODAPÉ INSTITUCIONAL */}
      <footer className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span className="text-slate-300 font-medium">
            Todos os direitos reservados a VPS NsA Hyperscale Cluster Enterprise
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Layout CSS Grid Responsivo Auto-Fit</span>
          <span className="text-cyan-400 font-semibold">Gemini 4 Carbon Shield</span>
        </div>
      </footer>

    </div>
  );
};
