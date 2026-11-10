import React from 'react';
import { Cpu, Zap, Check, X, Shield, Award, Sparkles } from 'lucide-react';
import { CpuItem } from '../types';
import { DatacenterCorridorShowcase } from './DatacenterCorridorShowcase';

interface CpusViewProps {
  cpus: CpuItem[];
  onSelectPlan: (cpuModel: string) => void;
}

export const CpusView: React.FC<CpusViewProps> = ({ cpus, onSelectPlan }) => {
  return (
    <div className="space-y-8">
      {/* 1. Visão Real do Corredor Datacenter com Molduras Neon Ciano e Roxo */}
      <DatacenterCorridorShowcase compact={true} />

      {/* Header */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Award className="w-4 h-4 text-cyan-400" />
          <span>COMPUTAÇÃO DE ALTA PERFORMANCE · ARQUITETURA HYPERSCALE</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          Os CPUs Mais Modernos do Mundo no VPS NsA
        </h1>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Projetado para superar concorrentes tradicionais como Hostinger, AWS e OVH. Disponibilizamos processadores com até 128 núcleos físicos dedicados por socket e aceleradores de IA integrados com zero throttling térmico.
        </p>
      </div>

      {/* Modern CPUs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cpus.map(cpu => (
          <div
            key={cpu.id}
            className={`rounded-xl border p-5 flex flex-col justify-between space-y-4 transition-all ${
              cpu.featured
                ? 'border-cyan-500/50 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 shadow-lg shadow-cyan-950/20'
                : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  {cpu.brand} · {cpu.category}
                </span>
                {cpu.featured && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                    Destaque Máximo
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                  {cpu.model}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{cpu.architecture}</p>
              </div>

              {/* Specs badges */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 font-mono">
                <div>
                  <p className="text-[10px] text-slate-500">Núcleos / Threads</p>
                  <p className="font-bold text-white">{cpu.cores}C / {cpu.threads}T</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Clock Turbo</p>
                  <p className="font-bold text-cyan-400">{cpu.clock}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Memória Cache</p>
                  <p className="font-bold text-slate-200">{cpu.cache}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Eficiência TDP</p>
                  <p className="font-bold text-emerald-400">{cpu.tdp}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <p className="text-slate-300 font-medium">Ideal para:</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">{cpu.idealFor}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <div className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                <span className="font-bold">Vantagem vs Hostinger:</span> {cpu.hostingerComparison}
              </div>

              <button
                onClick={() => onSelectPlan(cpu.model)}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Contratar com {cpu.brand}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table vs Hostinger, AWS & DigitalOcean */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">
            Tabela Comparativa: VPS NsA vs Concorrentes Globais
          </h2>
          <p className="text-xs text-slate-400">
            Comparação direta de recursos e capacidade computacional bruta
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800 font-mono">
              <tr>
                <th scope="col" className="px-4 py-3">Recurso / Especificação</th>
                <th scope="col" className="px-4 py-3 text-cyan-400 font-bold bg-cyan-950/20">VPS NsA Enterprise</th>
                <th scope="col" className="px-4 py-3">Hostinger Cloud</th>
                <th scope="col" className="px-4 py-3">AWS EC2 (c6g/c7g)</th>
                <th scope="col" className="px-4 py-3">DigitalOcean Droplets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="hover:bg-slate-900/40">
                <td className="px-4 py-3 font-sans font-medium text-white">Modelos de Processador</td>
                <td className="px-4 py-3 text-cyan-300 font-bold bg-cyan-950/20">AMD EPYC Bergamo 128C & GH200</td>
                <td className="px-4 py-3 text-slate-400">Xeon Gen Anterior</td>
                <td className="px-4 py-3 text-slate-400">Graviton 3 / Intel</td>
                <td className="px-4 py-3 text-slate-400">AMD EPYC Gen 2 / Intel</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="px-4 py-3 font-sans font-medium text-white">Velocidade de Disco (IOPS)</td>
                <td className="px-4 py-3 text-cyan-300 font-bold bg-cyan-950/20">1.420.000 IOPS Gen5</td>
                <td className="px-4 py-3 text-slate-400">~25.000 IOPS</td>
                <td className="px-4 py-3 text-slate-400">80.000 IOPS (Pago à parte)</td>
                <td className="px-4 py-3 text-slate-400">~30.000 IOPS</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="px-4 py-3 font-sans font-medium text-white">Latência em São Paulo (B3)</td>
                <td className="px-4 py-3 text-emerald-400 font-bold bg-cyan-950/20">1.8 ms Direto</td>
                <td className="px-4 py-3 text-slate-400">18 - 45 ms</td>
                <td className="px-4 py-3 text-slate-400">12 ms</td>
                <td className="px-4 py-3 text-slate-400">Sem Datacenter SP</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="px-4 py-3 font-sans font-medium text-white">Criptografia Argon2id Nativa</td>
                <td className="px-4 py-3 text-cyan-300 font-bold bg-cyan-950/20">Integrada com Aceleração HW</td>
                <td className="px-4 py-3 text-rose-400">Não nativo</td>
                <td className="px-4 py-3 text-slate-400">Configuração manual</td>
                <td className="px-4 py-3 text-slate-400">Configuração manual</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="px-4 py-3 font-sans font-medium text-white">Pagamento Mercado Pago & PIX</td>
                <td className="px-4 py-3 text-cyan-300 font-bold bg-cyan-950/20">Instantâneo (Titular VPSNsA)</td>
                <td className="px-4 py-3 text-slate-400">Intermediário terceiro</td>
                <td className="px-4 py-3 text-rose-400">Apenas Dólar / Cartão Int</td>
                <td className="px-4 py-3 text-rose-400">Apenas Dólar / Cartão Int</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="px-4 py-3 font-sans font-medium text-white">Proteção Anti-DDoS</td>
                <td className="px-4 py-3 text-emerald-400 font-bold bg-cyan-950/20">3.2 Tbps Anycast Grátis</td>
                <td className="px-4 py-3 text-slate-400">Básica ~10 Gbps</td>
                <td className="px-4 py-3 text-slate-400">AWS Shield Advanced ($3k/mês)</td>
                <td className="px-4 py-3 text-slate-400">Básica</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
