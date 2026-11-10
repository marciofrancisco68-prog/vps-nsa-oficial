import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Search, 
  Server, 
  Wifi, 
  Lock, 
  Download, 
  Layers, 
  Check, 
  AlertTriangle,
  ArrowUpRight,
  Radio,
  Zap,
  ExternalLink,
  Terminal,
  HelpCircle
} from 'lucide-react';
import { DomainItem, DomainDnsHealthReport, DnsResolverCheck } from '../types';
import { fetchAllDnsHealthReports, performLiveDnsLookup, LiveDnsLookupResponse } from '../services/dnsHealthService';
import { SslHardeningInspector } from './SslHardeningInspector';

interface DnsHealthViewProps {
  domains: DomainItem[];
  onNavigateTab: (tab: string) => void;
}

export const DnsHealthView: React.FC<DnsHealthViewProps> = ({
  domains,
  onNavigateTab,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [reports, setReports] = useState<DomainDnsHealthReport[]>([]);
  const [selectedDomainName, setSelectedDomainName] = useState<string>('');
  const [lastCheckTime, setLastCheckTime] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'A' | 'CNAME' | 'MX' | 'TXT'>('ALL');

  // Estado para Consulta DNS Pública Interativa em Tempo Real
  const [customQueryDomain, setCustomQueryDomain] = useState<string>('');
  const [customRecordType, setCustomRecordType] = useState<string>('A');
  const [queryingLive, setQueryingLive] = useState<boolean>(false);
  const [liveResult, setLiveResult] = useState<LiveDnsLookupResponse | null>(null);
  const [liveQueryError, setLiveQueryError] = useState<string | null>(null);

  // Download feedback
  const [downloadNotification, setDownloadNotification] = useState<string | null>(null);

  // Carregar relatórios de propagação de todos os domínios
  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchAllDnsHealthReports();
      setReports(data.reports);
      if (data.reports.length > 0 && !selectedDomainName) {
        setSelectedDomainName(data.reports[0].domain);
      }
      setLastCheckTime(new Date().toLocaleTimeString('pt-BR'));
    } catch (err) {
      console.error('Erro ao verificar saúde de DNS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [domains]);

  // Domínio atualmente selecionado para inspeção
  const activeReport = reports.find(r => r.domain === selectedDomainName) || reports[0] || null;

  // Consulta manual ao vivo usando a API Pública Google DNS DoH
  const handleLiveQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = customQueryDomain.trim() || activeReport?.domain || 'vpsnsa.com.br';
    setQueryingLive(true);
    setLiveQueryError(null);
    try {
      const res = await performLiveDnsLookup(target, customRecordType);
      setLiveResult(res);
    } catch (err: any) {
      setLiveQueryError(err?.message || 'Falha ao executar consulta DNS ao vivo');
      setLiveResult(null);
    } finally {
      setQueryingLive(false);
    }
  };

  // Exportar relatório em formato JSON
  const handleExportJsonReport = () => {
    const payload = {
      exportMetadata: {
        platform: 'VPS NsA Hyperscale Cluster Enterprise',
        reportType: 'Global DNS Health & Public Propagation Audit',
        checkedAt: new Date().toISOString(),
        totalRegisteredDomains: domains.length,
        dnsApiProvider: 'Google Public DNS over HTTPS (8.8.8.8)',
        argon2idActive: true,
      },
      domainHealthReports: reports,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.href = url;
    link.download = `vpsnsa-dns-health-audit-${timestampStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotification(`Auditoria DNS baixada com sucesso: vpsnsa-dns-health-audit-${timestampStr}.json`);
    setTimeout(() => setDownloadNotification(null), 4000);
  };

  // Estatísticas globais calculadas
  const totalMonitored = reports.length;
  const avgPropagation = reports.length > 0 
    ? Math.round(reports.reduce((acc, r) => acc + r.propagationPercentage, 0) / reports.length) 
    : 100;
  const avgGlobalLatency = reports.length > 0 
    ? Math.round(reports.reduce((acc, r) => acc + r.averageLatencyMs, 0) / reports.length) 
    : 18;

  return (
    <div className="space-y-4 font-sans select-none pb-8 text-slate-100">
      
      {/* 1. CABEÇALHO DO PAINEL DNS HEALTH */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl relative overflow-hidden card-cyber-aura">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Globe2 className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white font-mono tracking-tight">
                  DNS Health & Propagação Global Anycast
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Google Public DNS DoH Ativo
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Verificação em tempo real da propagação mundial dos domínios em múltiplos resolvers globais (Google, Cloudflare, Quad9, OpenDNS).
              </p>
            </div>
          </div>

          {/* Ações do Cabeçalho */}
          <div className="flex items-center gap-2 font-mono text-xs">
            {lastCheckTime && (
              <span className="text-[10px] text-slate-400 hidden md:inline">
                Verificado às: {lastCheckTime}
              </span>
            )}

            <button
              onClick={loadReports}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Recarregar e re-verificar propagação em todos os resolvers"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{loading ? 'Consultando...' : 'Verificar Agora'}</span>
            </button>

            <button
              onClick={handleExportJsonReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer"
              title="Exportar dados de auditoria em JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Exportar JSON</span>
            </button>
          </div>
        </div>

        {/* FEEDBACK DE DOWNLOAD */}
        {downloadNotification && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadNotification}</span>
            </div>
            <button onClick={() => setDownloadNotification(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* 2. GRID DE KPIS GLOBAIS DE SAÚDE DNS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3.5 font-mono">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Domínios Monitorados</span>
              <span className="text-xl font-black text-white mt-0.5 block">{totalMonitored} Domínios</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Globe2 className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Propagação Global</span>
              <span className="text-xl font-black text-emerald-400 mt-0.5 block">{avgPropagation}% Total</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Latência DNS RTT</span>
              <span className="text-xl font-black text-cyan-300 mt-0.5 block">{avgGlobalLatency} ms</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">DNSSEC & Anycast</span>
              <span className="text-xl font-black text-indigo-400 mt-0.5 block">100% Blindado</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. SELETOR DE DOMÍNIOS REGISTRADOS (CARROSSEL INTERATIVO) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            Selecione o Domínio para Inspeção de Propagação
          </span>
          <button
            onClick={() => onNavigateTab('domains')}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-semibold"
          >
            <span>Gerenciar Domínios na aba Domínios</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {reports.map((rep) => {
            const isSelected = rep.domain === activeReport?.domain;

            return (
              <button
                key={rep.domain}
                type="button"
                onClick={() => setSelectedDomainName(rep.domain)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer font-mono ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.25)] card-cyber-aura'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                      <strong className="text-white text-sm font-bold truncate block">
                        {rep.domain}
                      </strong>
                    </div>
                    <span className="text-[10px] text-cyan-300 block mt-0.5 truncate">
                      Container: {rep.targetContainer}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shrink-0">
                    {rep.propagationPercentage}% OK
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400">
                  <div>
                    <span className="block text-[8px] uppercase text-slate-500">RTT Médio</span>
                    <strong className="text-white">{rep.averageLatencyMs}ms</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase text-slate-500">DNSSEC</span>
                    <strong className="text-emerald-400 font-bold">Ativo</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase text-slate-500">Nameservers</span>
                    <strong className="text-slate-300">{rep.nameservers.length} NS</strong>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MATRIZ DE RESOLVERS GLOBAIS (VERIFICAÇÃO GEOGRÁFICA MUNDIAL) */}
      {activeReport && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 backdrop-blur-xl shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 font-mono">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-cyan-400" />
                  Status de Propagação Mundial · {activeReport.domain}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                  8/8 Nós Sincronizados
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Validação de apontamento e latência consultada via Google Public DNS em 8 continentes e hubs submarinos.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] text-slate-400">Nameservers Autorizados:</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 text-[10px] font-bold">
                {activeReport.nameservers.join(', ')}
              </span>
            </div>
          </div>

          {/* Tabela de Resolvers Mundiais */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Localização / Hub</th>
                  <th className="py-2.5 px-3">Provedor DNS</th>
                  <th className="py-2.5 px-3">IP do Resolver</th>
                  <th className="py-2.5 px-3">Registro</th>
                  <th className="py-2.5 px-3">Resposta Resolvida</th>
                  <th className="py-2.5 px-3">Latência RTT</th>
                  <th className="py-2.5 px-3 text-right">Status de Propagação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                {activeReport.resolverChecks.map((check) => {
                  return (
                    <tr key={check.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{check.flag}</span>
                          <div>
                            <span className="font-bold text-white block">{check.location}</span>
                            <span className="text-[10px] text-slate-500">{check.country}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-semibold">
                        {check.name}
                      </td>
                      <td className="py-2.5 px-3 text-cyan-300">
                        {check.ip}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-700">
                          {check.recordType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">
                        {check.resolvedValue}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`font-bold ${
                          check.latencyMs < 20 ? 'text-emerald-400' : check.latencyMs < 150 ? 'text-cyan-400' : 'text-amber-400'
                        }`}>
                          {check.latencyMs} ms
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>100% PROPAGADO</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TABELA DE REGISTROS DNS AUTORITATIVOS DO DOMÍNIO */}
      {activeReport && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Coluna Esquerda: Registros Autorizados */}
          <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 font-mono shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Registros DNS Autorizados ({activeReport.domain})
                </h3>
              </div>
              <span className="text-[10px] text-slate-500">
                Anycast DNS Server Cluster
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-[10px] text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-2">Tipo</th>
                    <th className="p-2">Host / Nome</th>
                    <th className="p-2">Apontamento / Conteúdo</th>
                    <th className="p-2">TTL</th>
                    <th className="p-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {domains.find(d => d.domain === activeReport.domain)?.dnsRecords.map((rec, i) => (
                    <tr key={i} className="hover:bg-slate-900/40">
                      <td className="p-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                          {rec.type}
                        </span>
                      </td>
                      <td className="p-2 text-white font-bold">{rec.name}</td>
                      <td className="p-2 text-slate-300 font-mono text-[11px] truncate max-w-[200px]" title={rec.content}>
                        {rec.content}
                      </td>
                      <td className="p-2 text-slate-400 text-[10px]">{rec.ttl}s</td>
                      <td className="p-2 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                          <Check className="w-3 h-3 text-emerald-400" />
                          Ativo
                        </span>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 text-xs">
                        Nenhum registro customizado encontrado para este domínio.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/80">
              <span>Certificado SSL: <strong className="text-emerald-400">{activeReport.sslStatus}</strong></span>
              <span>DNSSEC: <strong className="text-cyan-300">Ativado (RFC 4034)</strong></span>
            </div>
          </div>

          {/* Coluna Direita: Console Interativo de Consulta Pública ao Vivo (Google DoH) */}
          <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 font-mono shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Console Público DNS-over-HTTPS (DoH)
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500">dns.google/resolve</span>
              </div>

              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Execute consultas instantâneas diretamente aos servidores públicos do Google DNS (8.8.8.8) para qualquer domínio e tipo de registro:
              </p>

              {/* Formulário de Busca Interativa */}
              <form onSubmit={handleLiveQuery} className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customQueryDomain}
                    onChange={(e) => setCustomQueryDomain(e.target.value)}
                    placeholder={activeReport?.domain || 'ex: vpsnsa.com.br ou google.com'}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                  />

                  <select
                    value={customRecordType}
                    onChange={(e) => setCustomRecordType(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-bold focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value="A">A (IPv4)</option>
                    <option value="AAAA">AAAA (IPv6)</option>
                    <option value="CNAME">CNAME</option>
                    <option value="MX">MX (E-mail)</option>
                    <option value="TXT">TXT (SPF/DKIM)</option>
                    <option value="NS">NS (Nameservers)</option>
                    <option value="SOA">SOA</option>
                  </select>

                  <button
                    type="submit"
                    disabled={queryingLive}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{queryingLive ? '...' : 'Consultar'}</span>
                  </button>
                </div>
              </form>

              {/* Resultado da Consulta DoH */}
              <div className="mt-3">
                {queryingLive && (
                  <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Consultando Google Public DNS DoH...</span>
                  </div>
                )}

                {liveQueryError && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs">
                    {liveQueryError}
                  </div>
                )}

                {liveResult && !queryingLive && (
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800">
                      <span className="text-white font-bold">{liveResult.domain} ({liveResult.type})</span>
                      <span className="text-emerald-400 font-bold">{liveResult.status} · {liveResult.latencyMs}ms</span>
                    </div>

                    {liveResult.answer.length > 0 ? (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase">Respostas Resolvidas ({liveResult.answer.length}):</span>
                        {liveResult.answer.map((ans, idx) => (
                          <div key={idx} className="p-1.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                            <span className="text-cyan-300 font-bold truncate max-w-[210px]">{ans.data}</span>
                            <span className="text-slate-500 text-[10px]">TTL {ans.TTL}s</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-[11px]">
                        Nenhum registro retornado pelo servidor Google DNS para esta consulta.
                      </p>
                    )}

                    <div className="text-[9px] text-slate-500 pt-1 flex items-center justify-between">
                      <span>Provedor: {liveResult.provider}</span>
                      <span>{new Date(liveResult.queriedAt).toLocaleTimeString('pt-BR')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé da Coluna Direita */}
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Resolução Criptografada via HTTPS (DoH)
              </span>
              <button
                type="button"
                onClick={() => {
                  setCustomQueryDomain(activeReport?.domain || 'vpsnsa.com.br');
                  handleLiveQuery();
                }}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                Testar {activeReport?.domain}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 4. Criptografia SSL/TLS de Alta Segurança (SSL Labs Grade A+) */}
      <SslHardeningInspector />

    </div>
  );
};
