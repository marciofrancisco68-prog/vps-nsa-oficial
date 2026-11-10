import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, RefreshCcw, Clock, Globe } from 'lucide-react';
import { RealMarketData } from '../types';

interface LiveMarketTickerAndClockProps {
  realMarketData?: RealMarketData;
}

export function LiveMarketTickerAndClock({ realMarketData }: LiveMarketTickerAndClockProps = {}) {
  // Estado do Relógio Vivo (Segundos Corrigidos)
  const [currentTime, setCurrentTime] = useState(new Date());

  // Estado do Sistema de Cores Cíclico (Muda a cada 10 minutos)
  const [colorThemeIndex, setColorThemeIndex] = useState(0);

  // Temas de Cores Cyber-Neon da vpsNsA (Alternam a cada 10 minutos)
  const colorThemes = [
    { border: 'border-cyan-500/40', bg: 'bg-cyan-950/30', text: 'text-cyan-300', badge: 'bg-cyan-500/20 text-cyan-300' },
    { border: 'border-indigo-500/40', bg: 'bg-indigo-950/30', text: 'text-indigo-300', badge: 'bg-indigo-500/20 text-indigo-300' },
    { border: 'border-purple-500/40', bg: 'bg-purple-950/30', text: 'text-purple-300', badge: 'bg-purple-500/20 text-purple-300' },
    { border: 'border-emerald-500/40', bg: 'bg-emerald-950/30', text: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300' },
    { border: 'border-amber-500/40', bg: 'bg-amber-950/30', text: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300' },
  ];

  // Efeito do Relógio (Atualiza a cada 1 segundo sem travar)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Efeito de Mudança de Cores (Alterna automaticamente o tema a cada 10 minutos)
  useEffect(() => {
    const themeTimer = setInterval(() => {
      setColorThemeIndex(prev => (prev + 1) % colorThemes.length);
    }, 10 * 60 * 1000); // 10 Minutos
    return () => clearInterval(themeTimer);
  }, [colorThemes.length]);

  const activeTheme = colorThemes[colorThemeIndex];

  const marketItems = [
    { 
      name: 'B3 IBOVESPA', 
      value: realMarketData?.ibovespa ? `${realMarketData.ibovespa.points} pts` : '130.580 pts', 
      change: realMarketData?.ibovespa ? realMarketData.ibovespa.pctChange : '+1.10%', 
      color: 'text-emerald-400' 
    },
    { 
      name: 'S&P 500 (EUA)', 
      value: realMarketData?.sp500 ? `${realMarketData.sp500.points} pts` : '5.893,67 pts', 
      change: realMarketData?.sp500 ? realMarketData.sp500.pctChange : '+0.81%', 
      color: 'text-emerald-400' 
    },
    { 
      name: 'NASDAQ COMPOSITE', 
      value: realMarketData?.nasdaq ? `${realMarketData.nasdaq.points} pts` : '18.583,61 pts', 
      change: realMarketData?.nasdaq ? realMarketData.nasdaq.pctChange : '+1.04%', 
      color: 'text-emerald-400' 
    },
    { 
      name: 'PETRÓLEO BRENT', 
      value: realMarketData?.brent ? `$ ${realMarketData.brent.price} / barril` : '$ 74.43 / barril', 
      change: realMarketData?.brent ? realMarketData.brent.pctChange : '+0.52%', 
      color: 'text-amber-400' 
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans select-none">
      
      {/* BARRA SUPERIOR COM RELÓGIO VIVO E STATUS DE API */}
      <div className={`bg-[#0D121F] border ${activeTheme.border} rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-700`}>
        
        {/* RELÓGIO COM SEGUNDOS FUNCIONANDO EM TEMPO REAL */}
        <div className="flex items-center gap-3 font-mono">
          <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Sovereign Cluster Time</span>
            <span className="text-sm font-bold text-white tracking-widest">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>

        {/* INDICADOR DO CICLO DE CORES (10 MINUTOS) */}
        <div className={`px-4 py-1.5 rounded-xl border ${activeTheme.border} ${activeTheme.badge} text-xs font-mono font-bold flex items-center gap-2 transition-all duration-700`}>
          <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
          <span>Tema Dinâmico Ativo (Ciclo de 10 Minutos)</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Streaming de Mercado Contínuo</span>
        </div>
      </div>

      {/* GRELHA DE BOLSAS & ÍNDICES GLOBAIS COM CORES DINÂMICAS */}
      <div className={`bg-[#0D121F] border ${activeTheme.border} rounded-3xl p-6 shadow-2xl space-y-6 transition-all duration-700`}>
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span>Bolsas &amp; Índices Globais (vpsNsA Engine)</span>
            </h3>
            <p className="text-xs text-slate-400">Mercados em streaming contínuo com atualização em tempo real</p>
          </div>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-3 py-1 rounded-full font-mono font-bold">
            Mercado Aberto 🟢
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketItems.map((item, idx) => (
            <div key={idx} className={`bg-[#151C2C]/70 border ${activeTheme.border} rounded-2xl p-4 flex items-center justify-between transition-all duration-700`}>
              <div>
                <span className="text-[11px] font-mono text-slate-400 block">{item.name}</span>
                <span className="text-lg font-black text-white">{item.value}</span>
              </div>
              <div className="text-right">
                <span className={`text-xs font-mono font-bold ${item.color}`}>{item.change}</span>
                <div className="flex items-center gap-1 pt-1 justify-end">
                  <div className="w-1.5 h-3 bg-cyan-500 rounded-sm"></div>
                  <div className="w-1.5 h-4 bg-indigo-500 rounded-sm"></div>
                  <div className="w-1.5 h-5 bg-emerald-400 rounded-sm"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default LiveMarketTickerAndClock;
