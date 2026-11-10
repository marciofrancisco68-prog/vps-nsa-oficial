import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  PanelLeftClose, 
  PanelLeftOpen, 
  RefreshCw, 
  Maximize2, 
  Minimize2,
  Sparkles,
  Gauge,
  Zap,
  Clock,
  Pause,
  ChevronDown,
  Check,
  Bell,
  Crown
} from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';
import { TickerScrollSpeed } from '../types';
import { InteractiveRoundLogo } from './InteractiveRoundLogo';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: {
    username: string;
    email: string;
    role: string;
  } | null;
  onOpenAuthModal: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onSyncMarket?: () => void;
  isSyncingMarket?: boolean;
  lastMarketUpdate?: string;
  isAutoFit?: boolean;
  onToggleAutoFit?: () => void;
  visualFxMode?: 'cyber-aura' | 'neo-glass' | 'hud-contrast';
  onCycleVisualFx?: () => void;
  tickerSpeed?: TickerScrollSpeed;
  onCycleTickerSpeed?: () => void;
  onSetTickerSpeed?: (speed: TickerScrollSpeed) => void;
  unreadAlertCount?: number;
  onOpenNotificationCenter?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAuthModal,
  sidebarCollapsed,
  onToggleSidebar,
  onSyncMarket,
  isSyncingMarket = false,
  lastMarketUpdate,
  isAutoFit = true,
  onToggleAutoFit,
  visualFxMode = 'cyber-aura',
  onCycleVisualFx,
  tickerSpeed = 'normal',
  onCycleTickerSpeed,
  onSetTickerSpeed,
  unreadAlertCount = 0,
  onOpenNotificationCenter,
}) => {
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState<boolean>(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setIsSpeedMenuOpen(false);
      }
    };
    if (isSpeedMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSpeedMenuOpen]);

  const speedOptions: Array<{
    id: TickerScrollSpeed;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    activeBorder: string;
    badge: string;
  }> = [
    {
      id: 'paused',
      label: 'Paused',
      sublabel: 'Congelar rolagem instantaneamente',
      icon: Pause,
      color: 'text-rose-400',
      activeBorder: 'border-rose-500/60 bg-rose-500/10 text-rose-300',
      badge: '0s / STOP',
    },
    {
      id: 'slow',
      label: 'Slow',
      sublabel: 'Rolagem lenta analítica (64s)',
      icon: Clock,
      color: 'text-indigo-400',
      activeBorder: 'border-indigo-500/60 bg-indigo-500/10 text-indigo-300',
      badge: '64s',
    },
    {
      id: 'normal',
      label: 'Normal',
      sublabel: 'Velocidade padrão de mercado (32s)',
      icon: Gauge,
      color: 'text-cyan-400',
      activeBorder: 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300',
      badge: '32s',
    },
    {
      id: 'fast',
      label: 'Fast',
      sublabel: 'Alta frequência acelerada (14s)',
      icon: Zap,
      color: 'text-amber-400',
      activeBorder: 'border-amber-500/60 bg-amber-500/10 text-amber-300',
      badge: '14s',
    },
  ];

  const handleSelectSpeed = (speed: TickerScrollSpeed) => {
    if (onSetTickerSpeed) {
      onSetTickerSpeed(speed);
    } else if (onCycleTickerSpeed) {
      onCycleTickerSpeed();
    }
    setIsSpeedMenuOpen(false);
  };
  return (
    <header className="flex items-center justify-between gap-2 sm:gap-3 px-2 sm:px-4 lg:px-5 py-2 bg-[#130722]/90 backdrop-blur-md border-b border-purple-500/40 sticky top-0 z-40 transition-colors duration-200 shrink-0 shadow-[0_4px_25px_-5px_rgba(192,132,252,0.25)]">
      {/* Zone 1: Brand Wordmark + Sidebar Quick Toggle + Sync APIs button */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
            title={sidebarCollapsed ? 'Expandir Menu Lateral (Visão Detalhada)' : 'Recolher Menu Lateral (Visão Ampla)'}
            aria-label="Alternar Menu Lateral"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-cyan-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-400" />
            )}
          </button>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <InteractiveRoundLogo size={34} />
          <button
            onClick={() => onSelectTab('telemetry')}
            className="text-left font-extrabold text-sm sm:text-base tracking-tight hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 flex items-center gap-1.5"
            title="Ir para a visão de Telemetria e Monitoramento vpsNsA"
          >
            <span className="neon-glow-blue font-black tracking-tight">
              VPS NsA
            </span>
            <span className="text-slate-400 font-semibold text-xs hidden sm:inline">Enterprise</span>
          </button>
        </div>

        {/* Sync APIs button directly in Header */}
        {onSyncMarket && (
          <button 
            type="button"
            onClick={onSyncMarket}
            disabled={isSyncingMarket}
            className="hidden md:flex items-center gap-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 px-2.5 py-1 rounded-lg text-xs text-cyan-300 transition-colors shadow-xs"
            title="Sincronizar APIs de Cotações Comerciais (AwesomeAPI REST)"
          >
            <RefreshCw className={`w-3 h-3 text-cyan-400 ${isSyncingMarket ? 'animate-spin' : ''}`} />
            <span className="hidden xl:inline">Sincronizar APIs</span>
            <span className="text-[10px] text-cyan-400 font-mono">({lastMarketUpdate || 'Ao vivo'})</span>
          </button>
        )}
      </div>

      {/* Zone 2: Navigation Links - Visible across viewports with subtle overflow support */}
      <nav className="flex items-center gap-1 xl:gap-1.5 text-[11px] xl:text-xs font-semibold uppercase tracking-wider text-slate-300 overflow-x-auto no-scrollbar max-w-[42vw] md:max-w-none">
        <button
          onClick={() => onSelectTab('broadcast')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentTab === 'broadcast'
              ? 'text-white bg-red-600 font-bold border border-red-500 shadow-sm'
              : 'text-red-400 hover:text-white hover:bg-red-950/40'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
          Estúdio Ao Vivo
        </button>
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentTab === 'dashboard'
              ? 'text-white bg-indigo-600 font-bold border border-indigo-500 shadow-sm'
              : 'text-indigo-400 hover:text-white hover:bg-indigo-950/40'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          Dashboard Grid
        </button>
        <button
          onClick={() => onSelectTab('services')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentTab === 'services'
              ? 'text-white bg-gradient-to-r from-cyan-600 to-blue-600 font-bold border border-cyan-400 shadow-sm'
              : 'text-cyan-400 hover:text-white hover:bg-cyan-950/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Serviços & Hospedagens
        </button>
        <button
          onClick={() => onSelectTab('telemetry')}
          className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap shrink-0 ${
            currentTab === 'telemetry'
              ? 'text-cyan-300 bg-cyan-500/15 font-bold border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
              : 'text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/30'
          }`}
        >
          Telemetria
        </button>
        <button
          onClick={() => onSelectTab('containers')}
          className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap shrink-0 ${
            currentTab === 'containers'
              ? 'text-emerald-300 bg-emerald-500/15 font-bold border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
              : 'text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/30'
          }`}
        >
          Containers & Sites
        </button>
        <button
          onClick={() => onSelectTab('orchestration')}
          className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap shrink-0 ${
            currentTab === 'orchestration'
              ? 'text-purple-200 bg-purple-500/15 font-bold border border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
              : 'text-slate-300 hover:text-purple-300 hover:bg-purple-950/30'
          }`}
        >
          K8s & Swarm
        </button>
        <button
          onClick={() => onSelectTab('cpus')}
          className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap shrink-0 hidden sm:inline-block ${
            currentTab === 'cpus'
              ? 'text-sky-200 bg-sky-500/15 font-bold border border-sky-400/50 shadow-[0_0_12px_rgba(14,165,233,0.35)]'
              : 'text-slate-300 hover:text-sky-300 hover:bg-sky-950/30'
          }`}
        >
          CPUs Modernos
        </button>
        <button
          onClick={() => onSelectTab('domains')}
          className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap shrink-0 hidden sm:inline-block ${
            currentTab === 'domains'
              ? 'text-teal-200 bg-teal-500/15 font-bold border border-teal-400/50 shadow-[0_0_12px_rgba(20,184,166,0.35)]'
              : 'text-slate-300 hover:text-teal-300 hover:bg-teal-950/30'
          }`}
        >
          Domínios & DNS
        </button>
        <button
          onClick={() => onSelectTab('payments')}
          className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap shrink-0 ${
            currentTab === 'payments'
              ? 'text-amber-200 bg-amber-500/15 font-bold border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
              : 'text-slate-300 hover:text-amber-300 hover:bg-amber-950/30'
          }`}
        >
          Mercado Pago
        </button>
      </nav>

      {/* Zone 3: "Auto-Fit" CSS Grid Toggle, Theme Switcher & User Action */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Toggle para Modo Auto-Fit (CSS Grid sem rolagem) */}
        {onToggleAutoFit && (
          <button
            type="button"
            onClick={onToggleAutoFit}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all shadow-xs cursor-pointer ${
              isAutoFit
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-500/30'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-400 hover:text-slate-200'
            }`}
            title={isAutoFit ? 'Desativar Modo Auto-Fit (Retornar à rolagem tradicional)' : 'Ativar Modo Auto-Fit (CSS Grid responsivo sem rolagem vertical)'}
          >
            {isAutoFit ? (
              <Minimize2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className="hidden lg:inline flex items-center gap-1.5">
              Auto-Fit: <strong className={isAutoFit ? 'text-green-400' : 'text-slate-400'}>{isAutoFit ? 'ATIVO' : 'OFF'}</strong>
            </span>
            <span className="lg:hidden text-[10px] font-mono">{isAutoFit ? 'Fit ON' : 'Fit OFF'}</span>
          </button>
        )}

        {/* Alternador de Efeitos Visuais de Primeiro Mundo */}
        {onCycleVisualFx && (
          <button
            type="button"
            onClick={onCycleVisualFx}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all shadow-xs cursor-pointer ${
              visualFxMode === 'cyber-aura'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-500/30'
                : visualFxMode === 'neo-glass'
                ? 'bg-sky-500/20 border-sky-400 text-sky-300 ring-1 ring-sky-500/30'
                : 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-500/30'
            }`}
            title={`Alternar Efeitos Visuais (Atual: ${
              visualFxMode === 'cyber-aura'
                ? 'Aura Cibernética Glow'
                : visualFxMode === 'neo-glass'
                ? 'Vidro Futurista Glass'
                : 'HUD Tático Militar'
            })`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
            <span className="hidden lg:inline flex items-center gap-1">
              Visual FX: <strong className="text-white font-mono uppercase">{
                visualFxMode === 'cyber-aura'
                  ? 'Aura Glow'
                  : visualFxMode === 'neo-glass'
                  ? 'Neo Glass'
                  : 'HUD Pro'
              }</strong>
            </span>
            <span className="lg:hidden text-[10px] font-mono">FX</span>
          </button>
        )}

        {/* Dropdown Menu com Grupo de Radio Buttons para Seleção de Velocidade dos Tickers */}
        <div className="relative" ref={speedMenuRef}>
          <button
            type="button"
            onClick={() => setIsSpeedMenuOpen(prev => !prev)}
            aria-expanded={isSpeedMenuOpen}
            aria-haspopup="true"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all shadow-xs cursor-pointer ${
              tickerSpeed === 'fast'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-500/30'
                : tickerSpeed === 'slow'
                ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 ring-1 ring-indigo-500/30'
                : tickerSpeed === 'paused'
                ? 'bg-rose-500/20 border-rose-400 text-rose-300 ring-1 ring-rose-500/30'
                : 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-500/30'
            }`}
            title="Selecionar velocidade de rolagem dos tickers de mercado (Paused, Slow, Normal, Fast)"
          >
            {tickerSpeed === 'fast' ? (
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
            ) : tickerSpeed === 'slow' ? (
              <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            ) : tickerSpeed === 'paused' ? (
              <Pause className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : (
              <Gauge className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            )}
            <span className="hidden lg:inline flex items-center gap-1 font-mono">
              Velocidade: <strong className="text-white uppercase font-bold">{
                tickerSpeed === 'fast'
                  ? 'Fast'
                  : tickerSpeed === 'slow'
                  ? 'Slow'
                  : tickerSpeed === 'paused'
                  ? 'Paused'
                  : 'Normal'
              }</strong>
            </span>
            <span className="lg:hidden text-[10px] font-mono uppercase">{
              tickerSpeed === 'fast'
                ? '⚡ Fast'
                : tickerSpeed === 'slow'
                ? '🐢 Slow'
                : tickerSpeed === 'paused'
                ? '⏸️ Stop'
                : '⏱️ Norm'
            }</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isSpeedMenuOpen ? 'rotate-180 text-cyan-400' : ''}`} />
          </button>

          {/* Floating Dropdown com Grupo de Radio Buttons para Seleção Direta */}
          {isSpeedMenuOpen && (
            <div 
              role="radiogroup"
              aria-label="Opções de velocidade de rolagem dos tickers"
              className="absolute right-0 mt-1.5 w-64 bg-slate-950/95 border border-cyan-500/50 rounded-xl p-2 shadow-2xl backdrop-blur-md z-50 font-mono space-y-1.5 card-cyber-aura"
            >
              <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800 text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  <span>Velocidade dos Tickers</span>
                </span>
                <span className="text-[9px] text-slate-500 lowercase">awesomeapi & b3</span>
              </div>

              <div className="space-y-1 pt-0.5">
                {speedOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = tickerSpeed === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleSelectSpeed(opt.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                        isSelected
                          ? `${opt.activeBorder} shadow-sm border`
                          : 'hover:bg-slate-900/80 text-slate-300 border border-transparent hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Radio Button Customizado */}
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'border-cyan-400 bg-cyan-950' 
                            : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]"></div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${opt.color} shrink-0`} />
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{opt.label}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 font-normal">
                                {opt.badge}
                              </span>
                            </div>
                            <div className="text-[9px] text-slate-400 leading-tight">
                              {opt.sublabel}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Central de Notificações de Containers com Badge Pulsante */}
        {onOpenNotificationCenter && (
          <button
            onClick={onOpenNotificationCenter}
            className="relative p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
            title={`Central de Notificações (${unreadAlertCount} alerta${unreadAlertCount === 1 ? '' : 's'} ativo${unreadAlertCount === 1 ? '' : 's'})`}
            aria-label="Abrir Central de Notificações"
          >
            <Bell className={`w-4 h-4 ${unreadAlertCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`} />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-mono font-black text-white shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-ping">
                {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
              </span>
            )}
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-mono font-black text-white shadow-[0_0_8px_rgba(244,63,94,0.9)]">
                {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
              </span>
            )}
          </button>
        )}

        {/* Dynamic Dark / Light / System Theme Switcher */}
        <ThemeSelector />

        {currentUser ? (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-500/50 hover:border-cyan-400 px-2.5 py-1.5 rounded-lg text-xs transition-all shadow-md cursor-pointer"
            title={`Perfil Ativo: ${currentUser.username} (${currentUser.role}) · vpsNsA Sovereign Cloud`}
          >
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-400 text-white font-mono font-black flex items-center justify-center text-[10px] border border-cyan-300/40 shadow-xs shrink-0 tracking-wider">
              {currentUser.username.toLowerCase().includes('marcio') ? 'MF' : currentUser.username === 'vpsNsA' ? 'NsA' : currentUser.username.substring(0, 2).toUpperCase()}
            </span>
            <div className="flex flex-col text-left hidden sm:flex">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-[11px] leading-tight truncate max-w-[170px]">{currentUser.username}</span>
                {currentUser.role === 'admimaster' ? (
                  <span className="bg-amber-950 text-amber-300 border border-amber-500/60 px-1.5 py-0.2 rounded text-[8px] font-bold flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5 text-yellow-400" /> AdmiMaster
                  </span>
                ) : (
                  <span className="bg-slate-800 text-slate-300 border border-slate-700 px-1 py-0.2 rounded text-[8px] font-bold">
                    Usuário
                  </span>
                )}
              </div>
              <span className="text-[9px] text-cyan-400 font-mono leading-tight flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 inline" />
                {currentUser.role === 'admimaster' ? 'Argon2id Level 5 · Elo Ativo' : 'vpsNsA Cloud Member'}
              </span>
            </div>
          </button>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 rounded-lg hover:brightness-110 transition-all whitespace-nowrap shrink-0 shadow-sm"
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Acessar Painel / Login</span>
            <span className="sm:hidden">Entrar</span>
          </button>
        )}
      </div>
    </header>
  );
};
