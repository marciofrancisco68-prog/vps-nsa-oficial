import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  Activity, 
  HardDrive, 
  Wifi, 
  ArrowDownRight, 
  ArrowUpRight, 
  Radio, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Sliders,
  BellRing,
  Check,
  AlertTriangle,
  Cpu
} from 'lucide-react';
import { ContainerItem, ContainerResourceThreshold } from '../types';
import { 
  getContainerThreshold, 
  saveContainerThreshold, 
  dispatchContainerAlert 
} from '../services/containerThresholdService';

interface ContainerStatsHoverCardProps {
  container: ContainerItem;
}

interface MemoryDataPoint {
  secondsAgo: number;
  percent: number;
  gb: number;
}

export const ContainerStatsHoverCard: React.FC<ContainerStatsHoverCardProps> = ({ container }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Extrai total de GB de container.memoryAllocated (ex: "8 GB DDR5" -> 8)
  const totalGbMatch = container.memoryAllocated.match(/(\d+)\s*GB/i);
  const totalGb = totalGbMatch ? parseInt(totalGbMatch[1], 10) : 8;
  const isStopped = container.status === 'stopped';

  // Seed determinístico para dados iniciais realistas
  const seed = container.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 100;
  const basePercent = isStopped ? 0 : Math.min(90, Math.max(22, 36 + (seed % 32)));

  // Custom Resource Usage Thresholds state
  const [thresholds, setThresholds] = useState<ContainerResourceThreshold>(() => 
    getContainerThreshold(container.id, container.name)
  );
  const [showThresholdConfig, setShowThresholdConfig] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const lastRamAlertRef = useRef<number>(0);
  const lastCpuAlertRef = useRef<number>(0);

  // Estado dos pontos da janela de 30 segundos (15 pontos a cada 2s: -28s até 0s)
  const [memoryHistory, setMemoryHistory] = useState<MemoryDataPoint[]>(() => {
    const initialPoints: MemoryDataPoint[] = [];
    let currentVal = basePercent;
    for (let i = 14; i >= 0; i--) {
      const noise = ((seed * (i + 1) * 17) % 7) - 3.2;
      currentVal = isStopped ? 0 : Math.min(92, Math.max(18, currentVal + noise * 0.3));
      initialPoints.push({
        secondsAgo: i * 2,
        percent: parseFloat(currentVal.toFixed(1)),
        gb: parseFloat(((totalGb * currentVal) / 100).toFixed(2)),
      });
    }
    return initialPoints;
  });

  // Atualização periódica a cada 2 segundos (janela móvel contínua de 30 segundos)
  useEffect(() => {
    if (isStopped) return;

    const interval = setInterval(() => {
      setMemoryHistory(prev => {
        const last = prev[prev.length - 1];
        // Flutuação orgânica (-1.6% a +1.6%)
        const delta = (Math.random() * 3.2) - 1.6;
        const nextPercent = Math.min(92, Math.max(18, last.percent + delta));
        const nextGb = (totalGb * nextPercent) / 100;

        const updated = prev.slice(1).map((pt, idx) => ({
          ...pt,
          secondsAgo: (14 - idx) * 2,
        }));

        updated.push({
          secondsAgo: 0,
          percent: parseFloat(nextPercent.toFixed(1)),
          gb: parseFloat(nextGb.toFixed(2)),
        });

        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isStopped, totalGb]);

  // Cálculos de Status Atual
  const currentPoint = memoryHistory[memoryHistory.length - 1] || { percent: basePercent, gb: 0 };
  const firstPoint = memoryHistory[0] || currentPoint;
  const trendDelta = parseFloat((currentPoint.percent - firstPoint.percent).toFixed(1));
  const minPercent = d3.min(memoryHistory, d => d.percent) || currentPoint.percent;
  const maxPercent = d3.max(memoryHistory, d => d.percent) || currentPoint.percent;

  const usedGb = currentPoint.gb.toFixed(2);
  const cachedGb = isStopped ? '0.00' : (0.35 + (seed % 15) / 100).toFixed(2);
  const freeGb = isStopped ? totalGb.toFixed(2) : Math.max(0, totalGb - currentPoint.gb).toFixed(2);

  // CPU estimada do container
  const baseReq = container.requestsPerSec || 12;
  const containerCpuPercent = isStopped ? 0 : Math.min(96, Math.max(8, Math.round(baseReq * 1.8 + (seed % 28))));

  // Verificação de Limiares Excedidos (Thresholds Exceeded)
  const isMemoryExceeded = thresholds.enabled && !isStopped && currentPoint.percent >= thresholds.memoryThreshold;
  const isCpuExceeded = thresholds.enabled && !isStopped && containerCpuPercent >= thresholds.cpuThreshold;

  // Disparo automático de alerta para o Dashboard de Telemetria (com cooldown inteligente)
  useEffect(() => {
    if (!thresholds.enabled || isStopped) return;
    const now = Date.now();

    if (isMemoryExceeded && now - lastRamAlertRef.current > 25000) {
      lastRamAlertRef.current = now;
      dispatchContainerAlert({
        id: `container-${container.id}-ram-${now}`,
        containerId: container.id,
        containerName: container.name,
        resource: 'memory',
        currentValue: currentPoint.percent,
        thresholdValue: thresholds.memoryThreshold,
        timestamp: new Date().toISOString(),
        message: `Container "${container.name}" excedeu o limiar de Memória: ${currentPoint.percent}% > ${thresholds.memoryThreshold}%.`,
      });
    }

    if (isCpuExceeded && now - lastCpuAlertRef.current > 25000) {
      lastCpuAlertRef.current = now;
      dispatchContainerAlert({
        id: `container-${container.id}-cpu-${now}`,
        containerId: container.id,
        containerName: container.name,
        resource: 'cpu',
        currentValue: containerCpuPercent,
        thresholdValue: thresholds.cpuThreshold,
        timestamp: new Date().toISOString(),
        message: `Container "${container.name}" excedeu o limiar de CPU: ${containerCpuPercent}% > ${thresholds.cpuThreshold}%.`,
      });
    }
  }, [isMemoryExceeded, isCpuExceeded, thresholds.enabled, isStopped, container.id, container.name, currentPoint.percent, containerCpuPercent, thresholds.memoryThreshold, thresholds.cpuThreshold]);

  // Salvar Limiares Customizados
  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    saveContainerThreshold(thresholds);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowThresholdConfig(false);
    }, 1200);
  };

  // Renderização do Gráfico Sparkline D3.js para a janela de 30 segundos
  useEffect(() => {
    if (!svgRef.current || memoryHistory.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 290;
    const height = 52;
    const margin = { top: 6, right: 10, bottom: 6, left: 10 };

    const minVal = Math.max(0, d3.min(memoryHistory, d => d.percent)! - 3);
    const maxVal = Math.min(100, d3.max(memoryHistory, d => d.percent)! + 3);

    const xScale = d3.scaleLinear()
      .domain([28, 0])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([minVal, maxVal])
      .range([height - margin.bottom, margin.top]);

    const gradientId = `d3-sparkline-gradient-${container.id.replace(/[^a-zA-Z0-9]/g, '')}`;

    // Definição de Gradiente Fotônico Ciano/Índigo ou Alerta Vermelho
    const defs = svg.append('defs');
    const linearGradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    const topColor = isMemoryExceeded ? '#f43f5e' : '#00e5ff';
    const bottomColor = isMemoryExceeded ? '#881337' : '#0284c7';

    linearGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', topColor)
      .attr('stop-opacity', 0.45);

    linearGradient.append('stop')
      .attr('offset', '60%')
      .attr('stop-color', bottomColor)
      .attr('stop-opacity', 0.18);

    linearGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', bottomColor)
      .attr('stop-opacity', 0.0);

    // Linha de Referência do Limiar Configurado pelo Usuário
    if (thresholds.enabled && thresholds.memoryThreshold >= minVal && thresholds.memoryThreshold <= maxVal) {
      svg.append('line')
        .attr('x1', margin.left)
        .attr('y1', yScale(thresholds.memoryThreshold))
        .attr('x2', width - margin.right)
        .attr('y2', yScale(thresholds.memoryThreshold))
        .attr('stroke', '#f43f5e')
        .attr('stroke-dasharray', '3,3')
        .attr('stroke-width', 1.2)
        .attr('opacity', 0.85);

      svg.append('text')
        .attr('x', width - margin.right - 2)
        .attr('y', yScale(thresholds.memoryThreshold) - 3)
        .attr('text-anchor', 'end')
        .attr('fill', '#fb7185')
        .attr('font-size', '8px')
        .attr('font-family', 'monospace')
        .text(`Limiar: ${thresholds.memoryThreshold}%`);
    }

    // Gerador de Área Preenchida
    const areaGenerator = d3.area<MemoryDataPoint>()
      .x(d => xScale(d.secondsAgo))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.percent))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(memoryHistory)
      .attr('fill', `url(#${gradientId})`)
      .attr('d', areaGenerator);

    // Gerador de Linha Sparkline
    const lineGenerator = d3.line<MemoryDataPoint>()
      .x(d => xScale(d.secondsAgo))
      .y(d => yScale(d.percent))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(memoryHistory)
      .attr('fill', 'none')
      .attr('stroke', topColor)
      .attr('stroke-width', 1.85)
      .attr('stroke-linecap', 'round')
      .attr('filter', isMemoryExceeded ? 'drop-shadow(0 0 5px rgba(244, 63, 94, 0.9))' : 'drop-shadow(0 0 4px rgba(0, 229, 255, 0.8))')
      .attr('d', lineGenerator);

    // Ponto Atual Pulsante (Timestamp Agora: 0s)
    const latestPoint = memoryHistory[memoryHistory.length - 1];
    if (latestPoint && !isStopped) {
      svg.append('circle')
        .attr('cx', xScale(0))
        .attr('cy', yScale(latestPoint.percent))
        .attr('r', 5)
        .attr('fill', 'none')
        .attr('stroke', topColor)
        .attr('stroke-width', 1.2)
        .attr('opacity', 0.65);

      svg.append('circle')
        .attr('cx', xScale(0))
        .attr('cy', yScale(latestPoint.percent))
        .attr('r', 2.8)
        .attr('fill', '#ffffff')
        .attr('stroke', topColor)
        .attr('stroke-width', 1.5);
    }
  }, [memoryHistory, isStopped, container.id, isMemoryExceeded, thresholds.memoryThreshold, thresholds.enabled]);

  // Bandwidth
  const ingressMbpsVal = isStopped ? 0 : Math.max(2.4, Number((baseReq * 0.45 + (seed % 15)).toFixed(1)));
  const egressMbpsVal = isStopped ? 0 : Math.max(8.1, Number((baseReq * 1.6 + (seed % 35)).toFixed(1)));
  const ingressMbps = ingressMbpsVal.toFixed(1);
  const egressMbps = egressMbpsVal.toFixed(1);
  const totalMbps = (ingressMbpsVal + egressMbpsVal).toFixed(1);
  const packetsPerSec = isStopped ? 0 : Math.round(baseReq * 24 + (seed * 8) + 120);
  const tcpConnections = isStopped ? 0 : Math.round(baseReq * 3.5 + (seed % 40) + 18);
  const monthlyTransferredGb = ((seed * 3.8) + 142.5).toFixed(1);

  return (
    <div className="relative inline-block group/hovercard">
      {/* Botão de Disparo / Badge com Efeito Reativo e Indicação de Alerta */}
      <button
        type="button"
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono transition-all duration-200 shadow-xs cursor-pointer ${
          isMemoryExceeded || isCpuExceeded
            ? 'bg-rose-950/90 border border-rose-500 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
            : 'bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 group-hover/hovercard:neon-border-blue'
        }`}
        aria-label={`Ver telemetria em tempo real de ${container.name}`}
      >
        {isMemoryExceeded || isCpuExceeded ? (
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
        ) : (
          <Activity className={`w-3.5 h-3.5 text-cyan-400 ${container.status === 'running' ? 'animate-pulse' : ''}`} />
        )}
        <span className="font-semibold hidden sm:inline">Stats RAM & Banda</span>
        <span className="font-semibold sm:hidden">Stats</span>
        <span className={`w-1.5 h-1.5 rounded-full ${isMemoryExceeded || isCpuExceeded ? 'bg-rose-400 animate-ping' : 'bg-cyan-400'}`}></span>
      </button>

      {/* Floating Hover Card */}
      <div 
        className="pointer-events-none group-hover/hovercard:pointer-events-auto opacity-0 invisible group-hover/hovercard:opacity-100 group-hover/hovercard:visible -translate-y-1 group-hover/hovercard:translate-y-0 transition-all duration-200 ease-out absolute bottom-full mb-2 left-0 sm:-left-16 w-80 sm:w-92 bg-slate-950/95 border border-cyan-500/50 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl z-50 font-mono text-xs space-y-3 card-cyber-aura"
        style={{ minWidth: '320px' }}
      >
        {/* Glow Superior */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] rounded-t-xl ${
          isMemoryExceeded || isCpuExceeded
            ? 'bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500'
            : 'bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500'
        }`}></div>

        {/* Cabeçalho do Card */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${
              isMemoryExceeded || isCpuExceeded
                ? 'bg-rose-950/90 border-rose-500/60 text-rose-400'
                : 'bg-cyan-950/90 border-cyan-500/40 text-cyan-400'
            }`}>
              {isMemoryExceeded || isCpuExceeded ? <AlertTriangle className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white truncate max-w-[170px]">
                {container.name}
              </h4>
              <p className="text-[10px] text-cyan-400">
                Porta {container.port} · {container.status === 'running' ? 'Ao vivo 24/7' : 'Desativado'}
              </p>
            </div>
          </div>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1 border ${
            isMemoryExceeded || isCpuExceeded
              ? 'bg-rose-950/90 text-rose-300 border-rose-600 animate-pulse'
              : container.status === 'running'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
              : 'bg-rose-950/80 text-rose-300 border-rose-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              isMemoryExceeded || isCpuExceeded
                ? 'bg-rose-400 animate-ping'
                : container.status === 'running' ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
            }`}></span>
            {isMemoryExceeded || isCpuExceeded ? 'ALERTA' : container.status === 'running' ? 'ATIVO' : 'OFF'}
          </span>
        </div>

        {/* BANNER DE AVISO QUANDO LIMIAR FOR EXCEDIDO */}
        {(isMemoryExceeded || isCpuExceeded) && (
          <div className="bg-rose-950/70 border border-rose-500/80 p-2 rounded-lg text-rose-300 flex items-center justify-between text-[10px] shadow-sm">
            <span className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>
                {isMemoryExceeded && `RAM ${currentPoint.percent}% > ${thresholds.memoryThreshold}% `}
                {isCpuExceeded && `CPU ${containerCpuPercent}% > ${thresholds.cpuThreshold}%`}
              </span>
            </span>
            <span className="text-[9px] bg-rose-900/90 px-1.5 py-0.5 rounded text-white font-bold border border-rose-600">
              NOTIFICANDO DASHBOARD
            </span>
          </div>
        )}

        {/* SEÇÃO 1: CONSUMO DE MEMÓRIA EM TEMPO REAL COM D3.JS SPARKLINE */}
        <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              Consumo de Memória (RAM):
            </span>
            <div className="text-right">
              <span className="text-white font-bold tabular-nums text-xs">
                {usedGb} / {totalGb} GB
              </span>
              <span className={`font-bold ml-1 text-xs ${isMemoryExceeded ? 'text-rose-400' : 'text-cyan-300'}`}>
                ({currentPoint.percent}%)
              </span>
            </div>
          </div>

          {/* D3.js Sparkline Header com Indicador de Tendência de 30s */}
          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5 border-t border-slate-800/60">
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <Activity className="w-2.5 h-2.5" />
              D3.js Sparkline · Tendência 30s:
            </span>
            <div className="flex items-center gap-1">
              {trendDelta > 0 ? (
                <span className="text-amber-400 flex items-center font-bold">
                  <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" />
                  +{trendDelta}% (30s)
                </span>
              ) : trendDelta < 0 ? (
                <span className="text-emerald-400 flex items-center font-bold">
                  <TrendingDown className="w-2.5 h-2.5 inline mr-0.5" />
                  {trendDelta}% (30s)
                </span>
              ) : (
                <span className="text-slate-400 flex items-center font-bold">
                  <Minus className="w-2.5 h-2.5 inline mr-0.5" />
                  0.0% (30s)
                </span>
              )}
            </div>
          </div>

          {/* SVG D3.js Canvas do Gráfico Sparkline */}
          <div className="w-full bg-slate-950/90 rounded-md border border-slate-800/80 p-1 relative overflow-hidden">
            <svg 
              ref={svgRef} 
              viewBox="0 0 290 52" 
              className="w-full h-13 block"
              preserveAspectRatio="none"
            />
            <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono px-1.5 pt-0.5 border-t border-slate-900">
              <span>-30s</span>
              <span>-15s</span>
              <span className="text-cyan-400 font-bold">Agora (0s)</span>
              <span className="text-slate-400">Min: {minPercent}% · Max: {maxPercent}%</span>
            </div>
          </div>

          {/* Detalhes de Cache e Memória Disponível */}
          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5 font-sans">
            <span>Cache/Buffer: <strong className="text-slate-300 font-mono">{cachedGb} GB</strong></span>
            <span>Disponível: <strong className="text-emerald-400 font-mono">{freeGb} GB</strong></span>
          </div>
        </div>

        {/* SEÇÃO 2: CONSUMO DE CPU ESTIMADO DO CONTAINER */}
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Consumo de CPU do Container:
            </span>
            <span className={`font-bold tabular-nums ${isCpuExceeded ? 'text-rose-400' : 'text-indigo-300'}`}>
              {containerCpuPercent}% (Alocado: {container.cpuAllocation.split(' ')[0]}C)
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                isCpuExceeded 
                  ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' 
                  : containerCpuPercent > 60 
                  ? 'bg-amber-400' 
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${containerCpuPercent}%` }}
            ></div>
          </div>
        </div>

        {/* SEÇÃO 3: CONSUMO DE BANDA (BANDWIDTH) EM TEMPO REAL */}
        <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Wifi className="w-3.5 h-3.5 text-sky-400" />
              Consumo de Banda de Rede:
            </span>
            <span className="text-cyan-300 font-bold tabular-nums">
              {totalMbps} Mbps
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
            <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-400">
                <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                Download:
              </span>
              <strong className="text-emerald-300">{ingressMbps} Mbps</strong>
            </div>

            <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-400">
                <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                Upload:
              </span>
              <strong className="text-cyan-300">{egressMbps} Mbps</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[9px] text-slate-400 pt-1 border-t border-slate-800/60">
            <div className="flex items-center justify-between">
              <span>Sockets TCP:</span>
              <strong className="text-slate-200 font-mono">{tcpConnections}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Pacotes/seg:</span>
              <strong className="text-slate-200 font-mono">{packetsPerSec}</strong>
            </div>
            <div className="flex items-center justify-between col-span-2">
              <span>Tráfego Mensal Acumulado:</span>
              <strong className="text-indigo-300 font-mono">{monthlyTransferredGb} GB / mês</strong>
            </div>
          </div>
        </div>

        {/* SEÇÃO 4: CONFIGURAÇÃO DE LIMIARES DE ALERTA (CUSTOM USAGE THRESHOLDS) */}
        <div className="bg-slate-900/80 rounded-lg border border-cyan-500/30 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowThresholdConfig(prev => !prev)}
              className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Limiares Customizados (RAM/CPU)</span>
            </button>
            <span className="text-[9px] text-slate-400 font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
              RAM: {thresholds.memoryThreshold}% · CPU: {thresholds.cpuThreshold}%
            </span>
          </div>

          {showThresholdConfig && (
            <form onSubmit={handleSaveThresholds} className="pt-2 border-t border-slate-800/80 space-y-2.5 text-[11px]">
              {/* Toggle Habilitar Alertas */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-1">
                  <BellRing className="w-3 h-3 text-cyan-400" />
                  Ativar Alertas no Telemetry Dashboard:
                </span>
                <input
                  type="checkbox"
                  checked={thresholds.enabled}
                  onChange={e => setThresholds({ ...thresholds, enabled: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Slider Limiar de Memória (RAM) */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Limiar de Memória (RAM):</span>
                  <strong className="text-cyan-400 font-bold">{thresholds.memoryThreshold}%</strong>
                </div>
                <input
                  type="range"
                  min="40"
                  max="95"
                  step="1"
                  value={thresholds.memoryThreshold}
                  onChange={e => setThresholds({ ...thresholds, memoryThreshold: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[8px] text-slate-500">
                  <span>40% (Sensível)</span>
                  <span>75% (Padrão)</span>
                  <span>95% (Crítico)</span>
                </div>
              </div>

              {/* Slider Limiar de CPU */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Limiar de CPU:</span>
                  <strong className="text-indigo-400 font-bold">{thresholds.cpuThreshold}%</strong>
                </div>
                <input
                  type="range"
                  min="40"
                  max="95"
                  step="1"
                  value={thresholds.cpuThreshold}
                  onChange={e => setThresholds({ ...thresholds, cpuThreshold: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
                <div className="flex justify-between text-[8px] text-slate-500">
                  <span>40% (Sensível)</span>
                  <span>75% (Padrão)</span>
                  <span>95% (Crítico)</span>
                </div>
              </div>

              {/* Botão Salvar Limiares */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Limiares Salvos!</span>
                    </>
                  ) : (
                    <span>Salvar Limiares</span>
                  )}
                </button>
                <span className="text-[9px] text-slate-500">
                  Sincronizado com Telemetria
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Rodapé com Selo Anycast & Blindagem */}
        <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-800/80">
          <span className="flex items-center gap-1 text-cyan-500">
            <Radio className="w-2.5 h-2.5" />
            Nó Anycast Global B3 SP1
          </span>
          <span className="text-emerald-400 font-bold">
            0% Packet Loss
          </span>
        </div>
      </div>
    </div>
  );
};
