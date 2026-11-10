import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  RefreshCw, 
  Activity, 
  Terminal, 
  Database, 
  Zap, 
  Server, 
  Code2, 
  Radio, 
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import datacenterImg from '../assets/images/vpsnsa_datacenter_worldclass_1793432474348.jpg';
import datacenterFuturisticImg from '../assets/images/nsa_cloud_datacenter_futuristic_1793432871747.jpg';
import datacenterCorridorNeonImg from '../assets/images/vpsnsa_datacenter_corridor_neon.jpg';

interface SoftwareUpdateItem {
  id: string;
  name: string;
  version: string;
  category: 'Segurança' | 'Infraestrutura' | 'IA & Redes' | 'Banco & Dados' | 'UI & UX';
  status: 'Instalado & Operacional' | 'Atualizado' | 'Otimizado';
  releaseDate: string;
  description: string;
  highlight: string;
}

export const OniUiUpdateCard: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [datacenterView, setDatacenterView] = useState<'corridor-neon' | 'futuristic' | 'corridor'>('corridor-neon');
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [lastCheckMessage, setLastCheckMessage] = useState<string>('Sistema 100% atualizado');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const updates: SoftwareUpdateItem[] = [
    {
      id: 'kernel',
      name: 'Linux Sovereign Kernel Enterprise',
      version: 'v6.12.18-LTS (RT-Preempt)',
      category: 'Infraestrutura',
      status: 'Instalado & Operacional',
      releaseDate: '31 Out 2026',
      description: 'Patch de baixa latência em tempo real para processamento financeiro e alta densidade de containers com escalabilidade de 128 a 256 núcleos por socket.',
      highlight: 'Latência < 0.8ms em switches NVLink e Anycast B3 SP1'
    },
    {
      id: 'gemini-carbon',
      name: 'Gemini 4 Carbon Autonomous Defense Shield',
      version: 'v4.8.2-Neural',
      category: 'IA & Redes',
      status: 'Instalado & Operacional',
      releaseDate: '30 Out 2026',
      description: 'Motor autônomo com Deep Packet Inspection (DPI), isolamento preventivo de força bruta em portas SSH/HTTP e mitigação DDoS Anycast em nível bancário.',
      highlight: 'Zero violações de segurança e mitigação preditiva em menos de 12ms'
    },
    {
      id: 'argon2id',
      name: 'Argon2id Sovereign Cryptographic Engine',
      version: 'v3.2.0-FIPS',
      category: 'Segurança',
      status: 'Instalado & Operacional',
      releaseDate: '29 Out 2026',
      description: 'Blindagem de credenciais Root com parâmetros de nível bancário (Memória 64 MB, Iterações 3, Paralelismo 4) para proteção contra ataques com GPUs e ASICs.',
      highlight: 'Chave soberana vinculada à autoridade Root Soberana VPSNsA'
    },
    {
      id: 'k8s-swarm',
      name: 'Kubernetes 1.32.1 & Docker Swarm Grid',
      version: 'v1.32.1-Enterprise',
      category: 'Infraestrutura',
      status: 'Instalado & Operacional',
      releaseDate: '28 Out 2026',
      description: 'HPA auto-scaler ativo com capacidade elástica para orquestrar trilhões de sites e microsserviços com rolling updates e zero-downtime.',
      highlight: '48/48 Pods ativos com recuperação autônoma (self-healing)'
    },
    {
      id: 'awesome-api',
      name: 'AwesomeAPI Multi-Currency Real-Time Engine',
      version: 'v3.1.4-REST',
      category: 'IA & Redes',
      status: 'Atualizado',
      releaseDate: '31 Out 2026',
      description: 'Pipeline de streaming comercial em tempo real para USD, EUR, CHF, GBP, Brent e índices B3/S&P 500 com tolerância a falhas e cache resiliente.',
      highlight: 'Sincronização contínua a cada 30s com precisão de 3 casas decimais'
    },
    {
      id: 'n8n-engine',
      name: 'n8n Sovereign Workflow Automation Hub',
      version: 'v2.4.0-Production',
      category: 'IA & Redes',
      status: 'Instalado & Operacional',
      releaseDate: '27 Out 2026',
      description: 'Motor de automação de processos com nós nativos para PostgreSQL, Supabase, webhooks síncronos e pipelines de IA Gemini para tarefas repetitivas.',
      highlight: 'Execuções assíncronas de eventos com taxa de sucesso de 100%'
    },
    {
      id: 'postgres-supabase',
      name: 'PostgreSQL 17 Cloud & Supabase Dual-Sync',
      version: 'v17.2-Enterprise',
      category: 'Banco & Dados',
      status: 'Instalado & Operacional',
      releaseDate: '26 Out 2026',
      description: 'Banco relacional corporativo de alta performance integrado com armazenamento NVMe Gen5 Raided (>420.000 IOPS) e backup instantâneo.',
      highlight: 'Pool de conexões PgBouncer com failover automático em 200ms'
    },
    {
      id: 'oni-ui-grid',
      name: 'ONI UI 17 Adaptive CSS Grid Framework',
      version: 'v17.4.2-Pro',
      category: 'UI & UX',
      status: 'Otimizado',
      releaseDate: '31 Out 2026',
      description: 'Design responsivo inteligente com auto-redimensionamento proporcional de widgets, modo panorâmico zero-rolagem e suporte a temas dinâmicos.',
      highlight: 'Adaptação instantânea de colunas de 1 a 4 slots sem clipping'
    }
  ];

  const handleCheckUpdates = () => {
    setIsCheckingUpdate(true);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setLastCheckMessage(`Verificação concluída às ${new Date().toLocaleTimeString('pt-BR')}: Todos os 8 pacotes ONI UI 17 estão na versão mais recente.`);
    }, 1800);
  };

  const filteredUpdates = filter === 'all' 
    ? updates 
    : updates.filter(u => u.category === filter);

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md font-sans">
      
      {/* 1. HERO SHOWCASE DO DATACENTER MUNDIAL */}
      <div className="relative w-full h-56 sm:h-72 lg:h-80 overflow-hidden group">
        <img 
          src={
            datacenterView === 'corridor-neon'
              ? datacenterCorridorNeonImg
              : datacenterView === 'futuristic'
              ? datacenterFuturisticImg
              : datacenterImg
          } 
          alt="Datacenter VPS NsA Cloud Enterprise World-Class" 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Degradê sobreposto de alta tecnologia */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-slate-950/70"></div>

        {/* Badges Flutuantes do Datacenter & Seletor de Câmera */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-cyan-500 text-slate-950 font-black text-[10px] tracking-widest uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.7)]">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
              CORREDOR NEON OFICIAL
            </span>
            <span className="px-2.5 py-1 rounded-md bg-cyan-950/90 text-cyan-300 border border-cyan-400 text-[10px] font-mono font-bold shadow-md">
              Tier IV Certified · PUE 1.06
            </span>
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-md bg-purple-950/90 text-purple-200 border border-purple-500 text-[10px] font-mono font-bold shadow-md">
              Molduras Neon Ciano &amp; Roxo · Piso de Vidro
            </span>
          </div>

          {/* Seletor de Câmera do Datacenter */}
          <div className="bg-slate-950/90 p-1 rounded-lg border border-cyan-500/50 flex items-center gap-1 text-[10px] font-mono font-bold backdrop-blur-md shadow-lg">
            <button
              onClick={() => setDatacenterView('corridor-neon')}
              className={`px-2 py-0.5 rounded transition-all ${
                datacenterView === 'corridor-neon'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Corredor Neon (Foto)
            </button>
            <button
              onClick={() => setDatacenterView('futuristic')}
              className={`px-2 py-0.5 rounded transition-all ${
                datacenterView === 'futuristic'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Holográfico
            </button>
            <button
              onClick={() => setDatacenterView('corridor')}
              className={`px-2 py-0.5 rounded transition-all ${
                datacenterView === 'corridor'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Racks
            </button>
          </div>
        </div>

        {/* Floating HUD Telemetry Tags on Glass Floor */}
        <div className="hidden md:flex absolute top-14 right-4 flex-col gap-1.5 z-10 font-mono text-[10px] text-right">
          <div className="bg-slate-950/80 border border-cyan-500/40 px-2 py-0.5 rounded text-cyan-300 backdrop-blur-sm">
            BACKBONE: <strong className="text-white">940 Tbps</strong> Anycast
          </div>
          <div className="bg-slate-950/80 border border-emerald-500/40 px-2 py-0.5 rounded text-emerald-300 backdrop-blur-sm">
            IMMERSION: <strong className="text-white">18°C</strong> Operacional
          </div>
        </div>

        {/* Informações Centrais sobrepostas no Rodapé da Imagem */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-3 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
                ONI UI 17
              </span>
              <span className="text-xs bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-2 py-0.5 rounded font-bold font-mono">
                Sovereign Cloud OS v17.4.2
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5 max-w-xl">
              Plataforma de nível mundial operando no nó central <strong className="text-cyan-400">B3 SP1 GRU (São Paulo)</strong> com conectividade de fibra óptica redundante e SLA de 99.999%.
            </p>
          </div>

          <button
            onClick={handleCheckUpdates}
            disabled={isCheckingUpdate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition-all shadow-lg active:scale-95 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
            <span>{isCheckingUpdate ? 'Verificando OTA...' : 'Verificar Atualizações'}</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE STATUS DO SISTEMA ONI UI 17 & FILTROS */}
      <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-semibold text-slate-200">
              {lastCheckMessage}
            </span>
          </div>

          {/* Filtros por Categoria */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                filter === 'all' 
                  ? 'bg-slate-800 text-white font-bold border border-slate-700' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas ({updates.length})
            </button>
            <button
              onClick={() => setFilter('Infraestrutura')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                filter === 'Infraestrutura' 
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Infraestrutura
            </button>
            <button
              onClick={() => setFilter('Segurança')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                filter === 'Segurança' 
                  ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Segurança
            </button>
            <button
              onClick={() => setFilter('IA & Redes')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                filter === 'IA & Redes' 
                  ? 'bg-purple-950 text-purple-300 font-bold border border-purple-800' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              IA & Redes
            </button>
            <button
              onClick={() => setFilter('UI & UX')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                filter === 'UI & UX' 
                  ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              UI & UX
            </button>
          </div>
        </div>
      </div>

      {/* 3. LISTA DE ATUALIZAÇÕES DO SOFTWARE ONI UI 17 */}
      <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredUpdates.map((item) => {
          const isExpanded = expandedItem === item.id;
          return (
            <div 
              key={item.id}
              className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex flex-col justify-between transition-colors shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h4 className="text-xs font-bold text-white font-mono">{item.name}</h4>
                  </div>
                  <span className="text-[10px] bg-slate-900 text-cyan-300 px-2 py-0.5 rounded border border-slate-800 font-mono font-bold">
                    {item.version}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-400">
                  <span className="text-slate-500">{item.releaseDate}</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-semibold">{item.status}</span>
                  <span>·</span>
                  <span className="text-indigo-400">{item.category}</span>
                </div>

                <p className="text-xs text-slate-300 mt-2 font-sans leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Destaque Técnico */}
              <div className="mt-2.5 pt-2 border-t border-slate-900/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400 truncate pr-2">
                  <strong className="text-cyan-400">Destaque:</strong> {item.highlight}
                </span>
                <span className="text-emerald-400 font-bold shrink-0">Ativo</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. RODAPÉ DO CARD ONI UI 17 */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Certificação de Integridade Soberana: <strong className="text-slate-200">SHA-256 / Argon2id Verificado</strong></span>
        </div>
        <div>
          <span>Todos os direitos reservados a <strong className="text-slate-200">VPS NsA Hyperscale Cluster Enterprise</strong></span>
        </div>
      </div>

    </div>
  );
};
