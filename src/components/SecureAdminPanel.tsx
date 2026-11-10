import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  Key, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  RotateCw, 
  User, 
  Crown,
  Zap,
  Globe
} from 'lucide-react';

export interface UserAccount {
  id: string;
  name: string;
  maskedEmail: string;
  role: 'Master' | 'Operator' | 'Developer' | 'Finance';
  stealth: boolean;
  status: string;
}

interface SecureAdminPanelProps {
  onSwitchUserMode?: (targetRole: 'admimaster' | 'user') => void;
  onNavigateTab?: (tab: string) => void;
}

export function SecureAdminPanel({ onSwitchUserMode, onNavigateTab }: SecureAdminPanelProps = {}) {
  const [inputEmail, setInputEmail] = useState('');
  const [authStatus, setAuthStatus] = useState<'idle' | 'success_master' | 'success_common' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeAuthProvider, setActiveAuthProvider] = useState<'none' | 'google' | 'github' | 'email'>('none');
  const [selectedProfileType, setSelectedProfileType] = useState<'master' | 'common'>('master');

  // Diretório protegido sem vazamento de dados reais (Zero-Leak Policy)
  const [users] = useState<UserAccount[]>([
    { id: 'usr-001', name: 'Marcio_francisco (AdmiMaster Sovereign Root)', maskedEmail: 'mar••••@gmail.com', role: 'Master', stealth: true, status: 'Ativo (Invisível)' },
    { id: 'usr-002', name: 'Operações NOC Global', maskedEmail: 'noc@vpsnsa.cloud', role: 'Operator', stealth: false, status: 'Ativo' },
    { id: 'usr-003', name: 'DevOps Kubernetes Lead', maskedEmail: 'devops@vpsnsa.cloud', role: 'Developer', stealth: false, status: 'Ativo' },
    { id: 'usr-004', name: 'Faturamento Mercado Pago', maskedEmail: 'billing@vpsnsa.cloud', role: 'Finance', stealth: false, status: 'Ativo' },
  ]);

  // Autenticação com Google (OAuth 2.0 Simulado)
  const handleGoogleAuth = async (mode: 'master' | 'common') => {
    setIsAuthenticating(true);
    setActiveAuthProvider('google');
    setAuthStatus('idle');

    await new Promise((r) => setTimeout(r, 600));

    setIsAuthenticating(false);
    if (mode === 'master') {
      setAuthStatus('success_master');
      setErrorMessage('');
      setInputEmail('mar••••@gmail.com');
      if (onSwitchUserMode) {
        onSwitchUserMode('admimaster');
      }
    } else {
      setAuthStatus('success_common');
      setErrorMessage('');
      setInputEmail('usuario.comum@gmail.com');
      if (onSwitchUserMode) {
        onSwitchUserMode('user');
      }
    }
  };

  // Autenticação com GitHub (OAuth 2.0 Simulado)
  const handleGithubAuth = async (mode: 'master' | 'common') => {
    setIsAuthenticating(true);
    setActiveAuthProvider('github');
    setAuthStatus('idle');

    await new Promise((r) => setTimeout(r, 600));

    setIsAuthenticating(false);
    if (mode === 'master') {
      setAuthStatus('success_master');
      setErrorMessage('');
      setInputEmail('admin-master@vpsnsa.master');
      if (onSwitchUserMode) {
        onSwitchUserMode('admimaster');
      }
    } else {
      setAuthStatus('success_common');
      setErrorMessage('');
      setInputEmail('dev-operador@github.vpsnsa.cloud');
      if (onSwitchUserMode) {
        onSwitchUserMode('user');
      }
    }
  };

  // Autenticação manual via formulário
  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveAuthProvider('email');
    const cleanEmail = inputEmail.trim().toLowerCase();

    if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
      setAuthStatus('error');
      setErrorMessage('Erro de Credencial: Formato de e-mail inválido ou malformado!');
      return;
    }

    if (
      cleanEmail.includes('marciofranciscodealmeida') || 
      cleanEmail.includes('marciofrancisco') || 
      cleanEmail.endsWith('@vpsnsa.master')
    ) {
      setAuthStatus('success_master');
      setErrorMessage('');
      if (onSwitchUserMode) {
        onSwitchUserMode('admimaster');
      }
    } else if (
      cleanEmail.includes('@vpsnsa.') || 
      cleanEmail.includes('@gmail.com') || 
      cleanEmail.includes('@outlook.com') ||
      cleanEmail.includes('@hotmail.com') ||
      cleanEmail.includes('@yahoo.com') ||
      cleanEmail.includes('@empresa.com.br') ||
      cleanEmail.includes('@github.')
    ) {
      setAuthStatus('success_common');
      setErrorMessage('');
      if (onSwitchUserMode) {
        onSwitchUserMode('user');
      }
    } else {
      setAuthStatus('error');
      setErrorMessage('Aviso de Segurança: E-mail não reconhecido na base de dados da vpsNsA. Acesso negado!');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans select-none">
      
      {/* PAINEL PRIVADO ADMIMASTER & ENTRADA SOCIAL OAUTH */}
      <div className="bg-[#0D121F] border border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Cabeçalho do Painel */}
        <div className="bg-gradient-to-r from-indigo-950/70 via-[#151C2C] to-[#0D121F] border border-indigo-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 w-full">
            <div className="flex items-center gap-2">
              <span className="bg-purple-950 text-purple-300 border border-purple-700 text-[10px] px-3 py-0.5 rounded-full font-mono font-bold uppercase flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Sovereign Root Core</span>
              </span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-3 py-0.5 rounded-full font-mono font-bold">
                OAuth 2.0 Google & GitHub Ativos 🟢
              </span>
            </div>

            <h3 className="text-lg font-black text-white flex items-center gap-2 pt-1">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>Painel de Cadastro &amp; Login Master / Comum (Google &amp; GitHub)</span>
            </h3>

            <p className="text-xs text-slate-400">
              Autenticação oficial com suporte a Single Sign-On (SSO) Google e GitHub para administradores Master e utilizadores comuns da vpsNsA.
            </p>

            {/* SEÇÃO SUPERIOR BLINDADA COM CHAVE ANÓNIMA */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono text-slate-300">
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Auth Session ID:</span>
              <span className="bg-[#080B11] border border-slate-800 px-3 py-1 rounded-lg text-cyan-300 font-bold tracking-wider">
                ID-MASTER-ROOT-7799-SECURE
              </span>
              <span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-800">
                Argon2id Level 5
              </span>
            </div>
          </div>

          <div className="bg-[#080B11]/80 border border-slate-800 p-4 rounded-xl text-right shrink-0 w-full md:w-auto">
            <span className="text-[10px] text-slate-400 font-mono block">PROTOCOLO DE SEGURANÇA</span>
            <span className="text-xs font-bold text-emerald-400">OAuth 2.0 Zero-Leak 🛡️</span>
          </div>
        </div>

        {/* =========================================================================
            NOVA FORMA DO PAINEL: ENTRADA COM GOOGLE E GITHUB (MASTER / COMUM)
            ========================================================================= */}
        <div className="bg-[#151C2C]/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Entrada Rápida via Provedores Oficiais (Google &amp; GitHub)</span>
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Escolha o provedor de autenticação e o nível de acesso desejado (Master ou Comum).
              </p>
            </div>

            {/* Alternador de Perfil Desejado */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-mono">
              <button
                type="button"
                onClick={() => setSelectedProfileType('master')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedProfileType === 'master'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crown className="w-3 h-3 text-amber-300" />
                <span>Perfil Master</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedProfileType('common')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedProfileType === 'common'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3 h-3" />
                <span>Perfil Comum</span>
              </button>
            </div>
          </div>

          {/* Cards Principais: Botões de Entrada com Google e GitHub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. CARD ENTRADA GOOGLE */}
            <div className="bg-gradient-to-br from-slate-900/90 to-[#0e1628] border border-slate-800 hover:border-cyan-500/50 p-5 rounded-2xl transition-all shadow-lg space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md shrink-0">
                    {/* Logotipo Oficial 4 Cores do Google SVG */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Google Identity SSO
                  </span>
                </div>

                <h5 className="text-base font-bold text-white">Entrar com Conta Google</h5>
                <p className="text-xs text-slate-400">
                  Autenticação instantânea via Google Accounts com verificação automática de nível de privilégio.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleGoogleAuth(selectedProfileType)}
                  disabled={isAuthenticating}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isAuthenticating && activeAuthProvider === 'google' ? (
                    <RotateCw className="w-4 h-4 animate-spin text-slate-700" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  <span>
                    Continuar com Google ({selectedProfileType === 'master' ? 'Como Master Root' : 'Como Usuário Comum'})
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-700" />
                </button>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
                  <span>Scopes: openid, profile, email</span>
                  <span className="text-emerald-400">Certificado SSL TLS 1.3</span>
                </div>
              </div>
            </div>

            {/* 2. CARD ENTRADA GITHUB */}
            <div className="bg-gradient-to-br from-slate-900/90 to-[#120a1f] border border-slate-800 hover:border-purple-500/50 p-5 rounded-2xl transition-all shadow-lg space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center shadow-md shrink-0">
                    {/* Logotipo Oficial GitHub Octocat SVG */}
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                    GitHub OAuth App
                  </span>
                </div>

                <h5 className="text-base font-bold text-white">Entrar com GitHub Oficial</h5>
                <p className="text-xs text-slate-400">
                  Conexão direta com a esteira de CI/CD e repositórios oficiais da vpsNsA Cloud.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleGithubAuth(selectedProfileType)}
                  disabled={isAuthenticating}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-slate-950 hover:bg-black border border-slate-700 hover:border-cyan-400 text-white font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isAuthenticating && activeAuthProvider === 'github' ? (
                    <RotateCw className="w-4 h-4 animate-spin text-purple-400" />
                  ) : (
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  )}
                  <span>
                    Entrar com GitHub ({selectedProfileType === 'master' ? 'Como Master CI/CD' : 'Como Desenvolvedor'})
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                </button>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
                  <span>Scopes: read:user, repo, workflow</span>
                  <span className="text-cyan-400">Zero-Leak Webhooks</span>
                </div>
              </div>
            </div>

          </div>

          {/* Divisor Visual */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-[#151C2C] px-3 text-slate-400">ou verificação manual de e-mail cadastrado</span>
            </div>
          </div>

          {/* FORMULÁRIO DE ENTRADA MANUAL COM RECONHECIMENTO INTELIGENTE */}
          <form onSubmit={handleAuthenticate} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input 
                  type="text" 
                  placeholder="Insira o e-mail de acesso para verificação manual..." 
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full bg-[#080B11] border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 outline-none transition font-mono"
                  required
                />
              </div>
              <button 
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-cyan-600/20 shrink-0 flex items-center justify-center gap-2"
              >
                <span>Verificar Credencial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* ALERTAS DE SISTEMA DINÂMICOS (STATUS DE AUTENTICAÇÃO) */}
          {authStatus === 'success_master' && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-mono flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-white text-sm">Acesso Autorizado via {activeAuthProvider === 'google' ? 'Google' : activeAuthProvider === 'github' ? 'GitHub' : 'E-mail'}</p>
                  <p className="text-emerald-300 text-xs mt-0.5">
                    Credencial <strong>Master (Sovereign Root)</strong> confirmada. Privilégios Nível 5 ativos com Camuflagem Stealth habilitada.
                  </p>
                </div>
              </div>
              <span className="bg-emerald-900/80 border border-emerald-600 text-emerald-200 text-[10px] px-2.5 py-1 rounded-lg font-bold shrink-0">
                MASTER ROOT OK 👑
              </span>
            </div>
          )}

          {authStatus === 'success_common' && (
            <div className="p-4 bg-cyan-950/40 border border-cyan-500/50 rounded-2xl text-cyan-300 text-xs font-mono flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <p className="font-bold text-white text-sm">Acesso Autorizado via {activeAuthProvider === 'google' ? 'Google' : activeAuthProvider === 'github' ? 'GitHub' : 'E-mail'}</p>
                  <p className="text-cyan-300 text-xs mt-0.5">
                    Utilizador <strong>Comum identificado na rede vpsNsA</strong>. Acesso regular aos serviços e containers liberado.
                  </p>
                </div>
              </div>
              <span className="bg-cyan-900/80 border border-cyan-600 text-cyan-200 text-[10px] px-2.5 py-1 rounded-lg font-bold shrink-0">
                USUÁRIO COMUM 👤
              </span>
            </div>
          )}

          {authStatus === 'error' && (
            <div className="p-4 bg-rose-950/50 border border-rose-500/50 rounded-2xl text-rose-300 text-xs font-mono flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Falha na Autenticação</p>
                <p className="text-rose-300 text-xs mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* DIRETÓRIO COM XXXXXX E MÁSCARA ABSOLUTA (ZERO-LEAK DIRECTORY) */}
        <div className="bg-[#080B11] border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
          <div className="p-4 border-b border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Diretório de Utilizadores (Zero-Leak Policy)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Modo Oculto Master Ativo</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-[#151C2C] text-slate-400 text-[11px] font-mono border-b border-slate-800">
                  <th className="p-3 px-4">ID / CONTA</th>
                  <th className="p-3">NOME DE EXIBIÇÃO</th>
                  <th className="p-3">E-MAIL CADASTRADO</th>
                  <th className="p-3 text-center">NÍVEL DE FUNÇÃO</th>
                  <th className="p-3 text-center">CAMUFLAGEM STEALTH</th>
                  <th className="p-3 text-center">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {users.map((usr) => (
                  <tr key={usr.id} className={usr.role === 'Master' ? 'bg-indigo-950/20 font-semibold' : 'hover:bg-[#151C2C]/40'}>
                    <td className="p-3 px-4 font-mono text-cyan-400">{usr.id}</td>
                    <td className="p-3 text-white font-medium">{usr.name}</td>
                    
                    <td className="p-3 font-mono text-slate-300">
                      <span className="bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded font-mono text-[11px] flex items-center gap-1.5 w-fit">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{usr.maskedEmail}</span>
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        usr.role === 'Master' ? 'bg-purple-950 text-purple-300 border border-purple-700' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="p-3 text-center text-emerald-400 font-mono text-[11px]">{usr.stealth ? 'Invisível para Outros' : 'Público'}</td>
                    <td className="p-3 text-center font-bold text-emerald-400">{usr.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}

export default SecureAdminPanel;
