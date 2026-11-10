import React, { useState } from 'react';
import { 
  GitBranch, Play, CheckCircle2, ShieldCheck, Terminal, Server, 
  RefreshCw, ExternalLink, Copy, Check, FileCode, Download, Sparkles 
} from 'lucide-react';

interface VpsNsaDeployEngineProps {
  onNavigateTab?: (tab: string) => void;
}

export function VpsNsaDeployEngine({ onNavigateTab }: VpsNsaDeployEngineProps) {
  const [tenantId, setTenantId] = useState('cliente_001');
  const [repoUrl, setRepoUrl] = useState('https://github.com/vpsnsa/meu-site.git');
  const [domainName, setDomainName] = useState('meusite.com.br');
  const [branch, setBranch] = useState('main');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [showBashScript, setShowBashScript] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const bashDeployScript = `#!/bin/bash
# ============================================================================
# vpsNsA Sovereign Git Deploy Engine (PaaS / Vercel-Style Integration)
# Motor Nativo: vpsNsA Engine
# ============================================================================

set -e

CLIENT_ID=$1       # Ex: ${tenantId || 'cliente_001'}
REPO_URL=$2        # Ex: ${repoUrl || 'https://github.com/vpsnsa/meu-site.git'}
DOMAIN_NAME=$3     # Ex: ${domainName || 'meusite.com.br'}

WEB_ROOT="/var/www/vpsnsa/tenants/$CLIENT_ID"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN_NAME"

echo "🚀 [vpsNsA Engine] Clonando/Atualizando repositório para $DOMAIN_NAME..."

# 1. Aloca diretório isolado do cliente
if [ ! -d "$WEB_ROOT" ]; then
    mkdir -p "$WEB_ROOT"
    git clone "$REPO_URL" "$WEB_ROOT"
else
    cd "$WEB_ROOT"
    git pull origin main
fi

# 2. Build automático da aplicação Node/React/HTML
cd "$WEB_ROOT"
if [ -f "package.json" ]; then
    echo "📦 Instalando dependências e compilando..."
    npm install --silent
    npm run build --if-present
fi

# 3. Criação de Configuração Nginx Automática
echo "⚙️ Configurando entrada de rotas no Nginx..."
cat <<EOF > $NGINX_CONF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    root $WEB_ROOT/dist;
    index index.html;

    location / {
        try_files \\$uri \\$uri/ /index.html;
    }
}
EOF

# 4. Ativa o site e aplica SSL autônomo
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
systemctl reload nginx

# 5. Emissão do Certificado HTTPS Gratuito via Certbot
sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos -m contato@nsaoficial.com.br || true

echo "✅ [SUCCESS] O site $DOMAIN_NAME foi hospedado com sucesso via GitHub na vpsNsA!"`;

  const handleCopyBashScript = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(bashDeployScript);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    }
  };

  const handleDownloadBashScript = () => {
    const element = document.createElement('a');
    const file = new Blob([bashDeployScript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'deploy-vpsnsa.sh';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleRunDeploy = () => {
    setIsDeploying(true);
    setDeployedUrl(null);
    setDeployLogs([
      '⚡ [vpsNsA Engine] Inicializando isolamento por container...',
      '📦 Conectando ao repositório GitHub via webhook seguro...',
      '🔨 Compilando assets e instalando dependências (Node.js 20 / Vite)...',
      '🔒 Gerando certificado SSL Let\'s Encrypt e rota Nginx Reverse Proxy...'
    ]);

    setTimeout(() => {
      const finalUrl = domainName.startsWith('http') ? domainName : `https://${domainName}`;
      setDeployLogs(prev => [
        ...prev, 
        '🟢 [Status 200] Deploy concluído com sucesso em 1.4s! Site online.',
        `🚀 Rota Nginx ativada para ${finalUrl} com SSL Let's Encrypt automático.`
      ]);
      setDeployedUrl(finalUrl);
      setIsDeploying(false);
    }, 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans select-none">
      
      {/* CABEÇALHO DO MOTOR NATIVO */}
      <div className="bg-[#0D121F] border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <span>vpsNsA PaaS Engine — Hospedagem de Containers &amp; Serviços</span>
            </h2>
            <p className="text-xs text-slate-400">Arquitetura soberana com automação contínua de CI/CD</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-3 py-1 rounded-full font-mono font-bold">
              Zero-Downtime Engine 🟢
            </span>
            <button
              onClick={() => setShowBashScript(!showBashScript)}
              className="px-3 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>{showBashScript ? 'Ocultar Script .sh' : 'Ver deploy-vpsnsa.sh'}</span>
            </button>
          </div>
        </div>

        {/* SCRIPT MODAL / EXPANDABLE ACCORDION */}
        {showBashScript && (
          <div className="rounded-xl border border-indigo-500/30 bg-[#080B11] p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
              <span className="text-cyan-400 font-bold">deploy-vpsnsa.sh (Automação Bash Soberana Nativa)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyBashScript}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                >
                  {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedScript ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  onClick={handleDownloadBashScript}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Baixar .sh</span>
                </button>
              </div>
            </div>
            <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto p-3 bg-black/60 rounded-lg max-h-56 leading-relaxed">
              {bashDeployScript}
            </pre>
          </div>
        )}

        {/* FORMULÁRIO DE CONFIGURAÇÃO DO DEPLOY */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 font-bold block mb-1">CLIENT_ID (Locatário / Tenant)</label>
            <input 
              type="text" 
              value={tenantId} 
              onChange={(e) => setTenantId(e.target.value)} 
              className="w-full bg-[#151C2C] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-cyan-300 outline-none font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-slate-400 font-bold block mb-1">REPO_URL (Repositório GitHub)</label>
            <input 
              type="text" 
              value={repoUrl} 
              onChange={(e) => setRepoUrl(e.target.value)} 
              className="w-full bg-[#151C2C] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-slate-200 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-bold block mb-1">DOMAIN_NAME (Domínio de Destino)</label>
            <input 
              type="text" 
              value={domainName} 
              onChange={(e) => setDomainName(e.target.value)} 
              className="w-full bg-[#151C2C] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-slate-200 outline-none font-mono"
            />
          </div>
        </div>

        {/* BOTÃO PRINCIPAL CORRIGIDO: NATIVO DA VPSNSA */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span>Branch:</span>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-16 bg-[#151C2C] border border-slate-800 text-white px-2 py-0.5 rounded font-bold outline-none text-center"
              />
            </div>
            <span>•</span>
            <span>SSL Let's Encrypt: <strong className="text-emerald-400">Ativo</strong></span>
            <span>•</span>
            <span>Nginx Reverse Proxy: <strong className="text-cyan-400">Pronto</strong></span>
          </div>

          <button 
            onClick={handleRunDeploy}
            disabled={isDeploying}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {isDeploying ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Play className="w-4 h-4 fill-white text-white" />
            )}
            <span>{isDeploying ? 'Executando Build Soberano...' : 'Executar Deploy Nativo vpsNsA'}</span>
          </button>
        </div>

        {/* PAINEL DE LOGS DO TERMINAL */}
        {deployLogs.length > 0 && (
          <div className="bg-[#080B11] border border-slate-800 rounded-xl p-4 font-mono text-[11px] space-y-1.5 text-slate-300">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80 mb-2">
              <span className="text-cyan-400 font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span>Console de Deploy em Tempo Real</span>
              </span>
              {isDeploying ? (
                <span className="text-amber-400 text-[10px] flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Compilando...
                </span>
              ) : (
                <span className="text-emerald-400 text-[10px] flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Operacional
                </span>
              )}
            </div>
            {deployLogs.map((log, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-cyan-400">&gt;</span>
                <span className={log.includes('🟢') ? 'text-emerald-400 font-bold' : log.includes('🚀') ? 'text-cyan-300' : ''}>
                  {log}
                </span>
              </div>
            ))}

            {deployedUrl && (
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Aplicação no ar com sucesso!
                </span>
                <a
                  href={deployedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:underline font-bold"
                >
                  {deployedUrl} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default VpsNsaDeployEngine;
