import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Network,
  Zap,
  Server,
  ShieldCheck,
  RefreshCw,
  Globe,
  Gauge,
  Layers,
  Download,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  BellRing,
  AlertOctagon,
  Volume2,
  VolumeX,
  Flame,
  Sliders,
  RotateCcw,
  History,
  ShieldAlert,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';
import { TelemetryData, TelemetryAlert, TelemetryAlertConfig, ContainerThresholdAlert, ContainerItem } from '../types';
import { 
  getStoredContainerAlerts, 
  dismissContainerAlert, 
  clearAllContainerAlerts 
} from '../services/containerThresholdService';
import { TelemetryAlertToast } from './TelemetryAlertToast';
import { ResourceForecastChart } from './ResourceForecastChart';
import { SystemForecastWidget } from './SystemForecastWidget';
import { ContainerResourceForecastingSection } from './ContainerResourceForecastingSection';
import { GlobalLatencyHeatmapWidget } from './GlobalLatencyHeatmapWidget';
import { CarbonShieldModule } from './CarbonShieldModule';
import { MarketQuotesModule } from './MarketQuotesModule';
import { setSimulatedTelemetrySpike, getSimulatedSpikeState } from '../services/api';
import { RealMarketData } from '../types';

interface TelemetryViewProps {
  telemetry: TelemetryData | null;
  containers?: ContainerItem[];
  onRefresh: () => void;
  onNavigateTab: (tab: string) => void;
  realMarketData?: RealMarketData;
  loadingMarket?: boolean;
  lastMarketUpdate?: string;
  onSyncMarket?: () => void;
  isAutoFit?: boolean;
}

export const TelemetryView: React.FC<TelemetryViewProps> = ({
  telemetry,
  containers = [],
  onRefresh,
  onNavigateTab,
  realMarketData,
  loadingMarket,
  lastMarketUpdate,
  onSyncMarket,
  isAutoFit = false,
}) => {
  const [downloadNotification, setDownloadNotification] = useState<string | null>(null);
  const [historySnapshots, setHistorySnapshots] = useState<TelemetryData[]>([]);

  // Threshold-based alert system configuration
  const [alertConfig, setAlertConfig] = useState<TelemetryAlertConfig>({
    cpuThreshold: 90,
    ramThreshold: 90,
    enabled: true,
    soundEnabled: true,
  });

  const [activeAlerts, setActiveAlerts] = useState<TelemetryAlert[]>([]);
  const [alertHistory, setAlertHistory] = useState<TelemetryAlert[]>([]);
  const [containerAlerts, setContainerAlerts] = useState<ContainerThresholdAlert[]>(() => getStoredContainerAlerts());
  const [showConfigDrawer, setShowConfigDrawer] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Cooldown tracker to avoid spamming alerts on every 3.5s refresh cycle
  const lastCpuAlertTime = useRef<number>(0);
  const lastRamAlertTime = useRef<number>(0);

  // Web Audio API Alert Chime (Discreet two-tone sine synthesizer)
  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      // High-tech warning tone: 880Hz (A5) -> 587Hz (D5)
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(587, now + 0.16);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    } catch {
      // Audio playback fails silently if user has not interacted with DOM yet
    }
  };

  // Accumulate rolling historical samples for multi-row CSV export
  useEffect(() => {
    if (telemetry) {
      setHistorySnapshots(prev => {
        const next = [telemetry, ...prev];
        return next.slice(0, 50); // Keep last 50 samples
      });
    }
  }, [telemetry]);

  // Threshold evaluation effect: Triggers toast notifications when CPU or RAM exceeds threshold (90%)
  useEffect(() => {
    if (!telemetry || !alertConfig.enabled) return;

    const now = Date.now();
    const newAlerts: TelemetryAlert[] = [];

    // 1. CPU Threshold Check (> 90%)
    if (telemetry.cpu.overallLoadPercent >= alertConfig.cpuThreshold) {
      if (now - lastCpuAlertTime.current > 12000) {
        lastCpuAlertTime.current = now;
        const alertItem: TelemetryAlert = {
          id: `alert-cpu-${now}`,
          metric: 'cpu',
          currentValue: telemetry.cpu.overallLoadPercent,
          threshold: alertConfig.cpuThreshold,
          timestamp: new Date().toISOString(),
          severity: 'critical',
          message: `Carga crítica de CPU atingiu ${telemetry.cpu.overallLoadPercent}% nos nós Bergamo 128C. Limite estabelecido: >${alertConfig.cpuThreshold}%.`,
        };
        newAlerts.push(alertItem);
      }
    }

    // 2. RAM Threshold Check (> 90%)
    if (telemetry.memory.usagePercent >= alertConfig.ramThreshold) {
      if (now - lastRamAlertTime.current > 12000) {
        lastRamAlertTime.current = now;
        const alertItem: TelemetryAlert = {
          id: `alert-ram-${now}`,
          metric: 'ram',
          currentValue: telemetry.memory.usagePercent,
          threshold: alertConfig.ramThreshold,
          timestamp: new Date().toISOString(),
          severity: 'critical',
          message: `Consumo de Memória DDR5/HBM3 atingiu ${telemetry.memory.usagePercent}% (${telemetry.memory.usedGB} GB). Limite estabelecido: >${alertConfig.ramThreshold}%.`,
        };
        newAlerts.push(alertItem);
      }
    }

    if (newAlerts.length > 0) {
      if (alertConfig.soundEnabled) {
        playAlertChime();
      }
      setActiveAlerts(prev => [...newAlerts, ...prev].slice(0, 3));
      setAlertHistory(prev => [...newAlerts, ...prev].slice(0, 30));
    }
  }, [telemetry, alertConfig]);

  // Auto-dismiss active toast alerts after 9 seconds
  useEffect(() => {
    if (activeAlerts.length === 0) return;
    const timer = setTimeout(() => {
      setActiveAlerts(prev => prev.slice(0, prev.length - 1));
    }, 9000);
    return () => clearTimeout(timer);
  }, [activeAlerts]);

  // Listener para Alertas de Limiares Customizados de Containers
  useEffect(() => {
    const handleContainerAlert = (e: Event) => {
      const customEvent = e as CustomEvent<ContainerThresholdAlert>;
      const newAlert = customEvent.detail;
      if (!newAlert) return;

      setContainerAlerts(prev => {
        const filtered = prev.filter(a => a.id !== newAlert.id);
        return [newAlert, ...filtered].slice(0, 20);
      });

      if (alertConfig.enabled) {
        if (alertConfig.soundEnabled) {
          playAlertChime();
        }
        const toastItem: TelemetryAlert = {
          id: newAlert.id,
          metric: newAlert.resource === 'cpu' ? 'container-cpu' : 'container-memory',
          currentValue: newAlert.currentValue,
          threshold: newAlert.thresholdValue,
          timestamp: newAlert.timestamp,
          severity: 'warning',
          message: newAlert.message,
        };
        setActiveAlerts(prev => [toastItem, ...prev].slice(0, 4));
      }
    };

    const handleContainerAlertCleared = () => {
      setContainerAlerts(getStoredContainerAlerts());
    };

    window.addEventListener('vpsnsa-container-alert', handleContainerAlert);
    window.addEventListener('vpsnsa-container-alert-cleared', handleContainerAlertCleared);

    return () => {
      window.removeEventListener('vpsnsa-container-alert', handleContainerAlert);
      window.removeEventListener('vpsnsa-container-alert-cleared', handleContainerAlertCleared);
    };
  }, [alertConfig.enabled, alertConfig.soundEnabled]);

  if (!telemetry) {
    return (
      <div className="flex items-center justify-center p-16 text-slate-400 font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-3 text-cyan-400" />
        Sincronizando telemetria de hardware dos clusters VPSNsA em tempo real...
      </div>
    );
  }

  const { cpu, memory, storage, network, system } = telemetry;
  const isCpuInAlert = cpu.overallLoadPercent >= alertConfig.cpuThreshold;
  const isRamInAlert = memory.usagePercent >= alertConfig.ramThreshold;
  const activeSpike = getSimulatedSpikeState();

  // Handlers for alert dismissal and controls
  const handleDismissAlert = (id: string) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleToggleSound = () => {
    setAlertConfig(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleSetThreshold = (val: number) => {
    setAlertConfig(prev => ({
      ...prev,
      cpuThreshold: val,
      ramThreshold: val,
    }));
  };

  const handleSimulateSpike = (metric: 'cpu' | 'ram' | 'both') => {
    setSimulatedTelemetrySpike(metric);
    onRefresh();
  };

  const handleNormalize = () => {
    setSimulatedTelemetrySpike('clear');
    onRefresh();
  };

  // Download JSON handler: Exporta dados de telemetria e logs de saúde do sistema
  const handleDownloadJSON = () => {
    const exportPayload = {
      exportMetadata: {
        platform: 'VPS NsA Hyperscale Cluster Enterprise',
        reportType: 'System Health Logs & Telemetry Data Export',
        exportedAt: new Date().toISOString(),
        totalSamplesRecorded: historySnapshots.length,
        datacenter: system.datacenterLocation,
        tierCertification: 'Tier IV Gold Certified (SP1 GRU)',
        securityStatus: system.securityStatus,
        argon2idActive: true,
        uptimePercentage: system.uptimePercentage,
        alertSystemConfig: alertConfig,
        activeAlertsCount: activeAlerts.length,
        alertLogsCount: alertHistory.length,
        containerAlertsCount: containerAlerts.length,
      },
      systemHealthSummary: {
        status: isCpuInAlert || isRamInAlert ? 'WARNING_THRESHOLD_EXCEEDED' : 'HEALTHY_NOMINAL',
        uptimeDays: system.uptimeDays,
        uptimeSLA: system.uptimePercentage,
        totalHostedSites: system.totalHostedSites,
        activeNodes: system.activeNodes,
        cpuHealth: {
          loadPercent: cpu.overallLoadPercent,
          status: isCpuInAlert ? 'ALERT_EXCEEDED' : 'NOMINAL',
          temperatureCelsius: cpu.temperatureCelsius,
          clockSpeedGHz: cpu.clockSpeedGHz,
          totalCores: cpu.totalCores,
          totalThreads: cpu.totalThreads,
          activeModel: cpu.activeModel,
          loadBreakdown: cpu.loadBreakdown,
        },
        memoryHealth: {
          usagePercent: memory.usagePercent,
          status: isRamInAlert ? 'ALERT_EXCEEDED' : 'NOMINAL',
          totalGB: memory.totalGB,
          usedGB: memory.usedGB,
          freeGB: memory.freeGB,
          cachedGB: memory.cachedGB,
          memoryType: memory.type,
        },
        storageHealth: {
          totalTB: storage.totalTB,
          usedTB: storage.usedTB,
          freeTB: parseFloat(Math.max(0, storage.totalTB - storage.usedTB).toFixed(1)),
          usagePercent: parseFloat(((storage.usedTB / storage.totalTB) * 100).toFixed(1)),
          currentIops: storage.currentIops,
          readThroughputMBs: storage.readThroughputMBs,
          writeThroughputMBs: storage.writeThroughputMBs,
          storageType: storage.type,
        },
        networkHealth: {
          throughputInGbps: network.throughputInGbps,
          throughputOutGbps: network.throughputOutGbps,
          packetPerSecond: network.packetPerSecond,
          globalLatencyMs: network.globalLatencyMs,
          ddosMitigationStatus: system.networkDDoSProtection,
        },
      },
      currentTelemetrySnapshot: telemetry,
      containerThresholdAlerts: containerAlerts,
      historicalAlertLogs: alertHistory,
      timeSeriesTelemetryHistory: historySnapshots,
      systemHealthAuditLogs: [
        {
          timestamp: new Date().toISOString(),
          subsystem: 'KERNEL_SECURITY',
          level: 'INFO',
          message: 'Argon2id cryptographic enclave active with Zero-Trust enforcement.'
        },
        {
          timestamp: new Date(Date.now() - 60000).toISOString(),
          subsystem: 'HARDWARE_DIAGNOSTICS',
          level: 'INFO',
          message: `AMD EPYC Bergamo 128C operating at ${cpu.clockSpeedGHz}GHz, temperature ${cpu.temperatureCelsius}°C nominal.`
        },
        {
          timestamp: new Date(Date.now() - 120000).toISOString(),
          subsystem: 'STORAGE_NVME',
          level: 'INFO',
          message: `NVMe Gen5 Enterprise array reporting ${(storage.currentIops / 1000000).toFixed(2)}M IOPS with 0 error sectors.`
        },
        {
          timestamp: new Date(Date.now() - 180000).toISOString(),
          subsystem: 'NETWORK_BACKBONE',
          level: 'INFO',
          message: `Anycast BGP multi-homing uplink synchronized at ${network.throughputInGbps} Gbps throughput.`
        }
      ]
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.href = url;
    link.download = `vpsnsa-system-health-telemetry-${timestampStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotification(`Logs de saúde e telemetria JSON baixados com sucesso: vpsnsa-system-health-telemetry-${timestampStr}.json`);
    setTimeout(() => setDownloadNotification(null), 4000);
  };

  // Download CSV handler
  const handleDownloadCSV = () => {
    const headers = [
      'Timestamp',
      'Hostname',
      'OS',
      'Datacenter',
      'UptimeDays',
      'UptimeSLA',
      'ActiveNodes',
      'TotalSitesHosted',
      'CPULoadPercent',
      'CPUAlertStatus',
      'CPUClockSpeedGHz',
      'CPUTempCelsius',
      'TotalCores',
      'TotalThreads',
      'RAMTotalGB',
      'RAMUsedGB',
      'RAMFreeGB',
      'RAMCachedGB',
      'RAMUsagePercent',
      'RAMAlertStatus',
      'NVMeTotalTB',
      'NVMeUsedTB',
      'NVMeIOPS',
      'ReadThroughputMBs',
      'WriteThroughputMBs',
      'NetworkInGbps',
      'NetworkOutGbps',
      'PacketPerSec',
      'LatencySaoPauloB3',
      'LatencyMiami',
      'LatencyAshburn',
      'LatencyFrankfurt',
      'LatencyTokyo',
      'SecurityStatus',
    ];

    const rows = (historySnapshots.length > 0 ? historySnapshots : [telemetry]).map(s => {
      const cpuAlert = s.cpu.overallLoadPercent >= alertConfig.cpuThreshold ? 'CRITICAL_ALERT' : 'NOMINAL';
      const ramAlert = s.memory.usagePercent >= alertConfig.ramThreshold ? 'CRITICAL_ALERT' : 'NOMINAL';

      return [
        `"${s.timestamp}"`,
        `"${s.system.hostname}"`,
        `"${s.system.os.replace(/"/g, '""')}"`,
        `"${s.system.datacenterLocation}"`,
        s.system.uptimeDays,
        `"${s.system.uptimePercentage}"`,
        s.system.activeNodes,
        `"${s.system.totalHostedSites}"`,
        s.cpu.overallLoadPercent,
        `"${cpuAlert}"`,
        s.cpu.clockSpeedGHz,
        s.cpu.temperatureCelsius,
        s.cpu.totalCores,
        s.cpu.totalThreads,
        s.memory.totalGB,
        s.memory.usedGB,
        s.memory.freeGB,
        s.memory.cachedGB,
        s.memory.usagePercent,
        `"${ramAlert}"`,
        s.storage.totalTB,
        s.storage.usedTB,
        s.storage.currentIops,
        s.storage.readThroughputMBs,
        s.storage.writeThroughputMBs,
        s.network.throughputInGbps,
        s.network.throughputOutGbps,
        `"${s.network.packetPerSecond}"`,
        `"${s.network.globalLatencyMs['São Paulo (B3 / GRU)'] || ''}"`,
        `"${s.network.globalLatencyMs['Miami (MIA)'] || ''}"`,
        `"${s.network.globalLatencyMs['Ashburn (IAD)'] || ''}"`,
        `"${s.network.globalLatencyMs['Frankfurt (FRA)'] || ''}"`,
        `"${s.network.globalLatencyMs['Tóquio (NRT)'] || ''}"`,
        `"${s.system.securityStatus}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.href = url;
    link.download = `vpsnsa-telemetry-metrics-${timestampStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotification(`Dados CSV baixados com sucesso (${rows.length} amostras): vpsnsa-telemetry-metrics-${timestampStr}.csv`);
    setTimeout(() => setDownloadNotification(null), 4000);
  };

  // MODO AUTO-FIT: CSS Grid inteligente que preenche 100% da viewport sem rolagem
  if (isAutoFit) {
    return (
      <div className="w-full h-full max-h-full grid grid-rows-[auto_1fr_auto] gap-2 font-sans select-none overflow-hidden">
        {/* Toast Notification Stack for Critical Threshold Alerts */}
        <TelemetryAlertToast
          alerts={activeAlerts}
          onDismiss={handleDismissAlert}
          onNavigateTab={onNavigateTab}
          onNormalize={handleNormalize}
          soundEnabled={alertConfig.soundEnabled}
          onToggleSound={handleToggleSound}
        />

        {/* Notificação Compacta de Limiar em Containers (Auto-Fit) */}
        {containerAlerts.length > 0 && (
          <div className="bg-rose-950/70 border border-rose-500/60 rounded-lg px-3 py-1.5 flex items-center justify-between gap-2 text-xs font-mono shrink-0 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping shrink-0" />
              <span className="text-rose-300 font-bold uppercase tracking-wider text-[11px] shrink-0 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Limite Container ({containerAlerts.length}):
              </span>
              <span className="text-white text-[11px] truncate">
                {containerAlerts[0].containerName} ({containerAlerts[0].resource === 'cpu' ? 'CPU' : 'RAM'}: {containerAlerts[0].currentValue}% &gt; {containerAlerts[0].thresholdValue}%)
              </span>
              {containerAlerts.length > 1 && (
                <span className="text-slate-400 text-[10px] hidden sm:inline">
                  (+{containerAlerts.length - 1} outro{containerAlerts.length > 2 ? 's' : ''})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('containers')}
                  className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300 hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Ver Containers →
                </button>
              )}
              <button
                onClick={() => {
                  clearAllContainerAlerts();
                  setContainerAlerts([]);
                }}
                className="text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-800"
              >
                Limpar
              </button>
            </div>
          </div>
        )}

        {/* LINHA 1: Header Strip Compacto do Cluster */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between gap-3 shadow-md shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-black flex items-center justify-center text-xs shrink-0 border border-cyan-300/40 shadow-xs">
              NsA
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white tracking-tight truncate">
                  VPS NsA Hyperscale Cluster Enterprise
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shrink-0">
                  Tier IV · SP1 GRU
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold shrink-0 hidden sm:inline">
                  Argon2id Active
                </span>
              </div>
            </div>
          </div>

          {/* Métricas Principais Inline */}
          <div className="hidden md:flex items-center gap-2 xl:gap-3 text-xs font-mono shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">Sites:</span>
              <span className="text-white font-bold">{system.totalHostedSites}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">Rede:</span>
              <span className="text-cyan-300 font-bold">{network.throughputInGbps} Gbps</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">IOPS:</span>
              <span className="text-sky-400 font-bold">{(storage.currentIops / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">Uptime:</span>
              <span className="text-emerald-400 font-bold">{system.uptimePercentage}</span>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleDownloadJSON}
              title="Exportar logs de saúde e dados de telemetria em formato JSON"
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <FileJson className="w-3 h-3 text-cyan-400" />
              <span>JSON</span>
            </button>
            <button
              onClick={handleDownloadCSV}
              title="Exportar CSV de Telemetria"
              className="hidden lg:flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3 h-3 text-cyan-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={onRefresh}
              title="Atualizar Telemetria"
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* LINHA 2: CSS Grid Primário (1fr, min-h-0, overflow-hidden) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 min-h-0 overflow-hidden items-stretch">
          {/* Coluna Esquerda: Cotações Comerciais Reais (AwesomeAPI) */}
          <div className="lg:col-span-7 h-full min-h-0 overflow-hidden flex flex-col">
            {realMarketData && (
              <MarketQuotesModule
                marketData={realMarketData}
                loading={loadingMarket}
                lastUpdate={lastMarketUpdate}
                onRefresh={onSyncMarket}
              />
            )}
          </div>

          {/* Coluna Direita: Gemini 4 Carbon Autonomous Defense */}
          <div className="lg:col-span-5 h-full min-h-0 overflow-hidden flex flex-col">
            <CarbonShieldModule />
          </div>
        </div>

        {/* LINHA 3: Grid Inferior de Gauges (auto, shrink-0, compact) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0">
          {/* CPU Gauge */}
          <div className={`rounded-lg border p-2 space-y-1 ${
            isCpuInAlert
              ? 'border-rose-500/80 bg-rose-950/20'
              : 'border-slate-800 bg-slate-900/60'
          }`}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU Global
              </span>
              <span className="font-mono text-cyan-400 text-[10px]">{cpu.clockSpeedGHz} GHz</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-white">{cpu.overallLoadPercent}%</span>
              <span className="text-[10px] font-mono text-slate-400">{cpu.temperatureCelsius}°C</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-sky-400 h-1.5 transition-all duration-300"
                style={{ width: `${Math.min(100, cpu.overallLoadPercent)}%` }}
              />
            </div>
          </div>

          {/* RAM Gauge */}
          <div className={`rounded-lg border p-2 space-y-1 ${
            isRamInAlert
              ? 'border-rose-500/80 bg-rose-950/20'
              : 'border-slate-800 bg-slate-900/60'
          }`}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> RAM DDR5 ECC
              </span>
              <span className="font-mono text-indigo-400 text-[10px]">Octa-Channel</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-white">{memory.usedGB} <span className="text-[10px] font-normal text-slate-400">/ {memory.totalGB} GB</span></span>
              <span className="text-[10px] font-mono text-slate-400">{memory.usagePercent}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-sky-400 h-1.5 transition-all duration-300"
                style={{ width: `${Math.min(100, memory.usagePercent)}%` }}
              />
            </div>
          </div>

          {/* NVMe Gauge */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> NVMe Gen5
              </span>
              <span className="font-mono text-emerald-400 text-[10px]">PCIe x16 Direct</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-white">{storage.usedTB} <span className="text-[10px] font-normal text-slate-400">/ {storage.totalTB} TB</span></span>
              <span className="text-[10px] font-mono text-slate-400">{Math.round((storage.usedTB / storage.totalTB) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 transition-all duration-300"
                style={{ width: `${(storage.usedTB / storage.totalTB) * 100}%` }}
              />
            </div>
          </div>

          {/* Network Anycast Gauge */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <Network className="w-3.5 h-3.5 text-cyan-400" /> Rede Anycast
              </span>
              <span className="font-mono text-cyan-400 text-[10px]">1.8ms B3 SP</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-white">{network.throughputOutGbps} <span className="text-[10px] font-normal text-slate-400">Gbps Out</span></span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">100 Gbps Port</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-1.5 transition-all duration-300"
                style={{ width: '48%' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification Stack for Critical Threshold Alerts */}
      <TelemetryAlertToast
        alerts={activeAlerts}
        onDismiss={handleDismissAlert}
        onNavigateTab={onNavigateTab}
        onNormalize={handleNormalize}
        soundEnabled={alertConfig.soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Download Feedback Notification */}
      {downloadNotification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadNotification}</span>
          </div>
          <button
            onClick={() => setDownloadNotification(null)}
            className="text-emerald-400 hover:text-white text-xs px-2 py-0.5 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* Visual Notification Banner de Limiares Excedidos de Containers */}
      {containerAlerts.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-500/60 rounded-xl p-4 backdrop-blur-md shadow-xl font-mono text-xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
              <span className="uppercase tracking-wider text-sm">
                Notificação Visual de Limiar de Containers ({containerAlerts.length} {containerAlerts.length === 1 ? 'Alerta Ativo' : 'Alertas Ativos'})
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('containers')}
                  className="px-3 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Painel de Containers</span>
                  <span>→</span>
                </button>
              )}
              <button
                onClick={() => {
                  clearAllContainerAlerts();
                  setContainerAlerts([]);
                }}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800"
              >
                Limpar Todos os Alertas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {containerAlerts.slice(0, 6).map(alert => (
              <div key={alert.id} className="bg-slate-950/90 border border-rose-500/40 hover:border-rose-400/80 rounded-lg p-3 flex items-start justify-between gap-2 shadow-xs transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping shrink-0" />
                    <strong className="text-white text-xs truncate">{alert.containerName}</strong>
                  </div>
                  <p className="text-[11px] text-rose-300 font-bold mt-1">
                    {alert.resource === 'cpu' ? 'Limite de CPU Superado' : 'Limite de RAM Superado'}: {alert.currentValue}% &gt; {alert.thresholdValue}%
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{alert.message}</p>
                  <span className="text-[9px] text-slate-500 mt-1 block">{new Date(alert.timestamp).toLocaleTimeString('pt-BR')}</span>
                </div>
                <button
                  onClick={() => {
                    dismissContainerAlert(alert.id);
                    setContainerAlerts(prev => prev.filter(a => a.id !== alert.id));
                  }}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs"
                  title="Descartar notificação"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Datacenter Banner Card - Alinhado com as Cores da Foto (Neon Ciano e Roxo) */}
      <div className="relative rounded-xl border border-cyan-500/50 bg-[#0a0e1a] overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.2)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[160px]">
          {/* Left Text / Metrics */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between space-y-3 z-10 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>NÓ CENTRAL DE PROCESSAMENTO · ARGON2ID SECURITY ACTIVE</span>
                </div>
                <button
                  onClick={handleDownloadJSON}
                  title="Exportar logs de saúde e dados de telemetria em formato JSON para análise local"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-white text-xs font-mono font-bold transition-all shadow-md cursor-pointer hover:border-cyan-400"
                >
                  <FileJson className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Exportar Saúde & Telemetria (JSON)</span>
                </button>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                VPS NsA Hyperscale Cluster Enterprise
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-500/60 font-mono font-bold shadow-[0_0_10px_rgba(192,132,252,0.4)]">
                  Tier IV
                </span>
              </h1>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-xl">
                Infraestrutura com suporte para hospedar trilhões de sites e micro-containers com latência de 1.8ms em São Paulo (B3), equipada com AMD EPYC Bergamo 128 Cores, NVIDIA Grace Hopper GH200 e Intel Xeon Platinum.
              </p>
            </div>

            {/* Quick stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2.5 border-t border-cyan-500/30">
              <div>
                <p className="text-[10px] text-slate-400">Sites Hospedados</p>
                <p className="text-sm sm:text-base font-bold text-white font-mono tabular-nums">{system.totalHostedSites}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Throughput de Rede</p>
                <p className="text-sm sm:text-base font-bold text-cyan-300 font-mono tabular-nums">{network.throughputInGbps} Gbps</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">IOPS em Disco</p>
                <p className="text-sm sm:text-base font-bold text-sky-400 font-mono tabular-nums">{(storage.currentIops / 1000000).toFixed(2)}M IOPS</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Uptime Global</p>
                <p className="text-sm sm:text-base font-bold text-emerald-400 font-mono tabular-nums">{system.uptimePercentage}</p>
              </div>
            </div>
          </div>

          {/* Right Image - Exata Foto do Corredor Neon Enviada pelo Usuário */}
          <div className="lg:col-span-5 relative min-h-[160px] lg:min-h-full overflow-hidden bg-slate-950">
            <img
              src="/src/assets/images/vpsnsa_datacenter_corridor_neon.jpg"
              alt="VPS NsA Datacenter Rack Infrastructure"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent lg:bg-gradient-to-l" />
            
            {/* Tag Flutuante do Corredor Neon */}
            <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-cyan-400 text-[10px] font-mono text-cyan-300 font-bold shadow-[0_0_12px_rgba(0,240,255,0.7)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              Corredor Neon Oficial · SP1 GRU
            </div>
          </div>
        </div>
      </div>

      {/* Grade Panorâmica Alinhada: Cotações Comerciais (AwesomeAPI) + Defesa Cibernética Autônoma (Carbon Shield) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 items-stretch">
        {realMarketData && (
          <MarketQuotesModule
            marketData={realMarketData}
            loading={loadingMarket}
            lastUpdate={lastMarketUpdate}
            onRefresh={onSyncMarket}
          />
        )}
        <CarbonShieldModule />
      </div>

      {/* Threshold-Based Alert System Control Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
              isCpuInAlert || isRamInAlert
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
            }`}>
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Sistema de Alertas de Sobrecarga por Limiar
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isCpuInAlert || isRamInAlert
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {isCpuInAlert || isRamInAlert ? 'ALERTA ATIVO (>90%)' : 'MONITORAMENTO NOMINAL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Dispara notificações toast instantâneas e aviso sonoro quando o uso de CPU ou RAM ultrapassa o limite de <strong className="text-slate-200 font-mono">{alertConfig.cpuThreshold}%</strong>.
              </p>
            </div>
          </div>

          {/* Quick Threshold & Simulation Controls */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {/* Threshold Selector Buttons */}
            <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5">
              {[80, 85, 90, 95].map((val) => (
                <button
                  key={val}
                  onClick={() => handleSetThreshold(val)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    alertConfig.cpuThreshold === val
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Definir limiar de alerta em ${val}%`}
                >
                  {val}% {val === 90 ? '(Padrão)' : ''}
                </button>
              ))}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                alertConfig.soundEnabled
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title={alertConfig.soundEnabled ? 'Aviso sonoro ativado' : 'Aviso sonoro desativado'}
            >
              {alertConfig.soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Som Ativo</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mudo</span>
                </>
              )}
            </button>

            {/* Simulation Triggers to Test the Toast Immediately */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <button
                onClick={() => handleSimulateSpike('cpu')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  activeSpike.cpu
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
                title="Simular pico de CPU em 94% para disparar notificação toast"
              >
                <Flame className="w-3 h-3 text-rose-400" />
                <span>Testar CPU &gt;90%</span>
              </button>

              <button
                onClick={() => handleSimulateSpike('ram')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  activeSpike.ram
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
                title="Simular pico de RAM em 93% para disparar notificação toast"
              >
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Testar RAM &gt;90%</span>
              </button>

              {(activeSpike.cpu || activeSpike.ram) && (
                <button
                  onClick={handleNormalize}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-medium transition-all"
                  title="Restaurar métricas normais"
                >
                  <RotateCcw className="w-3 h-3 text-emerald-400" />
                  <span>Normalizar</span>
                </button>
              )}

              {/* History Button */}
              {alertHistory.length > 0 && (
                <button
                  onClick={() => setShowHistoryModal(!showHistoryModal)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
                  title="Ver histórico de alertas disparados"
                >
                  <History className="w-3 h-3 text-cyan-400" />
                  <span>Logs ({alertHistory.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Alert History Drawer (When open) */}
        {showHistoryModal && alertHistory.length > 0 && (
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                Histórico Recente de Alertas de Sobrecarga ({alertHistory.length} registros)
              </span>
              <button
                onClick={() => setAlertHistory([])}
                className="text-slate-400 hover:text-rose-400 text-[11px] underline"
              >
                Limpar Histórico
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1.5 font-mono text-xs pr-1">
              {alertHistory.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-slate-800/80 text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-bold">[{h.metric.toUpperCase()}]</span>
                    <span className="text-slate-300">{h.message}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 shrink-0">
                    <span className="font-bold text-rose-400">{h.currentValue}%</span>
                    <span>{new Date(h.timestamp).toLocaleTimeString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Telemetry Actions & Offline Download Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Download className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Exportação de Telemetria para Análise Offline
            </h3>
            <p className="text-[11px] text-slate-400">
              Baixe séries temporais completas com métricas de CPU, RAM, NVMe Gen5 e status de alertas de limiar.
            </p>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[10px] text-slate-500 mr-1 hidden md:inline">
            {historySnapshots.length} amostras
          </span>

          <button
            onClick={handleDownloadJSON}
            title="Baixar logs de integridade do sistema e snapshot completo de telemetria em formato JSON para análise local"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 hover:text-white font-bold transition-all shadow-sm cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exportar JSON (Logs & Telemetria)</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            title="Baixar histórico em planilha CSV compatível com Excel, Python e Pandas"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-950" />
            <span>Baixar CSV</span>
          </button>

          <button
            onClick={onRefresh}
            title="Forçar atualização da telemetria"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 4 Telemetry Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gauge 1: CPU Global */}
        <div className={`rounded-xl border p-4 space-y-3 transition-all duration-300 ${
          isCpuInAlert
            ? 'border-rose-500/80 bg-rose-950/20 shadow-[0_0_25px_rgba(244,63,94,0.18)] ring-1 ring-rose-500/40'
            : 'border-slate-800 bg-slate-900/50'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <Cpu className={`w-4 h-4 ${isCpuInAlert ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
              Carga da CPU Global
            </span>
            <div className="flex items-center gap-2">
              {isCpuInAlert && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  ALERTA &gt;{alertConfig.cpuThreshold}%
                </span>
              )}
              <span className="font-mono text-cyan-400">{cpu.clockSpeedGHz} GHz</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold font-mono tabular-nums ${
              isCpuInAlert ? 'text-rose-400' : 'text-white'
            }`}>
              {cpu.overallLoadPercent}%
            </span>
            <span className={`text-xs font-mono ${isCpuInAlert ? 'text-rose-300 font-bold' : 'text-slate-400'}`}>
              {cpu.temperatureCelsius}°C Temp
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-2 transition-all duration-500 ${
                isCpuInAlert
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 to-sky-400'
              }`}
              style={{ width: `${Math.min(100, cpu.overallLoadPercent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate">{cpu.totalCores} Cores · {cpu.totalThreads} Threads</span>
            {isCpuInAlert && (
              <button
                onClick={() => onNavigateTab('orchestration')}
                className="text-rose-400 hover:text-rose-300 font-semibold underline shrink-0"
              >
                Escalar Pods
              </button>
            )}
          </div>
        </div>

        {/* Gauge 2: RAM DDR5 */}
        <div className={`rounded-xl border p-4 space-y-3 transition-all duration-300 ${
          isRamInAlert
            ? 'border-rose-500/80 bg-rose-950/20 shadow-[0_0_25px_rgba(244,63,94,0.18)] ring-1 ring-rose-500/40'
            : 'border-slate-800 bg-slate-900/50'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <Layers className={`w-4 h-4 ${isRamInAlert ? 'text-rose-400 animate-pulse' : 'text-indigo-400'}`} />
              Memória DDR5 & HBM3
            </span>
            <div className="flex items-center gap-2">
              {isRamInAlert && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  ALERTA &gt;{alertConfig.ramThreshold}%
                </span>
              )}
              <span className="font-mono text-indigo-400">Octa-Channel</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold font-mono tabular-nums ${
              isRamInAlert ? 'text-rose-400' : 'text-white'
            }`}>
              {memory.usedGB} <span className="text-sm font-normal text-slate-400">/ {memory.totalGB} GB</span>
            </span>
            <span className={`text-xs font-mono ${isRamInAlert ? 'text-rose-300 font-bold' : 'text-slate-400'}`}>
              {memory.usagePercent}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-2 transition-all duration-500 ${
                isRamInAlert
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 animate-pulse'
                  : 'bg-gradient-to-r from-indigo-500 to-sky-400'
              }`}
              style={{ width: `${Math.min(100, memory.usagePercent)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {memory.freeGB} GB Livres · {memory.cachedGB} GB Buffer de Cache
          </p>
        </div>

        {/* Gauge 3: NVMe Gen5 Disks */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <HardDrive className="w-4 h-4 text-emerald-400" /> Discos NVMe Gen5
            </span>
            <span className="font-mono text-emerald-400">Direct PCIe x16</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {storage.usedTB} <span className="text-sm font-normal text-slate-400">/ {storage.totalTB} TB</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {Math.round((storage.usedTB / storage.totalTB) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 transition-all duration-500"
              style={{ width: `${(storage.usedTB / storage.totalTB) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            Leitura: {storage.readThroughputMBs} MB/s · Grav: {storage.writeThroughputMBs} MB/s
          </p>
        </div>

        {/* Gauge 4: Anycast Network */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <Network className="w-4 h-4 text-cyan-400" /> Rede Anycast Global
            </span>
            <span className="font-mono text-cyan-400">3.2 Tbps DDoS</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {network.throughputOutGbps} <span className="text-sm font-normal text-slate-400">Gbps Out</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {network.packetPerSecond}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-2 transition-all duration-500"
              style={{ width: '48%' }}
            />
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            Inbound: {network.throughputInGbps} Gbps · Tráfego Ilimitado
          </p>
        </div>
      </div>

      {/* New Resource Forecasting Section: 24h Container Capacity & Shortage Predictor */}
      <ContainerResourceForecastingSection
        containers={containers}
        onNavigateTab={onNavigateTab}
      />

      {/* 7-Day Predicted Resource Usage Forecast using Recharts */}
      <ResourceForecastChart
        telemetry={telemetry}
        cpuThreshold={alertConfig.cpuThreshold}
        ramThreshold={alertConfig.ramThreshold}
      />

      {/* System Forecast: Estimativa Preditiva de Esgotamento de Recursos (Runway / Time-to-Capacity) */}
      <SystemForecastWidget
        telemetry={telemetry}
        onNavigateTab={onNavigateTab}
        defaultCapacityThreshold={alertConfig.ramThreshold || 90}
      />

      {/* Global Latency Heatmap D3.js SVG Mapping */}
      <GlobalLatencyHeatmapWidget
        onNavigateTelemetry={() => {}}
      />

      {/* Processors Load Breakdown & Global Latency Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: CPU Sockets Breakdown */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Distribuição de Carga por Processador
              </h2>
              <p className="text-xs text-slate-400">
                Clusters com suporte a bilhões de requisições concorrentes
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('cpus')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Comparar CPUs →
            </button>
          </div>

          <div className="space-y-3">
            {cpu.loadBreakdown.map((sock, i) => {
              const isSocketAlert = sock.usage >= alertConfig.cpuThreshold;
              return (
                <div
                  key={i}
                  className={`p-3 rounded-lg border space-y-2 transition-colors ${
                    isSocketAlert
                      ? 'bg-rose-950/30 border-rose-500/50'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{sock.socket}</span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className={isSocketAlert ? 'text-rose-300' : 'text-slate-400'}>
                        {sock.temp}°C
                      </span>
                      <span className={`font-bold tabular-nums ${isSocketAlert ? 'text-rose-400' : 'text-white'}`}>
                        {sock.usage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 transition-all duration-300 ${
                        isSocketAlert ? 'bg-rose-500' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${Math.min(100, sock.usage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Global Edge Latencies & Server Details */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              Latência de Rede Anycast
            </h2>
            <p className="text-xs text-slate-400">
              Rotas diretas para hubs financeiros e de nuvem
            </p>
          </div>

          <div className="space-y-2.5">
            {Object.entries(network.globalLatencyMs).map(([location, latency], idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-200">{location}</span>
                </div>
                <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                  {latency}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Kernel:</span>
              <span className="font-mono text-slate-300 truncate max-w-[200px]">{system.os}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Proteção Anti-DDoS:</span>
              <span className="font-mono text-emerald-400">{system.networkDDoSProtection}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Segurança de Senha:</span>
              <span className="font-mono text-cyan-400">{system.securityStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
