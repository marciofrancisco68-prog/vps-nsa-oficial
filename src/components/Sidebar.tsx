import React from 'react';
import {
  Activity,
  Box,
  Layers,
  Workflow,
  Cpu,
  Globe2,
  Database,
  GitBranch,
  CreditCard,
  Terminal,
  ShieldAlert,
  Server,
  ChevronLeft,
  ChevronRight,
  Radio,
  LayoutGrid,
  Sparkles,
  Wifi,
  Code2,
  Crown,
  Gamepad2,
  Bitcoin,
  Zap,
  Lock,
  UserPlus
} from 'lucide-react';
import { InteractiveRoundLogo } from './InteractiveRoundLogo';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  containersCount: number;
  currentUser?: {
    username: string;
    email: string;
    role: string;
  } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  containersCount,
  currentUser,
}) => {
  const isMaster = currentUser?.role === 'admimaster';

  const menuItems = [
    // Aba Exclusiva do AdmiMaster (Privada: 100% invisível para usuários comuns)
    ...(isMaster ? [
      {
        id: 'admimaster',
        label: 'AdmiMaster Privado (Root)',
        icon: Crown,
        badge: 'Soberano',
        isMasterOnly: true,
      }
    ] : []),
    {
      id: 'vps',
      label: 'Hospedagem VPS (hPanel)',
      icon: Server,
      badge: '70% OFF',
    },
    {
      id: 'game',
      label: 'Game Panel (Jogos)',
      icon: Gamepad2,
      badge: 'Dedicado',
    },
    {
      id: 'broadcast',
      label: 'Estúdio Ao Vivo & TV News',
      icon: Radio,
      badge: 'AO VIVO',
    },
    {
      id: 'dashboard',
      label: 'Dashboard Adaptativo Grid',
      icon: LayoutGrid,
      badge: 'Auto-Fit',
    },
    {
      id: 'services',
      label: 'Serviços & Hospedagens',
      icon: Sparkles,
      badge: '23 Serviços',
    },
    {
      id: 'telemetry',
      label: 'Telemetria em Tempo Real',
      icon: Activity,
      badge: 'Live',
    },
    {
      id: 'containers',
      label: 'Containers & Trilhões de Sites',
      icon: Box,
      badge: `${containersCount}`,
    },
    {
      id: 'orchestration',
      label: 'Kubernetes & Docker Swarm',
      icon: Layers,
      badge: 'k8s/Swarm',
    },
    {
      id: 'n8n',
      label: 'n8n Automações & Fluxos',
      icon: Workflow,
      badge: 'n8n Node',
    },
    {
      id: 'cpus',
      label: 'CPUs Modernos & vs Hostinger',
      icon: Cpu,
      badge: '5 Modelos',
    },
    {
      id: 'domains',
      label: 'Domínios, DNS & SSL',
      icon: Globe2,
    },
    {
      id: 'dns-health',
      label: 'DNS Health & Propagação',
      icon: Wifi,
      badge: 'Public DoH',
    },
    {
      id: 'latency-heatmap',
      label: 'Heatmap Latência Global',
      icon: Globe2,
      badge: 'D3 Geo',
    },
    {
      id: 'database',
      label: 'Banco Nativo & Supabase',
      icon: Database,
    },
    {
      id: 'github',
      label: 'Deploy GitHub (Vercel-Style)',
      icon: GitBranch,
      badge: 'Bash .sh',
    },
    {
      id: 'open-source',
      label: 'Código Aberto & MP',
      icon: Code2,
      badge: 'Parceiro',
    },
    {
      id: 'payments',
      label: 'Mercado Pago & Preços',
      icon: CreditCard,
      badge: 'PIX / Cartão',
    },
    {
      id: 'terminal',
      label: 'Terminal SSH & Console Root',
      icon: Terminal,
    },
    {
      id: 'argon2',
      label: 'Segurança Argon2id',
      icon: ShieldAlert,
      badge: 'Elo Cripto',
    },
    {
      id: 'register',
      label: 'Cadastro & SSO Soberano',
      icon: UserPlus,
      badge: 'Google/Git',
    },
  ];

  return (
    <aside
      className={`relative flex flex-col h-full min-h-0 bg-[#120622]/90 border-r border-purple-500/30 backdrop-blur-md transition-all duration-200 z-20 shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-3 border-b border-purple-500/20 flex items-center justify-between shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <InteractiveRoundLogo size={32} />
            <div className="truncate">
              <span className="font-extrabold text-xs text-white tracking-wider block">
                vps<span className="text-indigo-400">NsA</span>
              </span>
              <a 
                href="https://www.nsaoficial.com.br" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[9px] text-cyan-400 font-mono hover:underline block truncate"
                title="www.nsaoficial.com.br"
              >
                nsaoficial.com.br
              </a>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-purple-300 hover:text-white hover:bg-purple-900/40 mx-auto transition-colors"
          title={collapsed ? 'Expandir Menu' : 'Recolher Menu'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 min-h-0 p-2 space-y-1 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isMasterItem = (item as any).isMasterOnly;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? isMasterItem
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-bold'
                    : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(192,132,252,0.5)] font-bold border border-purple-400/50'
                  : isMasterItem
                  ? 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-950/30 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${
                isActive 
                  ? isMasterItem ? 'text-yellow-400' : 'text-white' 
                  : isMasterItem ? 'text-amber-400' : 'text-slate-400'
              }`} />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-mono transition-all ${
                        isActive
                          ? isMasterItem
                            ? 'bg-amber-400/25 text-amber-200 border border-amber-400/50 font-bold shadow-xs'
                            : 'bg-white/25 text-white font-bold shadow-xs'
                          : isMasterItem
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          : 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 shrink-0 mt-auto space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Plataforma Soberana:</span>
              <span className="text-cyan-400 font-mono text-[10px]">Argon2id OK</span>
            </div>
            <p className="text-xs font-bold text-white truncate">vpsNsA Hyperscale</p>
            <p className="text-[10px] text-cyan-400 leading-tight font-mono">
              Cluster Soberano vpsNsA
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <a 
              href="https://www.nsaoficial.com.br" 
              target="_blank" 
              rel="noreferrer" 
              className="text-cyan-400 hover:underline"
            >
              www.nsaoficial.com.br
            </a>
            <span className="text-emerald-400">99.999%</span>
          </div>
        </div>
      )}
    </aside>
  );
};
