import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  Cpu, 
  Layers, 
  X, 
  CheckCircle2, 
  Trash2, 
  Volume2, 
  VolumeX, 
  ArrowUpRight, 
  Sliders, 
  Flame, 
  ShieldCheck, 
  Clock, 
  Filter, 
  Check,
  Server,
  Zap,
  RotateCcw
} from 'lucide-react';
import { ContainerThresholdAlert } from '../types';
import { 
  getStoredContainerAlerts, 
  dismissContainerAlert, 
  clearAllContainerAlerts,
  dispatchContainerAlert 
} from '../services/containerThresholdService';

export interface NotificationCenterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const NotificationCenterSidebar: React.FC<NotificationCenterSidebarProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  soundEnabled = true,
  onToggleSound,
}) => {
  const [alerts, setAlerts] = useState<ContainerThresholdAlert[]>(() => getStoredContainerAlerts());
  const [activeToasts, setActiveToasts] = useState<ContainerThresholdAlert[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'memory' | 'cpu'>('all');
  const [soundActive, setSoundActive] = useState<boolean>(soundEnabled);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Sintetizador Web Audio API para alerta sonoro discreto
  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Fallback silencioso caso contexto de áudio esteja bloqueado
    }
  };

  // Listener global de alertas de limiar de container
  useEffect(() => {
    const handleAlert = (e: Event) => {
      const customEvent = e as CustomEvent<ContainerThresholdAlert>;
      const newAlert = customEvent.detail;
      if (!newAlert) return;

      // Atualiza lista principal
      setAlerts(prev => {
        const filtered = prev.filter(a => a.id !== newAlert.id);
        return [newAlert, ...filtered].slice(0, 30);
      });

      // Dispara Toast Flutuante Visual
      setActiveToasts(prev => {
        const filtered = prev.filter(t => t.containerId !== newAlert.containerId || t.resource !== newAlert.resource);
        return [newAlert, ...filtered].slice(0, 4);
      });

      // Toca aviso sonoro se ativado
      if (soundActive) {
        playAlertChime();
      }

      // Auto-dispensa do toast após 6 segundos
      setTimeout(() => {
        setActiveToasts(prev => prev.filter(t => t.id !== newAlert.id));
      }, 6000);
    };

    const handleCleared = () => {
      setAlerts(getStoredContainerAlerts());
    };

    window.addEventListener('vpsnsa-container-alert', handleAlert);
    window.addEventListener('vpsnsa-container-alert-cleared', handleCleared);

    return () => {
      window.removeEventListener('vpsnsa-container-alert', handleAlert);
      window.removeEventListener('vpsnsa-container-alert-cleared', handleCleared);
    };
  }, [soundActive]);

  // Fechar sidebar ao pressionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Descartar alerta individual
  const handleDismiss = (id: string) => {
    dismissContainerAlert(id);
    setAlerts(prev => prev.filter(a => a.id !== id));
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  // Limpar todos os alertas
  const handleClearAll = () => {
    clearAllContainerAlerts();
    setAlerts([]);
    setActiveToasts([]);
  };

  // Alternar som
  const handleToggleSoundClick = () => {
    const next = !soundActive;
    setSoundActive(next);
    if (onToggleSound) onToggleSound();
  };

  // Simular disparo de alerta para teste
  const handleSimulateAlert = (resource: 'memory' | 'cpu') => {
    const sampleContainers = [
      { id: 'ct-b3-fintech', name: 'b3-fintech-gateway-01' },
      { id: 'ct-auth-sso', name: 'argon2id-auth-service' },
      { id: 'ct-order-matching', name: 'micro-order-matching-03' },
      { id: 'ct-redis-cluster', name: 'redis-epyc-inmemory-cache' },
    ];
    const picked = sampleContainers[Math.floor(Math.random() * sampleContainers.length)];
    const threshold = resource === 'memory' ? 80 : 75;
    const value = resource === 'memory' ? parseFloat((82 + Math.random() * 12).toFixed(1)) : parseFloat((78 + Math.random() * 14).toFixed(1));

    const newAlert: ContainerThresholdAlert = {
      id: `container-${picked.id}-${resource}-${Date.now()}`,
      containerId: picked.id,
      containerName: picked.name,
      resource,
      currentValue: value,
      thresholdValue: threshold,
      timestamp: new Date().toISOString(),
      message: `Container "${picked.name}" ultrapassou o limiar de ${resource === 'memory' ? 'Memória (RAM)' : 'CPU'}: ${value}% > ${threshold}%.`,
    };

    dispatchContainerAlert(newAlert);
  };

  // Filtros de alertas
  const filteredAlerts = alerts.filter(a => {
    if (activeFilter === 'memory') return a.resource === 'memory';
    if (activeFilter === 'cpu') return a.resource === 'cpu';
    return true;
  });

  const memoryAlertCount = alerts.filter(a => a.resource === 'memory').length;
  const cpuAlertCount = alerts.filter(a => a.resource === 'cpu').length;

  return (
    <>
      {/* ========================================================
          1. PILHA DE VISUAL TOASTS FLUTUANTES (GLOBALMENTE VISÍVEIS)
         ======================================================== */}
      {activeToasts.length > 0 && (
        <div 
          aria-live="assertive"
          className="fixed top-20 right-4 z-[9999] max-w-sm w-full flex flex-col gap-2.5 pointer-events-none"
        >
          {activeToasts.map((toast) => {
            const isCpu = toast.resource === 'cpu';
            return (
              <div
                key={toast.id}
                role="alert"
                className="pointer-events-auto bg-slate-950/95 border-2 border-rose-500/80 rounded-xl p-3.5 shadow-[0_0_25px_rgba(244,63,94,0.45)] backdrop-blur-xl animate-in slide-in-from-top-3 fade-in duration-300 font-mono text-xs space-y-2 card-cyber-aura"
              >
                {/* Header do Toast */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                      {isCpu ? <Cpu className="w-4 h-4 animate-pulse" /> : <Layers className="w-4 h-4 animate-pulse" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                        <strong className="text-white text-xs truncate max-w-[190px]">
                          {toast.containerName}
                        </strong>
                      </div>
                      <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
                        Limiar de {isCpu ? 'CPU' : 'RAM'} Excedido
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveToasts(prev => prev.filter(t => t.id !== toast.id))}
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Fechar notificação"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Métricas do Limiar Excedido */}
                <div className="bg-rose-950/40 rounded-lg p-2 border border-rose-900/50 flex items-center justify-between text-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Carga Atual vs Limite</span>
                    <span className="font-black text-rose-300 text-sm">
                      {toast.currentValue}% &gt; {toast.thresholdValue}%
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-normal">
                    {new Date(toast.timestamp).toLocaleTimeString('pt-BR')}
                  </span>
                </div>

                {/* Ações do Toast */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800 text-[10px]">
                  <button
                    onClick={() => {
                      onNavigateTab('containers');
                      setActiveToasts(prev => prev.filter(t => t.id !== toast.id));
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Ver no Painel</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => {
                      if (!isOpen) onClose(); // Aciona abertura se fornecido
                    }}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Abrir Central
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          2. BACKDROP ESCURO TRANSLÚCIDO QUANDO A SIDEBAR ESTÁ ABERTA
         ======================================================== */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-[9990] bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        />
      )}

      {/* ========================================================
          3. SIDEBAR DA CENTRAL DE NOTIFICAÇÕES (DRAWER LATERAL)
         ======================================================== */}
      <aside
        ref={sidebarRef}
        aria-label="Central de Notificações de Containers"
        className={`fixed top-0 right-0 h-full w-full max-w-md sm:max-w-lg z-[9995] bg-slate-950/98 border-l border-cyan-500/40 shadow-[-10px_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col font-mono text-slate-200 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* CABEÇALHO DA SIDEBAR */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 via-purple-600 to-cyan-500 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BellRing className="w-4 h-4 text-rose-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-tight">
                  Central de Notificações
                </h2>
                {alerts.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                Monitoramento de limiares de memória e CPU por container
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle de Som */}
            <button
              onClick={handleToggleSoundClick}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                soundActive 
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={soundActive ? 'Aviso sonoro ativado' : 'Aviso sonoro em mudo'}
            >
              {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Fechar Sidebar */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Fechar Central (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BARRA DE FILTROS & AÇÕES GLOBAIS */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          {/* Abas de Filtro */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                activeFilter === 'all' 
                  ? 'bg-cyan-600 text-white font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({alerts.length})
            </button>
            <button
              onClick={() => setActiveFilter('memory')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                activeFilter === 'memory' 
                  ? 'bg-cyan-600 text-white font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>RAM ({memoryAlertCount})</span>
            </button>
            <button
              onClick={() => setActiveFilter('cpu')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                activeFilter === 'cpu' 
                  ? 'bg-cyan-600 text-white font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3 h-3" />
              <span>CPU ({cpuAlertCount})</span>
            </button>
          </div>

          {/* Botão de Limpar Todos */}
          {alerts.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-1 rounded bg-rose-950/40 border border-rose-900/50 transition-colors cursor-pointer hover:bg-rose-950/70"
              title="Limpar todos os alertas da central"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpar Todos</span>
            </button>
          )}
        </div>

        {/* LISTAGEM DE ALERTAS (CORPO DA SIDEBAR COM SCROLL) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-500">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <strong className="text-sm text-slate-300 block font-bold">
                  Nenhum Alerta Ativo
                </strong>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Todos os containers estão operando com consumo de CPU e Memória dentro dos limiares nominais estipulados.
                </p>
              </div>

              {/* Botão de Teste no Estado Vazio */}
              <div className="pt-2 flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => handleSimulateAlert('memory')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Testar Alerta de RAM</span>
                </button>
                <button
                  onClick={() => handleSimulateAlert('cpu')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Testar Alerta de CPU</span>
                </button>
              </div>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isCpu = alert.resource === 'cpu';
              const alertDate = new Date(alert.timestamp);

              return (
                <div
                  key={alert.id}
                  className="bg-slate-900/80 border border-rose-500/50 hover:border-rose-400 rounded-xl p-3.5 space-y-2.5 shadow-md backdrop-blur-md transition-all group"
                >
                  {/* Topo do Card de Alerta */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                        {isCpu ? <Cpu className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping shrink-0" />
                          <strong className="text-white text-xs truncate max-w-[210px]">
                            {alert.containerName}
                          </strong>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5 text-slate-500" />
                          {alertDate.toLocaleTimeString('pt-BR')} · {alertDate.toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Descartar alerta"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Informações de Carga Excedida */}
                  <div className="bg-slate-950/90 rounded-lg p-2.5 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">
                        {isCpu ? 'Uso de CPU Registrado' : 'Uso de Memória (RAM)'}
                      </span>
                      <strong className="text-rose-400 text-sm font-black">
                        {alert.currentValue}%
                      </strong>
                      <span className="text-[10px] text-slate-400 ml-1">
                        (Cota: {alert.thresholdValue}%)
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
                        +{parseFloat((alert.currentValue - alert.thresholdValue).toFixed(1))}% Acima
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed truncate">
                    {alert.message}
                  </p>

                  {/* Ações Rápidas do Card */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => {
                        onNavigateTab('containers');
                        onClose();
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Inspecionar Container</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="text-slate-500 hover:text-slate-300 text-[10px] transition-colors cursor-pointer"
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RODAPÉ DA SIDEBAR: SIMULAÇÃO E DIAGNÓSTICO RÁPIDO */}
        <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 shrink-0 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              Testes de Alerta & Simulação de Carga
            </span>
            <button
              onClick={() => onNavigateTab('containers')}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Configurar Limiares →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleSimulateAlert('memory')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Simular RAM &gt; 80%</span>
            </button>

            <button
              onClick={() => handleSimulateAlert('cpu')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 text-rose-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-rose-400" />
              <span>Simular CPU &gt; 75%</span>
            </button>
          </div>
        </div>

      </aside>
    </>
  );
};
