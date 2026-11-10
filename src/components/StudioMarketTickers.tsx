import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, RefreshCw, Gauge, Zap, Clock, Pause } from 'lucide-react';
import { CardCornerMarks } from './CardCornerMarks';
import { TickerScrollSpeed } from '../types';

export interface StudioMarketTickersProps {
  scrollSpeed?: TickerScrollSpeed;
  onChangeSpeed?: (speed: TickerScrollSpeed) => void;
}

export function StudioMarketTickers({ 
  scrollSpeed = 'normal', 
  onChangeSpeed 
}: StudioMarketTickersProps) {
  const [marketData, setMarketData] = useState({
    usd: { bid: '5.842', ask: '5.845', pctChange: '+0.18' },
    eur: { bid: '6.210', ask: '6.214', pctChange: '+0.25' },
    chf: { bid: '6.520', ask: '6.525', pctChange: '-0.10' },
    gbp: { bid: '7.340', ask: '7.346', pctChange: '+0.42' },
    companies: [
      { name: 'VALE3', price: 'R$ 62.02', change: '+3.40%', up: true },
      { name: 'PETR4', price: 'R$ 38.50', change: '+1.15%', up: true },
      { name: 'ITUB4', price: 'R$ 33.14', change: '-0.45%', up: false },
      { name: 'BBDC4', price: 'R$ 14.20', change: '+0.80%', up: true },
      { name: 'WEGE3', price: 'R$ 40.10', change: '+1.50%', up: true },
      { name: 'ABEV3', price: 'R$ 12.30', change: '-0.20%', up: false },
      { name: 'BBAS3', price: 'R$ 27.85', change: '+1.90%', up: true },
      { name: 'RENT3', price: 'R$ 43.10', change: '-0.85%', up: false }
    ]
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Configuração dinâmica das durações conforme a velocidade selecionada
  // Fast: 14s / 16s
  // Normal: 32s / 36s
  // Slow: 64s / 72s
  // Paused: 'paused'
  const isPaused = scrollSpeed === 'paused';
  const ltrDuration = scrollSpeed === 'fast' ? '14s' : scrollSpeed === 'slow' ? '64s' : '32s';
  const rtlDuration = scrollSpeed === 'fast' ? '16s' : scrollSpeed === 'slow' ? '72s' : '36s';
  const playState = isPaused ? 'paused' : 'running';

  const handleNextSpeed = () => {
    if (onChangeSpeed) {
      const next: TickerScrollSpeed =
        scrollSpeed === 'normal' ? 'fast' :
        scrollSpeed === 'fast' ? 'slow' :
        scrollSpeed === 'slow' ? 'paused' : 'normal';
      onChangeSpeed(next);
    }
  };

  // Consumo das APIs reais (AwesomeAPI para moedas comerciais)
  const fetchApi = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,CHF-BRL,GBP-BRL');
      const data = await res.json();
      if (data.USDBRL) {
        setMarketData(prev => ({
          ...prev,
          usd: { bid: parseFloat(data.USDBRL.bid).toFixed(3), ask: parseFloat(data.USDBRL.ask).toFixed(3), pctChange: `${parseFloat(data.USDBRL.pctChange) >= 0 ? '+' : ''}${data.USDBRL.pctChange}%` },
          eur: { bid: parseFloat(data.EURBRL.bid).toFixed(3), ask: parseFloat(data.EURBRL.ask).toFixed(3), pctChange: `${parseFloat(data.EURBRL.pctChange) >= 0 ? '+' : ''}${data.EURBRL.pctChange}%` },
          chf: { bid: parseFloat(data.CHFBRL.bid).toFixed(3), ask: parseFloat(data.CHFBRL.ask).toFixed(3), pctChange: `${parseFloat(data.CHFBRL.pctChange) >= 0 ? '+' : ''}${data.CHFBRL.pctChange}%` },
          gbp: { bid: parseFloat(data.GBPBRL.bid).toFixed(3), ask: parseFloat(data.GBPBRL.ask).toFixed(3), pctChange: `${parseFloat(data.GBPBRL.pctChange) >= 0 ? '+' : ''}${data.GBPBRL.pctChange}%` }
        }));
        setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
      }
    } catch (err) {
      console.error('Erro ao atualizar cotações:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApi();
    const interval = setInterval(fetchApi, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-slate-950/95 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.6)] text-cyan-300 rounded-xl p-3 font-mono space-y-2 relative overflow-hidden backdrop-blur-md group card-cyber-aura transition-all duration-300">
      {/* High-Tech HUD Corner Accents and Laser Beam */}
      <CardCornerMarks glowColor="cyan" />

      {/* ESTILOS DE ANIMAÇÃO DE ROLAGEM HORIZONTAL */}
      <style>{`
        @keyframes scrollTicker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollTickerReverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-ticker-ltr {
          display: flex;
          width: 200%;
          animation: scrollTicker ${ltrDuration} linear infinite;
          animation-play-state: ${playState};
        }
        .animate-ticker-rtl {
          display: flex;
          width: 200%;
          animation: scrollTickerReverse ${rtlDuration} linear infinite;
          animation-play-state: ${playState};
        }
        .animate-ticker-ltr:hover, .animate-ticker-rtl:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* CABEÇALHO DO MÓDULO */}
      <div className="flex flex-wrap items-center justify-between border-b border-cyan-500/30 pb-1.5 gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="tracking-wider neon-glow-blue font-extrabold">ESTÚDIO DE TELEMETRIA VPSNsA — PAINEL BROADCAST</span>
          {lastSyncTime && (
            <span className="hidden sm:inline text-[9px] text-slate-500 font-normal">
              [Sync: {lastSyncTime}]
            </span>
          )}
          {onChangeSpeed && (
            <button
              onClick={handleNextSpeed}
              className={`flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded border transition-all cursor-pointer ${
                scrollSpeed === 'fast'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                  : scrollSpeed === 'slow'
                  ? 'bg-indigo-950/80 text-indigo-300 border-indigo-600'
                  : scrollSpeed === 'paused'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-600'
                  : 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
              }`}
              title="Alternar velocidade dos tickers (Rápido, Lento, Pausado, Normal)"
            >
              {scrollSpeed === 'fast' ? <Zap className="w-2.5 h-2.5 text-amber-400 animate-pulse" /> :
               scrollSpeed === 'slow' ? <Clock className="w-2.5 h-2.5 text-indigo-400" /> :
               scrollSpeed === 'paused' ? <Pause className="w-2.5 h-2.5 text-rose-400" /> :
               <Gauge className="w-2.5 h-2.5 text-cyan-400" />}
              <span>VELOCIDADE: {scrollSpeed.toUpperCase()}</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchApi}
            disabled={isRefreshing}
            className="p-1 hover:bg-slate-900 rounded border border-cyan-500/20 text-cyan-400 hover:text-cyan-200 transition-colors cursor-pointer"
            title="Atualizar cotações agora"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-[9px] bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-800 font-bold flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            ● AO VIVO (Cotações Comerciais)
          </span>
        </div>
      </div>

      {/* FAIXA 1: ROLAGEM HORIZONTAL DE MOEDAS MUNDIAIS (COMPRA COMERCIAL) */}
      <div className="w-full bg-slate-900/90 border border-cyan-500/30 rounded-lg overflow-hidden py-1.5 relative shadow-inner">
        <div className="text-[9px] text-cyan-400 font-bold px-2 mb-0.5 uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span>▶ Faixa 1: Câmbio Comercial Global (Rolagem Contínua)</span>
            <span className="text-[8px] text-slate-500 font-normal lowercase">(awesomeapi stream)</span>
          </div>
          <span className="text-[8px] text-slate-400 font-mono hidden md:inline">
            Status: {isPaused ? '⏸️ Pausado' : `Velocidade: ${scrollSpeed}`}
          </span>
        </div>
        <div 
          className="animate-ticker-ltr whitespace-nowrap text-[11px] items-center text-slate-200"
          style={{
            animationDuration: ltrDuration,
            animationPlayState: playState
          }}
        >
          <div className="flex items-center gap-6 px-4 shrink-0">
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <span className="text-white">USD/BRL</span> Compra: R$ {marketData.usd.bid} <span className="text-emerald-400 font-semibold">({marketData.usd.pctChange})</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <span className="text-white">EUR/BRL</span> Compra: R$ {marketData.eur.bid} <span className="text-emerald-400 font-semibold">({marketData.eur.pctChange})</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <span className="text-white">CHF/BRL</span> Compra: R$ {marketData.chf.bid} <span className="text-cyan-400 font-semibold">({marketData.chf.pctChange})</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <span className="text-white">GBP/BRL</span> Compra: R$ {marketData.gbp.bid} <span className="text-emerald-400 font-semibold">({marketData.gbp.pctChange})</span>
            </span>
            <span className="text-slate-600">|</span>
          </div>
          <div className="flex items-center gap-6 px-4 shrink-0">
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <span className="text-white">USD/BRL</span> Compra: R$ {marketData.usd.bid} <span className="text-emerald-400 font-semibold">({marketData.usd.pctChange})</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <span className="text-white">EUR/BRL</span> Compra: R$ {marketData.eur.bid} <span className="text-emerald-400 font-semibold">({marketData.eur.pctChange})</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <span className="text-white">CHF/BRL</span> Compra: R$ {marketData.chf.bid} <span className="text-cyan-400 font-semibold">({marketData.chf.pctChange})</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <span className="text-white">GBP/BRL</span> Compra: R$ {marketData.gbp.bid} <span className="text-emerald-400 font-semibold">({marketData.gbp.pctChange})</span>
            </span>
            <span className="text-slate-600">|</span>
          </div>
        </div>
      </div>

      {/* FAIXA 2: ROLAGEM HORIZONTAL DAS GRANDES EMPRESAS DO MERCADO */}
      <div className="w-full bg-slate-900/90 border border-cyan-500/30 rounded-lg overflow-hidden py-1.5 relative shadow-inner">
        <div className="text-[9px] text-green-400 font-bold px-2 mb-0.5 uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span>▶ Faixa 2: Grandes Empresas Globais / B3 (Ticker Dinâmico)</span>
            <span className="text-[8px] text-slate-500 font-normal lowercase">(b3 & adrs streaming)</span>
          </div>
          <span className="text-[8px] text-slate-400 font-mono hidden md:inline">
            Status: {isPaused ? '⏸️ Pausado' : `Velocidade: ${scrollSpeed}`}
          </span>
        </div>
        <div 
          className="animate-ticker-rtl whitespace-nowrap text-[11px] items-center text-slate-200"
          style={{
            animationDuration: rtlDuration,
            animationPlayState: playState
          }}
        >
          <div className="flex items-center gap-4 px-4 shrink-0">
            {marketData.companies.map((comp, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-950/90 px-2.5 py-1 rounded border border-slate-800 hover:border-cyan-500/50 transition-colors">
                <span className="font-bold text-white">{comp.name}</span>
                <span className="text-slate-300 font-mono">{comp.price}</span>
                <span className={`text-[10px] font-bold flex items-center ${comp.up ? 'text-green-400' : 'text-rose-400'}`}>
                  {comp.up ? <TrendingUp className="w-3 h-3 inline mr-0.5" /> : <TrendingDown className="w-3 h-3 inline mr-0.5" />}
                  {comp.change}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 px-4 shrink-0">
            {marketData.companies.map((comp, idx) => (
              <div key={idx + '-dup'} className="flex items-center gap-2 bg-slate-950/90 px-2.5 py-1 rounded border border-slate-800 hover:border-cyan-500/50 transition-colors">
                <span className="font-bold text-white">{comp.name}</span>
                <span className="text-slate-300 font-mono">{comp.price}</span>
                <span className={`text-[10px] font-bold flex items-center ${comp.up ? 'text-green-400' : 'text-rose-400'}`}>
                  {comp.up ? <TrendingUp className="w-3 h-3 inline mr-0.5" /> : <TrendingDown className="w-3 h-3 inline mr-0.5" />}
                  {comp.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
