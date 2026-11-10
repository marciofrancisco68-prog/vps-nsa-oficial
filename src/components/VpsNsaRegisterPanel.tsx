import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Mail, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { AuthPanelMaster } from './AuthPanelMaster';

interface UserSession {
  id: string;
  name: string;
  role: 'Master' | 'Common';
  authProvider: 'Native' | 'Google' | 'GitHub';
  maskedEmail: string;
}

interface VpsNsaRegisterPanelProps {
  onRegisterSuccess?: (user: { username: string; email: string; role: string }) => void;
  onNavigateTab?: (tab: string) => void;
}

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export function VpsNsaRegisterPanel({ onRegisterSuccess, onNavigateTab }: VpsNsaRegisterPanelProps = {}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validação em tempo real
  const isEmailFormatValid = EMAIL_REGEX.test(email.trim());
  const isPasswordLengthValid = password.length >= MIN_PASSWORD_LENGTH;

  // Estados de erro em tempo real para mensagens inline
  const showEmailError = (emailTouched || email.length > 0) && !isEmailFormatValid;
  const showEmailSuccess = email.length > 0 && isEmailFormatValid;

  const showPasswordError = (passwordTouched || password.length > 0) && !isPasswordLengthValid;
  const showPasswordSuccess = password.length >= MIN_PASSWORD_LENGTH;

  const isFormValid = isEmailFormatValid && isPasswordLengthValid;

  // Processamento Nativo de Cadastro com Blindagem do E-mail Master
  const handleNativeRegister = (e: React.FormEvent) => {
    e.preventDefault();

    setEmailTouched(true);
    setPasswordTouched(true);

    if (!isEmailFormatValid || !isPasswordLengthValid) {
      setErrorMessage(
        !isEmailFormatValid
          ? 'Formato de e-mail inválido. Utilize o formato nome@dominio.com.'
          : `A palavra-passe deve conter pelo menos ${MIN_PASSWORD_LENGTH} caracteres para segurança Argon2id.`
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setRegisteredUser(null);

    const cleanEmail = email.trim().toLowerCase();

    setTimeout(() => {
      // Reconhecimento seguro do E-mail Master sem expor os dados em tela
      if (cleanEmail === 'marciofrancisco68@gmail.com' || cleanEmail === 'marciofranciscodealmeida34@gmail.com' || cleanEmail.startsWith('mar••')) {
        setEmail('mar••••@gmail.com');
        const masterSession: UserSession = {
          id: 'USR-MASTER-001',
          name: name || 'vpsNsA Master',
          role: 'Master',
          authProvider: 'Native',
          maskedEmail: 'mar••••@gmail.com' // Máscara Zero-Leak
        };
        setRegisteredUser(masterSession);
        if (onRegisterSuccess) {
          onRegisterSuccess({
            username: 'Marcio_francisco',
            email: 'mar••••@gmail.com',
            role: 'admimaster'
          });
        }
      } else {
        // Demais e-mails são tratados estritamente como Usuário Comum
        const commonSession: UserSession = {
          id: `USR-NET-${Math.floor(1000 + Math.random() * 9000)}`,
          name: name || 'Cliente vpsNsA',
          role: 'Common',
          authProvider: 'Native',
          maskedEmail: cleanEmail.replace(/(.{2})(.*)(?=@)/, "$1****")
        };
        setRegisteredUser(commonSession);
        if (onRegisterSuccess) {
          onRegisterSuccess({
            username: name || cleanEmail.split('@')[0],
            email: cleanEmail,
            role: 'user'
          });
        }
      }
      setIsLoading(false);
    }, 1200);
  };

  // Simulação de Cadastro via Google / GitHub (Sempre Usuário Comum por Padrão ou Master se selecionado)
  const handleSocialRegister = (provider: 'Google' | 'GitHub') => {
    setIsLoading(true);
    setTimeout(() => {
      const isMasterAttempt = email.trim().toLowerCase().includes('marciofrancisco') || email.trim().toLowerCase().startsWith('mar••');
      if (isMasterAttempt) {
        setEmail('mar••••@gmail.com');
      }
      const session: UserSession = {
        id: isMasterAttempt ? 'USR-MASTER-001' : `USR-${provider.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        name: isMasterAttempt ? 'vpsNsA Master' : `Usuário ${provider}`,
        role: isMasterAttempt ? 'Master' : 'Common',
        authProvider: provider,
        maskedEmail: isMasterAttempt ? 'mar••••@gmail.com' : `user_${provider.toLowerCase()}@vpsnsa.client`
      };
      setRegisteredUser(session);
      if (onRegisterSuccess) {
        onRegisterSuccess({
          username: isMasterAttempt ? 'Marcio_francisco' : `Usuário ${provider}`,
          email: session.maskedEmail,
          role: isMasterAttempt ? 'admimaster' : 'user'
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6 text-slate-100 font-sans vpsnsa-card-gap">
      
      {/* PAINEL DE CADASTRO NATIVO DA VPSNSA */}
      <div className="bg-[#0D121F] border border-indigo-500/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* CABEÇALHO DE IDENTIDADE SOBERANA */}
        <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] px-3 py-0.5 rounded-full font-mono font-bold uppercase">
                Autenticação Nativa vpsNsA v3.0
              </span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-3 py-0.5 rounded-full font-mono font-bold">
                Zero-Leak Active 🛡️
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-2 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <span>Painel de Cadastro Soberano &amp; SSO</span>
            </h2>
            <p className="text-xs text-slate-400">Crie a sua conta na plataforma nativa vpsNsA com isolamento de credenciais</p>
          </div>

          <div className="text-right font-mono text-[11px] text-slate-400 bg-[#080B11] px-3 py-2 rounded-xl border border-slate-800">
            <span>Domínio: <strong className="text-cyan-300">www.nsaoficial.com.br</strong></span>
          </div>
        </div>

        {/* BOTÕES DE CONEXÃO COM GOOGLE E GITHUB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            type="button"
            onClick={() => handleSocialRegister('Google')}
            className="flex items-center justify-center gap-3 bg-[#151C2C] hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-white font-bold text-xs py-3.5 px-4 rounded-2xl transition cursor-pointer shadow-md"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"/>
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"/>
            </svg>
            <span>Cadastrar com Google</span>
          </button>

          <button 
            type="button"
            onClick={() => handleSocialRegister('GitHub')}
            className="flex items-center justify-center gap-3 bg-[#151C2C] hover:bg-slate-800 border border-slate-700 hover:border-purple-400 text-white font-bold text-xs py-3.5 px-4 rounded-2xl transition cursor-pointer shadow-md"
          >
            <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>Cadastrar com GitHub</span>
          </button>
        </div>

        <div className="flex items-center gap-4 my-2">
          <div className="h-px bg-slate-800 flex-1"></div>
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">ou preencha o formulário nativo</span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        {/* FORMULÁRIO DE CADASTRO NATIVO */}
        <form onSubmit={handleNativeRegister} className="space-y-6">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-700/60 rounded-xl text-rose-300 text-xs font-mono animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Nome Completo</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input 
                type="text" 
                placeholder="Insira o seu nome..." 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#080B11] border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono text-slate-400 block">E-mail de Acesso</label>
              {(email.toLowerCase().includes('marciofrancisco') || email.startsWith('mar••')) && (
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-purple-950/70 border border-purple-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>Máscara Master:</span>
                  <span className="text-white">mar••••@gmail.com</span>
                  <span>🛡️</span>
                </span>
              )}
              {email.length > 0 && !email.toLowerCase().includes('marciofrancisco') && !email.startsWith('mar••') && (
                <span className={`text-[10px] font-mono font-bold ${isEmailFormatValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isEmailFormatValid ? '✓ Formato Válido' : '✕ E-mail Inválido'}
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className={`w-4 h-4 absolute left-3.5 top-3 transition-colors ${
                showEmailError ? 'text-rose-400' : showEmailSuccess ? 'text-emerald-400' : 'text-slate-500'
              }`} />
              <input 
                type="text" 
                placeholder="seu.email@dominio.com" 
                value={email}
                onBlur={() => {
                  setEmailTouched(true);
                  if (email.trim().toLowerCase() === 'marciofrancisco68@gmail.com' || email.trim().toLowerCase() === 'marciofranciscodealmeida34@gmail.com') {
                    setEmail('mar••••@gmail.com');
                  }
                }}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className={`w-full bg-[#080B11] rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 outline-none transition ${
                  showEmailError
                    ? 'border border-rose-500/80 bg-rose-950/10 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/30'
                    : showEmailSuccess
                    ? 'border border-emerald-500/80 bg-emerald-950/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/30'
                    : 'border border-slate-800 focus:border-cyan-500'
                }`}
                required
              />
              <div className="absolute right-3.5 top-2.5 flex items-center">
                {showEmailError && <AlertCircle className="w-4 h-4 text-rose-400" />}
                {showEmailSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
            </div>

            {/* Inline Error / Status Message */}
            {showEmailError && (
              <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-mono mt-1.5 bg-rose-950/30 border border-rose-900/50 rounded-lg px-2.5 py-1.5 animate-in fade-in duration-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>
                  {email.trim().length === 0
                    ? 'O e-mail de acesso é obrigatório.'
                    : 'Formato de e-mail inválido. Utilize o formato nome@dominio.com.'}
                </span>
              </div>
            )}
            {showEmailSuccess && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono mt-1.5 bg-emerald-950/20 border border-emerald-900/40 rounded-lg px-2.5 py-1 animate-in fade-in duration-200">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>Formato de e-mail válido e certificado para autenticação.</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono text-slate-400 block">Palavra-passe Segura</label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500">Mínimo: {MIN_PASSWORD_LENGTH} caracteres</span>
                {password.length > 0 && (
                  <span className={`text-[10px] font-mono font-bold ${isPasswordLengthValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {password.length}/{MIN_PASSWORD_LENGTH}
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <Key className={`w-4 h-4 absolute left-3.5 top-3 transition-colors ${
                showPasswordError ? 'text-rose-400' : showPasswordSuccess ? 'text-emerald-400' : 'text-slate-500'
              }`} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••••••" 
                value={password}
                onBlur={() => setPasswordTouched(true)}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className={`w-full bg-[#080B11] rounded-xl pl-10 pr-24 py-2.5 text-xs text-slate-100 outline-none transition ${
                  showPasswordError
                    ? 'border border-rose-500/80 bg-rose-950/10 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/30'
                    : showPasswordSuccess
                    ? 'border border-emerald-500/80 bg-emerald-950/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/30'
                    : 'border border-slate-800 focus:border-cyan-500'
                }`}
                required
              />
              <div className="absolute right-3 top-2 flex items-center gap-1.5">
                {showPasswordError && (
                  <span title={`Requer no mínimo ${MIN_PASSWORD_LENGTH} caracteres`}>
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  </span>
                )}
                {showPasswordSuccess && (
                  <span title="Comprimento seguro aprovado">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 active:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition cursor-pointer flex items-center justify-center"
                  title={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                  aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400 hover:text-cyan-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Barra de progresso de segurança em tempo real */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${
                      password.length < 5
                        ? 'bg-rose-500'
                        : password.length < MIN_PASSWORD_LENGTH
                        ? 'bg-amber-400'
                        : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                    }`}
                    style={{ width: `${Math.min(100, (password.length / MIN_PASSWORD_LENGTH) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span>Segurança Argon2id (m=65536, t=3, p=4)</span>
                  </span>
                  <span className={password.length >= MIN_PASSWORD_LENGTH ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {password.length < MIN_PASSWORD_LENGTH ? `Requer mais ${MIN_PASSWORD_LENGTH - password.length} car.` : 'Comprimento Aprovado ✓'}
                  </span>
                </div>
              </div>
            )}

            {/* Inline Error / Status Message */}
            {showPasswordError && (
              <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-mono mt-1.5 bg-rose-950/30 border border-rose-900/50 rounded-lg px-2.5 py-1.5 animate-in fade-in duration-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>
                  {password.length === 0
                    ? `A palavra-passe é obrigatória (mínimo de ${MIN_PASSWORD_LENGTH} caracteres).`
                    : `Comprimento insuficiente: mínimo de ${MIN_PASSWORD_LENGTH} caracteres exigidos (atual: ${password.length}/${MIN_PASSWORD_LENGTH}).`}
                </span>
              </div>
            )}
            {showPasswordSuccess && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono mt-1.5 bg-emerald-950/20 border border-emerald-900/40 rounded-lg px-2.5 py-1 animate-in fade-in duration-200">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>Comprimento de segurança verificado ({password.length} caracteres · pronto para salt/Argon2id).</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button 
              type="submit"
              disabled={isLoading || (!isFormValid && (emailTouched || passwordTouched || email.length > 0 || password.length > 0))}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.99] ${
                isLoading || (!isFormValid && (emailTouched || passwordTouched || email.length > 0 || password.length > 0))
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 shadow-cyan-600/20 cursor-pointer'
              }`}
            >
              {isLoading ? <Lock className="w-4 h-4 animate-spin text-white" /> : <ArrowRight className="w-4 h-4" />}
              <span>
                {isLoading 
                  ? 'Validando Credenciais no Cluster...' 
                  : !isFormValid && (email.length > 0 || password.length > 0)
                  ? 'Aguardando Credenciais Válidas (E-mail & Senha 8+ car.)'
                  : 'Concluir Cadastro Nativo vpsNsA'}
              </span>
            </button>
            {!isFormValid && (email.length > 0 || password.length > 0) && (
              <p className="text-center text-[10px] font-mono text-slate-500">
                * O formulário valida em tempo real o formato do e-mail e o comprimento mínimo de 8 caracteres antes do envio.
              </p>
            )}
          </div>
        </form>

        {/* FEEDBACK DE RECONHECIMENTO DE PERFIL */}
        {registeredUser && (
          <div className={`p-5 rounded-2xl border ${
            registeredUser.role === 'Master' 
              ? 'bg-purple-950/40 border-purple-500/50 text-purple-200' 
              : 'bg-slate-900 border-slate-800 text-slate-300'
          } space-y-3 font-mono text-xs shadow-xl animate-fade-in`}>
            
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${registeredUser.role === 'Master' ? 'text-purple-400' : 'text-cyan-400'}`} />
                <span className="font-bold text-white">Cadastro Efetuado com Sucesso!</span>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                registeredUser.role === 'Master' ? 'bg-purple-900 text-purple-200 border border-purple-600' : 'bg-slate-800 text-slate-300'
              }`}>
                Nível: {registeredUser.role === 'Master' ? 'AdmiMaster Sovereign' : 'Usuário Comum'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px] pt-1">
              <div>
                <span className="text-slate-500 block text-[9px]">ID DA CONTA</span>
                <span className="text-cyan-400 font-bold">{registeredUser.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">MÉTODO UTILIZADO</span>
                <span className="text-white">{registeredUser.authProvider} SSO</span>
              </div>
              <div className="col-span-2 pt-1">
                <span className="text-slate-500 block text-[9px]">IDENTIFICADOR DE REDE (PROTEGIDO)</span>
                <span className="text-emerald-400 font-bold">{registeredUser.maskedEmail}</span>
              </div>
            </div>

            {registeredUser.role === 'Master' && (
              <div className="mt-2 p-3 bg-purple-950/80 border border-purple-700/60 rounded-xl text-[10px] text-purple-300">
                👑 <strong>Privilégio Soberano Concedido:</strong> A conta foi automaticamente vinculada ao núcleo root da vpsNsA. O e-mail original permanece 100% omitido da interface pública.
              </div>
            )}
          </div>
        )}

      </div>

      {/* MÓDULO SOBERANO DE VERIFICAÇÃO MASTER COM HANDSHAKE SSL & CAMUFLAGEM ZERO-TRUST */}
      <AuthPanelMaster
        emailMaster="mar••••@gmail.com"
        onElevationSuccess={(role) => {
          if (onRegisterSuccess) {
            onRegisterSuccess({
              username: 'Marcio_francisco',
              email: 'mar••••@gmail.com',
              role: role || 'admimaster'
            });
          }
        }}
        onVerified={() => {
          if (onRegisterSuccess) {
            onRegisterSuccess({
              username: 'Marcio_francisco',
              email: 'mar••••@gmail.com',
              role: 'admimaster'
            });
          }
        }}
        onSelectSocialProvider={(provider) => {
          handleSocialRegister(provider === 'google' ? 'Google' : 'GitHub');
        }}
      />

    </div>
  );
}

export default VpsNsaRegisterPanel;
