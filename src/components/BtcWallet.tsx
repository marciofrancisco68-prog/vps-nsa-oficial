import React, { useState, useEffect } from 'react';
import { 
  Bitcoin, 
  Eye, 
  EyeOff, 
  Copy, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  Clock, 
  QrCode,
  Sparkles
} from 'lucide-react';

export interface BtcWalletProps {
  btcRateBrl?: number; // Price of 1 BTC in BRL
  onWithdrawSuccess?: (amount: number, txId: string) => void;
  className?: string;
}

export const BtcWallet: React.FC<BtcWalletProps> = ({ 
  btcRateBrl = 385000, 
  onWithdrawSuccess,
  className = '' 
}) => {
  const [btcBalance, setBtcBalance] = useState<number>(() => {
    const saved = localStorage.getItem('vpsnsa_btc_balance');
    return saved ? parseFloat(saved) : 0.0845;
  });
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [copiedBtc, setCopiedBtc] = useState<boolean>(false);
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawStatus, setWithdrawStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const officialAddress = 'bc1qvpsnsamastersecureaddress000000000070off';

  useEffect(() => {
    localStorage.setItem('vpsnsa_btc_balance', btcBalance.toString());
  }, [btcBalance]);

  const handleCopyBtc = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(officialAddress);
    }
    setCopiedBtc(true);
    setTimeout(() => setCopiedBtc(false), 3000);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAddress.trim() || !withdrawAmount.trim()) {
      setWithdrawStatus('Erro: Preencha o endereço de destino e a quantia.');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawStatus('Erro: Quantidade inválida de BTC.');
      return;
    }

    if (amount > btcBalance) {
      setWithdrawStatus('Erro: Saldo insuficiente em BTC na carteira sovereign.');
      return;
    }

    setIsProcessing(true);
    setWithdrawStatus('Processando assinatura digital e broadcast na blockchain...');

    setTimeout(() => {
      setBtcBalance(prev => Math.max(0, prev - amount));
      const fakeTx = `tx-${Math.random().toString(36).substring(2, 10)}`;
      setWithdrawStatus(`✓ Saque de ${amount} BTC concluído! Hash: ${fakeTx}`);
      setWithdrawAmount('');
      setWithdrawAddress('');
      setIsProcessing(false);

      if (onWithdrawSuccess) {
        onWithdrawSuccess(amount, fakeTx);
      }
    }, 2000);
  };

  const brlValue = (btcBalance * btcRateBrl).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className={`bg-slate-900/90 border border-orange-500/40 rounded-xl p-4 shadow-xl space-y-3 font-mono ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-orange-500/30 pb-2 gap-2">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Bitcoin className="w-5 h-5 text-orange-400" />
          Carteira Mestre Bitcoin Sovereign — vpsNsA Datacenter
        </h3>
        <span className="text-[10px] bg-orange-950 text-orange-300 px-2 py-0.5 rounded border border-orange-800 font-bold self-start sm:self-auto flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Saques & Recebimento Ativos
        </span>
      </div>

      {/* Balance & Official Deposit Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Balance Card */}
        <div className="bg-slate-950 p-3 rounded-lg border border-orange-500/20 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">SALDO TOTAL (BTC)</span>
            <div className="text-lg font-bold text-white mt-1 flex items-center gap-2">
              <span>{showBalance ? `${btcBalance.toFixed(8)} BTC` : '•••••••• BTC'}</span>
              <button 
                onClick={() => setShowBalance(!showBalance)} 
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={showBalance ? "Ocultar saldo" : "Mostrar saldo"}
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-orange-400 block mt-1 font-mono font-bold">
              ≈ {showBalance ? `R$ ${brlValue}` : 'R$ ••••••••'}
            </span>
          </div>
          <Bitcoin className="w-10 h-10 text-orange-400/40 shrink-0" />
        </div>

        {/* Deposit Address Card */}
        <div className="bg-slate-950 p-3 rounded-lg border border-orange-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 block font-semibold">
                ENDEREÇO OFICIAL PARA RECEBIMENTO (70% OFF)
              </span>
              <span className="text-[9px] text-emerald-400 font-bold">Native SegWit</span>
            </div>
            <div className="text-[11px] text-orange-300 font-bold break-all mt-1 bg-slate-900 p-1.5 rounded border border-slate-800 select-all">
              {officialAddress}
            </div>
          </div>
          <button 
            onClick={handleCopyBtc}
            className="mt-2 w-full bg-orange-950 hover:bg-orange-900 border border-orange-600/50 text-orange-300 py-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            {copiedBtc ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedBtc ? 'Endereço Copiado com Sucesso!' : 'Copiar Endereço BTC'}</span>
          </button>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
        <span className="text-[10px] text-slate-400 block font-bold uppercase">
          Solicitar Saque / Transferência de Bitcoin:
        </span>
        <form onSubmit={handleWithdraw} className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input 
            type="text" 
            placeholder="Endereço BTC de destino..."
            value={withdrawAddress}
            onChange={(e) => setWithdrawAddress(e.target.value)}
            disabled={isProcessing}
            className="bg-slate-900 border border-slate-700 text-xs px-3 py-2 rounded-lg text-white outline-none font-mono focus:border-orange-500 transition-colors"
          />
          <input 
            type="number" 
            step="0.0001"
            min="0.0001"
            placeholder="Qtd BTC (ex: 0.01)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            disabled={isProcessing}
            className="bg-slate-900 border border-slate-700 text-xs px-3 py-2 rounded-lg text-white outline-none font-mono focus:border-orange-500 transition-colors"
          />
          <button 
            type="submit"
            disabled={isProcessing}
            className="bg-orange-600 hover:bg-orange-500 active:scale-98 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-orange-950/40 disabled:opacity-50"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{isProcessing ? 'Enviando...' : 'Confirmar Saque'}</span>
          </button>
        </form>
        {withdrawStatus && (
          <p className={`text-[11px] font-bold font-mono ${withdrawStatus.startsWith('Erro') ? 'text-rose-400' : 'text-cyan-300'}`}>
            {withdrawStatus}
          </p>
        )}
      </div>
    </div>
  );
};
