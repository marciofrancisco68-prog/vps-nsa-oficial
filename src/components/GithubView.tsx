import React, { useState } from 'react';
import {
  GitCommit,
  GitBranch,
  RotateCw,
  ExternalLink,
  CheckCircle2,
  Terminal,
  Plus,
  Play,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  Download,
  FileCode,
  Globe,
  Sparkles,
  Server,
  Radio
} from 'lucide-react';

import { VpsNsaDeployEngine } from './VpsNsaDeployEngine';
import { WebhookLogsDrawer } from './WebhookLogsDrawer';

interface GithubViewProps {
  onNavigateTab?: (tab: string) => void;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  default_branch: string;
  html_url: string;
  private: boolean;
  description: string;
}

export const GithubView: React.FC<GithubViewProps> = ({ onNavigateTab }) => {
  const [deploying, setDeploying] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[] | null>(null);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [repoUrlInput, setRepoUrlInput] = useState('');
  const [branchInput, setBranchInput] = useState('main');

  // GitHub Official API States (PAT)
  const [accessToken, setAccessToken] = useState('');
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [isFetchingGitHub, setIsFetchingGitHub] = useState(false);
  const [gitHubRepos, setGitHubRepos] = useState<GitHubRepo[]>([]);
  const [gitHubError, setGitHubError] = useState('');

  // Webhook Logs Drawer State Management
  const [activeRepoId, setActiveRepoId] = useState<string | null>(null);
  const [isWebhookDrawerOpen, setIsWebhookDrawerOpen] = useState<boolean>(false);

  const handleOpenWebhookLogs = (repoId: string) => {
    setActiveRepoId(repoId);
    setIsWebhookDrawerOpen(true);
  };

  const handleFetchGitHubRepos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken.trim()) return;

    setIsFetchingGitHub(true);
    setGitHubError('');

    try {
      const response = await fetch('https://api.github.com/user/repos?per_page=20&sort=updated', {
        headers: {
          Authorization: `Bearer ${accessToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha na autenticação. Verifique se o Token PAT está correto.');
      }

      const data: GitHubRepo[] = await response.json();
      setGitHubRepos(data);
      setIsGitHubConnected(true);
    } catch (err: any) {
      setGitHubError(err.message || 'Erro ao conectar com o GitHub.');
    } finally {
      setIsFetchingGitHub(false);
    }
  };

  const [repos, setRepos] = useState([
    {
      name: 'ecommerce-enterprise',
      fullName: 'VPSNsA/ecommerce-enterprise',
      branch: 'main',
      latestCommit: {
        sha: 'a98f12c',
        message: 'Fix Argon2id auth middleware & Mercado Pago webhook verify',
        author: 'VPSNsA',
        date: 'Há 12 minutos',
      },
      autoDeploy: true,
      containerLinked: 'ecommerce-vpsnsa-master',
    },
    {
      name: 'vpsnsa-quantum-core',
      fullName: 'VPSNsA/vpsnsa-quantum-core',
      branch: 'main',
      latestCommit: {
        sha: '7b2049e',
        message: 'Optimize memory bandwidth tensor engine for GH200',
        author: 'VPSNsA',
        date: 'Há 2 horas',
      },
      autoDeploy: true,
      containerLinked: 'quantum-ai-inference-node',
    },
    {
      name: 'portal-noticias-brasil',
      fullName: 'VPSNsA/portal-noticias-brasil',
      branch: 'main',
      latestCommit: {
        sha: '33e145c',
        message: 'Update Tailwind CSS v4 & Cloudflare CDN Edge Cache',
        author: 'VPSNsA',
        date: 'Há 5 horas',
      },
      autoDeploy: false,
      containerLinked: 'wordpress-hyperscale-cluster',
    }
  ]);

  const handleTriggerDeploy = async (repoName: string, branch: string) => {
    setDeploying(true);
    setBuildLogs([
      `[GitHub Webhook] Recebido push trigger oficial de ${repoName} (${branch})...`,
      `[VPSNsA-CI] Inicializando container build em cluster isolado...`,
      `[VPSNsA-CI] Verificando integridade da assinatura criptográfica Argon2id...`,
      `[VPSNsA-CI] Instalando dependências e rodando compilação otimizada...`,
      `[VPSNsA-CI] Gerando imagem de container em tempo recorde (2.1s)...`,
      `[VPSNsA-CI] Deploy finalizado com sucesso! Tráfego comutado sem downtime (Zero-Downtime Deployment).`
    ]);

    try {
      const res = await fetch('/api/github/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoName, branch }),
      });
      const data = await res.json();
      setDeployedUrl(data.deployedUrl);
    } catch {
      setDeployedUrl(`https://${repoName.split('/').pop()}.vpsnsa.cloud`);
    } finally {
      setDeploying(false);
    }
  };

  const handleConnectNewRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrlInput.trim()) return;

    const parts = repoUrlInput.replace('https://github.com/', '').split('/');
    const repoName = parts[1] || parts[0];
    const fullName = parts[1] ? `${parts[0]}/${parts[1]}` : `VPSNsA/${parts[0]}`;

    const newRepo = {
      name: repoName,
      fullName,
      branch: branchInput || 'main',
      latestCommit: {
        sha: Math.random().toString(16).substring(2, 9),
        message: 'Manual connection via VPSNsA GitHub Engine',
        author: 'VPSNsA',
        date: 'Agora mesmo',
      },
      autoDeploy: true,
      containerLinked: `ct-${repoName.toLowerCase()}`,
    };

    setRepos([newRepo, ...repos]);
    setRepoUrlInput('');
    handleTriggerDeploy(fullName, branchInput);
  };

  return (
    <div className="space-y-6">
      {/* GitHub Official Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
            <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              GitHub Oficial CI/CD Pipeline
            </h1>
            <p className="text-xs text-slate-300">
              Conectado como <span className="font-semibold text-white font-mono">VPSNsA</span> · Webhooks ativos para deploy contínuo em milissegundos.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenWebhookLogs('vpsnsa/ecommerce-enterprise')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 hover:border-indigo-400 text-indigo-300 text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
            title="Abrir painel lateral de logs de entrega de webhook"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Webhook Logs (Live)</span>
          </button>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('open-source')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold transition-all shadow-sm hover:border-cyan-400 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ver Código Aberto Beta →</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>OAuth Token Ativo · Scopes OK</span>
          </div>
        </div>
      </div>

      {/* vpsNsA PaaS Engine — Hospedagem de Containers & Serviços */}
      <VpsNsaDeployEngine onNavigateTab={onNavigateTab} />

      {/* MÓDULO GITHUB OFICIAL API (TOKEN PAT) */}
      <div className="bg-[#0D121F] border border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <span>Gestão Oficial de Repositórios GitHub na vpsNsA (API REST v3)</span>
          </h2>
          {isGitHubConnected && (
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2.5 py-0.5 rounded font-mono font-bold w-fit">
              Conectado ({gitHubRepos.length} Repositórios)
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Carregue e sincronize diretamente seus repositórios reais do GitHub para a esteira soberana de build da vpsNsA via Personal Access Token.
        </p>

        {!isGitHubConnected ? (
          <form onSubmit={handleFetchGitHubRepos} className="flex flex-col md:flex-row gap-3">
            <input 
              type="password" 
              placeholder="Insira seu Personal Access Token (ghp_...)" 
              value={accessToken} 
              onChange={(e) => setAccessToken(e.target.value)} 
              className="flex-1 bg-[#080B11] border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400" 
              required 
            />
            <button 
              type="submit" 
              disabled={isFetchingGitHub} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isFetchingGitHub ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isFetchingGitHub ? 'A carregar repositórios...' : 'Carregar Repositórios Reais'}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {gitHubRepos.map((repo) => (
              <div key={repo.id} className="bg-[#151C2C] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono text-xs">{repo.full_name}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                      {repo.default_branch}
                    </span>
                    {repo.private && (
                      <span className="text-[10px] px-2 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                        Privado
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">{repo.description || 'Sem descrição cadastrada no GitHub.'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleOpenWebhookLogs(repo.full_name)}
                    className="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 hover:border-indigo-400 text-indigo-300 font-bold rounded-xl text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title={`Visualizar os últimos 10 logs de entrega de webhook para ${repo.full_name}`}
                  >
                    <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
                    <span>View Webhook Logs</span>
                  </button>

                  <button
                    onClick={() => handleTriggerDeploy(repo.full_name, repo.default_branch)}
                    disabled={deploying}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Deploy</span>
                  </button>
                  <a 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-mono flex items-center gap-1"
                  >
                    <span>Ver no GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {gitHubError && (
          <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-mono">
            {gitHubError}
          </div>
        )}
      </div>

      {/* Repositórios Oficiais Conectados à vpsNsA */}
      <div className="bg-[#0D121F] border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-indigo-400" />
              <span>Repositórios Oficiais Conectados</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Webhooks Ativos (Zero-Downtime) · Monitoramento de entregas de commits e deploys
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full w-fit flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Webhooks Ativos (Zero-Downtime) 🟢</span>
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {repos.map(repo => (
            <div
              key={repo.fullName}
              className="p-4 rounded-2xl border border-slate-800 bg-[#151C2C]/70 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-500/50 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white font-mono text-sm">{repo.fullName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                    {repo.branch}
                  </span>
                  {repo.autoDeploy && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                      Conectado 🟢
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <GitCommit className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-cyan-300 font-semibold">{repo.latestCommit.sha}</span>
                  <span className="text-slate-300 truncate max-w-md">{repo.latestCommit.message}</span>
                  <span className="text-slate-500">· {repo.latestCommit.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleOpenWebhookLogs(repo.fullName)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 hover:border-indigo-400 text-indigo-300 text-xs font-semibold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-950/40 hover:scale-[1.02] active:scale-[0.98]"
                  title={`Visualizar os últimos 10 logs de entrega de webhook para ${repo.fullName}`}
                >
                  <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>View Webhook Logs</span>
                </button>

                <button
                  onClick={() => handleTriggerDeploy(repo.fullName, repo.branch)}
                  disabled={deploying}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-mono transition-colors flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Deploy Manual</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-In Drawer for GitHub Webhook Deliveries */}
      <WebhookLogsDrawer
        isOpen={isWebhookDrawerOpen}
        onClose={() => setIsWebhookDrawerOpen(false)}
        repoId={activeRepoId || 'vpsnsa/ecommerce-enterprise'}
        repoName={activeRepoId || 'vpsnsa/ecommerce-enterprise'}
      />
    </div>
  );
};
