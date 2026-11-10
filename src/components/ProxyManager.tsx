import React, { useState } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  Lock, 
  Zap,
  SlidersHorizontal,
  Check
} from 'lucide-react';

export interface ProxyItem {
  id: number;
  country: string;
  flag: string;
  ip: string;
  port: string;
  used: string;
  total: string;
  percentage: number;
  status: 'Ativa' | 'Rotacionando' | 'Standby';
}

export interface ProxyManagerProps {
  className?: string;
}

export const ProxyManager: React.FC<ProxyManagerProps> = ({ className = '' }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('🇧🇷 Brasil');
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [proxies, setProxies] = useState<ProxyItem[]>([
    { id: 1, country: 'Brasil', flag: '🇧🇷', ip: '185.122.84.19', port: '8080', used: '0.32 GB', total: '1.0 GB', percentage: 32, status: 'Ativa' },
    { id: 2, country: 'EUA', flag: '🇺🇸', ip: '104.28.192.42', port: '8080', used: '2.45 GB', total: '5.0 GB', percentage: 49, status: 'Ativa' },
    { id: 3, country: 'Alemanha', flag: '🇩🇪', ip: '185.93.18.77', port: '8080', used: '7.10 GB', total: '10.0 GB', percentage: 71, status: 'Ativa' },
    { id: 4, country: 'Japão', flag: '🇯🇵', ip: '133.242.105.12', port: '8080', used: '1.20 GB', total: '2.0 GB', percentage: 60, status: 'Ativa' },
  ]);

  const countryOptions = [
    { label: '🇧🇷 Brasil', prefix: '185.122', port: '8080' },
    { label: '🇺🇸 Estados Unidos', prefix: '104.28', port: '8080' },
    { label: '🇩🇪 Alemanha', prefix: '185.93', port: '8080' },
    { label: '🇯🇵 Japão', prefix: '133.242', port: '8080' },
    { label: '🇬🇧 Reino Unido', prefix: '141.101', port: '8080' },
    { label: '🇨🇭 Suíça', prefix: '194.150', port: '8080' },
  ];

  const handleRotateIp = () => {
    setIsRotating(true);
    setNotification('Iniciando rotação de túnel proxy via ASN residencial...');
    setTimeout(() => {
      setProxies(prev => prev.map(p => {
        const randOctet3 = Math.floor(Math.random() * 200) + 10;
        const randOctet4 = Math.floor(Math.random() * 240) + 10;
        const parts = p.ip.split('.');
        const newIp = `${parts[0]}.${parts[1]}.${randOctet3}.${randOctet4}`;
        return {
          ...p,
          ip: newIp,
          status: 'Ativa'
        };
      }));
      setIsRotating(false);
      setNotification(`✓ IPs residenciais rotacionados com sucesso para ${selectedCountry}!`);
      setTimeout(() => setNotification(null), 4000);
    }, 1200);
  };

  return (
    <div className={`bg-slate-900/90 border border-cyan-500/40 rounded-xl p-4 shadow-xl space-y-3 font-mono ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cyan-500/30 pb-2 gap-2">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          vpsNsA Residential Proxy Manager (+180 Países)
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> IPs Reais & Anônimos
          </span>
          <button
            onClick={handleRotateIp}
            disabled={isRotating}
            className="text-[10px] bg-cyan-950 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-300 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isRotating ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Rotacionar IPs</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="text-[11px] text-cyan-300 bg-cyan-950/80 border border-cyan-700 px-3 py-1.5 rounded flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Grid: Active Proxies & Country Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Active Proxies List */}
        <div className="space-y-2">
          <span className="text-[10px] text-slate-400 block font-semibold flex items-center justify-between">
            <span>Minhas Proxies Ativas (Consumo em Tempo Real):</span>
            <span className="text-cyan-400">Total: {proxies.length} endpoints</span>
          </span>
          
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {proxies.map((p) => (
              <div 
                key={p.id} 
                className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{p.flag}</span>
                  <div>
                    <p className="font-bold text-white text-[11px] flex items-center gap-1.5">
                      <span>{p.country}</span>
                      <span className="text-cyan-300 font-mono text-[10px]">({p.ip})</span>
                    </p>
                    <p className="text-[9px] text-slate-400">
                      Status: <span className="text-emerald-400 font-semibold">{p.status}</span> · Porta: {p.port}
                    </p>
                  </div>
                </div>
                <div className="text-right w-28">
                  <span className="text-[9px] text-cyan-300 block font-bold">{p.used} / {p.total}</span>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        p.percentage > 70 ? 'bg-amber-400' : 'bg-cyan-400'
                      }`} 
                      style={{ width: `${p.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Country Selector & Capabilities */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block mb-2 font-semibold">
              SELECIONAR PAÍS DA REDE PROXY:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {countryOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setSelectedCountry(opt.label)}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer text-[11px] font-bold ${
                    selectedCountry === opt.label 
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.3)]' 
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Rotação automática de IP habilitada com criptografia de ponta a ponta.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Sem retenção de logs (No-Log Policy) nos nós residenciais vpsNsA.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
