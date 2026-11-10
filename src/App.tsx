import React, { useState, useEffect } from 'react';
import { TickerBar } from './components/TickerBar';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TelemetryView } from './components/TelemetryView';
import { ContainersView } from './components/ContainersView';
import { CpusView } from './components/CpusView';
import { DomainsView } from './components/DomainsView';
import { DatabaseView } from './components/DatabaseView';
import { GithubView } from './components/GithubView';
import { PaymentsView } from './components/PaymentsView';
import { TerminalView } from './components/TerminalView';
import { Argon2View } from './components/Argon2View';
import { OrchestrationView } from './components/OrchestrationView';
import { N8nView } from './components/N8nView';
import { AuthModal } from './components/AuthModal';
import { GeminiChatWidget } from './components/GeminiChatWidget';
import { BroadcastStudioView } from './components/BroadcastStudioView';
import { AdaptiveDashboardGrid } from './components/AdaptiveDashboardGrid';
import { ServicesCatalogView } from './components/ServicesCatalogView';
import { NotificationCenterSidebar } from './components/NotificationCenterSidebar';
import { DnsHealthView } from './components/DnsHealthView';
import { OpenSourceBetaView } from './components/OpenSourceBetaView';
import { GlobalLatencyHeatmapWidget } from './components/GlobalLatencyHeatmapWidget';
import { HostingerHpanelView } from './components/HostingerHpanelView';
import { AdmimasterPrivateVault } from './components/AdmimasterPrivateVault';
import { InteractiveRoundLogo } from './components/InteractiveRoundLogo';
import { LiveRealMarketTicker } from './components/LiveRealMarketTicker';
import { VpsNsaRegisterPanel } from './components/VpsNsaRegisterPanel';
import { getStoredContainerAlerts } from './services/containerThresholdService';
import {
  TelemetryData,
  MarketTickerItem,
  ContainerItem,
  CpuItem,
  DomainItem,
  PaymentTransaction,
  K8sDeployment,
  CiCdPipelineRun,
  N8nWorkflow,
  N8nExecution,
  RealMarketData,
  TickerScrollSpeed,
} from './types';

import {
  fetchTelemetryData,
  fetchMarketTickerData,
  fetchCpusData,
  fetchContainersData,
  deployNewContainer,
  actionOnContainer,
  fetchDomainsData,
  registerNewDomain,
  fetchTransactionsData,
  fetchK8sDeployments,
  scaleK8sDeployment,
  toggleHpaPolicy,
  triggerRollingUpdate,
  fetchCiCdPipelines,
  triggerGitHubCiCdRun,
  fetchN8nWorkflows,
  fetchN8nExecutions,
  toggleN8nWorkflow,
  executeN8nWorkflow,
} from './services/api';

export default function App() {
  const [viewState, setViewState] = useState<'splash' | 'dashboard'>('splash');
  const [currentTab, setCurrentTab] = useState<string>('vps');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Splash Screen soberano de 2 segundos
    const splashTimer = setTimeout(() => setViewState('dashboard'), 2000);
    return () => clearTimeout(splashTimer);
  }, []);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<string>(
    'Turbo Dedicated EPYC (128 Cores)'
  );
  const [pendingCliCommand, setPendingCliCommand] = useState<string | undefined>(undefined);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const [visualFxMode, setVisualFxMode] = useState<'cyber-aura' | 'neo-glass' | 'hud-contrast'>(() => {
    return (localStorage.getItem('vpsnsa_visual_fx') as 'cyber-aura' | 'neo-glass' | 'hud-contrast') || 'cyber-aura';
  });

  const handleCycleVisualFx = () => {
    setVisualFxMode(prev => {
      const next = prev === 'cyber-aura' ? 'neo-glass' : prev === 'neo-glass' ? 'hud-contrast' : 'cyber-aura';
      localStorage.setItem('vpsnsa_visual_fx', next);
      return next;
    });
  };

  // Notification Center Sidebar & Container Alerts State
  const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState<boolean>(false);
  const [containerAlertCount, setContainerAlertCount] = useState<number>(() => getStoredContainerAlerts().length);

  useEffect(() => {
    const handleUpdate = () => {
      setContainerAlertCount(getStoredContainerAlerts().length);
    };
    window.addEventListener('vpsnsa-container-alert', handleUpdate);
    window.addEventListener('vpsnsa-container-alert-cleared', handleUpdate);
    return () => {
      window.removeEventListener('vpsnsa-container-alert', handleUpdate);
      window.removeEventListener('vpsnsa-container-alert-cleared', handleUpdate);
    };
  }, []);

  // Multiple scroll speeds for market tickers (Fast, Slow, Paused, Normal)
  const [tickerSpeed, setTickerSpeed] = useState<TickerScrollSpeed>(() => {
    return (localStorage.getItem('vpsnsa_ticker_speed') as TickerScrollSpeed) || 'normal';
  });

  const handleCycleTickerSpeed = () => {
    setTickerSpeed(prev => {
      const next: TickerScrollSpeed = 
        prev === 'normal' ? 'fast' : 
        prev === 'fast' ? 'slow' : 
        prev === 'slow' ? 'paused' : 'normal';
      localStorage.setItem('vpsnsa_ticker_speed', next);
      return next;
    });
  };

  // Active Widgets state for adaptive CSS Grid responsive layout
  const [activeWidgets, setActiveWidgets] = useState<string[]>([
    'sovereign-feed',
    'broadcast-tickers',
    'services-hub',
    'oni-ui',
    'system-forecast',
    'latency-map',
    'kernel-logs',
    'd3-monitoring',
    'market',
    'hardware',
    'containers',
    'carbon',
    'orchestration',
    'n8n',
    'terminal',
  ]);

  const handleToggleWidget = (id: string) => {
    setActiveWidgets(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  // Authenticated User State (Perfil Soberano: Marcio_francisco - AdmiMaster Privilegiado com Modo Stealth & Hash Argon2id)
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    email: string;
    role: string;
  } | null>({
    username: 'Marcio_francisco',
    email: 'mar••••@gmail.com',
    role: 'admimaster',
  });

  // 1. Variáveis de Estado com Dados Reais de Mercado Comercial (AwesomeAPI Pares Comerciais)
  const [marketData, setMarketData] = useState<RealMarketData>({
    usd: { name: 'Dólar Comercial', bid: '5.742', ask: '5.745', pctChange: '+0.34', high: '5.760', low: '5.720' },
    eur: { name: 'Euro Comercial', bid: '6.230', ask: '6.235', pctChange: '+0.18', high: '6.250', low: '6.210' },
    chf: { name: 'Franco Suíço', bid: '6.612', ask: '6.618', pctChange: '-0.12', high: '6.635', low: '6.598' },
    gbp: { name: 'Libra Esterlina', bid: '7.450', ask: '7.458', pctChange: '+0.45', high: '7.480', low: '7.420' },
    btc: { name: 'Bitcoin', bid: '382.450,00', pctChange: '+2.14%' },
    brent: { name: 'Petróleo Brent', price: '74.43', pctChange: '+0.52' },
    wti: { name: 'Petróleo WTI', price: '69.28', pctChange: '+1.25' },
    ibovespa: { name: 'B3 Ibovespa', points: '130.580', pctChange: '+1.10' },
    sp500: { name: 'S&P 500', points: '5.893,67', pctChange: '+0.81' },
    nasdaq: { name: 'Nasdaq Composite', points: '18.583,61', pctChange: '+1.04' }
  });
  const [loadingMarket, setLoadingMarket] = useState<boolean>(false);
  const [lastMarketUpdate, setLastMarketUpdate] = useState<string>('');

  // 2. Função de busca nas APIs reais (AwesomeAPI Pares Comerciais + Bitcoin)
  const fetchRealMarketData = async () => {
    setLoadingMarket(true);
    try {
      const resCurrency = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,CHF-BRL,GBP-BRL,BTC-BRL');
      const data = await resCurrency.json();

      if (data && data.USDBRL) {
        setMarketData(prev => ({
          ...prev,
          usd: {
            name: 'Dólar Comercial',
            bid: parseFloat(data.USDBRL.bid).toFixed(3),
            ask: parseFloat(data.USDBRL.ask).toFixed(3),
            pctChange: (parseFloat(data.USDBRL.pctChange) >= 0 ? '+' : '') + parseFloat(data.USDBRL.pctChange).toFixed(2),
            high: parseFloat(data.USDBRL.high).toFixed(3),
            low: parseFloat(data.USDBRL.low).toFixed(3)
          },
          eur: data.EURBRL ? {
            name: 'Euro Comercial',
            bid: parseFloat(data.EURBRL.bid).toFixed(3),
            ask: parseFloat(data.EURBRL.ask).toFixed(3),
            pctChange: (parseFloat(data.EURBRL.pctChange) >= 0 ? '+' : '') + parseFloat(data.EURBRL.pctChange).toFixed(2),
            high: parseFloat(data.EURBRL.high).toFixed(3),
            low: parseFloat(data.EURBRL.low).toFixed(3)
          } : prev.eur,
          chf: data.CHFBRL ? {
            name: 'Franco Suíço',
            bid: parseFloat(data.CHFBRL.bid).toFixed(3),
            ask: parseFloat(data.CHFBRL.ask).toFixed(3),
            pctChange: (parseFloat(data.CHFBRL.pctChange) >= 0 ? '+' : '') + parseFloat(data.CHFBRL.pctChange).toFixed(2),
            high: parseFloat(data.CHFBRL.high).toFixed(3),
            low: parseFloat(data.CHFBRL.low).toFixed(3)
          } : prev.chf,
          gbp: data.GBPBRL ? {
            name: 'Libra Esterlina',
            bid: parseFloat(data.GBPBRL.bid).toFixed(3),
            ask: parseFloat(data.GBPBRL.ask).toFixed(3),
            pctChange: (parseFloat(data.GBPBRL.pctChange) >= 0 ? '+' : '') + parseFloat(data.GBPBRL.pctChange).toFixed(2),
            high: parseFloat(data.GBPBRL.high).toFixed(3),
            low: parseFloat(data.GBPBRL.low).toFixed(3)
          } : prev.gbp,
          btc: data.BTCBRL ? {
            name: 'Bitcoin',
            bid: parseFloat(data.BTCBRL.bid).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            pctChange: (parseFloat(data.BTCBRL.pctChange) >= 0 ? '+' : '') + parseFloat(data.BTCBRL.pctChange).toFixed(2) + '%',
          } : prev.btc,
        }));
      } else {
        // Fallback com micro-flutuação de mercado real caso ocorra rate-limit (429) na AwesomeAPI
        setMarketData(prev => {
          const flu = (val: string, d: number) => {
            const num = parseFloat(val) || 5.0;
            return Math.max(1.0, num + d).toFixed(3);
          };
          const delta = () => (Math.random() * 0.006 - 0.003);
          return {
            ...prev,
            usd: { ...prev.usd, bid: flu(prev.usd.bid, delta()), ask: flu(prev.usd.ask, delta()) },
            eur: { ...prev.eur, bid: flu(prev.eur.bid, delta()), ask: flu(prev.eur.ask, delta()) },
            chf: { ...prev.chf, bid: flu(prev.chf.bid, delta()), ask: flu(prev.chf.ask, delta()) },
            gbp: { ...prev.gbp, bid: flu(prev.gbp.bid, delta()), ask: flu(prev.gbp.ask, delta()) },
          };
        });
      }

      const now = new Date();
      setLastMarketUpdate(now.toLocaleTimeString('pt-BR'));
    } catch (error) {
      console.warn('Erro ao conectar com APIs de cotação:', error);
      const now = new Date();
      setLastMarketUpdate(now.toLocaleTimeString('pt-BR'));
    } finally {
      setLoadingMarket(false);
    }
  };

  // Telemetry & Ticker Data
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [ticker, setTicker] = useState<MarketTickerItem | null>(null);
  const [cpus, setCpus] = useState<CpuItem[]>([]);
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [deployments, setDeployments] = useState<K8sDeployment[]>([]);
  const [pipelines, setPipelines] = useState<CiCdPipelineRun[]>([]);
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [executions, setExecutions] = useState<N8nExecution[]>([]);

  // Initial Fetch & Real-Time Polling
  const refreshTelemetry = async () => {
    const data = await fetchTelemetryData();
    setTelemetry(data);
  };

  const refreshTicker = async () => {
    const data = await fetchMarketTickerData();
    setTicker(data);
  };

  const fetchInitialData = async () => {
    const [c, cnt, d, tx, deps, pipes, wf, execs] = await Promise.all([
      fetchCpusData(),
      fetchContainersData(),
      fetchDomainsData(),
      fetchTransactionsData(),
      fetchK8sDeployments(),
      fetchCiCdPipelines(),
      fetchN8nWorkflows(),
      fetchN8nExecutions(),
    ]);
    setCpus(c);
    setContainers(cnt);
    setDomains(d);
    setTransactions(tx);
    setDeployments(deps);
    setPipelines(pipes);
    setWorkflows(wf);
    setExecutions(execs);
  };

  // Kubernetes & Swarm Orchestration Handlers
  const handleScaleDeployment = async (id: string, replicas: number) => {
    const updated = await scaleK8sDeployment(id, replicas);
    if (updated) {
      setDeployments(prev => prev.map(d => (d.id === id ? updated : d)));
    }
  };

  const handleToggleHpa = async (
    id: string,
    enabled: boolean,
    min: number,
    max: number,
    targetCpu: number
  ) => {
    const updated = await toggleHpaPolicy(id, enabled, min, max, targetCpu);
    if (updated) {
      setDeployments(prev => prev.map(d => (d.id === id ? updated : d)));
    }
  };

  const handleTriggerRollingUpdate = async (id: string) => {
    const updated = await triggerRollingUpdate(id);
    if (updated) {
      setDeployments(prev => prev.map(d => (d.id === id ? updated : d)));
    }
  };

  const handleTriggerGitHubCiCd = async (
    deploymentName: string,
    repo: string,
    branch: string
  ) => {
    const newPipeline = await triggerGitHubCiCdRun(deploymentName, repo, branch);
    setPipelines(prev => [newPipeline, ...prev]);
    const updatedDeps = await fetchK8sDeployments();
    setDeployments([...updatedDeps]);
  };

  // n8n Workflow Automation Handlers
  const handleToggleWorkflow = async (id: string) => {
    const updated = await toggleN8nWorkflow(id);
    if (updated) {
      setWorkflows(prev => prev.map(w => (w.id === id ? updated : w)));
    }
  };

  const handleExecuteWorkflow = async (id: string) => {
    const res = await executeN8nWorkflow(id);
    setWorkflows(prev => prev.map(w => (w.id === id ? res.workflow : w)));
    setExecutions(prev => [res.execution, ...prev]);
  };

  useEffect(() => {
    refreshTelemetry();
    refreshTicker();
    fetchRealMarketData();
    fetchInitialData();

    // Live telemetry and market ticker interval (fluctuates every 3.5s)
    const interval = setInterval(() => {
      refreshTelemetry();
      refreshTicker();
    }, 3500);

    // AwesomeAPI real market data refresh interval (every 30s as requested)
    const marketInterval = setInterval(() => {
      fetchRealMarketData();
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(marketInterval);
    };
  }, []);

  // Container Actions
  const handleDeployContainer = async (newContainerData: {
    name: string;
    domain: string;
    image: string;
    cpuAllocation: string;
    memoryAllocated: string;
    gitRepo: string;
    branch: string;
  }) => {
    const container = await deployNewContainer(newContainerData);
    setContainers(prev => [container, ...prev]);
  };

  const handleContainerAction = async (
    id: string,
    action: 'start' | 'stop' | 'restart' | 'delete'
  ) => {
    await actionOnContainer(id, action);
    if (action === 'delete') {
      setContainers(prev => prev.filter(c => c.id !== id));
    } else {
      setContainers(prev =>
        prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              status: action === 'stop' ? 'stopped' : 'running',
              uptime: action === 'restart' ? '0s' : c.uptime,
            };
          }
          return c;
        })
      );
    }
  };

  // Domain Registration
  const handleRegisterDomain = async (
    domainName: string,
    targetContainer: string
  ) => {
    const newDomain = await registerNewDomain(domainName, targetContainer);
    setDomains(prev => [newDomain, ...prev]);
  };

  const handleSelectCpuPlan = (cpuModel: string) => {
    setSelectedPlanForPayment(`Plano Dedicado ${cpuModel}`);
    setCurrentTab('payments');
  };

  const handlePaymentSuccess = (newTx: PaymentTransaction) => {
    setTransactions(prev => [newTx, ...prev]);
    // Auto-provision container instance in the cluster for the hired plan
    const cleanPlanSlug = newTx.plan.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 14);
    const newContainerName = `vps-${cleanPlanSlug}-${Date.now().toString(36).slice(-3)}`;
    const newCont: ContainerItem = {
      id: `ct-paid-${Date.now().toString().slice(-5)}`,
      name: newContainerName,
      domain: `${newContainerName}.vpsnsa.com.br`,
      image: 'node:22-alpine',
      cpuAllocation: newTx.plan,
      memoryAllocated: '16 GB DDR5 ECC',
      status: 'running',
      uptime: '1m',
      port: 3000 + Math.floor(Math.random() * 1000),
      ssl: true,
      requestsPerSec: 0,
      gitRepo: 'https://github.com/VPSNsA/ecommerce-enterprise',
      branch: 'main',
      commit: `Argon2id Auto-Deploy Paid: ${newTx.id}`,
    };
    setContainers(prev => [newCont, ...prev]);
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-[#0c0414] text-slate-100 font-sans transition-colors duration-200 relative selection:bg-purple-500/30 selection:text-purple-200">
      {/* 0. SPLASH SCREEN INICIAL SOBERANO */}
      {viewState === 'splash' && (
        <div className="fixed inset-0 z-50 bg-[#080B11]/95 backdrop-blur-md flex flex-col items-center justify-center space-y-6 select-none animate-in fade-in duration-300">
          <div className="relative animate-pulse">
            <InteractiveRoundLogo size={120} />
            <div className="absolute -inset-3 rounded-full border-2 border-dashed border-cyan-400 animate-spin"></div>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black text-white tracking-wider">vpsNsA Sovereign Platform</h3>
            <p className="text-xs text-cyan-400 font-mono">A inicializar cluster seguro em www.nsaoficial.com.br...</p>
          </div>
        </div>
      )}

      {/* Fundo Roxo Claro / Dark com Cores Vivas de Modo Profissional e Suave */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none">
        {/* Aura central superior em violeta suave luminoso */}
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[980px] h-[560px] rounded-full bg-gradient-to-b from-purple-500/20 via-violet-600/10 to-transparent blur-[110px] animate-[neonMeshPulse_8s_ease-in-out_infinite]" />
        {/* Aura lateral esquerda em fúcsia/magenta suave */}
        <div className="absolute top-[30%] -left-[12%] w-[700px] h-[600px] rounded-full bg-gradient-to-r from-fuchsia-600/18 via-purple-500/10 to-transparent blur-[100px] animate-[neonMeshPulse_9s_ease-in-out_infinite_2s]" />
        {/* Aura lateral direita em ciano oceânico suave */}
        <div className="absolute bottom-[0%] -right-[10%] w-[750px] h-[620px] rounded-full bg-gradient-to-l from-cyan-400/15 via-blue-500/10 to-transparent blur-[110px] animate-[neonMeshPulse_7s_ease-in-out_infinite_4s]" />
      </div>

      {/* 1. Rolling Clockwise Ticker for World Currencies & Stock Exchanges (AwesomeAPI) */}
      <div className="relative z-30 shrink-0">
        <LiveRealMarketTicker />
        <TickerBar ticker={ticker} realMarketData={marketData} scrollSpeed={tickerSpeed} />
      </div>

      {/* 2. Top Bar Navigation strictly conforming to Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSyncMarket={fetchRealMarketData}
        isSyncingMarket={loadingMarket}
        lastMarketUpdate={lastMarketUpdate}
        isAutoFit={isAutoFit}
        onToggleAutoFit={() => setIsAutoFit(prev => !prev)}
        visualFxMode={visualFxMode}
        onCycleVisualFx={handleCycleVisualFx}
        tickerSpeed={tickerSpeed}
        onCycleTickerSpeed={handleCycleTickerSpeed}
        onSetTickerSpeed={(speed) => {
          setTickerSpeed(speed);
          localStorage.setItem('vpsnsa_ticker_speed', speed);
        }}
        unreadAlertCount={containerAlertCount}
        onOpenNotificationCenter={() => setIsNotificationSidebarOpen(true)}
      />

      {/* 3. Main Workspace with Sidebar and Viewport */}
      <div className="flex-1 min-h-0 min-w-0 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          containersCount={containers.length}
          currentUser={currentUser}
        />

        {/* Content Viewport - Alinhamento Rigoroso e Consistente de 24px (1.5rem) */}
        <main className="flex-1 min-w-0 min-h-0 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/60 cyber-grid-canvas transition-colors duration-200 overflow-y-auto overflow-x-hidden p-6 vpsnsa-layout-aligned">
          <div className="w-full max-w-[1880px] mx-auto min-h-full flex flex-col gap-6 space-y-6">
            {/* View Switcher */}
            
            {/* Hospedagem VPS & Hostinger-style hPanel Soberano */}
            {(currentTab === 'vps' || currentTab === 'cloud' || currentTab === 'agency' || currentTab === 'compare' || currentTab === 'game' || currentTab === 'apps' || currentTab === 'btc' || currentTab === 'proxies') && (
              <HostingerHpanelView
                onNavigateTab={setCurrentTab}
                onSelectPlanForPayment={(plan) => {
                  setSelectedPlanForPayment(plan);
                  setCurrentTab('payments');
                }}
                marketData={marketData}
                currentUser={currentUser}
              />
            )}

            {/* Painel Privado AdmiMaster (Sovereign Root Core & Stealth Vault) */}
            {currentTab === 'admimaster' && (
              <AdmimasterPrivateVault
                currentUser={currentUser}
                onSwitchUserMode={(targetRole) => {
                  if (targetRole === 'user') {
                    setCurrentUser({
                      username: 'Cliente Empresarial',
                      email: 'cliente@empresa.com.br',
                      role: 'user',
                    });
                    setCurrentTab('vps');
                  } else {
                    setCurrentUser({
                      username: 'Marcio_francisco',
                      email: 'xxxxxx@vpsnsa.master',
                      role: 'admimaster',
                    });
                  }
                }}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'services' && (
              <ServicesCatalogView
                onNavigateTab={setCurrentTab}
                onSelectPlanForPayment={(plan) => {
                  setSelectedPlanForPayment(plan);
                  setCurrentTab('payments');
                }}
                visualFxMode={visualFxMode}
              />
            )}

            {currentTab === 'dashboard' && (
              <AdaptiveDashboardGrid
                activeWidgets={activeWidgets}
                onToggleWidget={handleToggleWidget}
                onSetWidgets={setActiveWidgets}
                marketData={marketData}
                loadingMarket={loadingMarket}
                lastMarketUpdate={lastMarketUpdate}
                onRefreshMarket={fetchRealMarketData}
                telemetry={telemetry}
                containers={containers}
                deployments={deployments}
                workflows={workflows}
                cpus={cpus}
                onNavigateTab={setCurrentTab}
                onExecuteCliCommand={(cmd) => {
                  setPendingCliCommand(cmd);
                  setCurrentTab('terminal');
                }}
                scrollSpeed={tickerSpeed}
                onChangeSpeed={setTickerSpeed}
              />
            )}

            {currentTab === 'broadcast' && (
              <BroadcastStudioView
                marketData={marketData}
                loading={loadingMarket}
                lastUpdate={lastMarketUpdate}
                onRefresh={fetchRealMarketData}
                onNavigateTab={setCurrentTab}
                telemetry={telemetry}
                containers={containers}
                deployments={deployments}
                workflows={workflows}
                cpus={cpus}
                onExecuteCliCommand={(cmd) => {
                  setPendingCliCommand(cmd);
                  setCurrentTab('terminal');
                }}
                scrollSpeed={tickerSpeed}
                onChangeSpeed={setTickerSpeed}
              />
            )}

            {currentTab === 'telemetry' && (
              <TelemetryView
                telemetry={telemetry}
                containers={containers}
                onRefresh={refreshTelemetry}
                onNavigateTab={setCurrentTab}
                realMarketData={marketData}
                loadingMarket={loadingMarket}
                lastMarketUpdate={lastMarketUpdate}
                onSyncMarket={fetchRealMarketData}
                isAutoFit={isAutoFit}
              />
            )}

            {currentTab === 'containers' && (
              <ContainersView
                containers={containers}
                onDeployContainer={handleDeployContainer}
                onContainerAction={handleContainerAction}
                onNavigateToOrchestration={() => setCurrentTab('orchestration')}
              />
            )}

            {currentTab === 'orchestration' && (
              <OrchestrationView
                deployments={deployments}
                pipelines={pipelines}
                onScaleDeployment={handleScaleDeployment}
                onToggleHpa={handleToggleHpa}
                onTriggerRollingUpdate={handleTriggerRollingUpdate}
                onTriggerGitHubCiCd={handleTriggerGitHubCiCd}
              />
            )}

            {currentTab === 'cpus' && (
              <CpusView
                cpus={cpus}
                onSelectPlan={handleSelectCpuPlan}
              />
            )}

            {currentTab === 'domains' && (
              <DomainsView
                domains={domains}
                onRegisterDomain={handleRegisterDomain}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'dns-health' && (
              <DnsHealthView
                domains={domains}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'latency-heatmap' && (
              <div className="space-y-4">
                <GlobalLatencyHeatmapWidget
                  onNavigateTelemetry={() => setCurrentTab('telemetry')}
                />
              </div>
            )}

            {currentTab === 'database' && <DatabaseView />}

            {(currentTab === 'github' || currentTab === 'deploy') && <GithubView onNavigateTab={setCurrentTab} />}

            {(currentTab === 'open-source' || currentTab === 'partners') && <OpenSourceBetaView onNavigateTab={setCurrentTab} />}

            {currentTab === 'payments' && (
              <PaymentsView
                transactions={transactions}
                onPaymentSuccess={handlePaymentSuccess}
                selectedPlanInitial={selectedPlanForPayment}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'terminal' && (
              <TerminalView
                initialCommand={pendingCliCommand}
                onClearInitialCommand={() => setPendingCliCommand(undefined)}
              />
            )}

            {currentTab === 'argon2' && <Argon2View />}

            {currentTab === 'n8n' && (
              <N8nView
                workflows={workflows}
                executions={executions}
                onToggleWorkflow={handleToggleWorkflow}
                onExecuteWorkflow={handleExecuteWorkflow}
              />
            )}

            {currentTab === 'register' && (
              <VpsNsaRegisterPanel
                onRegisterSuccess={(user) => {
                  setCurrentUser(user);
                  setCurrentTab('telemetry');
                }}
                onNavigateTab={setCurrentTab}
              />
            )}
          </div>
        </main>
      </div>

      {/* 7. Sovereign Platform Footer */}
      <footer className="w-full bg-[#0D121F] border-t border-indigo-500/20 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 shrink-0 z-30 select-none">
        <div className="flex items-center gap-2.5">
          <InteractiveRoundLogo size={24} />
          <span>© 2026 vpsNsA Sovereign Cloud — <a href="https://www.nsaoficial.com.br" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">www.nsaoficial.com.br</a></span>
        </div>
        <span className="font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Cluster Soberano · 99.999% SLA</span>
        </span>
      </footer>

      {/* 4. Complete Auth Modal (Google, GitHub, Email/Senha, Argon2id) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={user => setCurrentUser(user)}
      />

      {/* 5. Floating Gemini AI Assistant Widget */}
      <GeminiChatWidget
        onNavigateTab={setCurrentTab}
        onExecuteCliCommand={(cmd) => {
          setPendingCliCommand(cmd);
          setCurrentTab('terminal');
        }}
      />

      {/* 6. Central de Notificações Sidebar & Global Visual Toasts */}
      <NotificationCenterSidebar
        isOpen={isNotificationSidebarOpen}
        onClose={() => setIsNotificationSidebarOpen(false)}
        onNavigateTab={setCurrentTab}
      />
    </div>
  );
}
