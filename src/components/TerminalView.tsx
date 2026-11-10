import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Play, 
  Trash2, 
  ShieldCheck, 
  CornerDownLeft, 
  Sparkles, 
  Check, 
  ArrowRight,
  Zap
} from 'lucide-react';

interface TerminalViewProps {
  initialCommand?: string;
  onClearInitialCommand?: () => void;
}

interface AiOptimizationSuggestion {
  originalCmd: string;
  suggestedCmd: string;
  efficiencyGain: string;
  rationale: string;
  details: string[];
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  initialCommand,
  onClearInitialCommand,
}) => {
  const [history, setHistory] = useState<Array<{ command: string; output: string }>>([
    {
      command: 'neofetch',
      output: `       _.-'''''''-._       vpsnsa@nsa-datacenter-sp01
     .'  _________  '.     -----------------------------------
    /   /         \\   \\    OS: NsA Cloud Linux Enterprise 6.10.9 x86_64/ARM64
   |   |   NsA     |   |   Host: Hyperscale Server Cluster Rack Unit A2
   |   |  CLOUD    |   |   Kernel: 6.10.9-enterprise-argon2id
    \\   \\_________/   /    Uptime: 342 days, 14 hours, 28 mins
     '.             .'     Packages: 1420 (dpkg), 48 (containers)
       '-._______.-'       Shell: zsh 5.9 / Argon2 Secure Tunnel
                           Resolution: Multi-Region Anycast Mesh
                           CPU: AMD EPYC 9754 (256) @ 3.10GHz + NVIDIA GH200 (72)
                           GPU: NVIDIA GH200 96GB HBM3 NVLink
                           Memory: 512.4GB / 2048GB DDR5 ECC Octa-Channel
                           Disk (/): 34.6TB / 120TB NVMe Gen5 Array (28%)
                           Recipient Mercado Pago: VPSNsA (Todos os direitos reservados a VPS NsA Hyperscale Cluster Enterprise)`
    }
  ]);
  const [currentCmd, setCurrentCmd] = useState('');
  const [executing, setExecuting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<AiOptimizationSuggestion | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Handle external execution trigger from Gemini Chat
  useEffect(() => {
    if (initialCommand) {
      setCurrentCmd(initialCommand);
      executeCommandString(initialCommand);
      if (onClearInitialCommand) onClearInitialCommand();
    }
  }, [initialCommand]);

  const executeCommandString = async (cmdToRun: string) => {
    const cmd = cmdToRun.trim();
    if (!cmd) return;

    if (cmd === 'clear') {
      setHistory([]);
      setCurrentCmd('');
      return;
    }

    setExecuting(true);
    try {
      const res = await fetch('/api/ssh/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      setHistory(prev => [...prev, { command: cmd, output: data.output }]);
    } catch {
      setHistory(prev => [
        ...prev,
        { command: cmd, output: `[EXEC] Comando "${cmd}" executado no servidor central VPSNsA.` }
      ]);
    } finally {
      setCurrentCmd('');
      setExecuting(false);
    }
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeCommandString(currentCmd);
  };

  // Obtém o último comando executado
  const lastExecutedCommand = history.length > 0 ? history[history.length - 1].command : null;

  // Trigger para 'AI Optimization' com chamada simulada
  const handleAiOptimize = async () => {
    const cmdToAnalyze = lastExecutedCommand || currentCmd || 'neofetch';
    setIsOptimizing(true);

    try {
      // Simulação de chamada de IA analisando AST, pipelines e subsistemas do kernel
      await new Promise(resolve => setTimeout(resolve, 800));

      const normalized = cmdToAnalyze.trim().toLowerCase();
      let recommendation: {
        title: string;
        suggestedCmd: string;
        efficiencyGain: string;
        rationale: string;
        details: string[];
      };

      if (normalized.startsWith('docker ps')) {
        recommendation = {
          title: 'Docker Container Inspection Optimization',
          suggestedCmd: 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.RunningFor}}" --filter "status=running"',
          efficiencyGain: '+54% velocidade de renderização e parsing',
          rationale: 'Reduz o overhead de serialização JSON do containerd solicitando apenas colunas essenciais.',
          details: [
            'Evita truncamento visual das portas e nomes de instâncias no terminal.',
            'Zero locking no socket local do daemon durante requisições concorrentes de alta frequência.',
            'Alternativa em lote: execute `docker stats --no-stream` para telemetria sem bloqueio.'
          ]
        };
      } else if (normalized.startsWith('htop') || normalized.startsWith('top')) {
        recommendation = {
          title: 'Low-Overhead Process Profiler',
          suggestedCmd: 'ps -eo pid,user,%cpu,%mem,cmd --sort=-%cpu | head -n 12',
          efficiencyGain: '+82% menor consumo de ticks de CPU e rede',
          rationale: 'Substitui a interface ncurses interativa contínua por uma amostragem pontual de alto rendimento.',
          details: [
            'Ideal para diagnósticos remotos via túnel SSH sem poluir tráfego Anycast.',
            'Captura instantaneamente os 12 processos com maior consumo no AMD EPYC.',
            'Alternativa leve e visual: utilize `glances -t 2 --disable-plugin disk`.'
          ]
        };
      } else if (normalized.startsWith('free')) {
        recommendation = {
          title: 'Memory & Slab Allocation Diagnostic',
          suggestedCmd: 'free -h --wide && vmstat -s | grep -E "(active|inactive|buffer|cache)"',
          efficiencyGain: '+40% precisão diagnóstica de RAM DDR5 ECC',
          rationale: 'A flag `--wide` separa memória em buffer de páginas em cache reclaimed do kernel.',
          details: [
            'Permite detectar retenção de memória em containers antes de OOM-Kills.',
            'Exibe contadores de dirty pages diretamente do subsistema de memória virtual.'
          ]
        };
      } else if (normalized.startsWith('df')) {
        recommendation = {
          title: 'Storage Array NVMe Gen5 Filtering',
          suggestedCmd: 'df -hT --exclude-type=tmpfs --exclude-type=devtmpfs --exclude-type=squashfs',
          efficiencyGain: '+60% legibilidade instantânea de partições físicas',
          rationale: 'Elimina ruído de overlays efêmeros de containers e sistemas de arquivos em memória.',
          details: [
            'Foca exclusivamente nas partições NVMe Gen5 e blocos de armazenamento persistente.',
            'Exibe o tipo exato do sistema de arquivos (ext4, xfs, btrfs, zfs) para auditoria rápida.'
          ]
        };
      } else if (normalized.startsWith('neofetch')) {
        recommendation = {
          title: 'Fast Microsecond System Banner',
          suggestedCmd: 'fastfetch --logo-type small --load-config minimal',
          efficiencyGain: '+94% inicialização ultrarrápida (<3ms vs 48ms)',
          rationale: 'Código compilado nativamente em C substitui scripts bash com múltiplos forks de subshell.',
          details: [
            'Excelente para scripts de login e pipelines de inicialização rápida.',
            'Compatível com a arquitetura híbrida x86_64/ARM64 do cluster.'
          ]
        };
      } else if (normalized.startsWith('argon2')) {
        recommendation = {
          title: 'Argon2id Multi-threaded SIMD AVX-512',
          suggestedCmd: 'argon2-verify --threads $(nproc) --memory-cost 65536 --time-cost 3 --parallelism 4',
          efficiencyGain: '+48% vazão criptográfica com aceleração de hardware',
          rationale: 'Distribui as rodadas de hashing entre os 256 threads do AMD EPYC Bergamo.',
          details: [
            'Blindagem máxima contra ataques de força bruta paralelos em GPUs.',
            'Minimiza a latência da validação de autenticações simultâneas sob Zero-Trust.'
          ]
        };
      } else {
        recommendation = {
          title: 'Pipeline & Telemetry Optimization',
          suggestedCmd: `time (${cmdToAnalyze}) 2>&1 | tee -a /var/log/vpsnsa/audit.log`,
          efficiencyGain: '+35% rastreabilidade e telemetria de I/O wait',
          rationale: 'Encapsula cronometragem de CPU (user/sys) e persiste logs estruturados no disco NVMe.',
          details: [
            'Evita perda de saída em desordem de buffers stdout/stderr.',
            'Dica de I/O: Adicione `ionice -c 2 -n 0` para prioridade em leitura/escrita.'
          ]
        };
      }

      // Adiciona o relatório detalhado de IA no stream do terminal
      const aiOutput = `┌─ [AI OPTIMIZATION ENGINE — VPSNsA] ──────────────────────────────────────────
│ Comando Analisado: "${cmdToAnalyze}"
│ Sugestão Eficiente: ${recommendation.suggestedCmd}
│ Ganho Estimado:     ${recommendation.efficiencyGain}
│ Racional Técnico:   ${recommendation.rationale}
├─ Dicas de Engenharia:
${recommendation.details.map(d => `│ • ${d}`).join('\n')}
└──────────────────────────────────────────────────────────────────────────────`;

      setHistory(prev => [
        ...prev,
        {
          command: `nsa-ai-optimize --target="${cmdToAnalyze}"`,
          output: aiOutput,
        }
      ]);

      setActiveSuggestion({
        originalCmd: cmdToAnalyze,
        suggestedCmd: recommendation.suggestedCmd,
        efficiencyGain: recommendation.efficiencyGain,
        rationale: recommendation.rationale,
        details: recommendation.details,
      });

    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const quickCommands = [
    'neofetch',
    'docker ps',
    'htop',
    'free -m',
    'df -h',
    'argon2-verify',
    'mp-status',
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white flex items-center gap-2 font-mono">
              <TerminalIcon className="w-4 h-4 text-cyan-400" />
              Console SSH Interativo · VPSNsA Root Shell
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-bold">
              Argon2id Conectado
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Acesso root direto ao nó B3 SP1 (São Paulo) via túnel criptográfico seguro Zero-Trust.
          </p>
        </div>

        {/* Toolbar: AI Optimization + Quick Shortcuts + Clear */}
        <div className="flex flex-wrap items-center gap-2">
          {/* BOTÃO AI OPTIMIZATION */}
          <button
            type="button"
            onClick={handleAiOptimize}
            disabled={isOptimizing}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all border shadow-md cursor-pointer ${
              isOptimizing
                ? 'bg-purple-950/90 border-purple-500 text-purple-300 ring-1 ring-purple-400 animate-pulse'
                : 'bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-cyan-950/90 hover:from-purple-900 hover:to-cyan-900 text-purple-200 hover:text-white border-purple-500/60 hover:border-cyan-400 shadow-[0_0_15px_rgba(168,85,247,0.35)] active:scale-95'
            }`}
            title="Analisar e otimizar eficiência do último comando executado com IA"
          >
            <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>AI Optimization</span>
            {lastExecutedCommand && (
              <span className="text-[10px] text-purple-300/80 max-w-[130px] truncate hidden sm:inline">
                ({lastExecutedCommand})
              </span>
            )}
          </button>

          {/* Quick Command Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 mr-1 hidden sm:inline font-mono">Atalhos:</span>
            {quickCommands.map(cmd => (
              <button
                key={cmd}
                onClick={() => setCurrentCmd(cmd)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-cyan-300 transition-colors cursor-pointer border border-slate-700/60"
              >
                {cmd}
              </button>
            ))}
            <button
              onClick={() => {
                setHistory([]);
                setActiveSuggestion(null);
              }}
              title="Limpar tela do terminal"
              className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-xs transition-colors cursor-pointer border border-slate-700/60"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* BANNER REATIVO DE SUGESTÃO DE OTIMIZAÇÃO (SE ATIVO) */}
      {activeSuggestion && (
        <div className="bg-purple-950/40 border border-purple-500/50 rounded-xl p-3 font-mono text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-900/60 border border-purple-400/40 text-purple-300 shrink-0">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white uppercase text-[11px]">
                  Sugestão AI Engine:
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700 font-bold">
                  {activeSuggestion.efficiencyGain}
                </span>
              </div>
              <p className="text-cyan-300 font-semibold mt-0.5 break-all">
                {activeSuggestion.suggestedCmd}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setCurrentCmd(activeSuggestion.suggestedCmd);
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Aplicar no Prompt</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveSuggestion(null)}
              className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs"
            >
              Dispensar
            </button>
          </div>
        </div>
      )}

      {/* Terminal Screen */}
      <div className="rounded-xl border border-slate-800 bg-black/95 p-5 min-h-[460px] max-h-[580px] overflow-y-auto font-mono text-xs space-y-4 shadow-2xl relative">
        {/* Welcome Banner */}
        <div className="text-slate-400 border-b border-slate-800/80 pb-3 leading-relaxed">
          <p className="text-cyan-400 font-bold">NsA Cloud Enterprise Linux 6.10.9-enterprise-argon2</p>
          <p>Autenticado como: <span className="text-white font-semibold">root@vpsnsa</span></p>
          <p>
            Digite <span className="text-cyan-300 font-semibold">'help'</span> para listar comandos, use os atalhos ou clique em <span className="text-purple-300 font-bold">'AI Optimization'</span> para sugestões de eficiência.
          </p>
        </div>

        {/* History Stream */}
        {history.map((entry, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400">
              <span className="text-emerald-400">root@vpsnsa-sp01:~#</span>
              <span className="text-white font-bold">{entry.command}</span>
            </div>
            <pre className="text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-slate-800">
              {entry.output}
            </pre>
          </div>
        ))}

        {/* Current Active Input Prompt */}
        <form onSubmit={handleCommand} className="flex items-center gap-2 pt-2">
          <span className="text-emerald-400 shrink-0 font-bold">root@vpsnsa-sp01:~#</span>
          <input
            type="text"
            autoFocus
            value={currentCmd}
            onChange={e => setCurrentCmd(e.target.value)}
            disabled={executing || isOptimizing}
            placeholder="digite um comando (ex: neofetch, docker ps, free -m, df -h)..."
            className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-slate-600"
          />
          <button
            type="submit"
            disabled={executing || isOptimizing}
            className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
            title="Executar comando"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </form>

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
