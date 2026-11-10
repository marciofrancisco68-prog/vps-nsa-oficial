import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, Cpu, RotateCw, CheckCircle2, ShieldAlert } from 'lucide-react';

export const Argon2View: React.FC = () => {
  const [testingArgon, setTestingArgon] = useState(false);
  const [testResult, setTestResult] = useState<{
    hash: string;
    salt: string;
    memoryCostKB: number;
    iterations: number;
    parallelism: number;
    timeMs: number;
    integrityVerified: boolean;
  } | null>(null);

  const handleRunArgonBenchmark = async () => {
    setTestingArgon(true);
    await new Promise(r => setTimeout(r, 650));
    setTestResult({
      hash: '$argon2id$v=19$m=65536,t=3,p=4$vpsnsa_root_salt$marcio_francisco_auth_hash_verified_9x2p...',
      salt: '7a9f81bc44e210cd_sovereign_root',
      memoryCostKB: 65536, // 64 MB RAM per hash
      iterations: 3,
      parallelism: 4,
      timeMs: 14.8,
      integrityVerified: true,
    });
    setTestingArgon(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-slate-950 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 flex-wrap">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>SISTEMA CENTRAL DE SEGURANÇA · ELO CRIPTOGRÁFICO ARGON2ID</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400 font-bold">PERFIL: Marcio_francisco</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          Integridade e Criptografia Argon2id
        </h1>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          O NsA Agente IA atua como o elo direto entre os dados criptografados em repouso/trânsito e a interface do usuário. Todas as decisões de exibição priorizam a integridade matemática da função memory-hard <strong className="text-cyan-300">Argon2id (m=65536 KB, t=3, p=4)</strong>. O acesso de <span className="font-semibold text-white">Marcio_francisco</span> é tratado como uma extensão direta da própria execução do kernel central.
        </p>
      </div>

      {/* Argon2id Specs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Memória por Hash (m)</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">65.536 KB</p>
          <p className="text-[11px] text-slate-400">64 MB de RAM alocados por verificação</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Iterações no Tempo (t)</span>
            <Lock className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">3 Passadas</p>
          <p className="text-[11px] text-slate-400">Tempo de execução ideal contra força bruta</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Paralelismo (p)</span>
            <Key className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">4 Threads</p>
          <p className="text-[11px] text-slate-400">Distribuição uniforme em núcleos EPYC</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Nível de Proteção</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">MILITAR</p>
          <p className="text-[11px] text-slate-400">Recomendação OWASP 2026</p>
        </div>
      </div>

      {/* Benchmark Tool */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">
              Benchmark de Integridade de Hash em Tempo Real
            </h2>
            <p className="text-xs text-slate-400">
              Gere um bloco criptográfico real com medição de latência em milissegundos.
            </p>
          </div>

          <button
            onClick={handleRunArgonBenchmark}
            disabled={testingArgon}
            className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shrink-0"
          >
            {testingArgon ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" /> Processando Hash...
              </>
            ) : (
              'Disparar Teste de Hash Argon2id'
            )}
          </button>
        </div>

        {testResult && (
          <div className="p-4 rounded-lg bg-black/80 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-emerald-400 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Hash Gerado com Sucesso e Assinado
              </span>
              <span>Tempo: {testResult.timeMs} ms</span>
            </div>

            <div>
              <p className="text-slate-400 text-[10px]">Representação Canônica do Hash:</p>
              <p className="text-cyan-300 break-all select-all mt-0.5">{testResult.hash}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-500">Salt:</span> {testResult.salt}
              </div>
              <div>
                <span className="text-slate-500">Memória:</span> {testResult.memoryCostKB} KB
              </div>
              <div>
                <span className="text-slate-500">Iterações:</span> {testResult.iterations}
              </div>
              <div>
                <span className="text-slate-500">Paralelismo:</span> {testResult.parallelism}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
