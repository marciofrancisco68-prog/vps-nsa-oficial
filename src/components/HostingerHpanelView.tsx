import React, { useState } from 'react';
import { 
  Globe, Activity, Zap, Crown, Layers, Cpu, Server, 
  ShieldCheck, CreditCard, Bitcoin, Copy, CheckCircle2, 
  Eye, EyeOff, Database, ArrowUpRight, Gamepad2, LayoutGrid, 
  Sparkles, Code2, Bot, HelpCircle, ChevronRight, Search, Play,
  Check, Lock, ShieldAlert, Terminal, RefreshCw, Radio,
  ChevronDown, ChevronUp, X, Layout, Shield
} from 'lucide-react';
import { RealMarketData } from '../types';
import { DatacenterCorridorShowcase } from './DatacenterCorridorShowcase';

interface HostingerHpanelViewProps {
  onNavigateTab: (tab: string) => void;
  onSelectPlanForPayment?: (planName: string) => void;
  marketData?: RealMarketData;
  currentUser?: {
    username: string;
    email: string;
    role: string;
  } | null;
}

export const HostingerHpanelView: React.FC<HostingerHpanelViewProps> = ({
  onNavigateTab,
  onSelectPlanForPayment,
  marketData,
  currentUser,
}) => {
  const [subTab, setSubTab] = useState<'vps' | 'compare' | 'game' | 'apps' | 'btc' | 'proxies'>('vps');
  const [billingCycle, setBillingCycle] = useState<'48' | '24' | '12' | '1'>('48');
  const [openSections, setOpenSections] = useState({
    wordpress: true,
    aiTools: true,
    security: true,
    agencyTools: true
  });
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleSection = (sec: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const getPrice = (base: number) => {
    switch (billingCycle) {
      case '48': return (base * 0.4).toFixed(2);
      case '24': return (base * 0.55).toFixed(2);
      case '12': return (base * 0.75).toFixed(2);
      default: return base.toFixed(2);
    }
  };

  const [btcBalance, setBtcBalance] = useState<number>(0.0845);
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [copiedBtc, setCopiedBtc] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('bergamo-dedicated');
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawStatus, setWithdrawStatus] = useState<string | null>(null);

  const handleCopyBtc = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText('bc1qvpsnsamastersecureaddress000000000070off');
      setCopiedBtc(true);
      setTimeout(() => setCopiedBtc(false), 3000);
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAddress || !withdrawAmount) return;
    setWithdrawStatus('Processando transação on-chain via nó Bitcoin Core...');
    setTimeout(() => {
      setWithdrawStatus('✓ Saque de ' + withdrawAmount + ' BTC transmitido para a mempool com taxa prioritária!');
      setWithdrawAddress('');
      setWithdrawAmount('');
      setTimeout(() => setWithdrawStatus(null), 5000);
    }, 1200);
  };

  const vpsPlans = [
    {
      id: 'epyc-bergamo',
      name: 'VPS Turbo Bergamo (128 Cores)',
      cpu: 'AMD EPYC 9754 Bergamo (CXL 3.0)',
      ram: '256 GB DDR5 ECC',
      storage: '3.84 TB NVMe Gen5 (14 GB/s)',
      traffic: '100 Gbps Unmetered',
      origPrice: 'R$ 899,00',
      price: 'R$ 269,70',
      discount: '70% OFF',
      tag: 'Mais Popular',
      recommended: true
    },
    {
      id: 'nvidia-grace',
      name: 'VPS IA Grace Hopper GH200',
      cpu: 'NVIDIA GH200 Grace Hopper Superchip',
      ram: '480 GB LPDDR5X + 96 GB HBM3',
      storage: '7.68 TB NVMe Enterprise',
      traffic: '200 Gbps InfiniBand',
      origPrice: 'R$ 2.490,00',
      price: 'R$ 747,00',
      discount: '70% OFF',
      tag: 'Supercomputação IA',
      recommended: false
    },
    {
      id: 'xeon-platinum',
      name: 'VPS Intel Xeon Emerald Rapids',
      cpu: 'Intel Xeon Platinum 8592+ (64 Cores)',
      ram: '128 GB DDR5 Octa-Channel',
      storage: '1.92 TB NVMe Gen5',
      traffic: '50 Gbps Dedicado',
      origPrice: 'R$ 649,00',
      price: 'R$ 194,70',
      discount: '70% OFF',
      tag: 'Custo-Benefício',
      recommended: false
    }
  ];

  const gameTemplates = [
    { name: 'Counter-Strike 2', icon: '🎯', tickRate: '128 Sub-tick', players: '64 Slots', ram: '16 GB', ping: '2ms' },
    { name: 'Minecraft Paper / Purpur', icon: '⛏️', tickRate: '20.0 TPS', players: '200 Slots', ram: '24 GB', ping: '3ms' },
    { name: 'Palworld Dedicated Server', icon: '🐾', tickRate: '60 FPS Server', players: '32 Slots', ram: '32 GB', ping: '4ms' },
    { name: 'Rust High-Tick Server', icon: '☢️', tickRate: '30 FPS Fixed', players: '250 Slots', ram: '32 GB', ping: '3ms' },
    { name: 'ARK: Survival Ascended', icon: '🦖', tickRate: 'Unreal Engine 5', players: '70 Slots', ram: '48 GB', ping: '5ms' },
    { name: 'GTA V / FiveM Roleplay', icon: '🏎️', tickRate: 'OneSync Infinity', players: '1024 Slots', ram: '64 GB', ping: '2ms' }
  ];

  const catalogApps = [
    { name: 'Docker Compose & Swarm', category: 'DevOps & Containers', icon: '🐳', desc: 'Deploy instantâneo de stacks multicontêineres.' },
    { name: 'n8n Automações', category: 'Workflow & IA', icon: '⚡', desc: 'Mais de 400 nós de integração sem limites.' },
    { name: 'PostgreSQL 16 & pgvector', category: 'Banco de Dados', icon: '🐘', desc: 'Banco relacional com suporte a embeddings de IA.' },
    { name: 'WordPress Hyperscale', category: 'CMS & E-commerce', icon: '🌐', desc: 'Cache LSCache + Redis com 0.04s TTFB.' },
    { name: 'OpenClaw & Ollama IA', category: 'LLMs Locais', icon: '🤖', desc: 'Execução de DeepSeek, Llama 3 e Gemma 2 em hardware próprio.' },
    { name: 'Supabase Sovereign Stack', category: 'Backend as a Service', icon: '⚡', desc: 'Auth, Edge Functions e Realtime em alta escala.' }
  ];

  return (
    <div className="w-full space-y-6 text-slate-100">
      
      {/* 1. CORREDOR DATACENTER FUTURISTA INTEGRADO (FOTO REAL COM NEON CIANO E ROXO) */}
      <DatacenterCorridorShowcase onNavigateTab={onNavigateTab} />

      {/* 2. SUB-ABAS HOSTINGER HPANEL */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800 text-xs font-medium">
        <button
          onClick={() => setSubTab('vps')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer font-bold ${
            subTab === 'vps' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Server className="w-4 h-4 text-indigo-400" />
          <span>Hospedagem VPS (70% OFF)</span>
        </button>

        <button
          onClick={() => setSubTab('compare')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer font-bold ${
            subTab === 'compare' 
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20' 
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Comparar Recursos (Tabela Completa)</span>
        </button>

        <button
          onClick={() => setSubTab('game')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer font-bold ${
            subTab === 'game' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20' 
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-4 h-4 text-purple-400" />
          <span>Game Panel</span>
        </button>

        <button
          onClick={() => setSubTab('apps')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer font-bold ${
            subTab === 'apps' 
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20' 
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-cyan-400" />
          <span>Catálogo de Aplicações</span>
        </button>

        <button
          onClick={() => setSubTab('btc')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer font-bold ${
            subTab === 'btc' 
              ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg shadow-amber-500/20' 
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Bitcoin className="w-4 h-4 text-amber-400" />
          <span>Carteira Bitcoin</span>
        </button>

        <button
          onClick={() => setSubTab('proxies')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer font-bold ${
            subTab === 'proxies' 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20' 
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>Proxies (+180 Países)</span>
        </button>
      </div>

      {/* 3. SHOWCASE DOS 3 CARDS PRINCIPAIS (ESTILO HOSTINGER) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: HOSPEDAGEM VPS */}
        <div className={`bg-[#0D121F] border rounded-2xl p-5 transition group flex flex-col justify-between shadow-xl ${
          subTab === 'vps' ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-indigo-500/30 hover:border-indigo-500'
        }`}>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Hospedagem VPS</h3>
                <span className="bg-indigo-950 text-cyan-400 text-[10px] px-2 py-0.5 rounded font-bold border border-indigo-800">Economize 70%</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Aproveite todo o poder, flexibilidade e velocidade com seu próprio servidor virtual privado AMD EPYC Bergamo.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSubTab('vps')}
            className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            Configurar VPS
          </button>
        </div>

        {/* CARD 2: GAME PANEL */}
        <div className={`bg-[#0D121F] border rounded-2xl p-5 transition group flex flex-col justify-between shadow-xl ${
          subTab === 'game' ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-indigo-500/30 hover:border-purple-500'
        }`}>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Game Panel</h3>
                <span className="bg-purple-950 text-purple-300 text-[10px] px-2 py-0.5 rounded font-bold border border-purple-800">Economize 70%</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Hospede seus jogos favoritos (CS2, Minecraft, Palworld, Rust) com processadores potentes e anti-DDoS de 3.2 Tbps.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSubTab('game')}
            className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            Configurar Game Panel
          </button>
        </div>

        {/* CARD 3: CATÁLOGO DE APLICAÇÕES */}
        <div className={`bg-[#0D121F] border rounded-2xl p-5 transition group flex flex-col justify-between shadow-xl ${
          subTab === 'apps' ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-indigo-500/30 hover:border-cyan-500'
        }`}>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Catálogo de Aplicações</h3>
                <span className="bg-cyan-950 text-cyan-300 text-[10px] px-2 py-0.5 rounded font-bold border border-cyan-800">One-Click Install</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Implante aplicativos populares em 1 clique: Docker, OpenClaw, N8N, PostgreSQL, WordPress e modelos de IA.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSubTab('apps')}
            className="mt-6 w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg shadow-cyan-600/30 cursor-pointer"
          >
            Explorar Catálogo
          </button>
        </div>

      </div>

      {/* 4. CONTEÚDO ESPECÍFICO CONFORME A SUB-ABA SELECIONADA */}

      {/* SUB-ABA: HOSPEDAGEM VPS */}
      {subTab === 'vps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-400" />
                Planos de Servidores VPS Soberanos (AMD &amp; NVIDIA)
              </h3>
              <p className="text-xs text-slate-400">Provisionamento instantâneo em menos de 15 segundos com IP dedicado e full root</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/40 text-xs font-bold font-mono">
              70% OFF À Vista
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vpsPlans.map(plan => (
              <div 
                key={plan.id}
                className={`bg-[#0D121F] rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                  plan.recommended 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-xl' 
                    : 'border-slate-800 hover:border-indigo-500/50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700 text-[10px] font-bold">
                      {plan.tag}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {plan.discount}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white">{plan.name}</h4>

                  <div className="py-2 border-y border-slate-800 space-y-1">
                    <div className="text-[11px] text-slate-400 line-through">De: {plan.origPrice}/mês</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">{plan.price}</span>
                      <span className="text-xs text-slate-400 font-normal">/mês</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{plan.cpu}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{plan.ram}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{plan.storage}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{plan.traffic}</span>
                    </li>
                    <li className="flex items-center gap-2 text-cyan-300 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Proteção DDoS 3.2 Tbps + IPv4/IPv6</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    if (onSelectPlanForPayment) {
                      onSelectPlanForPayment(plan.name);
                    }
                    onNavigateTab('payments');
                  }}
                  className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Contratar com 70% Desconto
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-ABA: GAME PANEL */}
      {subTab === 'game' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-purple-400" />
                Game Panel Soberano — Hostinger &amp; Pterodactyl Edition
              </h3>
              <p className="text-xs text-slate-400">Instalação com 1 clique de servidores de jogos em hardware dedicado com latência ultrabaixa</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40 text-xs font-bold font-mono">
              Anti-DDoS Game Incluso
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameTemplates.map((g, idx) => (
              <div 
                key={idx}
                className="bg-[#0D121F] border border-purple-500/30 rounded-2xl p-4 hover:border-purple-400 transition space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{g.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{g.name}</h4>
                      <span className="text-[10px] text-purple-300 font-mono">Ping: {g.ping} no Brasil</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                    {g.players}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-[#151C2C] p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[9px]">TICK-RATE</span>
                    <span className="text-slate-200 font-bold">{g.tickRate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">RAM ALOCADA</span>
                    <span className="text-emerald-400 font-bold">{g.ram}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (onSelectPlanForPayment) {
                      onSelectPlanForPayment(`Servidor Game: ${g.name}`);
                    }
                    onNavigateTab('payments');
                  }}
                  className="w-full py-2 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-xs transition cursor-pointer"
                >
                  Criar Servidor ({g.name.split(' ')[0]})
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-ABA: CATÁLOGO DE APLICAÇÕES */}
      {subTab === 'apps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-cyan-400" />
                Catálogo de Aplicações e Stacks Soberanas
              </h3>
              <p className="text-xs text-slate-400">Instalação com 1 clique de plataformas de containers, IA e automações</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono">
              6 Stacks Oficiais
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalogApps.map((app, idx) => (
              <div 
                key={idx}
                className="bg-[#0D121F] border border-cyan-500/30 rounded-2xl p-4 hover:border-cyan-400 transition space-y-3 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{app.icon}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                      {app.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{app.name}</h4>
                  <p className="text-xs text-slate-400">{app.desc}</p>
                </div>

                <button 
                  onClick={() => onNavigateTab('containers')}
                  className="w-full py-2 rounded-xl bg-cyan-600/80 hover:bg-cyan-600 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Instalar em 1 Clique</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-ABA: CARTEIRA BITCOIN E SAQUES */}
      {subTab === 'btc' && (
        <div className="bg-[#0D121F] border border-amber-500/30 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/20 pb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400">
                <Bitcoin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Carteira Sovereign Bitcoin (vpsNsA Core)</h3>
                <p className="text-xs text-slate-400">Gateway descentralizado de saques e pagamentos com 70% OFF</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-950 text-amber-300 px-3 py-1 rounded-full border border-amber-800 font-bold font-mono">
                SegWit v0 / Taproot Ready
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Saldo e Endereço */}
            <div className="space-y-4">
              <div className="bg-[#151C2C] p-5 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-400 font-mono">SALDO DISPONÍVEL</span>
                  <div className="text-2xl font-black text-white mt-1 flex items-center gap-3">
                    <span>{showBalance ? `${btcBalance.toFixed(8)} BTC` : '•••••••• BTC'}</span>
                    <button 
                      onClick={() => setShowBalance(!showBalance)} 
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {showBalance && (
                    <span className="text-xs text-emerald-400 font-mono mt-1 block">
                      ≈ R$ {(btcBalance * (parseFloat(marketData?.btc?.bid?.replace(/\./g, '').replace(',', '.') || '382450'))).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                <Bitcoin className="w-10 h-10 text-amber-400/20" />
              </div>

              {/* Endereço de Depósito */}
              <div className="bg-[#151C2C] p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>ENDEREÇO SOVERANO BITCOIN</span>
                  <span className="text-amber-400">Rede Principal (Mainnet)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-amber-300 break-all select-all flex items-center justify-between gap-2">
                  <span>bc1qvpsnsamastersecureaddress000000000070off</span>
                  <button 
                    onClick={handleCopyBtc}
                    className="p-1.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 shrink-0 cursor-pointer"
                  >
                    {copiedBtc ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Formulário de Saque */}
            <form onSubmit={handleWithdraw} className="bg-[#151C2C] p-5 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white block">Solicitar Saque On-Chain</span>
              
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono">ENDEREÇO DE DESTINO (BTC)</label>
                <input 
                  type="text" 
                  value={withdrawAddress}
                  onChange={e => setWithdrawAddress(e.target.value)}
                  placeholder="bc1q... ou 3..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono">QUANTIDADE (BTC)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.0001"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="0.0100"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                  <button 
                    type="button"
                    onClick={() => setWithdrawAmount(btcBalance.toString())}
                    className="absolute right-2 top-2 text-[10px] text-amber-400 hover:text-amber-300 font-mono font-bold cursor-pointer"
                  >
                    MÁXIMO
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs transition shadow-md cursor-pointer"
              >
                Transmitir Saque com Validação Segura
              </button>

              {withdrawStatus && (
                <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-300 text-xs font-mono">
                  {withdrawStatus}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* SUB-ABA: PROXIES */}
      {subTab === 'proxies' && (
        <div className="bg-[#0D121F] border border-indigo-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-indigo-500/20 pb-4 gap-2">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-cyan-400" />
              <div>
                <h3 className="text-base font-bold text-white">Proxies Residenciais Soberanos (+180 Países)</h3>
                <p className="text-xs text-slate-400">Rede global de túneis rotativos No-Log de alta vazão</p>
              </div>
            </div>
            <span className="text-xs bg-indigo-950 text-indigo-300 px-3 py-1 rounded-full border border-indigo-800 font-bold font-mono">
              Rotação Autônoma Ativa
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
            <div className="bg-[#151C2C] p-4 rounded-xl border border-slate-800 text-slate-200 space-y-1">
              <span className="text-base">🇧🇷</span>
              <p className="font-bold text-white">Brasil (São Paulo)</p>
              <p className="text-[10px] text-emerald-400 font-mono">IP: 185.122.84.19 (Ativo)</p>
              <span className="text-[9px] text-slate-500">Latência: 1.2ms</span>
            </div>
            <div className="bg-[#151C2C] p-4 rounded-xl border border-slate-800 text-slate-200 space-y-1">
              <span className="text-base">🇺🇸</span>
              <p className="font-bold text-white">EUA (Virgínia)</p>
              <p className="text-[10px] text-emerald-400 font-mono">IP: 104.28.192.42 (Ativo)</p>
              <span className="text-[9px] text-slate-500">Latência: 68ms</span>
            </div>
            <div className="bg-[#151C2C] p-4 rounded-xl border border-slate-800 text-slate-200 space-y-1">
              <span className="text-base">🇩🇪</span>
              <p className="font-bold text-white">Alemanha (Frankfurt)</p>
              <p className="text-[10px] text-emerald-400 font-mono">IP: 185.93.18.77 (Ativo)</p>
              <span className="text-[9px] text-slate-500">Latência: 142ms</span>
            </div>
            <div className="bg-[#151C2C] p-4 rounded-xl border border-slate-800 text-slate-200 space-y-1">
              <span className="text-base">🇯🇵</span>
              <p className="font-bold text-white">Japão (Tóquio)</p>
              <p className="text-[10px] text-emerald-400 font-mono">IP: 133.242.105.12 (Ativo)</p>
              <span className="text-[9px] text-slate-500">Latência: 210ms</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. TABELA COMPARATIVA COMPLETA DE RECURSOS VPSNSA COM SELETOR DE CICLO */}
      {(subTab === 'vps' || subTab === 'compare') && (
        <div className="space-y-6 pt-4">
          
          {/* Seletor Superior de Ciclo de Faturamento */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0D121F] border border-indigo-500/30 p-5 rounded-2xl shadow-xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Comparar todos os recursos vpsNsA (Single, Premium, Unlimited & Cloud)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Selecione o plano ideal com descontos progressivos por ciclo de contratação</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">Período de faturamento:</span>
              <select 
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as any)}
                className="bg-[#151C2C] border border-indigo-500/40 text-cyan-300 font-bold text-xs rounded-xl px-4 py-2.5 outline-none cursor-pointer"
              >
                <option value="48">48 Meses (60% OFF - Maior Economia)</option>
                <option value="24">24 Meses (45% OFF)</option>
                <option value="12">12 Meses (25% OFF)</option>
                <option value="1">1 Mês (Preço Normal)</option>
              </select>
            </div>
          </div>

          {/* Tabela Rolável Estilo Hostinger com Marca vpsNsA */}
          <div className="bg-[#0D121F] border border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto overflow-y-auto max-h-[680px] scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-[#080B11]">
              <table className="w-full text-left border-collapse min-w-[950px]">
                
                <thead className="sticky top-0 bg-[#0D121F] z-30 border-b border-indigo-500/30 shadow-md">
                  <tr>
                    <th className="p-6 text-sm font-bold text-white w-1/5 bg-[#0D121F]">Planos vpsNsA</th>
                    
                    <th className="p-6 text-center w-1/5 border-l border-slate-800 bg-[#0D121F]">
                      <span className="text-xs font-mono font-bold text-slate-400">Single / Startup</span>
                      <div className="text-2xl font-black text-white mt-1">R$ {getPrice(14.99)}<span className="text-xs font-normal text-slate-400">/mês</span></div>
                      <button 
                        onClick={() => {
                          if (onSelectPlanForPayment) onSelectPlanForPayment('Single / Startup vpsNsA');
                          onNavigateTab('payments');
                        }}
                        className="w-full mt-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                      >
                        Garantir Single
                      </button>
                    </th>

                    <th className="p-6 text-center w-1/5 border-l border-indigo-500/50 bg-indigo-950/40 relative">
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-cyan-400 text-white text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                        Recomendado
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-300">Premium / Pro</span>
                      <div className="text-2xl font-black text-white mt-1">R$ {getPrice(24.99)}<span className="text-xs font-normal text-slate-400">/mês</span></div>
                      <button 
                        onClick={() => {
                          if (onSelectPlanForPayment) onSelectPlanForPayment('Premium / Pro vpsNsA (Recomendado)');
                          onNavigateTab('payments');
                        }}
                        className="w-full mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-2 rounded-xl transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                      >
                        Garantir Premium
                      </button>
                    </th>

                    <th className="p-6 text-center w-1/5 border-l border-slate-800 bg-[#0D121F]">
                      <span className="text-xs font-mono font-bold text-purple-400">Unlimited / Growth</span>
                      <div className="text-2xl font-black text-white mt-1">R$ {getPrice(39.99)}<span className="text-xs font-normal text-slate-400">/mês</span></div>
                      <button 
                        onClick={() => {
                          if (onSelectPlanForPayment) onSelectPlanForPayment('Unlimited / Growth vpsNsA');
                          onNavigateTab('payments');
                        }}
                        className="w-full mt-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                      >
                        Garantir Unlimited
                      </button>
                    </th>

                    <th className="p-6 text-center w-1/5 border-l border-slate-800 bg-[#0D121F]">
                      <span className="text-xs font-mono font-bold text-amber-400">Cloud Enterprise</span>
                      <div className="text-2xl font-black text-white mt-1">R$ {getPrice(99.99)}<span className="text-xs font-normal text-slate-400">/mês</span></div>
                      <button 
                        onClick={() => {
                          if (onSelectPlanForPayment) onSelectPlanForPayment('Cloud Enterprise vpsNsA');
                          onNavigateTab('payments');
                        }}
                        className="w-full mt-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                      >
                        Explorar Cloud
                      </button>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60 text-xs">
                  
                  {/* ACORDEÃO 1: WORDPRESS E GERENCIAMENTO */}
                  <tr className="bg-[#151C2C] cursor-pointer" onClick={() => toggleSection('wordpress')}>
                    <td colSpan={5} className="py-3 px-6 font-bold text-cyan-300">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-cyan-400" />
                          <span>Instalação WordPress, LiteSpeed & Migração Automática</span>
                        </span>
                        {openSections.wordpress ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </td>
                  </tr>
                  {openSections.wordpress && (
                    <>
                      <tr>
                        <td className="p-4 px-6 text-slate-300">Instalação grátis do WordPress em 1 clique</td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400 bg-indigo-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="p-4 px-6 text-slate-300">Migração automática de sites grátis</td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400 bg-indigo-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="p-4 px-6 text-slate-300">Aceleração com LiteSpeed & Cache de Objetos</td>
                        <td className="p-4 text-center text-slate-400">Padrão</td>
                        <td className="p-4 text-center font-bold text-cyan-300 bg-indigo-950/20">Aprimorado</td>
                        <td className="p-4 text-center font-bold text-cyan-300">Aprimorado</td>
                        <td className="p-4 text-center font-bold text-amber-300">Máximo Dedicado</td>
                      </tr>
                    </>
                  )}

                  {/* ACORDEÃO 2: RECURSOS AGENCY E E-COMMERCE */}
                  <tr className="bg-[#151C2C] cursor-pointer" onClick={() => toggleSection('agencyTools')}>
                    <td colSpan={5} className="py-3 px-6 font-bold text-amber-300">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Layout className="w-4 h-4 text-amber-400" />
                          <span>Ferramentas de Agência, E-Commerce & Monetização (vpsNsA Engine)</span>
                        </span>
                        {openSections.agencyTools ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </td>
                  </tr>
                  {openSections.agencyTools && (
                    <>
                      <tr>
                        <td className="p-4 px-6 text-slate-300">Receba pagamentos com Checkout Transparente (Mercado Pago)</td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400 bg-indigo-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="p-4 px-6 text-slate-300">Venda produtos físicos e digitais</td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400 bg-indigo-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="p-4 px-6 text-slate-300">Editor de código & ferramentas de SEO com IA</td>
                        <td className="p-4 text-center text-slate-500"><X className="w-4 h-4 mx-auto text-slate-600" /></td>
                        <td className="p-4 text-center text-emerald-400 bg-indigo-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="p-4 px-6 text-slate-300">Monetize seus modelos com o recurso de remuneração</td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400 bg-indigo-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                      </tr>
                    </>
                  )}

                  {/* ACORDEÃO 3: SEGURANÇA E REDE */}
                  <tr className="bg-[#151C2C] cursor-pointer" onClick={() => toggleSection('security')}>
                    <td colSpan={5} className="py-3 px-6 font-bold text-emerald-300">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-emerald-400" />
                          <span>Segurança Soberana, Firewall WAF & Cloudflare Nameservers</span>
                        </span>
                        {openSections.security ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </td>
                  </tr>
                  {openSections.security && (
                    <>
                      <tr>
                        <td className="p-4 px-6 text-slate-300">Proteção contra ataques DDoS de camada 7</td>
                        <td className="p-4 text-center text-slate-400">Padrão</td>
                        <td className="p-4 text-center text-white bg-indigo-950/20">Padrão</td>
                        <td className="p-4 text-center text-emerald-400 font-bold">Aprimorado</td>
                        <td className="p-4 text-center text-emerald-400 font-bold">Aprimorado Avançado</td>
                      </tr>
                      <tr>
                        <td className="p-4 px-6 text-slate-300">Firewall de Aplicação Web (WAF) vpsNsA</td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400 bg-indigo-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                      </tr>
                    </>
                  )}

                </tbody>
              </table>
            </div>
          </div>

          {/* Prova Social & FAQ Accordion */}
          <div className="bg-[#0D121F] border border-indigo-500/30 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white">Mais de 5 milhões de pessoas criaram seus sites na vpsNsA.</h2>
              <p className="text-xs text-slate-400">Perguntas frequentes (FAQ) sobre planos de hospedagem soberana</p>
            </div>

            <div className="space-y-3 max-w-4xl mx-auto pt-2">
              {[
                { 
                  q: "Qual a diferença entre os planos Cloud e Agency da vpsNsA?", 
                  a: "Os planos Cloud são focados em alta capacidade isolada para um único projeto pesado. Os planos Agency oferecem um painel White-label completo para você gerenciar de 100 a 300 sites de terceiros e revender com sua própria marca." 
                },
                { 
                  q: "Já tenho um site na Hostinger ou outro provedor. Posso transferi-lo para a vpsNsA?", 
                  a: "Sim! Nossa ferramenta de migração automática transfere todos os seus arquivos, banco de dados MySQL e SSL para a vpsNsA gratuitamente sem interrupção de serviço." 
                },
                { 
                  q: "Como recebo minhas comissões do programa de Código Aberto?", 
                  a: "Ao cadastrar sua conta do Mercado Pago no painel, o valor gerado através do botão de implantação cai diretamente na sua chave cadastrada." 
                }
              ].map((faq, idx) => (
                <div key={idx} className="bg-[#151C2C] border border-slate-800 rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)} 
                    className="w-full px-6 py-4 text-left font-bold text-xs text-white flex items-center justify-between cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-4 text-xs text-slate-300 border-t border-slate-800/80 pt-3 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
