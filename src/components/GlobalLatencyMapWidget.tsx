import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Radio, 
  MapPin, 
  Server, 
  RefreshCw, 
  ArrowUpRight, 
  Maximize2, 
  Wifi, 
  Layers,
  X,
  CheckCircle2,
  Cpu,
  Clock,
  HardDrive,
  BarChart2,
  Sliders
} from 'lucide-react';

export interface DatacenterNode {
  id: string;
  name: string;
  city: string;
  country: string;
  region: string;
  x: number; // SVG coordinate (0 - 1000)
  y: number; // SVG coordinate (0 - 500)
  baseLatencyMs: number;
  currentLatencyMs: number;
  status: 'ONLINE' | 'ACTIVE_EDGE' | 'PRIMARY_CORE';
  tier: string;
  hardware: string;
  bandwidth: string;
  packetLoss: string;
  peeringExchange: string;
  uptimeSla: string;
  cpuLoadPercent: number;
  memoryLoadPercent: number;
  activeEdgeWorkers: number;
  jitterMs: number;
  minPingMs: number;
  maxPingMs: number;
  avgPingMs: number;
  pingHistory: number[];
  serverHealth: 'HEALTHY' | 'OPTIMAL' | 'REDUNDANT';
  routingProtocol: string;
}

interface GlobalLatencyMapWidgetProps {
  onClose?: () => void;
  onNavigateTelemetry?: () => void;
}

export const GlobalLatencyMapWidget: React.FC<GlobalLatencyMapWidgetProps> = ({
  onClose,
  onNavigateTelemetry,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('sp1');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [isPinging, setIsPinging] = useState<boolean>(true);
  const [lastPingTime, setLastPingTime] = useState<string>('');

  const [nodes, setNodes] = useState<DatacenterNode[]>([
    {
      id: 'sp1',
      name: 'Nó Central B3 SP1',
      city: 'São Paulo',
      country: 'Brasil',
      region: 'América do Sul (BR-EAST-1)',
      x: 325,
      y: 355,
      baseLatencyMs: 1.8,
      currentLatencyMs: 1.8,
      status: 'PRIMARY_CORE',
      tier: 'Tier IV Gold Certified',
      hardware: 'AMD EPYC Bergamo 128C + NVMe Gen5',
      bandwidth: '40 Gbps Uplink Redundante',
      packetLoss: '0.00%',
      peeringExchange: 'IX.br (PTT São Paulo) 100 Gbps Core',
      uptimeSla: '99.999% SLA',
      cpuLoadPercent: 28,
      memoryLoadPercent: 39,
      activeEdgeWorkers: 142,
      jitterMs: 0.12,
      minPingMs: 1.7,
      maxPingMs: 1.9,
      avgPingMs: 1.8,
      pingHistory: [1.8, 1.7, 1.8, 1.9, 1.8, 1.7, 1.8, 1.8, 1.7, 1.8],
      serverHealth: 'OPTIMAL',
      routingProtocol: 'BGP Anycast + DWDM Dark Fiber',
    },
    {
      id: 'stg1',
      name: 'Nó Borda STG1',
      city: 'Santiago',
      country: 'Chile',
      region: 'América do Sul (SA-WEST-1)',
      x: 290,
      y: 375,
      baseLatencyMs: 18.4,
      currentLatencyMs: 18.4,
      status: 'ACTIVE_EDGE',
      tier: 'Tier III+',
      hardware: 'AMD EPYC Dedicated 64C',
      bandwidth: '20 Gbps Anycast',
      packetLoss: '0.00%',
      peeringExchange: 'PIT Chile / Lumen Subsea Link',
      uptimeSla: '99.995% SLA',
      cpuLoadPercent: 31,
      memoryLoadPercent: 42,
      activeEdgeWorkers: 36,
      jitterMs: 0.45,
      minPingMs: 17.8,
      maxPingMs: 19.2,
      avgPingMs: 18.4,
      pingHistory: [18.2, 18.5, 18.3, 18.9, 18.1, 18.4, 18.6, 18.2, 18.5, 18.4],
      serverHealth: 'HEALTHY',
      routingProtocol: 'BGP Anycast Edge Route',
    },
    {
      id: 'va1',
      name: 'Nó Anycast VA1',
      city: 'Ashburn / Virginia',
      country: 'Estados Unidos',
      region: 'América do Norte (US-EAST-1)',
      x: 260,
      y: 180,
      baseLatencyMs: 118.2,
      currentLatencyMs: 118.2,
      status: 'ACTIVE_EDGE',
      tier: 'Tier IV Enterprise',
      hardware: 'AMD EPYC + Grace Hopper GH200',
      bandwidth: '100 Gbps Core Backbone',
      packetLoss: '0.00%',
      peeringExchange: 'Equinix Ashburn Cross-Connect',
      uptimeSla: '99.999% SLA',
      cpuLoadPercent: 44,
      memoryLoadPercent: 51,
      activeEdgeWorkers: 184,
      jitterMs: 0.85,
      minPingMs: 116.5,
      maxPingMs: 120.1,
      avgPingMs: 118.2,
      pingHistory: [117.8, 118.5, 118.0, 119.2, 117.5, 118.2, 118.9, 117.6, 118.4, 118.2],
      serverHealth: 'OPTIMAL',
      routingProtocol: 'Submarine Cable Seabras-1 Direct',
    },
    {
      id: 'pdx1',
      name: 'Nó Pacific PDX1',
      city: 'Oregon / Vale do Silício',
      country: 'Estados Unidos',
      region: 'América do Norte (US-WEST-1)',
      x: 185,
      y: 170,
      baseLatencyMs: 134.7,
      currentLatencyMs: 134.7,
      status: 'ACTIVE_EDGE',
      tier: 'Tier III+ High-Compute',
      hardware: 'NVIDIA GH200 NVLink Cluster',
      bandwidth: '40 Gbps Anycast',
      packetLoss: '0.00%',
      peeringExchange: 'NWAX / CoreSite Silicon Valley',
      uptimeSla: '99.998% SLA',
      cpuLoadPercent: 38,
      memoryLoadPercent: 44,
      activeEdgeWorkers: 96,
      jitterMs: 0.92,
      minPingMs: 133.2,
      maxPingMs: 136.4,
      avgPingMs: 134.7,
      pingHistory: [134.2, 135.1, 134.0, 135.8, 133.9, 134.7, 135.2, 134.5, 134.9, 134.7],
      serverHealth: 'HEALTHY',
      routingProtocol: 'Trans-Pacific Direct DWDM Wave',
    },
    {
      id: 'fra1',
      name: 'Nó Gateway FRA1',
      city: 'Frankfurt',
      country: 'Alemanha',
      region: 'Europa Central (EU-CENTRAL-1)',
      x: 520,
      y: 155,
      baseLatencyMs: 142.1,
      currentLatencyMs: 142.1,
      status: 'ACTIVE_EDGE',
      tier: 'Tier IV Financial Grid',
      hardware: 'AMD EPYC 9754 Bergamo',
      bandwidth: '100 Gbps DE-CIX Peering',
      packetLoss: '0.00%',
      peeringExchange: 'DE-CIX Frankfurt (100 Gbps Core)',
      uptimeSla: '99.999% SLA',
      cpuLoadPercent: 41,
      memoryLoadPercent: 47,
      activeEdgeWorkers: 112,
      jitterMs: 0.74,
      minPingMs: 140.5,
      maxPingMs: 143.8,
      avgPingMs: 142.1,
      pingHistory: [141.5, 142.6, 141.9, 143.1, 141.2, 142.1, 142.7, 141.8, 142.4, 142.1],
      serverHealth: 'OPTIMAL',
      routingProtocol: 'Atlantic Subsea EllaLink Direct',
    },
    {
      id: 'lon1',
      name: 'Nó City LON1',
      city: 'Londres',
      country: 'Reino Unido',
      region: 'Europa Ocidental (EU-WEST-1)',
      x: 485,
      y: 148,
      baseLatencyMs: 138.9,
      currentLatencyMs: 138.9,
      status: 'ACTIVE_EDGE',
      tier: 'Tier III+ Enterprise',
      hardware: 'AMD EPYC Bergamo 128C',
      bandwidth: '40 Gbps LINX Direct Peering',
      packetLoss: '0.00%',
      peeringExchange: 'LINX Direct Interconnect London',
      uptimeSla: '99.997% SLA',
      cpuLoadPercent: 35,
      memoryLoadPercent: 41,
      activeEdgeWorkers: 88,
      jitterMs: 0.68,
      minPingMs: 137.4,
      maxPingMs: 140.6,
      avgPingMs: 138.9,
      pingHistory: [138.2, 139.4, 138.0, 139.8, 138.5, 138.9, 139.2, 138.7, 139.1, 138.9],
      serverHealth: 'HEALTHY',
      routingProtocol: 'BGP Anycast Subsea Transatlantic',
    },
    {
      id: 'tyo1',
      name: 'Nó Ásia TYO1',
      city: 'Tóquio',
      country: 'Japão',
      region: 'Ásia Pacífico (AP-NORTHEAST-1)',
      x: 825,
      y: 190,
      baseLatencyMs: 209.6,
      currentLatencyMs: 209.6,
      status: 'ACTIVE_EDGE',
      tier: 'Tier IV Sovereign',
      hardware: 'AMD EPYC + NVIDIA GH200',
      bandwidth: '40 Gbps JPIX Direct',
      packetLoss: '0.00%',
      peeringExchange: 'JPIX / BBIX Tokyo Peering',
      uptimeSla: '99.999% SLA',
      cpuLoadPercent: 29,
      memoryLoadPercent: 37,
      activeEdgeWorkers: 74,
      jitterMs: 1.15,
      minPingMs: 208.1,
      maxPingMs: 211.5,
      avgPingMs: 209.6,
      pingHistory: [209.0, 210.4, 208.9, 211.0, 209.2, 209.6, 210.1, 209.4, 209.9, 209.6],
      serverHealth: 'OPTIMAL',
      routingProtocol: 'Trans-Pacific Low Latency Fiber',
    },
    {
      id: 'sin1',
      name: 'Nó Equatorial SIN1',
      city: 'Cingapura',
      country: 'Cingapura',
      region: 'Sudeste Asiático (AP-SOUTHEAST-1)',
      x: 740,
      y: 295,
      baseLatencyMs: 244.8,
      currentLatencyMs: 244.8,
      status: 'ACTIVE_EDGE',
      tier: 'Tier IV Regional Hub',
      hardware: 'AMD EPYC Bergamo 128C',
      bandwidth: '40 Gbps SGIX Subsea Link',
      packetLoss: '0.00%',
      peeringExchange: 'SGIX Subsea Cable Peering Hub',
      uptimeSla: '99.999% SLA',
      cpuLoadPercent: 33,
      memoryLoadPercent: 39,
      activeEdgeWorkers: 68,
      jitterMs: 1.28,
      minPingMs: 243.2,
      maxPingMs: 246.8,
      avgPingMs: 244.8,
      pingHistory: [244.1, 245.5, 243.9, 246.1, 244.3, 244.8, 245.2, 244.5, 245.0, 244.8],
      serverHealth: 'OPTIMAL',
      routingProtocol: 'Subsea Anycast Southeast Asia Hub',
    },
    {
      id: 'syd1',
      name: 'Nó Oceania SYD1',
      city: 'Sydney',
      country: 'Austrália',
      region: 'Oceania (AU-EAST-1)',
      x: 875,
      y: 405,
      baseLatencyMs: 279.4,
      currentLatencyMs: 279.4,
      status: 'ACTIVE_EDGE',
      tier: 'Tier III+ Edge',
      hardware: 'AMD Dedicated Compute 64C',
      bandwidth: '20 Gbps Submarine Cable',
      packetLoss: '0.00%',
      peeringExchange: 'Megaport Sydney Edge Interconnect',
      uptimeSla: '99.994% SLA',
      cpuLoadPercent: 24,
      memoryLoadPercent: 32,
      activeEdgeWorkers: 42,
      jitterMs: 1.42,
      minPingMs: 277.5,
      maxPingMs: 281.9,
      avgPingMs: 279.4,
      pingHistory: [278.8, 280.2, 278.5, 281.1, 279.0, 279.4, 280.0, 279.1, 279.8, 279.4],
      serverHealth: 'HEALTHY',
      routingProtocol: 'Southern Cross Cable Subsea Link',
    }
  ]);

  // Simulação de telemetria de ping ICMP dinâmico com cálculo de estatísticas (min, avg, max, jitter)
  useEffect(() => {
    if (!isPinging) return;

    const interval = setInterval(() => {
      setNodes(prev => prev.map(n => {
        let jitterVal = 0;
        let newLatency = n.baseLatencyMs;
        if (n.id === 'sp1') {
          // Nó central local com jitter mínimo
          jitterVal = parseFloat((Math.random() * 0.2 - 0.1).toFixed(2));
          newLatency = parseFloat((n.baseLatencyMs + jitterVal).toFixed(1));
        } else {
          // Nós distribuídos com jitter realista de fibra submarina
          jitterVal = parseFloat((Math.random() * 2.4 - 1.2).toFixed(2));
          newLatency = parseFloat(Math.max(1, n.baseLatencyMs + jitterVal).toFixed(1));
        }

        const newHistory = [...(n.pingHistory || []), newLatency].slice(-10);
        const minPing = parseFloat(Math.min(...newHistory).toFixed(1));
        const maxPing = parseFloat(Math.max(...newHistory).toFixed(1));
        const sum = newHistory.reduce((a, b) => a + b, 0);
        const avgPing = parseFloat((sum / newHistory.length).toFixed(1));
        const currentJitter = parseFloat(Math.abs(newLatency - avgPing).toFixed(2));

        return {
          ...n,
          currentLatencyMs: newLatency,
          pingHistory: newHistory,
          minPingMs: minPing,
          maxPingMs: maxPing,
          avgPingMs: avgPing,
          jitterMs: currentJitter,
        };
      }));
      setLastPingTime(new Date().toLocaleTimeString('pt-BR'));
    }, 2500);

    return () => clearInterval(interval);
  }, [isPinging]);

  const primaryNode = nodes.find(n => n.id === 'sp1') || nodes[0];
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || primaryNode;
  const hoveredNode = nodes.find(n => n.id === hoveredNodeId) || null;

  // Cálculo de posicionamento responsivo do Tooltip evitando corte nas bordas
  const getTooltipPosition = (node: DatacenterNode) => {
    const xPercent = (node.x / 1000) * 100;
    const yPercent = (node.y / 500) * 100;

    let xClass = '-translate-x-1/2';
    if (node.x > 660) {
      xClass = '-translate-x-[92%]';
    } else if (node.x < 300) {
      xClass = '-translate-x-[8%]';
    }

    let yClass = 'mt-3';
    if (node.y > 240) {
      yClass = '-translate-y-full -mt-3';
    }

    return {
      style: {
        left: `${xPercent}%`,
        top: `${yPercent}%`,
      },
      className: `${xClass} ${yClass}`,
    };
  };

  return (
    <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl overflow-hidden font-sans transition-all">
      
      {/* 1. CABEÇALHO DO WIDGET */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/70 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                Global Latency Map · Cobertura & Borda NsA
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
                9 Nós Globais Ativos
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Passe o cursor sobre qualquer nó do mapa para inspecionar estatísticas de ping e status do servidor regional em tempo real.
            </p>
          </div>
        </div>

        {/* Controles de Rota e Sincronização */}
        <div className="flex items-center gap-2">
          {lastPingTime && (
            <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
              Último ping: {lastPingTime}
            </span>
          )}

          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showRoutes
                ? 'bg-cyan-50 dark:bg-cyan-950/80 border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rotas Anycast</span>
          </button>

          <button
            onClick={() => setIsPinging(!isPinging)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isPinging
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
            title="Alternar ping ICMP contínuo em tempo real"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ping ICMP</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar Widget"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. ÁREA PRINCIPAL DO MAPA MÚNDI SVG INTERATIVO */}
      <div 
        className="relative w-full mt-4 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner group"
        onMouseLeave={() => setHoveredNodeId(null)}
      >
        
        {/* SVG Interativo com Mapa Mundi e Nós de Datacenter */}
        <svg 
          viewBox="0 0 1000 500" 
          className="w-full h-auto max-h-[380px] sm:max-h-[440px] select-none block"
          style={{ background: 'radial-gradient(circle at 40% 50%, #030712 0%, #020617 100%)' }}
        >
          {/* Definições de Estilo & Gradientes das Rotas */}
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="activeRouteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="1" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="1" />
            </linearGradient>

            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="strongNeonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* GRADE DE LATITUDE E LONGITUDE SUTIL */}
          <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4">
            <line x1="0" y1="125" x2="1000" y2="125" />
            <line x1="0" y1="250" x2="1000" y2="250" />
            <line x1="0" y1="375" x2="1000" y2="375" />
            <line x1="250" y1="0" x2="250" y2="500" />
            <line x1="500" y1="0" x2="500" y2="500" />
            <line x1="750" y1="0" x2="750" y2="500" />
          </g>

          {/* CONTORNOS CONTINENTAIS SIMPLIFICADOS EM SVG */}
          <g fill="#0f172a" stroke="#1e293b" strokeWidth="1" opacity="0.75">
            {/* América do Norte */}
            <path d="M 140 100 L 260 90 L 320 120 L 290 190 L 250 240 L 220 280 L 190 260 L 170 210 L 130 170 Z" />
            {/* América do Sul */}
            <path d="M 270 280 L 340 300 L 370 360 L 340 430 L 300 460 L 280 400 L 260 330 Z" />
            {/* Europa */}
            <path d="M 460 110 L 540 100 L 570 140 L 540 190 L 480 180 L 460 140 Z" />
            {/* África */}
            <path d="M 460 210 L 560 200 L 600 270 L 570 370 L 510 400 L 460 320 Z" />
            {/* Ásia */}
            <path d="M 580 100 L 800 80 L 880 140 L 850 240 L 760 290 L 650 250 L 590 190 Z" />
            {/* Oceania */}
            <path d="M 780 340 L 880 340 L 910 400 L 860 440 L 790 410 Z" />
          </g>

          {/* ROTAS DE FIBRA ÓPTICA ANYCAST (CONECTANDO SP1 AOS OUTROS NÓS) */}
          {showRoutes && nodes.filter(n => n.id !== 'sp1').map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            // Curva de Bezier para simular rotas submarinas em grande círculo
            const midX = (primaryNode.x + node.x) / 2;
            const midY = (primaryNode.y + node.y) / 2 - 40;
            const pathD = `M ${primaryNode.x} ${primaryNode.y} Q ${midX} ${midY} ${node.x} ${node.y}`;

            return (
              <g key={`route-${node.id}`}>
                {/* Linha base */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isHovered ? '#00e5ff' : isSelected ? '#06b6d4' : '#334155'}
                  strokeWidth={isHovered ? '2.8' : isSelected ? '2' : '1'}
                  strokeDasharray={isHovered || isSelected ? 'none' : '4,4'}
                  opacity={isHovered ? 1 : isSelected ? 0.9 : 0.4}
                  filter={isHovered ? 'url(#strongNeonGlow)' : undefined}
                />

                {/* Pulso animado de pacote ICMP navegando pela rota */}
                {isPinging && (
                  <circle 
                    r={isHovered ? 4.5 : isSelected ? 3.5 : 2.5} 
                    fill={isHovered ? '#00e5ff' : isSelected ? '#22d3ee' : '#818cf8'} 
                    filter="url(#neonGlow)"
                  >
                    <animateMotion
                      path={pathD}
                      dur={`${Math.max(1.2, node.baseLatencyMs / 65)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* NÓS DE DATACENTER (PONTOS INTERATIVOS COM DETECÇÃO DE HOVER) */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isCore = node.status === 'PRIMARY_CORE';

            return (
              <g 
                key={node.id} 
                className="cursor-pointer group/node"
                onClick={() => setSelectedNodeId(node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
              >
                {/* Hit target invisível expandido para facilitar hover com mouse */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="24"
                  fill="transparent"
                  className="pointer-events-auto"
                />

                {/* Halo pulsante para nó Core, nó selecionado ou nó hovered */}
                {(isCore || isSelected || isHovered) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isHovered ? 20 : isCore ? 16 : 13}
                    fill={isHovered ? '#00e5ff' : isCore ? '#ef4444' : '#06b6d4'}
                    opacity={isHovered ? 0.45 : 0.25}
                    className="animate-ping"
                  />
                )}

                {/* Anel de destaque em estado de hover */}
                {isHovered && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="11"
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth="2"
                    filter="url(#neonGlow)"
                    className="animate-pulse"
                  />
                )}

                {/* Círculo externo do nó */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? 8 : isCore ? 8 : 6}
                  fill={isHovered ? '#00e5ff' : isCore ? '#dc2626' : isSelected ? '#06b6d4' : '#1e293b'}
                  stroke={isHovered ? '#ffffff' : isSelected ? '#ffffff' : isCore ? '#fca5a5' : '#38bdf8'}
                  strokeWidth={isHovered || isSelected ? 2.5 : 1.5}
                  filter="url(#neonGlow)"
                />

                {/* Círculo interno */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? 4 : isCore ? 3.5 : 2.5}
                  fill={isHovered ? '#020617' : '#ffffff'}
                />

                {/* Etiqueta de Latência Flutuante */}
                <g transform={`translate(${node.x}, ${node.y - 12})`}>
                  <rect
                    x="-32"
                    y="-16"
                    width="64"
                    height="16"
                    rx="4"
                    fill={isHovered ? '#020617' : isSelected ? '#0f172a' : '#020617'}
                    stroke={isHovered ? '#00e5ff' : isSelected ? '#06b6d4' : '#334155'}
                    strokeWidth={isHovered ? '1.5' : '0.8'}
                    opacity="0.95"
                    filter={isHovered ? 'url(#neonGlow)' : undefined}
                  />
                  <text
                    x="0"
                    y="-5"
                    textAnchor="middle"
                    fill={isHovered ? '#00e5ff' : isCore ? '#4ade80' : isSelected ? '#38bdf8' : '#e2e8f0'}
                    fontSize="9px"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="bold"
                  >
                    {node.currentLatencyMs}ms
                  </text>
                </g>

                {/* Nome da Cidade */}
                <text
                  x={node.x}
                  y={node.y + 18}
                  textAnchor="middle"
                  fill={isHovered ? '#38bdf8' : '#94a3b8'}
                  fontSize={isHovered ? '9.5px' : '8.5px'}
                  fontFamily="system-ui, sans-serif"
                  fontWeight={isHovered ? 'bold' : '600'}
                >
                  {node.city}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 🌟 TOOLTIP INTERATIVO COM STATUS REGIONAL E ESTATÍSTICAS DE PING NO HOVER */}
        {hoveredNode && (() => {
          const pos = getTooltipPosition(hoveredNode);
          const isCore = hoveredNode.status === 'PRIMARY_CORE';

          return (
            <div 
              className={`absolute z-30 pointer-events-none w-80 sm:w-88 transition-all duration-150 ease-out animate-in fade-in zoom-in-95 ${pos.className}`}
              style={pos.style}
            >
              <div className="bg-slate-950/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl p-3.5 shadow-[0_0_30px_rgba(6,182,212,0.35)] text-xs font-mono text-slate-200 space-y-2.5">
                
                {/* Top Strip: Status do Servidor Regional & Região */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isCore ? 'bg-rose-400 animate-ping' : 'bg-emerald-400 animate-ping'}`} />
                      <strong className="text-white text-xs truncate">
                        {hoveredNode.name}
                      </strong>
                    </div>
                    <p className="text-[10px] text-cyan-300 truncate mt-0.5">
                      {hoveredNode.city}, {hoveredNode.country} · {hoveredNode.region}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider shrink-0 border ${
                    isCore 
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/50' 
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                  }`}>
                    {hoveredNode.status === 'PRIMARY_CORE' ? 'CORE B3' : 'EDGE ANYCAST'}
                  </span>
                </div>

                {/* Grade de Estatísticas de Ping ICMP */}
                <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Activity className="w-3 h-3 text-cyan-400" />
                      Ping Atual (ICMP RTT)
                    </span>
                    <span className={`text-base font-black ${
                      hoveredNode.currentLatencyMs < 20 
                        ? 'text-emerald-400' 
                        : hoveredNode.currentLatencyMs < 150 
                          ? 'text-cyan-400' 
                          : 'text-amber-400'
                    }`}>
                      {hoveredNode.currentLatencyMs} ms
                    </span>
                  </div>

                  {/* Resumo Estatístico: Mín, Méd, Máx e Jitter */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-800/80 text-center">
                    <div className="bg-slate-950/80 rounded p-1 border border-slate-800">
                      <span className="text-[8px] text-slate-500 block uppercase">Mínimo</span>
                      <strong className="text-[10px] text-emerald-400">{hoveredNode.minPingMs}ms</strong>
                    </div>
                    <div className="bg-slate-950/80 rounded p-1 border border-slate-800">
                      <span className="text-[8px] text-slate-500 block uppercase">Média</span>
                      <strong className="text-[10px] text-cyan-300">{hoveredNode.avgPingMs}ms</strong>
                    </div>
                    <div className="bg-slate-950/80 rounded p-1 border border-slate-800">
                      <span className="text-[8px] text-slate-500 block uppercase">Máximo</span>
                      <strong className="text-[10px] text-amber-300">{hoveredNode.maxPingMs}ms</strong>
                    </div>
                    <div className="bg-slate-950/80 rounded p-1 border border-slate-800">
                      <span className="text-[8px] text-slate-500 block uppercase">Jitter</span>
                      <strong className="text-[10px] text-sky-400">±{hoveredNode.jitterMs}ms</strong>
                    </div>
                  </div>

                  {/* Mini-Gráfico Histórico de Ping das últimas 10 amostras */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
                      <span>Histórico Recente de Ping</span>
                      <span className="text-emerald-400 font-bold">Perda: {hoveredNode.packetLoss}</span>
                    </div>
                    <div className="h-6 flex items-end gap-1 bg-slate-950/80 p-1 rounded border border-slate-800/80">
                      {hoveredNode.pingHistory.map((ping, idx) => {
                        const min = hoveredNode.minPingMs;
                        const max = hoveredNode.maxPingMs;
                        const range = Math.max(0.5, max - min);
                        const heightPercent = Math.min(100, Math.max(25, ((ping - min) / range) * 75 + 25));
                        return (
                          <div 
                            key={idx}
                            className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-xs transition-all duration-300"
                            style={{ height: `${heightPercent}%` }}
                            title={`${ping} ms`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Status do Servidor Regional & Infraestrutura */}
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Server className="w-3 h-3 text-cyan-400" />
                      Hardware / Tier:
                    </span>
                    <span className="text-slate-200 font-semibold text-right truncate max-w-[170px]" title={hoveredNode.hardware}>
                      {hoveredNode.tier}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-indigo-400" />
                      Ponto de Peering:
                    </span>
                    <span className="text-cyan-300 font-semibold truncate max-w-[170px]" title={hoveredNode.peeringExchange}>
                      {hoveredNode.peeringExchange}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Disponibilidade SLA:
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {hoveredNode.uptimeSla} ({hoveredNode.serverHealth})
                    </span>
                  </div>

                  {/* Carga de CPU & Memória do Servidor */}
                  <div className="pt-1.5 border-t border-slate-800 grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center justify-between text-[9px] mb-0.5">
                        <span className="text-slate-400">Carga CPU</span>
                        <span className="text-white font-bold">{hoveredNode.cpuLoadPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-cyan-400 h-full rounded-full transition-all"
                          style={{ width: `${hoveredNode.cpuLoadPercent}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[9px] mb-0.5">
                        <span className="text-slate-400">Edge Workers</span>
                        <span className="text-cyan-300 font-bold">{hoveredNode.activeEdgeWorkers}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-400 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, hoveredNode.activeEdgeWorkers / 2)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rodapé do Tooltip */}
                <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                    {hoveredNode.routingProtocol}
                  </span>
                  <span className="text-cyan-400/80">Clique p/ travar</span>
                </div>

              </div>
            </div>
          );
        })()}

        {/* HUD SOBREPOSTO: DETALHES DO NÓ SELECIONADO */}
        <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 border border-slate-800 rounded-xl p-3 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${
              selectedNode.status === 'PRIMARY_CORE'
                ? 'bg-red-950/80 border-red-800 text-red-400'
                : 'bg-cyan-950/80 border-cyan-800 text-cyan-400'
            }`}>
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  {selectedNode.name} ({selectedNode.city}, {selectedNode.country})
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                  {selectedNode.region}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {selectedNode.tier} · Hardware: <strong className="text-slate-300">{selectedNode.hardware}</strong> · Peering: <strong className="text-cyan-300">{selectedNode.peeringExchange}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Latência ICMP</span>
              <span className={`text-base font-black ${
                selectedNode.currentLatencyMs < 20 ? 'text-emerald-400' : selectedNode.currentLatencyMs < 150 ? 'text-cyan-400' : 'text-amber-400'
              }`}>
                {selectedNode.currentLatencyMs} ms
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Largura de Banda</span>
              <span className="text-xs font-bold text-white">{selectedNode.bandwidth}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Perda de Pacotes</span>
              <span className="text-xs font-bold text-emerald-400">{selectedNode.packetLoss}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. GRID INFERIOR DE ESTATÍSTICAS DA REDE MUNDIAL */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 font-mono">
        <div className="bg-slate-100/70 dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">ALCANCE GLOBAL</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base font-bold text-slate-900 dark:text-white">6 Continentes</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">9 Datacenters</span>
          </div>
        </div>

        <div className="bg-slate-100/70 dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">LATÊNCIA MÉDIA GLOBAL</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base font-bold text-cyan-600 dark:text-cyan-400">118.6 ms</span>
            <span className="text-[10px] text-slate-500">RTT Anycast</span>
          </div>
        </div>

        <div className="bg-slate-100/70 dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">BACKBONE ANYCAST</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">940 Tbps</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">100% Ativo</span>
          </div>
        </div>

        <div className="bg-slate-100/70 dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">SLA DE REDE</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">99.999%</span>
            <span className="text-[10px] text-slate-500">Subsea Fiber</span>
          </div>
        </div>
      </div>

      {/* 4. RODAPÉ DE AÇÕES */}
      <div className="pt-3 mt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Roteamento Anycast com mitigação anti-DDoS BGP no nível de borda
        </span>

        {onNavigateTelemetry && (
          <button
            onClick={onNavigateTelemetry}
            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            Ver Telemetria Detalhada dos Nós →
          </button>
        )}
      </div>

    </div>
  );
};
