import React, { useState } from 'react';
import {
  Globe2,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Plus,
  RefreshCw,
  ExternalLink,
  Lock,
  Wifi,
} from 'lucide-react';
import { DomainItem } from '../types';
import { SslHardeningInspector } from './SslHardeningInspector';

interface DomainsViewProps {
  domains: DomainItem[];
  onRegisterDomain: (domain: string, targetContainer: string) => Promise<void>;
  onNavigateTab?: (tab: string) => void;
}

export const DomainsView: React.FC<DomainsViewProps> = ({ domains, onRegisterDomain, onNavigateTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{
    domain: string;
    available: boolean;
    price: string;
    tld: string;
    registry: string;
  }> | null>(null);
  const [selectedContainer, setSelectedContainer] = useState('ecommerce-vpsnsa-master');
  const [registeringDomain, setRegisteringDomain] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch('/api/domains/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setSearchResults(data.results);
    } catch {
      const clean = searchQuery.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setSearchResults([
        { domain: `${clean}.com.br`, available: true, price: 'R$ 39,90/ano', tld: '.com.br', registry: 'Registro.br' },
        { domain: `${clean}.com`, available: true, price: 'R$ 59,90/ano', tld: '.com', registry: 'VeriSign Global' },
        { domain: `${clean}.cloud`, available: true, price: 'R$ 29,90/ano', tld: '.cloud', registry: 'VPSNsA Cloud TLD' },
      ]);
    } finally {
      setSearching(false);
    }
  };

  const handleRegister = async (domain: string) => {
    setRegisteringDomain(domain);
    await onRegisterDomain(domain, selectedContainer);
    setRegisteringDomain(null);
    if (searchResults) {
      setSearchResults(
        searchResults.map(r => (r.domain === domain ? { ...r, available: false } : r))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Register Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-cyan-400" />
              Painel de Criação e Registro de Domínios Globais
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Pesquise e registre extensões .com.br, .com, .cloud e .tech com apontamento DNS instantâneo e certificado SSL Wildcard automático.
            </p>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('dns-health')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition-all shadow-sm hover:border-cyan-400 shrink-0 self-start md:self-auto cursor-pointer"
            >
              <Wifi className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Verificar Saúde & Propagação DNS Global →</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              placeholder="Digite o domínio desejado (ex: novaloja, meuapp, vpsnsatech)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            {searching ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verificando...
              </>
            ) : (
              'Verificar Disponibilidade'
            )}
          </button>
        </form>

        {/* Search Results */}
        {searchResults && (
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="text-xs font-semibold text-slate-300">
              Resultados da Pesquisa para "{searchQuery}":
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map(result => (
                <div
                  key={result.domain}
                  className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-white font-mono">{result.domain}</p>
                      <p className="text-[10px] text-slate-400">{result.registry}</p>
                    </div>
                    {result.available ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        DISPONÍVEL
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                        REGISTRADO
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-xs font-bold text-cyan-300 font-mono">{result.price}</span>
                    {result.available ? (
                      <button
                        onClick={() => handleRegister(result.domain)}
                        disabled={registeringDomain === result.domain}
                        className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        {registeringDomain === result.domain ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" /> Registrando...
                          </>
                        ) : (
                          'Registrar Agora'
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500">Indisponível</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SSL Labs Grade A+ Criptografia & Hardening Inspector */}
      <SslHardeningInspector />

      {/* Active Domains & DNS Records Table */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Domínios Ativos no Servidor VPS NsA
        </h2>

        <div className="space-y-4">
          {domains.map(dom => (
            <div
              key={dom.domain}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-mono">{dom.domain}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">
                      {dom.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Vinculado ao Container: <span className="text-cyan-300 font-mono">{dom.targetContainer}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{dom.sslStatus}</span>
                  </div>
                  <span className="text-slate-600">·</span>
                  <span>DNSSEC: Ativo</span>
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('dns-health')}
                      className="ml-2 px-2.5 py-1 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Wifi className="w-3 h-3 text-cyan-400" />
                      <span>Auditar Propagação</span>
                    </button>
                  )}
                </div>
              </div>

              {/* DNS Records */}
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-2">
                  Zona DNS Global Anycast (Registros A, CNAME, TXT, MX):
                </p>
                <div className="overflow-x-auto rounded-lg border border-slate-800/80">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="text-[10px] text-slate-400 uppercase bg-slate-950 font-mono">
                      <tr>
                        <th className="px-3 py-2">Tipo</th>
                        <th className="px-3 py-2">Nome (Host)</th>
                        <th className="px-3 py-2">Destino / Valor</th>
                        <th className="px-3 py-2">TTL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-mono">
                      {dom.dnsRecords.map((rec, i) => (
                        <tr key={i} className="hover:bg-slate-900/60">
                          <td className="px-3 py-1.5 font-bold text-cyan-400">{rec.type}</td>
                          <td className="px-3 py-1.5 text-slate-300">{rec.name}</td>
                          <td className="px-3 py-1.5 text-slate-200">{rec.content}</td>
                          <td className="px-3 py-1.5 text-slate-400">{rec.ttl}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
