import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Crown, 
  Cpu, 
  CreditCard, 
  Bitcoin, 
  Check,
  Zap
} from 'lucide-react';
import { RealMarketData } from '../types';
import { MasterContainer } from './MasterContainer';
import { ProxyManager } from './ProxyManager';
import { BtcWallet } from './BtcWallet';

interface CeoMasterDashboardProps {
  onNavigateTab?: (tab: string) => void;
  onSelectPlanForPayment?: (planName: string) => void;
  externalMarketData?: RealMarketData;
  loadingExternalMarket?: boolean;
  onSyncMarketExternal?: () => void;
}

export const CeoMasterDashboard: React.FC<CeoMasterDashboardProps> = ({
  onNavigateTab,
  onSelectPlanForPayment,
  externalMarketData,
  loadingExternalMarket,
  onSyncMarketExternal,
}) => {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('epyc-pro');

  // Estados de Mercado (AwesomeAPI)
  const [marketData, setMarketData] = useState({
    usd: { bid: externalMarketData?.usd.bid || '5.742', ask: externalMarketData?.usd.ask || '5.745', pctChange: externalMarketData?.usd.pctChange || '+0.34' },
    eur: { bid: externalMarketData?.eur.bid || '6.230', ask: externalMarketData?.eur.ask || '6.235', pctChange: externalMarketData?.eur.pctChange || '+0.18' },
    chf: { bid: externalMarketData?.chf.bid || '6.612', ask: externalMarketData?.chf.ask || '6.618', pctChange: externalMarketData?.chf.pctChange || '-0.12' },
    gbp: { bid: externalMarketData?.gbp.bid || '7.450', ask: externalMarketData?.gbp.ask || '7.458', pctChange: externalMarketData?.gbp.pctChange || '+0.45' },
    btc: { bid: externalMarketData?.btc?.bid || '382.450,00', pctChange: externalMarketData?.btc?.pctChange || '+2.14%' },
    ibovespa: { points: externalMarketData?.ibovespa.points || '130.580', pctChange: externalMarketData?.ibovespa.pctChange || '+1.10' },
    sp500: { points: externalMarketData?.sp500.points || '5.893,67', pctChange: externalMarketData?.sp500.pctChange || '+0.81' },
    nasdaq: { points: externalMarketData?.nasdaq.points || '18.583,61', pctChange: externalMarketData?.nasdaq.pctChange || '+1.04' },
    brent: { price: externalMarketData?.brent.price || '74.43', pctChange: externalMarketData?.brent.pctChange || '+0.52' }
  });

  const [proxies, setProxies] = useState([
    { id: 1, country: 'Brasil', flag: '🇧🇷', ip: '185.122.84.19', port: '8080', used: '0.32 GB', total: '1.0 GB', percentage: 32, status: 'Ativa' },
    { id: 2, country: 'EUA', flag: '🇺🇸', ip: '104.28.192.42', port: '8080', used: '2.45 GB', total: '5.0 GB', percentage: 49, status: 'Ativa' },
    { id: 3, country: 'Alemanha', flag: '🇩🇪', ip: '185.93.18.77', port: '8080', used: '7.10 GB', total: '10.0 GB', percentage: 71, status: 'Ativa' },
    { id: 4, country: 'Japão', flag: '🇯🇵', ip: '133.242.105.12', port: '8080', used: '1.20 GB', total: '2.0 GB', percentage: 60, status: 'Ativa' },
  ]);

  // Busca de APIs Reais (AwesomeAPI)
  const fetchRealMarketData = async () => {
    setLoading(true);
    try {
      if (onSyncMarketExternal) {
        onSyncMarketExternal();
      }
      const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,CHF-BRL,GBP-BRL,BTC-BRL');
      const data = await res.json();

      if (data && data.USDBRL) {
        setMarketData(prev => ({
          ...prev,
          usd: { bid: parseFloat(data.USDBRL.bid).toFixed(3), ask: parseFloat(data.USDBRL.ask).toFixed(3), pctChange: `${parseFloat(data.USDBRL.pctChange) >= 0 ? '+' : ''}${data.USDBRL.pctChange}%` },
          eur: data.EURBRL ? { bid: parseFloat(data.EURBRL.bid).toFixed(3), ask: parseFloat(data.EURBRL.ask).toFixed(3), pctChange: `${parseFloat(data.EURBRL.pctChange) >= 0 ? '+' : ''}${data.EURBRL.pctChange}%` } : prev.eur,
          chf: data.CHFBRL ? { bid: parseFloat(data.CHFBRL.bid).toFixed(3), ask: parseFloat(data.CHFBRL.ask).toFixed(3), pctChange: `${parseFloat(data.CHFBRL.pctChange) >= 0 ? '+' : ''}${data.CHFBRL.pctChange}%` } : prev.chf,
          gbp: data.GBPBRL ? { bid: parseFloat(data.GBPBRL.bid).toFixed(3), ask: parseFloat(data.GBPBRL.ask).toFixed(3), pctChange: `${parseFloat(data.GBPBRL.pctChange) >= 0 ? '+' : ''}${data.GBPBRL.pctChange}%` } : prev.gbp,
          btc: data.BTCBRL ? { bid: parseFloat(data.BTCBRL.bid).toLocaleString('pt-BR', { minimumFractionDigits: 2 }), pctChange: `${parseFloat(data.BTCBRL.pctChange) >= 0 ? '+' : ''}${data.BTCBRL.pctChange}%` } : prev.btc
        }));
      }
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
    } catch (error) {
      console.warn('Conectando em modo failover para cotações:', error);
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealMarketData();
    const interval = setInterval(fetchRealMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sincronizar com externalMarketData se fornecido
  useEffect(() => {
    if (externalMarketData) {
      setMarketData(prev => ({
        ...prev,
        usd: { bid: externalMarketData.usd.bid, ask: externalMarketData.usd.ask, pctChange: `${externalMarketData.usd.pctChange}%` },
        eur: { bid: externalMarketData.eur.bid, ask: externalMarketData.eur.ask, pctChange: `${externalMarketData.eur.pctChange}%` },
        chf: { bid: externalMarketData.chf.bid, ask: externalMarketData.chf.ask, pctChange: `${externalMarketData.chf.pctChange}%` },
        gbp: { bid: externalMarketData.gbp.bid, ask: externalMarketData.gbp.ask, pctChange: `${externalMarketData.gbp.pctChange}%` },
        btc: externalMarketData.btc ? { bid: externalMarketData.btc.bid, pctChange: externalMarketData.btc.pctChange } : prev.btc,
      }));
    }
  }, [externalMarketData]);

  const plans = [
    {
      id: 'epyc-pro',
      name: 'Instância AMD EPYC Bergamo',
      cores: '128 Cores / 256 Threads',
      ram: '512 GB DDR5 ECC',
      storage: '4.0 TB NVMe Gen5',
      originalPrice: 2999,
      pixBtcPrice: 899.70,
      cardMonthly12x: 249.91
    },
    {
      id: 'grace-hopper',
      name: 'Superchip NVIDIA Grace Hopper',
      cores: '72 Cores ARM + H100 GPU',
      ram: '480 GB LPDDR5X + HBM3',
      storage: '8.0 TB NVMe Ultra',
      originalPrice: 5999,
      pixBtcPrice: 1799.70,
      cardMonthly12x: 499.91
    },
    {
      id: 'intel-xeon',
      name: 'Intel Xeon Platinum Scalable',
      cores: '64 Cores / 128 Threads',
      ram: '256 GB DDR5 ECC',
      storage: '2.0 TB NVMe Enterprise',
      originalPrice: 1899,
      pixBtcPrice: 664.65,
      cardMonthly12x: 158.25
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    const plan = plans.find(p => p.id === planId);
    if (plan && onSelectPlanForPayment) {
      onSelectPlanForPayment(`${plan.name} (${plan.cores})`);
    }
  };

  return (
    <div className="w-full text-slate-100 font-mono flex flex-col space-y-3.5 select-none">
      
      {/* ANIMAÇÃO DE ROLAGEM DOS TICKERS */}
      <style>{`
        @keyframes tickerCeo {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker-ceo {
          display: flex;
          width: 200%;
          animation: tickerCeo 28s linear infinite;
        }
        .animate-ticker-ceo:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* 1. FAIXA DE ROLAGEM DO CABEÇALHO (BITCOIN + CÂMBIO COMERCIAL) */}
      <div className="w-full bg-slate-900 border-t-2 border-b border-cyan-400/80 rounded-t-xl overflow-hidden shrink-0 shadow-lg">
        <div className="animate-ticker-ceo flex items-center py-2 text-[11px] whitespace-nowrap">
          <div className="flex items-center gap-6 px-4">
            <span className="text-orange-400 font-extrabold flex items-center gap-1.5">
              <Bitcoin className="w-4 h-4 text-orange-400 animate-bounce" />
              BITCOIN (BTC/BRL): <strong className="text-white">R$ {marketData.btc.bid}</strong>
              <span className="text-emerald-400">({marketData.btc.pctChange})</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-bold">USD/BRL Compra: R$ {marketData.usd.bid}</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-bold">EUR/BRL Compra: R$ {marketData.eur.bid}</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-bold">CHF/BRL Compra: R$ {marketData.chf.bid}</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-bold">GBP/BRL Compra: R$ {marketData.gbp.bid}</span>
            <span className="text-slate-600">|</span>
            <span className="text-white font-bold">B3 IBOVESPA: {marketData.ibovespa.points} pts ({marketData.ibovespa.pctChange}%)</span>
          </div>
          <div className="flex items-center gap-6 px-4">
            <span className="text-orange-400 font-extrabold flex items-center gap-1.5">
              <Bitcoin className="w-4 h-4 text-orange-400 animate-bounce" />
              BITCOIN (BTC/BRL): <strong className="text-white">R$ {marketData.btc.bid}</strong>
              <span className="text-emerald-400">({marketData.btc.pctChange})</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-bold">USD/BRL Compra: R$ {marketData.usd.bid}</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-bold">EUR/BRL Compra: R$ {marketData.eur.bid}</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-bold">CHF/BRL Compra: R$ {marketData.chf.bid}</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-bold">GBP/BRL Compra: R$ {marketData.gbp.bid}</span>
            <span className="text-slate-600">|</span>
            <span className="text-white font-bold">B3 IBOVESPA: {marketData.ibovespa.points} pts ({marketData.ibovespa.pctChange}%)</span>
          </div>
        </div>
      </div>

      {/* 2. CABEÇALHO DO ADMINMASTER SOBERANO */}
      <header className="bg-slate-900 border border-cyan-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white font-black flex items-center justify-center text-sm border border-cyan-300/40 shadow shrink-0">
            NsA
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-white text-sm sm:text-base">vpsNsA</span>
              <span className="bg-cyan-950 text-cyan-300 border border-cyan-500/60 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-xs">
                <Crown className="w-3 h-3 text-yellow-400" /> AdminMaster Active
              </span>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">vpsNsA Sovereign Master Core — Level 5 Full Root Access</span>
          </div>
        </div>

        <button 
          onClick={fetchRealMarketData}
          disabled={loading || loadingExternalMarket}
          className="flex items-center gap-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 px-3.5 py-1.5 rounded-lg text-xs text-cyan-300 transition-all shadow-sm cursor-pointer self-stretch sm:self-auto justify-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading || loadingExternalMarket ? 'animate-spin' : ''}`} />
          <span>Sincronizar APIs ({lastUpdate || 'Carregando'})</span>
        </button>
      </header>

      {/* 3. PAINEL PRINCIPAL COMBINADO (CONTAINER MESTRE + CARDS + PROXIES + CARTEIRA BTC) */}
      <div className="space-y-4">
        
        {/* CONTAINER MESTRE DE AUTO-SCALING E FAILOVER */}
        <MasterContainer />

        {/* CARDS DE CPUS E FERRAMENTAS COM 70% DE DESCONTO */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Supercomputação & Infraestrutura — Desconto de 70% PIX / Bitcoin à Vista
            </h2>
            {onNavigateTab && (
              <button 
                onClick={() => onNavigateTab('cpus')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                Ver todos os CPUs →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`bg-slate-900 border ${selectedPlan === plan.id ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)] ring-1 ring-cyan-400/50' : 'border-cyan-500/30'} p-4 rounded-xl flex flex-col justify-between relative overflow-hidden transition-all`}
              >
                <div className="absolute top-0 right-0 bg-red-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-bl shadow-sm">
                  -70% OFF
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white">{plan.name}</h3>
                  <div className="text-[10px] text-cyan-400 mt-1 space-y-0.5">
                    <p>⚡ {plan.cores}</p>
                    <p>🧠 {plan.ram}</p>
                    <p>💾 {plan.storage}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800">
                    <span className="text-[9px] text-slate-500 line-through block">De: R$ {plan.originalPrice.toFixed(2)}/mês</span>
                    <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                      R$ {plan.pixBtcPrice.toFixed(2)} <span className="text-[10px] text-white font-normal">à vista (PIX / BTC)</span>
                    </div>
                    <div className="text-[10px] text-slate-300 mt-1 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-cyan-400" />
                      <span>ou 12x de <strong className="text-white">R$ {plan.cardMonthly12x.toFixed(2)}</strong></span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`mt-4 w-full ${selectedPlan === plan.id ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300'} py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer`}
                >
                  {selectedPlan === plan.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Instância Selecionada</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Selecionar Instância</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* MÓDULO DE PROXIES RESIDENCIAIS ROTATIVAS (+180 PAÍSES) */}
        <ProxyManager />

        {/* CARTEIRA MESTRE BITCOIN & GATEWAY DE SAQUE */}
        <BtcWallet btcRateBrl={parseFloat(marketData.btc.bid.replace(/\./g, '').replace(',', '.')) || 382450} />

      </div>

    </div>
  );
};
