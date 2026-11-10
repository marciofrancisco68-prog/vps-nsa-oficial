import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Globe,
  DollarSign,
  Fuel,
  Clock,
  RotateCw,
  Zap,
  Bitcoin,
} from 'lucide-react';
import { MarketTickerItem, RealMarketData, TickerScrollSpeed } from '../types';

interface TickerBarProps {
  ticker?: MarketTickerItem | null;
  realMarketData?: RealMarketData;
  scrollSpeed?: TickerScrollSpeed;
}

export type TickerTimeframe = '1m' | '2m' | '4m' | '5m' | '10m';

export const TickerBar: React.FC<TickerBarProps> = ({ 
  ticker, 
  realMarketData,
  scrollSpeed = 'normal' 
}) => {
  const [timeframe, setTimeframe] = useState<TickerTimeframe>('1m');
  const [direction, setDirection] = useState<'clockwise' | 'standard'>('clockwise');

  // Animation speed based on timeframe
  const speedSeconds: Record<TickerTimeframe, number> = {
    '1m': 30,
    '2m': 45,
    '4m': 75,
    '5m': 110,
    '10m': 170,
  };

  const baseDuration = speedSeconds[timeframe];
  const animDuration = 
    scrollSpeed === 'fast' 
      ? Math.round(baseDuration * 0.5) 
      : scrollSpeed === 'slow' 
      ? Math.round(baseDuration * 1.8) 
      : baseDuration;

  const playState = scrollSpeed === 'paused' ? 'paused' : 'running';

  return (
    <div className="w-full bg-[#120622]/95 backdrop-blur-md border-t border-b border-purple-500/30 overflow-hidden shrink-0 shadow-md relative select-none z-30">
      <style>{`
        @keyframes tickerRoll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes tickerRollReverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-ticker-marquee {
          display: flex;
          width: 200%;
          animation: ${direction === 'clockwise' ? 'tickerRoll' : 'tickerRollReverse'} ${animDuration}s linear infinite;
          animation-play-state: ${playState};
        }
        .animate-ticker-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex items-center min-w-0">
        {/* Left Live Broadcast Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border-r border-red-600/40 text-[11px] font-mono shrink-0 z-10 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span className="text-red-500 font-extrabold uppercase tracking-wider text-[11px] whitespace-nowrap">
            COTAÇÕES AO VIVO:
          </span>
        </div>

        {/* Timeframe Selector Controls (1m, 2m, 4m, 5m, 10m) */}
        <div className="hidden sm:flex items-center gap-0.5 px-2 py-1 bg-slate-950/90 border-r border-slate-800 shrink-0 z-10">
          <Clock className="w-2.5 h-2.5 text-slate-400 mr-1" />
          {(['1m', '2m', '4m', '5m', '10m'] as TickerTimeframe[]).map(tf => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              title={`Intervalo de taxa de atualização: ${tf}`}
              className={`px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded transition-colors ${
                timeframe === tf
                  ? 'bg-red-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tf}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setDirection(d => (d === 'clockwise' ? 'standard' : 'clockwise'))}
            title={direction === 'clockwise' ? 'Sentido Horário' : 'Sentido Normal'}
            className="ml-1 px-1 py-0.5 text-[9px] font-mono rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center gap-0.5"
          >
            <RotateCw className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Rolling Continuous Infinite Marquee */}
        <div className="overflow-hidden flex-1 min-w-0 relative">
          <div className="animate-ticker-marquee flex items-center py-1 text-[11px] font-mono whitespace-nowrap">
            {/* BLOCO DE DADOS 1 */}
            <div className="flex items-center gap-6 px-4 shrink-0">
              {realMarketData ? (
                <>
                  <span className="text-orange-400 font-extrabold flex items-center gap-1.5">
                    <Bitcoin className="w-3.5 h-3.5 text-orange-400 animate-bounce" />
                    BITCOIN (BTC/BRL): <strong className="text-white">R$ {realMarketData.btc?.bid || '382.450,00'}</strong>{' '}
                    <span className="text-emerald-400">({realMarketData.btc?.pctChange || '+2.14%'})</span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    USD/BRL Compra: <strong className="text-white">R$ {realMarketData.usd.bid}</strong>{' '}
                    <span className={parseFloat(realMarketData.usd.pctChange) >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                      ({realMarketData.usd.pctChange}%)
                    </span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    EUR/BRL Compra: <strong className="text-white">R$ {realMarketData.eur.bid}</strong>{' '}
                    <span className={parseFloat(realMarketData.eur.pctChange) >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                      ({realMarketData.eur.pctChange}%)
                    </span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    CHF/BRL Compra: <strong className="text-white">R$ {realMarketData.chf.bid}</strong>{' '}
                    <span className={parseFloat(realMarketData.chf.pctChange) >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                      ({realMarketData.chf.pctChange}%)
                    </span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    GBP/BRL Compra: <strong className="text-white">R$ {realMarketData.gbp.bid}</strong>{' '}
                    <span className={parseFloat(realMarketData.gbp.pctChange) >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                      ({realMarketData.gbp.pctChange}%)
                    </span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    B3 IBOVESPA: <strong className="text-white">{realMarketData.ibovespa.points} pts</strong>{' '}
                    <span className="text-green-400 font-bold">({realMarketData.ibovespa.pctChange}%)</span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    PETRÓLEO BRENT: <strong className="text-white">${realMarketData.brent.price}</strong>{' '}
                    <span className="text-green-400 font-bold">({realMarketData.brent.pctChange}%)</span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    S&P 500: <strong className="text-white">{realMarketData.sp500.points} pts</strong>{' '}
                    <span className="text-green-400 font-bold">({realMarketData.sp500.pctChange}%)</span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    NASDAQ: <strong className="text-white">{realMarketData.nasdaq.points} pts</strong>{' '}
                    <span className="text-green-400 font-bold">({realMarketData.nasdaq.pctChange}%)</span>
                  </span>
                </>
              ) : (
                <span className="text-slate-400">Carregando cotações ao vivo...</span>
              )}
            </div>

            {/* BLOCO DE DADOS 2 (REPETIÇÃO PARA ROLAGEM INFINITA FLUÍDA) */}
            <div className="flex items-center gap-6 px-4 shrink-0">
              {realMarketData ? (
                <>
                  <span className="text-orange-400 font-extrabold flex items-center gap-1.5">
                    <Bitcoin className="w-3.5 h-3.5 text-orange-400 animate-bounce" />
                    BITCOIN (BTC/BRL): <strong className="text-white">R$ {realMarketData.btc?.bid || '382.450,00'}</strong>{' '}
                    <span className="text-emerald-400">({realMarketData.btc?.pctChange || '+2.14%'})</span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    USD/BRL Compra: <strong className="text-white">R$ {realMarketData.usd.bid}</strong>{' '}
                    <span className={parseFloat(realMarketData.usd.pctChange) >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                      ({realMarketData.usd.pctChange}%)
                    </span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    EUR/BRL Compra: <strong className="text-white">R$ {realMarketData.eur.bid}</strong>{' '}
                    <span className={parseFloat(realMarketData.eur.pctChange) >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                      ({realMarketData.eur.pctChange}%)
                    </span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    CHF/BRL Compra: <strong className="text-white">R$ {realMarketData.chf.bid}</strong>{' '}
                    <span className={parseFloat(realMarketData.chf.pctChange) >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                      ({realMarketData.chf.pctChange}%)
                    </span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    GBP/BRL Compra: <strong className="text-white">R$ {realMarketData.gbp.bid}</strong>{' '}
                    <span className={parseFloat(realMarketData.gbp.pctChange) >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                      ({realMarketData.gbp.pctChange}%)
                    </span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    B3 IBOVESPA: <strong className="text-white">{realMarketData.ibovespa.points} pts</strong>{' '}
                    <span className="text-green-400 font-bold">({realMarketData.ibovespa.pctChange}%)</span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    PETRÓLEO BRENT: <strong className="text-white">${realMarketData.brent.price}</strong>{' '}
                    <span className="text-green-400 font-bold">({realMarketData.brent.pctChange}%)</span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    S&P 500: <strong className="text-white">{realMarketData.sp500.points} pts</strong>{' '}
                    <span className="text-green-400 font-bold">({realMarketData.sp500.pctChange}%)</span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    NASDAQ: <strong className="text-white">{realMarketData.nasdaq.points} pts</strong>{' '}
                    <span className="text-green-400 font-bold">({realMarketData.nasdaq.pctChange}%)</span>
                  </span>
                </>
              ) : (
                <span className="text-slate-400">Carregando cotações ao vivo...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
