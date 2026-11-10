import React from 'react';
import { 
  Globe, 
  Activity, 
  RefreshCw, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Fuel, 
  BarChart3,
  Clock
} from 'lucide-react';
import { RealMarketData } from '../types';

interface MarketQuotesModuleProps {
  marketData: RealMarketData;
  loading?: boolean;
  lastUpdate?: string;
  onRefresh?: () => void;
}

export const MarketQuotesModule: React.FC<MarketQuotesModuleProps> = ({
  marketData,
  loading = false,
  lastUpdate,
  onRefresh,
}) => {
  return (
    <div className="bg-slate-900/90 border border-cyan-500/40 p-3 sm:p-3.5 rounded-xl shadow-xl relative overflow-hidden backdrop-blur-md flex flex-col justify-between font-sans select-none h-full min-h-0">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500"></div>

      {/* CABEÇALHO DO MÓDULO */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h2 className="text-xs font-bold text-white tracking-wide uppercase">
            Moedas Mundiais & Bolsas Globais (Tempo Real)
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button 
              type="button"
              onClick={onRefresh}
              disabled={loading}
              title="Sincronizar cotações com AwesomeAPI agora"
              className="flex items-center gap-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 px-2 py-0.5 rounded text-[10px] text-cyan-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sincronizar</span>
              <span className="text-cyan-400 font-mono">({lastUpdate || 'Live'})</span>
            </button>
          )}
          <span className="text-[9px] font-mono text-green-400 bg-green-950/80 px-2 py-0.5 rounded border border-green-800 flex items-center gap-1 font-semibold">
            <Zap className="w-3 h-3 text-green-400" /> REST API Active
          </span>
        </div>
      </div>

      {/* 1. CARDS DAS MOEDAS MUNDIAIS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
        {/* CARD USD */}
        <div className="bg-slate-950/90 p-2.5 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-colors shadow-inner">
          <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mb-0.5">
            <span className="font-semibold text-slate-300">USD (DÓLAR)</span>
            <span className={`flex items-center gap-0.5 font-bold ${parseFloat(marketData.usd.pctChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(marketData.usd.pctChange) >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {marketData.usd.pctChange}%
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
            R$ {marketData.usd.bid}
          </div>
          <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-900">
            <span>Venda: {marketData.usd.ask}</span>
            <span>Máx: {marketData.usd.high}</span>
          </div>
        </div>

        {/* CARD EUR */}
        <div className="bg-slate-950/90 p-2.5 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-colors shadow-inner">
          <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mb-0.5">
            <span className="font-semibold text-slate-300">EUR (EURO)</span>
            <span className={`flex items-center gap-0.5 font-bold ${parseFloat(marketData.eur.pctChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(marketData.eur.pctChange) >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {marketData.eur.pctChange}%
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
            R$ {marketData.eur.bid}
          </div>
          <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-900">
            <span>Venda: {marketData.eur.ask}</span>
            <span>Máx: {marketData.eur.high}</span>
          </div>
        </div>

        {/* CARD CHF */}
        <div className="bg-slate-950/90 p-2.5 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-colors shadow-inner">
          <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mb-0.5">
            <span className="font-semibold text-slate-300">CHF (SUÍÇO)</span>
            <span className={`flex items-center gap-0.5 font-bold ${parseFloat(marketData.chf.pctChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(marketData.chf.pctChange) >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {marketData.chf.pctChange}%
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
            R$ {marketData.chf.bid}
          </div>
          <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-900">
            <span>Venda: {marketData.chf.ask}</span>
            <span>Máx: {marketData.chf.high}</span>
          </div>
        </div>

        {/* CARD GBP */}
        <div className="bg-slate-950/90 p-2.5 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-colors shadow-inner">
          <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mb-0.5">
            <span className="font-semibold text-slate-300">GBP (LIBRA)</span>
            <span className={`flex items-center gap-0.5 font-bold ${parseFloat(marketData.gbp.pctChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(marketData.gbp.pctChange) >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {marketData.gbp.pctChange}%
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
            R$ {marketData.gbp.bid}
          </div>
          <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-900">
            <span>Venda: {marketData.gbp.ask}</span>
            <span>Máx: {marketData.gbp.high}</span>
          </div>
        </div>
      </div>

      {/* 2. BOLSAS GLOBAIS E COMMODITIES */}
      <div className="pt-2 border-t border-cyan-500/20">
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1.5">
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <Activity className="w-3 h-3 text-cyan-400" /> Bolsas & Commodities
          </span>
          <span className="text-cyan-400 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" /> Live Sync
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {/* B3 IBOVESPA */}
          <div className="bg-slate-950/90 p-2 rounded border border-cyan-500/20">
            <span className="text-[8px] text-slate-400 block font-mono">B3 IBOVESPA</span>
            <div className="text-xs font-bold text-white font-mono">{marketData.ibovespa.points}</div>
            <span className="text-[9px] font-bold text-green-400 font-mono">{marketData.ibovespa.pctChange}%</span>
          </div>

          {/* S&P 500 */}
          <div className="bg-slate-950/90 p-2 rounded border border-cyan-500/20">
            <span className="text-[8px] text-slate-400 block font-mono">S&P 500</span>
            <div className="text-xs font-bold text-white font-mono">{marketData.sp500.points}</div>
            <span className="text-[9px] font-bold text-green-400 font-mono">{marketData.sp500.pctChange}%</span>
          </div>

          {/* NASDAQ */}
          <div className="bg-slate-950/90 p-2 rounded border border-cyan-500/20">
            <span className="text-[8px] text-slate-400 block font-mono">NASDAQ</span>
            <div className="text-xs font-bold text-white font-mono">{marketData.nasdaq.points}</div>
            <span className="text-[9px] font-bold text-green-400 font-mono">{marketData.nasdaq.pctChange}%</span>
          </div>

          {/* PETRÓLEO BRENT */}
          <div className="bg-slate-950/90 p-2 rounded border border-cyan-500/20">
            <span className="text-[8px] text-slate-400 block font-mono">BRENT</span>
            <div className="text-xs font-bold text-white font-mono">${marketData.brent.price}</div>
            <span className="text-[9px] font-bold text-green-400 font-mono">{marketData.brent.pctChange}%</span>
          </div>

          {/* PETRÓLEO WTI */}
          <div className="bg-slate-950/90 p-2 rounded border border-cyan-500/20">
            <span className="text-[8px] text-slate-400 block font-mono">WTI</span>
            <div className="text-xs font-bold text-white font-mono">${marketData.wti.price}</div>
            <span className="text-[9px] font-bold text-green-400 font-mono">{marketData.wti.pctChange}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
