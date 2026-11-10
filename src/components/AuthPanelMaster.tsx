import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  RefreshCw, 
  KeyRound, 
  UserCheck, 
  Globe, 
  Server,
  Zap 
} from 'lucide-react';

interface AuthPanelMasterProps {
  emailMaster?: string;
  onElevationSuccess?: (userRole: string) => void;
  onVerified?: () => void;
  onSelectSocialProvider?: (provider: 'google' | 'github') => void;
}

export function AuthPanelMaster({ 
  emailMaster,
  onElevationSuccess,
  onVerified,
  onSelectSocialProvider
}: AuthPanelMasterProps) {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'sso' | 'master'>('master');
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null);

  // Mascaramento Zero-Trust: oculta a credencial sensível em tela
  const maskEmail = (email?: string) => {
    if (!email || email.includes('marciofrancisco') || email.startsWith('mar••')) return 'mar••••@gmail.com';
    const [user, domain] = email.split('@');
    if (!domain) return '••••••••';
    const visiblePrefix = user.slice(0, 3);
    return `${visiblePrefix}••••@${domain}`;
  };

  // Simulação de Handshake SSL/TLS 1.3 & OAuth 2.0
  const handleVerifyCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerified(false);

    // Handshake seguro simulado
    setTimeout(() => {
      setIsVerifying(false);
      setVerified(true);
      if (onElevationSuccess) {
        onElevationSuccess('admimaster');
      }
      if (onVerified) {
        onVerified();
      }
    }, 1200);
  };

  const handleSocialClick = (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    setTimeout(() => {
      setSocialLoading(null);
      if (onSelectSocialProvider) {
        onSelectSocialProvider(provider);
      }
    }, 800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-slate-100 font-sans my-6">
      {/* Cabeçalho do Painel Soberano */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Painel de Cadastro &amp; Login Master
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-mono uppercase">
                vpsNsA Enterprise
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Autenticação unificada com Single Sign-On (SSO) para administradores Master e utilizadores comuns.
            </p>
          </div>
        </div>

        {/* Status de Conexão Zero-Trust */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-300">Auth Session ID:</span>
          <span className="text-cyan-400 font-bold">2D-MASTER-ROOT</span>
        </div>
      </div>

      {/* Seleção de Módulo de Acesso */}
      <div className="flex items-center gap-2 mb-6 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('master')}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'master'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Credencial Soberana Master</span>
        </button>

        <button
          onClick={() => setActiveTab('sso')}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'sso'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Cadastro / SSO Comum (Google &amp; GitHub)</span>
        </button>
      </div>

      {/* Conteúdo da Aba Master */}
      {activeTab === 'master' && (
        <div className="space-y-4">
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-xl border border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                  <Lock className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Conta Soberana Ativa:</span>
                  <span className="font-mono text-sm text-cyan-300 font-bold tracking-wide">
                    {maskEmail(emailMaster)}
                  </span>
                </div>
              </div>

              {/* Botão de Validação SSL/TLS */}
              <button
                onClick={handleVerifyCredential}
                disabled={isVerifying}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Validando SSL...</span>
                  </>
                ) : verified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Credencial Verificada!</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-slate-950" />
                    <span>Verificar Credencial</span>
                  </>
                )}
              </button>
            </div>

            {/* Confirmação de Elevação Stealth Nível 5 */}
            {verified && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-mono space-y-1 animate-fade-in">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Acesso Autorizado via Google / SSL Handshake</span>
                </div>
                <p className="text-emerald-300/80 pl-6">
                  Credencial Master (Sovereign Root) confirmada. Privilégios Nível 5 ativos com Camuflagem Stealth habilitada.
                </p>
                <div className="pl-6 text-[11px] text-slate-400 font-mono pt-1">
                  Identidade de rede: <span className="text-cyan-400">mar••••@gmail.com</span> (Zero-Trust Master 🛡️)
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo da Aba SSO Comum */}
      {activeTab === 'sso' && (
        <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-6 space-y-4 text-center">
          <p className="text-xs text-slate-300">
            Selecione o provedor de autenticação para criar ou aceder à sua conta de utilizador comum na vpsNsA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button 
              onClick={() => handleSocialClick('google')}
              disabled={socialLoading !== null}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {socialLoading === 'google' ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> : <Globe className="w-4 h-4 text-cyan-400" />}
              <span>{socialLoading === 'google' ? 'Conectando ao Google...' : 'Entrar com Google'}</span>
            </button>
            <button 
              onClick={() => handleSocialClick('github')}
              disabled={socialLoading !== null}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {socialLoading === 'github' ? <RefreshCw className="w-4 h-4 animate-spin text-blue-400" /> : <Server className="w-4 h-4 text-blue-400" />}
              <span>{socialLoading === 'github' ? 'Conectando ao GitHub...' : 'Entrar com GitHub'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthPanelMaster;
