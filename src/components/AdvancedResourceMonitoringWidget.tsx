import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  RefreshCw, 
  Layers, 
  Zap, 
  CheckCircle2, 
  Box, 
  Maximize2, 
  X 
} from 'lucide-react';
import { ContainerItem } from '../types';

interface HistoricalDataPoint {
  timestamp: Date;
  timeStr: string;
  cpuPercent: number;
  ramPercent: number;
  containerId: string;
  containerName: string;
}

interface AdvancedResourceMonitoringWidgetProps {
  containers?: ContainerItem[];
  onClose?: () => void;
  onNavigateContainers?: () => void;
}

export const AdvancedResourceMonitoringWidget: React.FC<AdvancedResourceMonitoringWidgetProps> = ({
  containers = [],
  onClose,
  onNavigateContainers,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedContainerId, setSelectedContainerId] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<'both' | 'cpu' | 'ram'>('both');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m'>('1m');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);

  // Buffer de histórico de métricas
  const [historyData, setHistoryData] = useState<HistoricalDataPoint[]>(() => {
    const points: HistoricalDataPoint[] = [];
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
      const t = new Date(now - i * 3000);
      points.push({
        timestamp: t,
        timeStr: t.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cpuPercent: Math.min(95, Math.max(8, 22 + Math.sin(i * 0.4) * 14 + (Math.random() * 8 - 4))),
        ramPercent: Math.min(90, Math.max(15, 34 + Math.cos(i * 0.3) * 10 + (Math.random() * 6 - 3))),
        containerId: 'all',
        containerName: 'Média de Todos os Containers',
      });
    }
    return points;
  });

  // Atualização em tempo real (push de novo ponto a cada 3s)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Simula métricas reais baseadas no container selecionado
      const baseCpu = selectedContainerId === 'all' ? 24 : 18 + (selectedContainerId.charCodeAt(0) % 25);
      const baseRam = selectedContainerId === 'all' ? 36 : 28 + (selectedContainerId.charCodeAt(1) % 20);

      const jitterCpu = Math.random() * 12 - 6;
      const jitterRam = Math.random() * 8 - 4;

      const newPoint: HistoricalDataPoint = {
        timestamp: now,
        timeStr,
        cpuPercent: Math.min(98, Math.max(5, parseFloat((baseCpu + jitterCpu).toFixed(1)))),
        ramPercent: Math.min(95, Math.max(10, parseFloat((baseRam + jitterRam).toFixed(1)))),
        containerId: selectedContainerId,
        containerName: selectedContainerId === 'all' 
          ? 'Média de Todos os Containers' 
          : (containers.find(c => c.id === selectedContainerId)?.name || 'Container Instância'),
      };

      setHistoryData(prev => [...prev.slice(1), newPoint]);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, selectedContainerId, containers]);

  // Renderizador D3.js responsivo
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || historyData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const bounds = containerRef.current.getBoundingClientRect();
    const width = Math.max(300, bounds.width);
    const height = 240;
    const margin = { top: 20, right: 25, bottom: 35, left: 42 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Defs para gradientes de linha e área (Glow Neon Cyan e Indigo)
    const defs = svg.append('defs');

    // Gradiente da Área de CPU
    const cpuGradient = defs.append('linearGradient')
      .attr('id', 'cpu-area-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    cpuGradient.append('stop').attr('offset', '0%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.35);
    cpuGradient.append('stop').attr('offset', '100%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.0);

    // Gradiente da Área de RAM
    const ramGradient = defs.append('linearGradient')
      .attr('id', 'ram-area-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    ramGradient.append('stop').attr('offset', '0%').attr('stop-color', '#6366f1').attr('stop-opacity', 0.30);
    ramGradient.append('stop').attr('offset', '100%').attr('stop-color', '#6366f1').attr('stop-opacity', 0.0);

    // Escalas D3
    const xExtent = d3.extent(historyData, d => d.timestamp) as [Date, Date];
    const xScale = d3.scaleTime()
      .domain(xExtent)
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Gridlines horizontais
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '3,3');

    // Eixo X
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.max(4, Math.floor(innerWidth / 90)))
      .tickFormat(d => d3.timeFormat('%H:%M:%S')(d as Date));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace');

    // Eixo Y
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    g.append('g')
      .call(yAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace');

    // Linha e Área de RAM
    if (selectedMetric === 'both' || selectedMetric === 'ram') {
      const ramArea = d3.area<HistoricalDataPoint>()
        .curve(d3.curveMonotoneX)
        .x(d => xScale(d.timestamp))
        .y0(innerHeight)
        .y1(d => yScale(d.ramPercent));

      const ramLine = d3.line<HistoricalDataPoint>()
        .curve(d3.curveMonotoneX)
        .x(d => xScale(d.timestamp))
        .y(d => yScale(d.ramPercent));

      g.append('path')
        .datum(historyData)
        .attr('fill', 'url(#ram-area-gradient)')
        .attr('d', ramArea);

      g.append('path')
        .datum(historyData)
        .attr('fill', 'none')
        .attr('stroke', '#6366f1')
        .attr('stroke-width', 2.5)
        .attr('d', ramLine);
    }

    // Linha e Área de CPU
    if (selectedMetric === 'both' || selectedMetric === 'cpu') {
      const cpuArea = d3.area<HistoricalDataPoint>()
        .curve(d3.curveMonotoneX)
        .x(d => xScale(d.timestamp))
        .y0(innerHeight)
        .y1(d => yScale(d.cpuPercent));

      const cpuLine = d3.line<HistoricalDataPoint>()
        .curve(d3.curveMonotoneX)
        .x(d => xScale(d.timestamp))
        .y(d => yScale(d.cpuPercent));

      g.append('path')
        .datum(historyData)
        .attr('fill', 'url(#cpu-area-gradient)')
        .attr('d', cpuArea);

      g.append('path')
        .datum(historyData)
        .attr('fill', 'none')
        .attr('stroke', '#06b6d4')
        .attr('stroke-width', 2.5)
        .attr('d', cpuLine);
    }

    // Ponto mais recente (pulsante)
    const latest = historyData[historyData.length - 1];
    if (latest) {
      if (selectedMetric === 'both' || selectedMetric === 'cpu') {
        g.append('circle')
          .attr('cx', xScale(latest.timestamp))
          .attr('cy', yScale(latest.cpuPercent))
          .attr('r', 4.5)
          .attr('fill', '#06b6d4')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);
      }

      if (selectedMetric === 'both' || selectedMetric === 'ram') {
        g.append('circle')
          .attr('cx', xScale(latest.timestamp))
          .attr('cy', yScale(latest.ramPercent))
          .attr('r', 4.5)
          .attr('fill', '#6366f1')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);
      }
    }

  }, [historyData, selectedMetric]);

  const latestPoint = historyData[historyData.length - 1] || { cpuPercent: 0, ramPercent: 0 };
  const avgCpu = (historyData.reduce((acc, d) => acc + d.cpuPercent, 0) / historyData.length).toFixed(1);
  const avgRam = (historyData.reduce((acc, d) => acc + d.ramPercent, 0) / historyData.length).toFixed(1);
  const maxCpu = Math.max(...historyData.map(d => d.cpuPercent)).toFixed(1);

  return (
    <div className="bg-slate-900/95 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between shadow-2xl backdrop-blur-md transition-all font-sans">
      
      {/* 1. CABEÇALHO DO WIDGET */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-lg text-white shadow-md">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase font-mono tracking-wider">
                  Advanced Resource Monitoring (D3.js)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  Tempo Real (3s)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Série temporal contínua de uso de CPU/RAM em todas as instâncias ativas de container.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Seletor de Métrica */}
            <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex items-center text-[10px] font-mono font-bold">
              <button
                onClick={() => setSelectedMetric('both')}
                className={`px-2 py-1 rounded transition-colors ${selectedMetric === 'both' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                CPU + RAM
              </button>
              <button
                onClick={() => setSelectedMetric('cpu')}
                className={`px-2 py-1 rounded transition-colors ${selectedMetric === 'cpu' ? 'bg-cyan-950 text-cyan-400 shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                CPU
              </button>
              <button
                onClick={() => setSelectedMetric('ram')}
                className={`px-2 py-1 rounded transition-colors ${selectedMetric === 'ram' ? 'bg-indigo-950 text-indigo-400 shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                RAM
              </button>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors"
                title="Fechar Widget"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. FILTROS RÁPIDOS & SELEÇÃO DE CONTAINER */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mt-3 pt-1">
          {/* Dropdown de Containers Ativos */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedContainerId}
              onChange={(e) => setSelectedContainerId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="all">Todos os Containers (Média Ponderada)</option>
              {containers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.domain})
                </option>
              ))}
            </select>
          </div>

          {/* Legenda de Cores do Gráfico */}
          <div className="flex items-center gap-3 text-xs font-mono">
            {(selectedMetric === 'both' || selectedMetric === 'cpu') && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-cyan-400 rounded-full"></span>
                <span className="text-slate-300">CPU: <strong className="text-cyan-400">{latestPoint.cpuPercent}%</strong></span>
              </div>
            )}
            {(selectedMetric === 'both' || selectedMetric === 'ram') && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-indigo-400 rounded-full"></span>
                <span className="text-slate-300">RAM: <strong className="text-indigo-400">{latestPoint.ramPercent}%</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* 3. ÁREA DO GRÁFICO D3.JS */}
        <div ref={containerRef} className="w-full mt-3 bg-slate-950/90 rounded-xl p-2 border border-slate-800/80 relative overflow-hidden shadow-inner">
          <svg ref={svgRef} className="w-full h-[240px] overflow-visible"></svg>
        </div>

        {/* 4. CARDS DE ESTATÍSTICAS HISTÓRICAS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 font-mono">
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">CPU ATUAL</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-base font-bold text-cyan-400">{latestPoint.cpuPercent}%</span>
              <span className="text-[10px] text-slate-500">Média {avgCpu}%</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">RAM ATUAL</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-base font-bold text-indigo-400">{latestPoint.ramPercent}%</span>
              <span className="text-[10px] text-slate-500">Média {avgRam}%</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">PICO REGISTRADO</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-base font-bold text-amber-400">{maxCpu}%</span>
              <span className="text-[10px] text-slate-500">24 Amostras</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">INSTÂNCIAS</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-base font-bold text-emerald-400">{containers.length || 6} Containers</span>
              <span className="text-[10px] text-emerald-400">100% Vivos</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. RODAPÉ DE AÇÕES */}
      <div className="pt-3 mt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-slate-400">
          Algoritmo de Interpolação: <strong className="text-slate-300">D3 MonotoneX Smooth Spline</strong>
        </span>
        {onNavigateContainers && (
          <button
            onClick={onNavigateContainers}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold font-mono flex items-center gap-1 transition-colors"
          >
            Ver Detalhes dos Containers →
          </button>
        )}
      </div>

    </div>
  );
};
