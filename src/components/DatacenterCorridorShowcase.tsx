import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Cpu, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Gauge, 
  Thermometer, 
  Layers, 
  Sparkles, 
  Maximize2, 
  Eye, 
  Radio, 
  CheckCircle2, 
  Wifi, 
  Lock
} from 'lucide-react';
import datacenterCorridorNeonImg from '../assets/images/vpsnsa_datacenter_corridor_neon.jpg';

interface DatacenterCorridorShowcaseProps {
  onNavigateTab?: (tab: string) => void;
  compact?: boolean;
}

export const DatacenterCorridorShowcase: React.FC<DatacenterCorridorShowcaseProps> = ({
  onNavigateTab,
  compact = false,
}) => {
  const [activeRack, setActiveRack] = useState<'nvidia' | 'epyc' | 'floor'>('nvidia');
  const [cyanGlowActive, setCyanGlowActive] = useState(true);
  const [purpleGlowActive, setPurpleGlowActive] = useState(true);
  const [hologramsActive, setHologramsActive] = useState(true);
  const [fiberFlowActive, setFiberFlowActive] = useState(true);

  // Telemetria em tempo real sincronizada com a foto (19°C, 68% Load)
  const [temp, setTemp] = useState(19.2);
  const [load, setLoad] = useState(68);
  const [throughput, setThroughput] = useState(942.6);

  useEffect(() => {
    const interval = setInterval(() => {
      setTemp(prev => Number((19.0 + (Math.sin(Date.now() / 4000) * 0.4)).toFixed(1)));
      setLoad(prev => Math.floor(67 + (Math.sin(Date.now() / 3000) * 3)));
      setThroughput(prev => Number((940 + (Math.sin(Date.now() / 2500) * 4)).toFixed(1)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-cyan-400/50 bg-[#060a12] shadow-[0_0_40px_rgba(0,240,255,0.25)] transition-all select-none">
      
      {/* 1. CONTAINER DO CORREDOR COM A FOTO REAL EM ALTA RESOLUÇÃO */}
      <div className={`relative w-full overflow-hidden ${compact ? 'h-[360px] sm:h-[440px]' : 'h-[440px] sm:h-[560px] lg:h-[620px]'}`}>
        
        {/* Imagem Oficial do Datacenter enviada pelo CEO */}
        <img 
          src={datacenterCorridorNeonImg} 
          alt="Datacenter Soberano vpsNsA - Corredor de Racks com Neon Ciano e Roxo" 
          className="w-full h-full object-cover object-center scale-100 group-hover:scale-102 transition-transform duration-1000"
        />

        {/* 2. CAMADAS DE BRILHO NEON PULSANTE (CIANO ELÉTRICO & ROXO ULTRAVIOLETA) */}
        {cyanGlowActive && (
          <>
            {/* Feixe Neon Ciano - Racks da Esquerda */}
            <div className="pointer-events-none absolute left-[12%] top-[30%] w-[10%] h-[45%] bg-cyan-400/15 blur-2xl animate-pulse" />
            <div className="pointer-events-none absolute left-[21%] top-[32%] w-[8%] h-[42%] bg-cyan-400/20 blur-xl animate-[neonPulseGlow_3s_ease-in-out_infinite]" />
            
            {/* Feixe Neon Ciano - Racks da Direita */}
            <div className="pointer-events-none absolute right-[12%] top-[30%] w-[10%] h-[45%] bg-cyan-400/15 blur-2xl animate-pulse" />
            <div className="pointer-events-none absolute right-[21%] top-[32%] w-[8%] h-[42%] bg-cyan-400/20 blur-xl animate-[neonPulseGlow_3s_ease-in-out_infinite]" />
            
            {/* Reflexo Neon Ciano no Piso de Vidro */}
            <div className="pointer-events-none absolute bottom-0 left-[25%] right-[25%] h-[35%] bg-gradient-to-t from-cyan-400/25 via-cyan-500/10 to-transparent blur-2xl" />
          </>
        )}

        {purpleGlowActive && (
          <>
            {/* Teto e esteiras superiores com luz roxa/ultravioleta */}
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-[28%] bg-gradient-to-b from-purple-500/20 via-violet-600/10 to-transparent blur-2xl" />
            
            {/* Acento Roxo Neon nos racks à esquerda (superior) */}
            <div className="pointer-events-none absolute left-[3%] top-[32%] w-[10%] h-[40%] bg-purple-500/25 blur-xl animate-pulse" />
            
            {/* Fibras Roxas no Piso de Vidro */}
            <div className="pointer-events-none absolute bottom-0 left-[35%] right-[35%] h-[25%] bg-purple-500/15 blur-xl" />
          </>
        )}

        {/* 3. TELAS HOLOGRÁFICAS FLUTUANTES (IDÊNTICAS À FOTO) */}
        {hologramsActive && (
          <div className="absolute inset-0 pointer-events-none z-20">
            
            {/* HOLOGRÁFICO 1: SAFE 28 AND CPU / NVIDIA RACK (Topo Esquerda - exatamente como na foto) */}
            <div className="pointer-events-auto absolute top-[16%] left-[28%] sm:left-[30%] max-w-[260px] sm:max-w-[290px] p-2.5 sm:p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-400/70 shadow-[0_0_20px_rgba(0,240,255,0.5)] transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between border-b border-cyan-500/40 pb-1 mb-1.5 font-mono text-[9px] text-cyan-300">
                <span className="font-bold flex items-center gap-1 text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  SAFE 28 AND CPU / NVIDIA RACK
                </span>
                <span className="text-emerald-400 font-bold">OPERATIONAL</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-cyan-200 font-mono text-[10px] mb-2">
                <div className="bg-cyan-950/60 p-1 rounded border border-cyan-500/30">
                  <span className="text-[8px] text-cyan-400 block">TEMP</span>
                  <strong className="text-white text-xs">{temp}°C</strong>
                </div>
                <div className="bg-cyan-950/60 p-1 rounded border border-cyan-500/30">
                  <span className="text-[8px] text-cyan-400 block">LOAD</span>
                  <strong className="text-white text-xs">{load}%</strong>
                </div>
              </div>

              {/* Gráfico circular de radar e forma de onda */}
              <div className="flex items-center justify-between pt-1 border-t border-cyan-500/30 text-[9px] font-mono text-cyan-300">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full border border-cyan-400 border-t-transparent animate-spin flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
                  </div>
                  <span className="text-[8px]">GH200 IMMERSION</span>
                </div>
                <span className="text-[8px] text-emerald-400">PUE: 1.06</span>
              </div>
            </div>

            {/* HOLOGRÁFICO 2: REAL-TIME FREQUENCY & METRICS (Topo Direita - exatamente como na foto) */}
            <div className="pointer-events-auto absolute top-[16%] right-[28%] sm:right-[30%] max-w-[260px] sm:max-w-[290px] p-2.5 sm:p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-purple-400/70 shadow-[0_0_20px_rgba(192,132,252,0.5)] transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between border-b border-purple-500/40 pb-1 mb-1.5 font-mono text-[9px] text-purple-300">
                <span className="font-bold flex items-center gap-1 text-white">
                  <Activity className="w-3 h-3 text-purple-400 animate-pulse" />
                  CLUSTER WAVEFORM FREQ
                </span>
                <span className="text-cyan-400 font-bold">4.40 GHz</span>
              </div>

              {/* Ondas do Osciloscópio SVG simuladas da foto */}
              <div className="h-9 w-full bg-purple-950/40 rounded border border-purple-500/30 flex items-center px-1 overflow-hidden">
                <svg className="w-full h-7 stroke-cyan-400 fill-none" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path d="M0,12 Q10,2 20,12 T40,12 T60,5 T80,18 T100,12" strokeWidth="1.5" className="animate-pulse" />
                  <path d="M0,15 Q15,22 30,15 T60,18 T90,8 T100,15" strokeWidth="1" stroke="#c084fc" opacity="0.7" />
                </svg>
              </div>

              <div className="flex items-center justify-between pt-1 mt-1.5 border-t border-purple-500/30 text-[8px] font-mono text-purple-300">
                <span>NVLINK 900 GB/s</span>
                <span className="text-white font-bold">{throughput} Tbps</span>
              </div>
            </div>

            {/* HOLOGRÁFICO 3 (Ao Fundo do Corredor): PONTO DE PERSPECTIVA INFINITA */}
            <div className="hidden lg:flex absolute top-[44%] left-1/2 -translate-x-1/2 flex-col items-center gap-1 font-mono text-[9px]">
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-300 font-bold shadow-[0_0_12px_rgba(0,240,255,0.7)] animate-pulse">
                &uarr; CORREDOR SOBERANO vpsNsA &uarr;
              </span>
            </div>

          </div>
        )}

        {/* 4. BARRA DE CONTROLE INTERATIVA & STATUS (SOBREPOSTA NO TOPO) */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-30">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-slate-950/90 border-2 border-cyan-400 text-cyan-300 font-black text-xs font-mono tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.5)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              DATACENTER TIER IV SÃO PAULO (B3 SP1)
            </span>

            <span className="px-2.5 py-1 rounded-xl bg-purple-950/90 border border-purple-500/60 text-purple-200 text-xs font-mono font-bold shadow-sm hidden sm:inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              NVIDIA GH200 + AMD EPYC
            </span>
          </div>

          {/* Botões de Alternância das Cores da Foto */}
          <div className="flex items-center gap-1.5 bg-slate-950/90 p-1 rounded-xl border border-slate-700/80 backdrop-blur-md font-mono text-[11px]">
            <button
              onClick={() => setCyanGlowActive(prev => !prev)}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-bold ${
                cyanGlowActive 
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.8)]' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Alternar Colunas Neon Ciano Elétrico"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-300"></span>
              <span>Neon Ciano</span>
            </button>

            <button
              onClick={() => setPurpleGlowActive(prev => !prev)}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-bold ${
                purpleGlowActive 
                  ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.8)]' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Alternar Iluminação Ultravioleta / Roxa"
            >
              <span className="w-2 h-2 rounded-full bg-purple-300"></span>
              <span>Neon Roxo</span>
            </button>

            <button
              onClick={() => setHologramsActive(prev => !prev)}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-bold ${
                hologramsActive 
                  ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.6)]' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Alternar Telas Holográficas Flutuantes"
            >
              <Layers className="w-3 h-3" />
              <span className="hidden sm:inline">Hologramas</span>
            </button>
          </div>
        </div>

        {/* 5. RODAPÉ DE TELEMETRIA DO PISO DE VIDRO COM CABOS DE FIBRA ÓPTICA */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-3 z-30">
          
          <div className="bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-cyan-400/50 shadow-xl max-w-lg space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-white text-xs font-mono">
                Piso de Vidro Refletivo com Feixes de Fibra Óptica Ativa
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-tight">
              Os cabos subterrâneos iluminados em ciano, roxo e cobre conectam cada rack ao switch central <strong className="text-cyan-300">400 Gbps QSFP-DD</strong> com 0% de jitter.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('cpus')}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-200" />
                <span>Explorar CPUs Bergamo &amp; GH200 &rarr;</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 6. PAINEL INFERIOR DE ESPECIFICAÇÕES DOS RACKS DA FOTO */}
      <div className="p-4 sm:p-5 bg-gradient-to-b from-[#0a0f1d] to-[#060a12] border-t border-cyan-500/30 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        
        {/* RACK DA ESQUERDA: NVIDIA GH200 */}
        <div 
          onClick={() => setActiveRack('nvidia')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeRack === 'nvidia'
              ? 'bg-slate-900/90 border-cyan-400 ring-2 ring-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
              : 'bg-black/40 border-slate-800 hover:border-cyan-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Racks Esquerda: NVIDIA Grace Hopper
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
              GH200 AI
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans mb-2">
            Colunas com moldura de neon ciano brilhante. 576 GB de memória coerente CPU+GPU e interconnect NVLink de 900 GB/s.
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>TEMP: 19°C</span>
            <span className="text-emerald-400 font-bold">100% ONLINE</span>
          </div>
        </div>

        {/* RACK DA DIREITA: AMD EPYC BERGAMO */}
        <div 
          onClick={() => setActiveRack('epyc')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeRack === 'epyc'
              ? 'bg-slate-900/90 border-purple-400 ring-2 ring-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
              : 'bg-black/40 border-slate-800 hover:border-purple-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-300 font-bold flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-purple-400" /> Racks Direita: AMD EPYC Bergamo
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-700">
              128 Cores / 256T
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans mb-2">
            Superfícies de computação massiva para VPS Sovereign com 0% de throttling térmico e garantia de SLA bancário.
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>CARGA: 68%</span>
            <span className="text-cyan-400 font-bold">TURBO 3.10 GHz</span>
          </div>
        </div>

        {/* PISO REFLETIVO & CONEXÕES DE FIBRA */}
        <div 
          onClick={() => setActiveRack('floor')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeRack === 'floor'
              ? 'bg-slate-900/90 border-emerald-400 ring-2 ring-emerald-500/40 shadow-[0_0_20px_rgba(0,255,136,0.2)]'
              : 'bg-black/40 border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300 font-bold flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" /> Piso de Vidro &amp; Fibras Ópticas
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
              400G DWDM
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans mb-2">
            Placas de vidro temperado espelhado com feixes visíveis de laser ciano, roxo e âmbar alimentando os switches de alta densidade.
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>LATÊNCIA: 0.38ms</span>
            <span className="text-emerald-400 font-bold">LOSS 0.00%</span>
          </div>
        </div>

      </div>

    </div>
  );
};
