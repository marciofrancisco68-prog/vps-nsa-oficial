import React, { useState } from 'react';
import {
  Workflow,
  Play,
  RotateCw,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Database,
  GitBranch,
  CreditCard,
  ShieldCheck,
  Send,
  Sparkles,
  Server,
  Zap,
  Copy,
  Check,
  FileCode,
  Terminal,
} from 'lucide-react';
import { N8nWorkflow, N8nNode, N8nExecution } from '../types';

interface N8nViewProps {
  workflows: N8nWorkflow[];
  executions: N8nExecution[];
  onToggleWorkflow: (id: string) => Promise<void>;
  onExecuteWorkflow: (id: string) => Promise<void>;
}

export const N8nView: React.FC<N8nViewProps> = ({
  workflows,
  executions,
  onToggleWorkflow,
  onExecuteWorkflow,
}) => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(
    workflows[0]?.id || 'wf-mp-k8s-01'
  );
  const [selectedNode, setSelectedNode] = useState<N8nNode | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [showNodeCatalog, setShowNodeCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');

  const currentWorkflow = workflows.find(w => w.id === selectedWorkflowId) || workflows[0];

  const handleRunWorkflow = async () => {
    if (!currentWorkflow) return;
    setIsExecuting(true);
    try {
      await onExecuteWorkflow(currentWorkflow.id);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyPayload = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'mercadopago':
        return CreditCard;
      case 'argon2':
        return ShieldCheck;
      case 'postgres':
      case 'supabase':
        return Database;
      case 'k8s_scale':
        return Layers;
      case 'telegram':
      case 'discord':
        return Send;
      case 'github':
        return GitBranch;
      case 'ai_gemini':
        return Sparkles;
      case 'cron':
        return Clock;
      default:
        return Workflow;
    }
  };

  const nodeCatalog = [
    { type: 'mercadopago', name: 'Mercado Pago Webhook', desc: 'Dispara quando pagamentos PIX ou Cartão são aprovados para VPSNsA' },
    { type: 'argon2', name: 'Argon2id Hash Verify', desc: 'Valida a integridade criptográfica da requisição com m=65536' },
    { type: 'postgres', name: 'PostgreSQL Nativo NsA', desc: 'Executa queries em alta velocidade no banco nativo' },
    { type: 'supabase', name: 'Supabase Cloud Sync', desc: 'Sincroniza registros com o projeto Supabase na região sa-east-1' },
    { type: 'k8s_scale', name: 'Kubernetes Pod Manager', desc: 'Provisiona réplicas de contêineres e aplica rolling updates' },
    { type: 'ai_gemini', name: 'IA Gemini 2.5 Flash', desc: 'Processamento inteligente de texto, código e decisões de negócio' },
    { type: 'github', name: 'GitHub Webhook (Push / PR)', desc: 'Gatilho automático disparado a cada commit oficial' },
    { type: 'telegram', name: 'Telegram Bot Notifier', desc: 'Envia mensagens instantâneas e relatórios para canais ou usuários' },
    { type: 'cron', name: 'Cron Schedule Trigger', desc: 'Executa fluxos em intervalos regulares (1m, 5m, 1h, diário)' },
  ];

  return (
    <div className="space-y-6">
      {/* n8n Server Container Status Banner */}
      <div className="p-6 rounded-xl border border-rose-500/30 bg-gradient-to-r from-slate-950 via-slate-900/80 to-slate-950 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
            {/* n8n Nodes Logo SVG */}
            <Workflow className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                N8N WORKFLOW AUTOMATION ENGINE · NATIVO NO CLUSTER VPSNSA
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                PRODUÇÃO ATIVA
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-white mt-0.5">
              Instância Oficial do n8n (v1.64 LTS)
            </h1>
            <p className="text-xs text-slate-300">
              Ambiente de automação no-code/code conectado diretamente ao PostgreSQL Nativo, Kubernetes, Mercado Pago e GitHub.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
            Porta: <span className="text-cyan-400 font-bold">5678</span> · Banco: <span className="text-emerald-400 font-bold">PostgreSQL 16.3</span>
          </div>

          <a
            href="https://n8n.io"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
          >
            <span>Abrir n8n Web Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Workflow Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Workflows List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Workflow className="w-4 h-4 text-rose-400" />
              Workflows Cadastrados ({workflows.length})
            </h2>
            <button
              onClick={() => setShowNodeCatalog(true)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Novo Nó
            </button>
          </div>

          <div className="space-y-3">
            {workflows.map(wf => {
              const isSelected = wf.id === selectedWorkflowId;
              return (
                <div
                  key={wf.id}
                  onClick={() => setSelectedWorkflowId(wf.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-rose-500/50 bg-gradient-to-br from-slate-900 to-rose-950/20 shadow-md ring-1 ring-rose-500/40'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-white leading-snug">{wf.name}</h3>
                    <input
                      type="checkbox"
                      checked={wf.active}
                      onChange={e => {
                        e.stopPropagation();
                        onToggleWorkflow(wf.id);
                      }}
                      className="w-4 h-4 accent-rose-500 rounded cursor-pointer shrink-0"
                      title={wf.active ? 'Desativar Workflow' : 'Ativar Workflow'}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{wf.description}</p>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-[10px] font-mono">
                    <span className="text-cyan-400">{wf.triggerType}</span>
                    <span className="text-slate-400">
                      {wf.totalExecutions} execs · {wf.successRate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visual Canvas & Node Execution (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {currentWorkflow && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-5">
              {/* Workflow Details & Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{currentWorkflow.name}</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        currentWorkflow.active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {currentWorkflow.active ? 'ATIVO NO N8N' : 'PAUSADO'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gatilho: <span className="text-cyan-300 font-mono">{currentWorkflow.triggerType}</span> · Última execução: {currentWorkflow.lastExecutedAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunWorkflow}
                    disabled={isExecuting}
                    className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    {isExecuting ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" /> Executando Fluxo...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" /> Testar / Executar
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Visual Node Flow Canvas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Pipeline Visual de Nós (n8n Flow Canvas):
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Clique em qualquer nó para inspecionar parâmetros e payload JSON
                  </span>
                </div>

                <div className="overflow-x-auto p-6 bg-slate-950/80 rounded-xl border border-slate-800 relative">
                  <div className="flex items-center gap-4 min-w-max">
                    {currentWorkflow.nodes.map((node, idx) => {
                      const IconComponent = getNodeIcon(node.type);
                      const isNodeSelected = selectedNode?.id === node.id;
                      const isLast = idx === currentWorkflow.nodes.length - 1;

                      return (
                        <React.Fragment key={node.id}>
                          {/* Node Card */}
                          <div
                            onClick={() => setSelectedNode(node)}
                            className={`p-3.5 rounded-xl border w-56 flex flex-col justify-between space-y-2 cursor-pointer transition-all ${
                              isNodeSelected
                                ? 'border-rose-400 bg-rose-950/20 shadow-lg ring-1 ring-rose-400'
                                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                                style={{
                                  backgroundColor: `${node.color}20`,
                                  borderColor: `${node.color}50`,
                                }}
                              >
                                <IconComponent className="w-4 h-4" style={{ color: node.color }} />
                              </div>

                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                  node.status === 'success'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : node.status === 'running'
                                    ? 'bg-amber-500/10 text-amber-400 animate-pulse'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {node.status === 'success' && '200 OK'}
                                {node.status === 'running' && 'RODANDO'}
                                {node.status === 'idle' && 'PRONTO'}
                              </span>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-white truncate">{node.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{node.subtitle}</p>
                            </div>

                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                              <span>In: {node.inputs} · Out: {node.outputs}</span>
                              <span className="text-cyan-400">{node.lastExecutionTimeMs || 10} ms</span>
                            </div>
                          </div>

                          {/* Connector Arrow */}
                          {!isLast && (
                            <div className="flex items-center justify-center px-1 text-slate-600">
                              <div className="w-6 h-0.5 bg-slate-800" />
                              <span className="text-cyan-400 font-bold -ml-1">❯</span>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Node Parameter & Output Payload Inspector */}
              {selectedNode ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-rose-400" />
                      <span className="font-bold text-white font-sans">{selectedNode.name}</span>
                      <span className="text-slate-400 text-[11px]">({selectedNode.type})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyPayload(selectedNode.outputPayload || selectedNode.parameters)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition-colors"
                      >
                        {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPayload ? 'Copiado' : 'Copiar JSON'}</span>
                      </button>
                      <button
                        onClick={() => setSelectedNode(null)}
                        className="text-slate-500 hover:text-white px-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                    <div>
                      <p className="text-slate-400 font-sans font-semibold mb-1">Parâmetros de Entrada:</p>
                      <pre className="bg-black/80 p-3 rounded border border-slate-800 text-slate-300 overflow-x-auto max-h-48">
                        {JSON.stringify(selectedNode.parameters, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <p className="text-slate-400 font-sans font-semibold mb-1">Payload de Saída (Output Data):</p>
                      <pre className="bg-black/80 p-3 rounded border border-slate-800 text-cyan-300 overflow-x-auto max-h-48">
                        {JSON.stringify(selectedNode.outputPayload || { status: 'Aguardando disparo' }, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                  <span>💡 Dica: Clique em qualquer caixa de nó acima para inspecionar os dados que passam pelo pipeline.</span>
                  <button
                    onClick={() => setSelectedNode(currentWorkflow.nodes[0])}
                    className="text-cyan-400 hover:underline font-mono text-[11px]"
                  >
                    Inspecionar 1º Nó
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* n8n Execution History Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Histórico Recente de Execuções do n8n
            </h3>
            <p className="text-xs text-slate-400">
              Logs detalhados de execuções automatizadas e manuais gravadas no banco nativo.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
            Taxa de Sucesso: 99.8%
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="text-[10px] uppercase bg-slate-950 text-slate-400">
              <tr>
                <th className="px-3 py-2">ID Execução</th>
                <th className="px-3 py-2 font-sans">Workflow</th>
                <th className="px-3 py-2">Gatilho</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Tempo</th>
                <th className="px-3 py-2">Iniciado</th>
                <th className="px-3 py-2 font-sans">Resumo do Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {executions.map(exec => (
                <tr key={exec.id} className="hover:bg-slate-900/60">
                  <td className="px-3 py-2 text-cyan-300 font-semibold">{exec.id}</td>
                  <td className="px-3 py-2 text-white font-sans">{exec.workflowName}</td>
                  <td className="px-3 py-2 text-slate-400">{exec.trigger}</td>
                  <td className="px-3 py-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                      SUCCESS
                    </span>
                  </td>
                  <td className="px-3 py-2 text-emerald-400 font-bold">{exec.durationMs} ms</td>
                  <td className="px-3 py-2 text-slate-400">{exec.startedAt}</td>
                  <td className="px-3 py-2 text-slate-300 font-sans truncate max-w-xs">{exec.payloadSummary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Node Catalog Modal */}
      {showNodeCatalog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-rose-400" />
                Catálogo de Nós Integrados no n8n VPSNsA
              </h3>
              <button onClick={() => setShowNodeCatalog(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {nodeCatalog.map(item => (
                <div
                  key={item.type}
                  className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/50 transition-colors flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded bg-slate-800 flex items-center justify-center shrink-0 text-cyan-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setShowNodeCatalog(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Fechar Catálogo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
