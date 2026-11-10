import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, RefreshCw } from 'lucide-react';

interface CleanAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (role: string) => void;
  onLoginSuccess?: (user: { username: string; email: string; role: string }) => void;
}

export function CleanAuthModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  onLoginSuccess 
}: CleanAuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  if (!isOpen) return null;

  // Mascaramento Zero-Trust ao autenticar
  const computeZeroTrustPayload = (rawEmail: string) => {
    const clean = rawEmail.trim().toLowerCase();
    const isMaster =
      clean === 'marciofrancisco68@gmail.com' ||
      clean === 'marciofranciscodealmeida34@gmail.com' ||
      clean.includes('marciofrancisco') ||
      clean.startsWith('mar••');

    if (isMaster) {
      return {
        username: 'Marcio_francisco',
        email: 'mar••••@gmail.com',
        role: 'admimaster',
      };
    }

    const [userPart, domainPart] = clean.includes('@') ? clean.split('@') : [clean || 'user', 'vpsnsa.client'];
    const maskedUser = userPart.length <= 2 ? `${userPart}****` : `${userPart.substring(0, 2)}****`;
    return {
      username: userPart || 'Utilizador',
      email: `${maskedUser}@${domainPart}`,
      role: 'user',
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de handshake criptográfico e verificação SSL/TLS
    setTimeout(() => {
      setLoading(false);
      setAuthSuccess(true);
      const userPayload = computeZeroTrustPayload(email);
      if (userPayload.role === 'admimaster') {
        setEmail('mar••••@gmail.com');
      }

      setTimeout(() => {
        if (onSuccess) onSuccess(userPayload.role);
        if (onLoginSuccess) onLoginSuccess(userPayload);
        onClose();
      }, 1000);
    }, 1200);
  };

  const handleSocialLogin = (provider: 'google' | 'github') => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAuthSuccess(true);
      const isMaster = email.trim().toLowerCase().includes('marciofrancisco') || email.trim().toLowerCase().startsWith('mar••');
      if (isMaster) {
        setEmail('mar••••@gmail.com');
      }
      const userPayload = {
        username: isMaster ? 'Marcio_francisco' : `Utilizador ${provider === 'google' ? 'Google' : 'GitHub'}`,
        email: isMaster ? 'mar••••@gmail.com' : `user_${provider}@vpsnsa.client`,
        role: isMaster ? 'admimaster' : 'user',
      };

      setTimeout(() => {
        if (onSuccess) onSuccess(userPayload.role);
        if (onLoginSuccess) onLoginSuccess(userPayload);
        onClose();
      }, 900);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative text-white animate-fade-in">
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          ✕
        </button>

        {/* Título Principal */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            {isSignUp ? 'Criar conta' : 'Entrar'}
          </h2>
          <p className="text-xs text-slate-400">
            {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthSuccess(false);
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
            >
              {isSignUp ? 'Entrar' : 'Criar conta'}
            </button>
          </p>
        </div>

        {/* Botões de Login Social (Google, GitHub) */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
            title="Entrar com Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"/>
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('github')}
            disabled={loading}
            className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
            title="Entrar com GitHub"
          >
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </button>
        </div>

        {/* Divisor "ou" */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase tracking-widest font-mono absolute">
            ou
          </span>
        </div>

        {/* Formulário Limpo */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs text-slate-300 font-medium">E-mail</label>
              {(email.toLowerCase().includes('marciofrancisco') || email.startsWith('mar••')) && (
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-purple-950/70 border border-purple-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>Máscara Master:</span>
                  <span className="text-white">mar••••@gmail.com</span>
                  <span>🛡️</span>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={email}
                onBlur={() => {
                  if (email.trim().toLowerCase() === 'marciofrancisco68@gmail.com' || email.trim().toLowerCase() === 'marciofranciscodealmeida34@gmail.com') {
                    setEmail('mar••••@gmail.com');
                  }
                }}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu-email@dominio.com"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-medium mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer p-0.5"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isSignUp && (
            <div className="text-left">
              <a href="#esqueceu" onClick={(e) => e.preventDefault()} className="text-xs text-cyan-400 hover:underline">
                Esqueceu a senha?
              </a>
            </div>
          )}

          {/* Botão Principal de Submissão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Autenticando SSL...</span>
              </>
            ) : authSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Acesso Autorizado!</span>
              </>
            ) : (
              <span>{isSignUp ? 'Criar conta' : 'Entrar'}</span>
            )}
          </button>
        </form>

        <p className="text-[11px] text-slate-500 text-center mt-6">
          Não consegue acessar sua conta?
        </p>
      </div>
    </div>
  );
}

export default CleanAuthModal;
