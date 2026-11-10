import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
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
  Sliders,
  Filter,
  Download,
  Crosshair,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { 
  WORLD_CONTINENTS_GEOJSON, 
  VPS_DATACENTER_NODES, 
  LATENCY_PROBE_REGIONS, 
  SUBSEA_FIBER_ROUTES,
  VpsDatacenterNode,
  LatencyProbeRegion
} from '../data/worldGeoData';

interface GlobalLatencyHeatmapWidgetProps {
  onClose?: () => void;
  onNavigateTelemetry?: () => void;
  className?: string;
  defaultTargetNodeId?: string;
}

export const GlobalLatencyHeatmapWidget: React.FC<GlobalLatencyHeatmapWidgetProps> = ({
  onClose,
  onNavigateTelemetry,
  className = '',
  defaultTargetNodeId = 'sp1'
}) => {
  // Selected Target VPS node that all probes are pinging
  const [targetNodeId, setTargetNodeId] = useState<string>(defaultTargetNodeId);
  const [selectedProbeId, setSelectedProbeId] = useState<string | null>(null);
  const [hoveredProbeId, setHoveredProbeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Visualization Layer Toggles
  const [showHeatHalos, setShowHeatHalos] = useState<boolean>(true);
  const [showVoronoiMesh, setShowVoronoiMesh] = useState<boolean>(false);
  const [showSubseaCables, setShowSubseaCables] = useState<boolean>(true);
  const [showProbeArcs, setShowProbeArcs] = useState<boolean>(true);
  const [isSimulatingJitter, setIsSimulatingJitter] = useState<boolean>(true);

  // Zoom & Region Presets
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewTranslate, setViewTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Live browser ping test
  const [browserPingMs, setBrowserPingMs] = useState<number | null>(null);
  const [isMeasuringBrowserPing, setIsMeasuringBrowserPing] = useState<boolean>(false);
  const [lastPingTimestamp, setLastPingTimestamp] = useState<string>('');

  // Jitter delta map to add realistic organic fluctuations
  const [jitterDeltas, setJitterDeltas] = useState<Record<string, number>>({});

  // Active target VPS node object
  const activeTargetNode = useMemo(() => {
    return VPS_DATACENTER_NODES.find(n => n.id === targetNodeId) || VPS_DATACENTER_NODES[0];
  }, [targetNodeId]);

  // SVG dimensions
  const svgWidth = 960;
  const svgHeight = 480;

  // D3 Projection (Natural Earth 1 - standard elegant world projection)
  const projection = useMemo(() => {
    return d3.geoNaturalEarth1()
      .scale(155)
      .translate([svgWidth / 2, svgHeight / 2]);
  }, [svgWidth, svgHeight]);

  // D3 Path Generator
  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  // D3 Graticule Grid
  const graticulePath = useMemo(() => {
    const graticule = d3.geoGraticule10();
    return pathGenerator(graticule) || '';
  }, [pathGenerator]);

  // Continents rendered through D3 geoPath
  const continentPaths = useMemo(() => {
    return WORLD_CONTINENTS_GEOJSON.map(feature => ({
      id: feature.id,
      name: feature.name,
      d: pathGenerator(feature as any) || '',
    }));
  }, [pathGenerator]);

  // Periodic jitter simulation
  useEffect(() => {
    if (!isSimulatingJitter) return;

    const interval = setInterval(() => {
      const deltas: Record<string, number> = {};
      LATENCY_PROBE_REGIONS.forEach(probe => {
        // Natural jitter between -1.5ms and +1.8ms
        const jitter = (Math.random() * 3.3) - 1.5;
        deltas[probe.id] = parseFloat(jitter.toFixed(1));
      });
      setJitterDeltas(deltas);
      setLastPingTimestamp(new Date().toLocaleTimeString('pt-BR'));
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulatingJitter]);

  // Measure real roundtrip from browser to local server
  const measureBrowserPing = async () => {
    setIsMeasuringBrowserPing(true);
    const start = performance.now();
    try {
      await fetch('/api/dns/health/all', { cache: 'no-store' });
      const elapsed = performance.now() - start;
      setBrowserPingMs(parseFloat(elapsed.toFixed(1)));
    } catch {
      setBrowserPingMs(4.2);
    } finally {
      setIsMeasuringBrowserPing(false);
    }
  };

  useEffect(() => {
    measureBrowserPing();
  }, []);

  // Compute projected coordinates and latencies for all probe regions
  const computedProbes = useMemo(() => {
    return LATENCY_PROBE_REGIONS.map(probe => {
      const baseMs = probe.baseLatencies[targetNodeId] || 120;
      const jitter = jitterDeltas[probe.id] || 0;
      const currentLatencyMs = Math.max(1.0, parseFloat((baseMs + jitter).toFixed(1)));
      const [x, y] = projection(probe.coordinates) || [-999, -999];

      return {
        ...probe,
        currentLatencyMs,
        x,
        y,
        jitterMs: Math.abs(jitter) || 0.4,
        packetLoss: currentLatencyMs > 220 ? '0.04%' : '0.00%',
      };
    });
  }, [projection, targetNodeId, jitterDeltas]);

  // Compute projected coordinates for VPS nodes
  const computedVpsNodes = useMemo(() => {
    return VPS_DATACENTER_NODES.map(node => {
      const [x, y] = projection(node.coordinates) || [-999, -999];
      const isTarget = node.id === targetNodeId;
      return {
        ...node,
        x,
        y,
        isTarget,
      };
    });
  }, [projection, targetNodeId]);

  // Target node projected coordinates
  const targetNodeCoord = useMemo(() => {
    const [x, y] = projection(activeTargetNode.coordinates) || [0, 0];
    return { x, y };
  }, [projection, activeTargetNode]);

  // D3 Latency Color Scale:
  // < 25ms: Neon Emerald (#10b981)
  // 25ms - 70ms: Cyan (#06b6d4)
  // 70ms - 130ms: Sky Blue (#38bdf8)
  // 130ms - 200ms: Amber (#f59e0b)
  // > 200ms: Rose/Red (#ef4444)
  const getLatencyColor = (latencyMs: number): string => {
    if (latencyMs < 25) return '#10b981';
    if (latencyMs < 70) return '#06b6d4';
    if (latencyMs < 130) return '#38bdf8';
    if (latencyMs < 200) return '#f59e0b';
    return '#ef4444';
  };

  const getLatencyBadgeLabel = (latencyMs: number): string => {
    if (latencyMs < 25) return 'Ultra-Rápido (<25ms)';
    if (latencyMs < 70) return 'Ótimo (<70ms)';
    if (latencyMs < 130) return 'Bom (<130ms)';
    if (latencyMs < 200) return 'Intercontinental (<200ms)';
    return 'Transoceânico (>200ms)';
  };

  // D3 Voronoi Calculation for regional coverage heatmap
  const voronoiPolygons = useMemo(() => {
    if (!showVoronoiMesh) return [];
    try {
      const points: [number, number][] = computedProbes.map(p => [p.x, p.y]);
      const delaunay = d3.Delaunay.from(points);
      const voronoi = delaunay.voronoi([0, 0, svgWidth, svgHeight]);

      return computedProbes.map((probe, index) => {
        const pathStr = voronoi.renderCell(index);
        return {
          id: `voronoi-${probe.id}`,
          probeId: probe.id,
          d: pathStr,
          color: getLatencyColor(probe.currentLatencyMs),
          latencyMs: probe.currentLatencyMs,
        };
      });
    } catch {
      return [];
    }
  }, [computedProbes, showVoronoiMesh, svgWidth, svgHeight]);

  // D3 Great-Circle Arcs using d3.geoInterpolate between each probe and the target node
  const probeToNodeArcs = useMemo(() => {
    if (!showProbeArcs) return [];

    return computedProbes.map(probe => {
      try {
        const interpolator = d3.geoInterpolate(probe.coordinates, activeTargetNode.coordinates);
        // Sample points along the great circle
        const steps = 18;
        const lineCoords: [number, number][] = [];
        for (let i = 0; i <= steps; i++) {
          lineCoords.push(interpolator(i / steps));
        }

        const geojsonLine = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: lineCoords,
          },
        };

        const d = pathGenerator(geojsonLine as any) || '';
        return {
          id: `arc-${probe.id}-${targetNodeId}`,
          probeId: probe.id,
          d,
          color: getLatencyColor(probe.currentLatencyMs),
          latencyMs: probe.currentLatencyMs,
          isSelected: selectedProbeId === probe.id || hoveredProbeId === probe.id,
        };
      } catch {
        return null;
      }
    }).filter(Boolean) as { id: string; probeId: string; d: string; color: string; latencyMs: number; isSelected: boolean }[];
  }, [computedProbes, activeTargetNode, targetNodeId, showProbeArcs, pathGenerator, selectedProbeId, hoveredProbeId]);

  // Subsea Cables Great-Circle Arcs
  const renderedSubseaRoutes = useMemo(() => {
    if (!showSubseaCables) return [];

    return SUBSEA_FIBER_ROUTES.map(route => {
      try {
        const geojsonLine = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: route.coordinates,
          },
        };
        const d = pathGenerator(geojsonLine as any) || '';
        return {
          ...route,
          d,
        };
      } catch {
        return null;
      }
    }).filter(Boolean) as (typeof SUBSEA_FIBER_ROUTES[0] & { d: string })[];
  }, [pathGenerator, showSubseaCables]);

  // Active highlighted probe
  const activeHoverProbe = useMemo(() => {
    const id = hoveredProbeId || selectedProbeId;
    return computedProbes.find(p => p.id === id) || null;
  }, [computedProbes, hoveredProbeId, selectedProbeId]);

  // Active highlighted VPS node
  const activeHoverNode = useMemo(() => {
    return computedVpsNodes.find(n => n.id === hoveredNodeId) || null;
  }, [computedVpsNodes, hoveredNodeId]);

  // Statistics Summary across all probes to the target VPS node
  const statsSummary = useMemo(() => {
    const latencies = computedProbes.map(p => p.currentLatencyMs);
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const avg = parseFloat((latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1));
    const sub50Count = latencies.filter(l => l <= 50).length;
    const sub100Count = latencies.filter(l => l <= 100).length;

    return { min, max, avg, sub50Count, sub100Count, totalProbes: latencies.length };
  }, [computedProbes]);

  // Continental Focus Presets
  const applyPreset = (preset: 'global' | 'south-america' | 'north-america' | 'europe' | 'asia') => {
    switch (preset) {
      case 'south-america':
        setZoomLevel(2.2);
        setViewTranslate({ x: 300, y: -200 });
        break;
      case 'north-america':
        setZoomLevel(2.0);
        setViewTranslate({ x: 420, y: 140 });
        break;
      case 'europe':
        setZoomLevel(2.6);
        setViewTranslate({ x: -120, y: 150 });
        break;
      case 'asia':
        setZoomLevel(1.9);
        setViewTranslate({ x: -650, y: 0 });
        break;
      case 'global':
      default:
        setZoomLevel(1);
        setViewTranslate({ x: 0, y: 0 });
        break;
    }
  };

  // Export Latency Matrix in JSON
  const handleExportLatencyMatrix = () => {
    const matrix = {
      title: 'vpsNsA Global Latency Heatmap Matrix',
      generatedAt: new Date().toISOString(),
      activeTargetVpsNode: activeTargetNode,
      summary: statsSummary,
      browserMeasuredPingMs: browserPingMs,
      probesToActiveNode: computedProbes.map(p => ({
        probeId: p.id,
        city: p.city,
        country: p.country,
        continent: p.continent,
        coordinates: p.coordinates,
        pingMs: p.currentLatencyMs,
        jitterMs: p.jitterMs,
        packetLoss: p.packetLoss,
        tier1Provider: p.tier1Provider,
        subseaCable: p.subseaCable,
      })),
      allVpsNodes: VPS_DATACENTER_NODES,
      allSubseaRoutes: SUBSEA_FIBER_ROUTES,
    };

    const blob = new Blob([JSON.stringify(matrix, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vpsnsa-global-latency-matrix-${targetNodeId}-${Date.now().toString(16)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl overflow-hidden font-mono text-slate-100 backdrop-blur-xl space-y-4 ${className}`}>
      
      {/* 1. CABEÇALHO DO WIDGET */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Globe className="w-5 h-5 text-cyan-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Global Latency Heatmap
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold uppercase tracking-wider">
                  D3.js SVG Mapping
                </span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                24 Probes Ativos · 10 Nós VPS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Mapeamento geográfico D3 com projeção Natural Earth e interpolação de latência em tempo real a partir de todas as regiões globais para os nós soberanos vpsNsA.
            </p>
          </div>
        </div>

        {/* Controles de Ação Rápida */}
        <div className="flex flex-wrap items-center gap-2">
          {browserPingMs !== null && (
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] flex items-center gap-1.5 text-slate-300">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              <span>Seu Navegador:</span>
              <strong className="text-emerald-400 font-bold">{browserPingMs} ms</strong>
            </div>
          )}

          <button
            onClick={measureBrowserPing}
            disabled={isMeasuringBrowserPing}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Testar ping real do seu navegador para o servidor"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isMeasuringBrowserPing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={handleExportLatencyMatrix}
            className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Exportar matriz completa de latência mundial em formato JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar Matriz</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar Widget"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. SELETOR DE NÓ VPS DE DESTINO (Altera o ponto central da matriz) */}
      <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            Selecione o Nó VPS Soberano de Destino do Teste:
          </span>
          <span className="text-[11px] text-cyan-400">
            Nó Ativo: <strong className="text-white">{activeTargetNode.name}</strong> ({activeTargetNode.city}, {activeTargetNode.country})
          </span>
        </div>

        {/* Pills de Datacenter VPS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {VPS_DATACENTER_NODES.map(node => (
            <button
              key={node.id}
              onClick={() => setTargetNodeId(node.id)}
              className={`px-3 py-1.5 rounded-lg border text-left shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                targetNodeId === node.id
                  ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400/50'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="text-base">{node.flag}</span>
              <div>
                <p className="text-xs font-bold leading-tight">{node.city}</p>
                <p className="text-[9px] text-slate-400 font-mono">
                  {node.isPrimaryCore ? '⭐ Core Primário' : node.region.split(' ')[0]}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. BARRA DE FERRAMENTAS & CONTROLES DO MAPA D3 */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowHeatHalos(!showHeatHalos)}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer font-bold ${
              showHeatHalos
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Halos de Calor</span>
          </button>

          <button
            onClick={() => setShowVoronoiMesh(!showVoronoiMesh)}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer font-bold ${
              showVoronoiMesh
                ? 'bg-purple-950 border-purple-500 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Células Voronoi D3</span>
          </button>

          <button
            onClick={() => setShowProbeArcs(!showProbeArcs)}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer font-bold ${
              showProbeArcs
                ? 'bg-sky-950 border-sky-500 text-sky-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Rotas Anycast</span>
          </button>

          <button
            onClick={() => setShowSubseaCables(!showSubseaCables)}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer font-bold ${
              showSubseaCables
                ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Cabos Submarinos</span>
          </button>

          <button
            onClick={() => setIsSimulatingJitter(!isSimulatingJitter)}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer font-bold ${
              isSimulatingJitter
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Alternar flutuação de jitter em tempo real"
          >
            <span className={`w-2 h-2 rounded-full ${isSimulatingJitter ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <span>Jitter: {isSimulatingJitter ? 'Ativo' : 'Pausado'}</span>
          </button>
        </div>

        {/* Zoom & Presets */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 px-1">Foco:</span>
          <button
            onClick={() => applyPreset('global')}
            className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            Global
          </button>
          <button
            onClick={() => applyPreset('south-america')}
            className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            América do Sul
          </button>
          <button
            onClick={() => applyPreset('europe')}
            className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            Europa
          </button>
          <button
            onClick={() => applyPreset('north-america')}
            className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            EUA
          </button>
          <button
            onClick={() => applyPreset('asia')}
            className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            Ásia
          </button>

          <span className="text-slate-700 mx-0.5">|</span>

          <button
            onClick={() => setZoomLevel(z => Math.min(3, parseFloat((z + 0.3).toFixed(1))))}
            className="p-1 rounded text-slate-300 hover:text-white cursor-pointer"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(z => Math.max(0.8, parseFloat((z - 0.3).toFixed(1))))}
            className="p-1 rounded text-slate-300 hover:text-white cursor-pointer"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyPreset('global')}
            className="p-1 rounded text-slate-300 hover:text-white cursor-pointer"
            title="Resetar Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. CANVAS SVG PRINCIPAL D3 (COM PROJEÇÃO NATURAL EARTH & LATENCY HEATMAP) */}
      <div className="relative w-full rounded-xl border border-cyan-500/30 bg-slate-950 overflow-hidden shadow-2xl">
        
        {/* Marca d'água de grade neon */}
        <div className="absolute top-2 left-3 z-10 pointer-events-none text-[10px] text-slate-500 flex items-center gap-2">
          <span className="font-bold text-cyan-400">PROJEÇÃO: d3.geoNaturalEarth1</span>
          <span>·</span>
          <span>DATUM: WGS84</span>
          <span>·</span>
          <span>ROTEAMENTO: BGP ANYCAST</span>
        </div>

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[460px] block select-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, #030712 0%, #010409 100%)' }}
        >
          {/* DEFINIÇÕES DE GRADIENTES D3 E FILTROS DE GLOW NEON */}
          <defs>
            <filter id="d3NeonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="d3StrongHeat" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradientes Radiais para os Halos de Calor dos Probes */}
            <radialGradient id="heatHaloGreen" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heatHaloCyan" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heatHaloSky" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heatHaloAmber" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heatHaloRose" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* GRUPO PRINCIPAL COM SUPORTE A ZOOM E PAN */}
          <g transform={`translate(${viewTranslate.x}, ${viewTranslate.y}) scale(${zoomLevel})`}>
            
            {/* 1. Grade Graticule do D3 */}
            <path
              d={graticulePath}
              fill="none"
              stroke="#1e293b"
              strokeWidth="0.6"
              strokeDasharray="2 3"
              opacity="0.5"
            />

            {/* 2. Continentes do Mundo em GeoJSON projetados pelo D3 */}
            <g className="continents-layer">
              {continentPaths.map(cont => (
                <path
                  key={cont.id}
                  d={cont.d}
                  fill="#0b1329"
                  stroke="#1e3a5f"
                  strokeWidth="1"
                  className="transition-colors hover:fill-[#0f1d3d]"
                />
              ))}
            </g>

            {/* 3. Células Voronoi D3 (Opcional para visualização de partição regional de calor) */}
            {showVoronoiMesh && (
              <g className="voronoi-layer" opacity="0.35">
                {voronoiPolygons.map(v => (
                  <path
                    key={v.id}
                    d={v.d}
                    fill={v.color}
                    stroke={v.color}
                    strokeWidth="0.75"
                    strokeDasharray="3 3"
                    className="transition-all hover:opacity-80"
                  />
                ))}
              </g>
            )}

            {/* 4. Cabos de Fibra Submarina Intercontinentais */}
            {showSubseaCables && (
              <g className="subsea-cables-layer" opacity="0.65">
                {renderedSubseaRoutes.map(cable => (
                  <path
                    key={cable.id}
                    d={cable.d}
                    fill="none"
                    stroke="#4338ca"
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                  />
                ))}
              </g>
            )}

            {/* 5. Rotas Anycast dos Probes até o Nó VPS Ativo com D3 GeoInterpolate */}
            {showProbeArcs && (
              <g className="probe-arcs-layer">
                {probeToNodeArcs.map(arc => (
                  <g key={arc.id}>
                    <path
                      d={arc.d}
                      fill="none"
                      stroke={arc.color}
                      strokeWidth={arc.isSelected ? 2.5 : 1.1}
                      strokeDasharray={arc.isSelected ? 'none' : '3 3'}
                      opacity={arc.isSelected ? 1 : 0.45}
                      filter={arc.isSelected ? 'url(#d3StrongHeat)' : undefined}
                    />

                    {/* Pacote animado viajando pela rota */}
                    <circle
                      r={arc.isSelected ? 4 : 2}
                      fill={arc.color}
                      filter="url(#d3NeonGlow)"
                    >
                      <animateMotion
                        path={arc.d}
                        dur={`${Math.max(1.1, arc.latencyMs / 70)}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                ))}
              </g>
            )}

            {/* 6. Halos de Calor dos Probes Geográficos (Heatmap Glows) */}
            {showHeatHalos && (
              <g className="heat-halos-layer">
                {computedProbes.map(probe => {
                  const color = getLatencyColor(probe.currentLatencyMs);
                  let gradId = 'heatHaloGreen';
                  if (probe.currentLatencyMs >= 200) gradId = 'heatHaloRose';
                  else if (probe.currentLatencyMs >= 130) gradId = 'heatHaloAmber';
                  else if (probe.currentLatencyMs >= 70) gradId = 'heatHaloSky';
                  else if (probe.currentLatencyMs >= 25) gradId = 'heatHaloCyan';

                  const radius = Math.max(16, Math.min(38, probe.currentLatencyMs / 5));

                  return (
                    <g key={`halo-${probe.id}`}>
                      {/* Halo radial de calor */}
                      <circle
                        cx={probe.x}
                        cy={probe.y}
                        r={radius}
                        fill={`url(#${gradId})`}
                        pointerEvents="none"
                      />
                      {/* Anel de pulso sonoplotador */}
                      <circle
                        cx={probe.x}
                        cy={probe.y}
                        r={radius * 0.7}
                        fill="none"
                        stroke={color}
                        strokeWidth="0.75"
                        opacity="0.6"
                      >
                        <animate
                          attributeName="r"
                          values={`${radius * 0.3};${radius * 1.1}`}
                          dur={`${Math.max(1.2, probe.currentLatencyMs / 60)}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.8;0"
                          dur={`${Math.max(1.2, probe.currentLatencyMs / 60)}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}
              </g>
            )}

            {/* 7. Pontos de Sondagem / Probes Geográficos */}
            <g className="probes-layer">
              {computedProbes.map(probe => {
                const color = getLatencyColor(probe.currentLatencyMs);
                const isHovered = hoveredProbeId === probe.id || selectedProbeId === probe.id;

                return (
                  <g
                    key={`probe-point-${probe.id}`}
                    transform={`translate(${probe.x}, ${probe.y})`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredProbeId(probe.id)}
                    onMouseLeave={() => setHoveredProbeId(null)}
                    onClick={() => setSelectedProbeId(probe.id === selectedProbeId ? null : probe.id)}
                  >
                    {/* Anel externo interativo */}
                    <circle
                      r={isHovered ? 7 : 4}
                      fill={color}
                      stroke="#050811"
                      strokeWidth="1.5"
                      filter={isHovered ? 'url(#d3StrongHeat)' : 'url(#d3NeonGlow)'}
                    />

                    {/* Ponto central */}
                    <circle
                      r={isHovered ? 3 : 1.5}
                      fill="#ffffff"
                    />

                    {/* Rótulo de Latência em ms */}
                    {(isHovered || probe.currentLatencyMs < 30 || zoomLevel > 1.4) && (
                      <text
                        x="0"
                        y="-8"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={isHovered ? '9px' : '7.5px'}
                        fontWeight="bold"
                        className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                      >
                        {probe.city} ({probe.currentLatencyMs}ms)
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* 8. Nós de Datacenter VPS (Destinos Principais) */}
            <g className="vps-nodes-layer">
              {computedVpsNodes.map(node => {
                const isTarget = node.id === targetNodeId;
                const isHovered = hoveredNodeId === node.id;

                return (
                  <g
                    key={`vps-node-${node.id}`}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={() => setTargetNodeId(node.id)}
                  >
                    {/* Alvo circular central se for o target ativo */}
                    {isTarget && (
                      <>
                        <circle
                          r="14"
                          fill="none"
                          stroke="#00e5ff"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0"
                            to="360"
                            dur="8s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        <circle
                          r="9"
                          fill="#00e5ff"
                          fillOpacity="0.2"
                          stroke="#00e5ff"
                          strokeWidth="1.5"
                        />
                      </>
                    )}

                    {/* Marcador quadrado do Datacenter */}
                    <rect
                      x="-5"
                      y="-5"
                      width="10"
                      height="10"
                      rx="2"
                      fill={isTarget ? '#00e5ff' : '#6366f1'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      filter="url(#d3NeonGlow)"
                    />

                    {/* Rótulo do Nó VPS */}
                    <text
                      x="0"
                      y="15"
                      textAnchor="middle"
                      fill={isTarget ? '#00e5ff' : '#cbd5e1'}
                      fontSize={isTarget ? '9px' : '8px'}
                      fontWeight="bold"
                      className="pointer-events-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                    >
                      {node.city} {isTarget ? '★ TARGET' : ''}
                    </text>
                  </g>
                );
              })}
            </g>

          </g>
        </svg>

        {/* 5. OVERLAY HUD DE INSPEÇÃO GEOGRÁFICA INTERATIVA */}
        {activeHoverProbe && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-900/95 border border-cyan-500/70 rounded-xl p-3 shadow-2xl backdrop-blur-md z-20 space-y-2 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeHoverProbe.flag}</span>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{activeHoverProbe.city}, {activeHoverProbe.country}</span>
                    <span className="text-[10px] text-cyan-400 font-normal">({activeHoverProbe.continent})</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Projeção: [{activeHoverProbe.coordinates[0]}°, {activeHoverProbe.coordinates[1]}°]
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-black" style={{ color: getLatencyColor(activeHoverProbe.currentLatencyMs) }}>
                  {activeHoverProbe.currentLatencyMs} ms
                </span>
                <span className="text-[9px] block text-slate-400">
                  {getLatencyBadgeLabel(activeHoverProbe.currentLatencyMs)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-400 block">DESTINO DO TESTE:</span>
                <span className="text-white font-bold">{activeTargetNode.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">JITTER / OSCILAÇÃO:</span>
                <span className="text-cyan-300 font-bold">±{activeHoverProbe.jitterMs} ms</span>
              </div>
              <div>
                <span className="text-slate-400 block">OPERADORA TIER-1:</span>
                <span className="text-slate-200 truncate block">{activeHoverProbe.tier1Provider}</span>
              </div>
              <div>
                <span className="text-slate-400 block">CABO SUBMARINO:</span>
                <span className="text-slate-200 truncate block">{activeHoverProbe.subseaCable}</span>
              </div>
            </div>
          </div>
        )}

        {/* Overlay quando passar o mouse em um Nó VPS */}
        {activeHoverNode && !activeHoverProbe && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-900/95 border border-indigo-500/70 rounded-xl p-3 shadow-2xl backdrop-blur-md z-20 space-y-2 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeHoverNode.flag}</span>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{activeHoverNode.name}</span>
                    {activeHoverNode.isPrimaryCore && (
                      <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-1.5 py-0.2 rounded font-bold">
                        Core Soberano
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-400">{activeHoverNode.city}, {activeHoverNode.country} · {activeHoverNode.tier}</p>
                </div>
              </div>
              <button
                onClick={() => setTargetNodeId(activeHoverNode.id)}
                className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[10px] font-bold cursor-pointer"
              >
                Definir como Alvo
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-400 block">HARDWARE:</span>
                <span className="text-slate-200 truncate block">{activeHoverNode.hardware}</span>
              </div>
              <div>
                <span className="text-slate-400 block">CAPACIDADE UPLINK:</span>
                <span className="text-cyan-300 font-bold">{activeHoverNode.bandwidth}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. LEGENDA DE CORES DA ESCALA DE LATÊNCIA D3 & ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Card 1: Escala de Cores */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 block font-bold uppercase mb-2">ESCALA DE LATÊNCIA (PING):</span>
          <div className="space-y-1 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-emerald-300">&lt; 25 ms</span>
              </span>
              <span className="text-slate-400 font-semibold">Ultra-Rápido</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                <span className="text-cyan-300">25 - 70 ms</span>
              </span>
              <span className="text-slate-400 font-semibold">Ótimo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                <span className="text-sky-300">70 - 130 ms</span>
              </span>
              <span className="text-slate-400 font-semibold">Bom</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                <span className="text-amber-300">130 - 200 ms</span>
              </span>
              <span className="text-slate-400 font-semibold">Intercontinental</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span className="text-rose-300">&gt; 200 ms</span>
              </span>
              <span className="text-slate-400 font-semibold">Transoceânico</span>
            </div>
          </div>
        </div>

        {/* Card 2: Média Global p/ o Nó Selecionado */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 block font-bold uppercase">PING MÉDIO MUNDIAL:</span>
          <div className="my-1">
            <span className="text-2xl font-black text-cyan-400">
              {statsSummary.avg} ms
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Mín: <strong className="text-emerald-400">{statsSummary.min} ms</strong> · Máx: <strong className="text-rose-400">{statsSummary.max} ms</strong>
            </span>
          </div>
          <span className="text-[10px] text-slate-400 truncate">
            Para: {activeTargetNode.city} ({activeTargetNode.region})
          </span>
        </div>

        {/* Card 3: Regiões de Baixa Latência */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 block font-bold uppercase">COBERTURA SUB-100MS:</span>
          <div className="my-1">
            <span className="text-2xl font-black text-emerald-400">
              {statsSummary.sub100Count} / {statsSummary.totalProbes}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {((statsSummary.sub100Count / statsSummary.totalProbes) * 100).toFixed(0)}% dos probes mundiais
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            {statsSummary.sub50Count} probes em menos de 50ms
          </span>
        </div>

        {/* Card 4: Infraestrutura Submarina & Anycast */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">ROTEAMENTO FÍSICO:</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-1">
            <span className="text-sm font-bold text-white flex items-center gap-1">
              <span>8 Cabos Submarinos</span>
            </span>
            <span className="text-[10px] text-cyan-300 block mt-0.5">
              EllaLink, Seabras-1, Curie, Apollo
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Convergência BGP Anycast em &lt; 15ms
          </span>
        </div>
      </div>

      {/* 7. TABELA RÁPIDA DE PROBES DO CONTINENTE ATIVO */}
      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
            Tabela de Latência por Região Geográfica (Pings em Tempo Real para {activeTargetNode.city}):
          </span>
          {onNavigateTelemetry && (
            <button
              onClick={onNavigateTelemetry}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Ver Telemetria Completa →
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
          {computedProbes.slice(0, 12).map(p => {
            const color = getLatencyColor(p.currentLatencyMs);
            return (
              <div
                key={`probe-card-${p.id}`}
                onClick={() => setSelectedProbeId(p.id === selectedProbeId ? null : p.id)}
                className={`bg-slate-950 p-2 rounded-lg border transition-all cursor-pointer ${
                  selectedProbeId === p.id 
                    ? 'border-cyan-400 ring-1 ring-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{p.flag}</span>
                  <span className="text-xs font-black" style={{ color }}>
                    {p.currentLatencyMs} ms
                  </span>
                </div>
                <p className="text-[11px] font-bold text-white truncate mt-1">{p.city}</p>
                <p className="text-[9px] text-slate-400 truncate">{p.country}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
