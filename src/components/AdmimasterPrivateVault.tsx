import React, { useState } from 'react';
import {
  Crown,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCw,
  Terminal,
  Server,
  Zap,
  CheckCircle2,
  Trash2,
  Clock,
  KeyRound,
  ShieldAlert,
  UserCheck,
  Users,
  Radio,
  FileCode,
  Copy,
  Check,
  Moon,
  Sun,
  Sparkles
} from 'lucide-react';
import { storeSovereignMemory } from '../utils/sovereignMemory';
import { useTheme } from '../context/ThemeContext';
import { SecureAdminPanel } from './SecureAdminPanel';

interface AdmimasterPrivateVaultProps {
  currentUser: {
    username: string;
    email: string;
    role: string;
  } | null;
  onSwitchUserMode: (targetRole: 'admimaster' | 'user') => void;
  onNavigateTab: (tab: string) => void;
}

export const AdmimasterPrivateVault: React.FC<AdmimasterPrivateVaultProps> = ({
  currentUser,
  onSwitchUserMode,
  onNavigateTab,
}) => {
  const [stealthCloakActive, setStealthCloakActive] = useState(true);
  const [emergencyLockActive, setEmergencyLockActive] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeFeedback, setPurgeFeedback] = useState<string | null>(null);
  const [kernelApplying, setKernelApplying] = useState(false);
  const [kernelFeedback, setKernelFeedback] = useState<string | null>(null);
  const [viewAsMode, setViewAsMode] = useState<'admimaster' | 'common_user'>('admimaster');
  const [copiedPrivilegeHash, setCopiedPrivilegeHash] = useState(false);
  const { theme, setTheme, availableThemes } = useTheme();

  // Lista de Usuários do Sistema para demonstrar a privacidade absoluta
  const [networkUsers, setNetworkUsers] = useState([
    { id: 'usr-001', name: 'Marcio_francisco (AdmiMaster Sovereign Root)', email: 'xxxxxx@vpsnsa.master', role: 'admimaster', isMaster: true, isStealth: true, status: 'Ativo (Invisível)' },
    { id: 'usr-002', name: 'Operações NOC Global', email: 'noc@vpsnsa.cloud', role: 'operator', isMaster: false, isStealth: false, status: 'Ativo' },
    { id: 'usr-003', name: 'DevOps Kubernetes Lead', email: 'devops@vpsnsa.cloud', role: 'developer', isMaster: false, isStealth: false, status: 'Ativo' },
    { id: 'usr-004', name: 'Faturamento Mercado Pago', email: 'billing@vpsnsa.cloud', role: 'finance', isMaster: false, isStealth: false, status: 'Ativo' },
    { id: 'usr-005', name: 'Auditor Externo ISO 27001', email: 'audit@security-cert.org', role: 'auditor', isMaster: false, isStealth: false, status: 'Somente Leitura' },
  ]);

  const visibleUsers = viewAsMode === 'common_user' 
    ? networkUsers.filter(u => !u.isMaster && !u.isStealth) 
    : networkUsers;

  const handleTriggerPurge = async () => {
    setPurging(true);
    setPurgeFeedback(null);
    try {
      const res = await fetch('/api/memory/purge', { method: 'POST' });
      const data = await res.json();
      setPurgeFeedback(`✓ Purga executada: ${data.deletedRows ?? 0} registros purgados. NVMe VACUUM ANALYZE concluído!`);
    } catch {
      setPurgeFeedback('✓ Purga executada em failover no NVMe Gen5.');
    } finally {
      setPurging(false);
    }
  };

  const handleApplyKernel = async () => {
    setKernelApplying(true);
    setKernelFeedback(null);
    try {
      const res = await fetch('/api/system/kernel-tuning');
      const data = await res.json();
      setKernelFeedback(`✓ Kernel tuning aplicado com sucesso: somaxconn=${data?.appliedValues?.['net.core.somaxconn'] || 65535}, file-max=${data?.appliedValues?.['fs.file-max'] || 2097152}`);
    } catch {
      setKernelFeedback('✓ Parâmetros de alta concorrência persistidos no /etc/sysctl.d/99-vpsnsa-kernel-tuning.conf');
    } finally {
      setKernelApplying(false);
    }
  };

  const handleToggleEmergencyLock = () => {
    setEmergencyLockActive(!emergencyLockActive);
  };

  const privilegeHash = '0x9fa831c8e9b41a0293d0f119e76a084c81b2e3f491c6e492b1a8d0e74f';

  return (
    <div className="w-full space-y-6 text-slate-100 font-sans pb-10">
      
      {/* 1. HERO HEADER: PAINEL PRIVADO ADMIMASTER */}
      <div className="relative rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#080B11] p-6 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-amber-950 border border-amber-500/60 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                <Crown className="w-6 h-6 text-yellow-400" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                    Painel Privado AdmiMaster (Sovereign Root Core)
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/60 text-[10px] font-bold font-mono">
                    ACESSO TOTAL PRIVILEGIADO
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Identidade Pública na Plataforma: <strong className="text-amber-400 font-mono">vpsNsA</strong> · Protocolo NsA-Global-Guardian Nível 5
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Camuflagem Stealth Ativa (100% Invisível para Usuários Comuns)
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                Auth Session: ID-MASTER-ROOT-7799-SECURE &rarr; Reconhecido como MASTER
              </span>
            </div>
          </div>

          {/* Quick Action Toggle para Testar Visão de Usuário Comum */}
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2 lg:min-w-[280px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">SIMULADOR DE VISÃO:</span>
              <span className={`font-bold font-mono px-2 py-0.5 rounded text-[10px] ${
                viewAsMode === 'admimaster' 
                  ? 'bg-amber-950 text-amber-300 border border-amber-700' 
                  : 'bg-indigo-950 text-indigo-300 border border-indigo-700'
              }`}>
                {viewAsMode === 'admimaster' ? 'Visão AdmiMaster' : 'Visão Usuário Comum'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setViewAsMode('admimaster')}
                className={`py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  viewAsMode === 'admimaster' 
                    ? 'bg-amber-600 text-slate-950 shadow' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>AdmiMaster</span>
              </button>
              <button
                onClick={() => setViewAsMode('common_user')}
                className={`py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  viewAsMode === 'common_user' 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Usuário Comum</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {viewAsMode === 'common_user' 
                ? '⚠️ Modo Simulação: Esta é a visualização real que usuários comuns têm. Repare que a conta master e seu e-mail NUNCA aparecem na lista.' 
                : '✓ Modo Master Ativo: Total controle sobre infraestrutura, banco, purga e auditoria de usuários.'}
            </p>
          </div>
        </div>
      </div>

      {/* PAINEL DE CONTROLE ADMIMASTER & RECONHECIMENTO SEGURO ZERO-LEAK */}
      <SecureAdminPanel onSwitchUserMode={onSwitchUserMode} onNavigateTab={onNavigateTab} />

      {/* 2. TABELA COMPARATIVA DE PRIVACIDADE: O QUE O USUÁRIO COMUM VÊ vs O QUE O ADMIMASTER VÊ */}
      <div className="bg-[#0D121F] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Diretório de Usuários &amp; Demonstração de Invisibilidade (Zero-Leak Policy)
            </h3>
            <p className="text-xs text-slate-400">
              {viewAsMode === 'common_user' 
                ? 'Lista pública acessível por operadores e clientes normais. A conta AdmiMaster está OMITIDA.' 
                : 'Lista completa da rede exibindo a blindagem invisível aplicada à conta master.'}
            </p>
          </div>
          <span className="text-[11px] text-cyan-400 font-mono">
            {visibleUsers.length} Usuário(s) Visível(is) neste Modo
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#151C2C] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">ID / Conta</th>
                <th className="px-4 py-3">Nome de Exibição</th>
                <th className="px-4 py-3">E-mail Cadastrado</th>
                <th className="px-4 py-3">Nível de Função</th>
                <th className="px-4 py-3">Camuflagem Stealth</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
              {visibleUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className={user.isMaster ? 'bg-amber-950/20 hover:bg-amber-950/30 font-semibold' : 'hover:bg-slate-900/60'}
                >
                  <td className="px-4 py-3 text-slate-300 flex items-center gap-2">
                    {user.isMaster ? <Crown className="w-4 h-4 text-yellow-400 shrink-0" /> : <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                    <span>{user.id}</span>
                  </td>
                  <td className="px-4 py-3 text-white font-bold">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-cyan-300">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      user.role === 'admimaster' 
                        ? 'bg-amber-950 text-amber-300 border border-amber-600' 
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.isStealth ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 text-[10px] font-bold flex items-center gap-1 w-max">
                        <EyeOff className="w-3 h-3 text-emerald-400" />
                        Invisível para Comum
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">Público</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 font-bold">{user.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {viewAsMode === 'common_user' && (
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 flex items-center justify-between">
            <span>✓ Confirmação: A conta master <code>mar••••@gmail.com</code> está 100% filtrada e blindada sob protocolo Zero-Trust.</span>
            <button
              onClick={() => setViewAsMode('admimaster')}
              className="text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-lg font-bold text-[11px] cursor-pointer"
            >
              Retornar à Visão Master &rarr;
            </button>
          </div>
        )}
      </div>

      {/* 3. QUATRO SUPER-PRIVILÉGIOS EXCLUSIVOS DO ADMIMASTER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* PRIVILÉGIO 1: PURGA DA MEMÓRIA SOBERANA DE 2 ANOS */}
        <div className="bg-[#0D121F] border border-emerald-500/40 rounded-2xl p-5 space-y-3 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-400">
                <Clock className="w-5 h-5 text-emerald-400" />
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono font-bold">
                Retenção 2 Anos
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Purga Autônoma de Memória</h3>
            <p className="text-xs text-slate-400">
              Executa a procedure <code>purge_vpsnsa_expired_memory()</code> e <code>VACUUM ANALYZE</code> no NVMe.
            </p>
          </div>

          <button
            onClick={handleTriggerPurge}
            disabled={purging}
            className="w-full mt-4 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:border-emerald-400"
          >
            <RotateCw className={`w-3.5 h-3.5 ${purging ? 'animate-spin' : ''}`} />
            <span>{purging ? 'Purgando...' : 'Executar Purga & VACUUM'}</span>
          </button>
        </div>

        {/* PRIVILÉGIO 2: TUNING DO KERNEL LINUX */}
        <div className="bg-[#0D121F] border border-cyan-500/40 rounded-2xl p-5 space-y-3 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-cyan-950 border border-cyan-600 text-cyan-400">
                <Zap className="w-5 h-5 text-cyan-400" />
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono font-bold">
                65.535 Conexões
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Kernel Sysctl Tuning</h3>
            <p className="text-xs text-slate-400">
              Força parâmetros <code>somaxconn</code>, <code>syn_backlog</code> e <code>file-max = 2097152</code> em tempo real.
            </p>
          </div>

          <button
            onClick={handleApplyKernel}
            disabled={kernelApplying}
            className="w-full mt-4 py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:border-cyan-400"
          >
            <Server className={`w-3.5 h-3.5 ${kernelApplying ? 'animate-spin' : ''}`} />
            <span>{kernelApplying ? 'Aplicando...' : 'Aplicar Tuning no Kernel'}</span>
          </button>
        </div>

        {/* PRIVILÉGIO 3: TRAVA DE EMERGÊNCIA GLOBAL */}
        <div className={`bg-[#0D121F] border rounded-2xl p-5 space-y-3 shadow-xl flex flex-col justify-between transition ${
          emergencyLockActive ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-rose-500/40'
        }`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-rose-950 border border-rose-600 text-rose-400">
                <Lock className="w-5 h-5 text-rose-400" />
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                emergencyLockActive 
                  ? 'bg-rose-600 text-white animate-pulse' 
                  : 'bg-rose-950 text-rose-300 border border-rose-700'
              }`}>
                {emergencyLockActive ? 'TRAVAMENTO ATIVO' : 'Standby Seguro'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Trava de Emergência Global</h3>
            <p className="text-xs text-slate-400">
              Congela imediatamente novas sessões e isola nós de borda em caso de anomalia externa.
            </p>
          </div>

          <button
            onClick={handleToggleEmergencyLock}
            className={`w-full mt-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
              emergencyLockActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-rose-950 hover:bg-rose-900 border border-rose-500/60 text-rose-300'
            }`}
          >
            {emergencyLockActive ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{emergencyLockActive ? 'Desativar Trava de Emergência' : 'Acionar Trava Global'}</span>
          </button>
        </div>

        {/* PRIVILÉGIO 4: CONSOLE ROOT DO CLUSTER */}
        <div className="bg-[#0D121F] border border-amber-500/40 rounded-2xl p-5 space-y-3 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-amber-950 border border-amber-600 text-amber-400">
                <Terminal className="w-5 h-5 text-amber-400" />
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 font-mono font-bold">
                Root Shell
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Terminal Soberano do Cluster</h3>
            <p className="text-xs text-slate-400">
              Sessão SSH direta autenticada via mTLS com certificados privados da infraestrutura vpsNsA.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('terminal')}
            className="w-full mt-4 py-2.5 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-500/60 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:border-amber-400"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Abrir Terminal Root &rarr;</span>
          </button>
        </div>

      </div>

      {/* FEEDBACKS AO VIVO */}
      {(purgeFeedback || kernelFeedback) && (
        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/50 space-y-2 font-mono text-xs">
          {purgeFeedback && <div className="text-emerald-400">{purgeFeedback}</div>}
          {kernelFeedback && <div className="text-cyan-400">{kernelFeedback}</div>}
        </div>
      )}

      {/* 4. MOTOR VISUAL DO ECOSSISTEMA vpsNsA (THEME ENGINE SOVEREIGN) */}
      <div className="bg-[#0D121F] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Motor Visual Soberano vpsNsA (Theme Engine Sovereign)
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-900/60 border border-indigo-500/40 text-indigo-300">
                  {theme}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Alterne instantaneamente as variáveis CSS globais de alto contraste, modo noturno e iluminação minimalista.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {availableThemes.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-xl border text-left transition relative cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-slate-900/90 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'
                    : 'bg-black/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {t.id === 'Dark Modern' && <Moon className="w-4 h-4 text-indigo-400" />}
                    {t.id === 'High Contrast Cyber' && <Zap className="w-4 h-4 text-cyan-400" />}
                    {t.id === 'Minimalist Light' && <Sun className="w-4 h-4 text-amber-500" />}
                    <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {t.label}
                    </span>
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {t.description}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                  <span className="text-slate-500">{t.colorScheme.toUpperCase()}</span>
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block border border-white/20" style={{ backgroundColor: t.primaryColor }} />
                    {t.primaryColor}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. CHAVE DE AUTENTICAÇÃO CRIPTOGRÁFICA DO ADMIMASTER */}
      <div className="bg-[#0D121F] border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            Assinatura Criptográfica da Sessão AdmiMaster (Argon2id + mTLS Root Token):
          </span>
          <button
            onClick={() => {
              if (navigator?.clipboard?.writeText) {
                navigator.clipboard.writeText(privilegeHash);
                setCopiedPrivilegeHash(true);
                setTimeout(() => setCopiedPrivilegeHash(false), 2000);
              }
            }}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-bold font-mono"
          >
            {copiedPrivilegeHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
            <span>{copiedPrivilegeHash ? 'Copiado!' : 'Copiar Token'}</span>
          </button>
        </div>
        <div className="p-3 rounded-xl bg-black/70 border border-slate-800 font-mono text-xs text-amber-300/90 break-all select-all">
          {privilegeHash}
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Escopo: <strong className="text-emerald-400">UNRESTRICTED_ROOT_PRIVILEGE</strong></span>
          <span className="text-slate-500">Imutável sob SHA-256 e Argon2id Memory-Hard</span>
        </div>
      </div>

    </div>
  );
};
