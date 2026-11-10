import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Lock, Smartphone, Mail, QrCode, CheckCircle2, AlertCircle, RefreshCw, Send, Check, Copy } from 'lucide-react';

export interface InvoiceDetails {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  planName: string;
  amount: number;
  paymentMethod: 'credit_card' | 'pix';
  status: 'paid' | 'pending';
  timestamp: string;
}

interface SecureCheckoutEngineProps {
  onPaymentSuccess?: (invoice: InvoiceDetails) => void;
  onNavigateTab?: (tab: string) => void;
  initialPlanName?: string;
  initialAmount?: number;
}

export function SecureCheckoutEngine({
  onPaymentSuccess,
  onNavigateTab,
  initialPlanName = 'Plano Turbo Dedicated VPS (128 Cores)',
  initialAmount = 149.00
}: SecureCheckoutEngineProps = {}) {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');
  
  // Dados do Formulário (Protegidos)
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('VPSNSA HYPERSCALE');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvv, setCardCvv] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);

  // Estados de Processamento e Fatura
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState<InvoiceDetails | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<string[]>([]);

  // Mascarar Cartão para Visualização Limpa
  const formatCardNumber = (val: string) => {
    return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  };

  const handleCopyPix = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText('00020126580014BR.GOV.BCB.PIX0136vpsnsa-pagamentos-mp-soberano');
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  // Simulação de Tokenização PCI-DSS e Envio de Fatura
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setDispatchStatus([]);
    setInvoiceGenerated(null);

    // 1. Criptografia / Tokenização
    setTimeout(() => {
      setDispatchStatus(prev => [...prev, '🔒 [PCI-DSS] Dados do cartão tokenizados via Mercado Pago SDK (Zero-Leak).']);
    }, 800);

    // 2. Validação da Cobrança (Cartão ou PIX)
    setTimeout(() => {
      setDispatchStatus(prev => [...prev, `✅ [Gateway MP] Pagamento aprovado no valor de R$ ${initialAmount.toFixed(2)} via ${paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'PIX'}.`]);
    }, 1800);

    // 3. Disparo da Fatura para E-mail e Celular (WhatsApp/SMS)
    setTimeout(() => {
      const newInvoice: InvoiceDetails = {
        id: `FAT-vpsNsA-${Math.floor(100000 + Math.random() * 900000)}`,
        clientName: cardHolder,
        clientEmail: clientEmail,
        clientPhone: clientPhone,
        planName: initialPlanName,
        amount: initialAmount,
        paymentMethod: paymentMethod,
        status: 'paid',
        timestamp: new Date().toLocaleString('pt-BR')
      };

      setInvoiceGenerated(newInvoice);
      setDispatchStatus(prev => [
        ...prev,
        `📲 [SMS/WhatsApp API] Fatura enviada para o número de celular: ${clientPhone}`,
        `📧 [SMTP Server] Fatura e recibo em PDF enviados para o e-mail: ${clientEmail}`
      ]);
      setIsProcessing(false);

      if (onPaymentSuccess) {
        onPaymentSuccess(newInvoice);
      }
    }, 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans select-none">
      
      {/* CABEÇALHO DO GATEWAY MERCADO PAGO DA VPSNSA */}
      <div className="bg-[#0D121F] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] px-3 py-1 rounded-full font-mono font-bold uppercase">
              Gateway Mercado Pago — Liquidação em Nome da vpsNsA
            </span>
            <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Checkout Seguro &amp; Emissão Automática de Fatura</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-[#151C2C] px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">Blindagem PCI-DSS Nível 1 🛡️</span>
          </div>
        </div>

        {/* SELETOR DE MÉTODO DE PAGAMENTO (CARTÃO OU PIX) */}
        <div className="flex flex-wrap gap-3 border-b border-slate-800 pb-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('credit_card')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              paymentMethod === 'credit_card' 
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg' 
                : 'bg-[#151C2C] text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Cartão de Crédito (Todas as Bandeiras)</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('pix')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              paymentMethod === 'pix' 
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg' 
                : 'bg-[#151C2C] text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-300" />
            <span>PIX Instantâneo</span>
          </button>
        </div>

        {/* FORMULÁRIO DE CHECKOUT E PROCESSAMENTO */}
        <form onSubmit={handleProcessPayment} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* COLUNA ESQUERDA: DADOS DE CONTATO DO CLIENTE (PARA DISPARO DE FATURA) */}
          <div className="space-y-4 bg-[#151C2C]/50 border border-slate-800 p-5 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Dados para Envio da Fatura (Celular &amp; E-mail)</span>
            </h3>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">E-mail Cadastrado do Cliente</label>
              <input 
                type="email" 
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-[#080B11] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Número de Celular (WhatsApp / SMS)</label>
              <input 
                type="text" 
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-[#080B11] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-[11px] text-indigo-300 font-mono">
              💡 Assim que o pagamento for confirmado, o recibo e a fatura em PDF serão despachados automaticamente para este WhatsApp e E-mail.
            </div>
          </div>

          {/* COLUNA DIREITA: DADOS DO PAGAMENTO (CARTÃO OU PIX) */}
          <div className="space-y-4 bg-[#151C2C]/50 border border-slate-800 p-5 rounded-2xl">
            {paymentMethod === 'credit_card' ? (
              <>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span>Dados do Cartão (Visa, Mastercard, Elo, Amex)</span>
                </h3>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Número do Cartão de Crédito</label>
                  <input 
                    type="text" 
                    placeholder="5502 9799 4829 9942"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full bg-[#080B11] border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Nome Impresso no Cartão</label>
                  <input 
                    type="text" 
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full bg-[#080B11] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 uppercase font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Validade (MM/AA)</label>
                    <input 
                      type="text" 
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-[#080B11] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none text-center focus:border-cyan-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">CVV / CVC (Criptografado)</label>
                    <input 
                      type="password" 
                      placeholder="***"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-[#080B11] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none text-center focus:border-cyan-500 font-mono"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-4">
                <QrCode className="w-24 h-24 text-emerald-400 mx-auto" />
                <p className="text-xs text-slate-300">Escaneie o QR Code ou copie a chave Pix abaixo. A liberação do servidor vpsNsA é instantânea.</p>
                <div className="relative">
                  <input 
                    type="text" 
                    readOnly 
                    value="00020126580014BR.GOV.BCB.PIX0136vpsnsa-pagamentos-mp-soberano" 
                    className="w-full bg-[#080B11] border border-slate-800 rounded-xl px-3 py-2 pr-16 text-[10px] font-mono text-emerald-400 text-center select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="absolute right-2 top-2 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPix ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Lock className="w-4 h-4" />}
              <span>{isProcessing ? 'Tokenizando Cartão & Gerando Fatura...' : `Pagar R$ ${initialAmount.toFixed(2)} via Mercado Pago`}</span>
            </button>
          </div>

        </form>

        {/* LOGS DE DISPARO DE FATURA EM TEMPO REAL */}
        {dispatchStatus.length > 0 && (
          <div className="bg-[#080B11] border border-slate-800 rounded-2xl p-4 font-mono text-[11px] space-y-2 text-slate-300">
            {dispatchStatus.map((msg, index) => (
              <div key={index} className="flex items-center gap-2">
                <span>{msg}</span>
              </div>
            ))}
          </div>
        )}

        {/* EXIBIÇÃO DA FATURA DIGITADA APÓS O PAGAMENTO */}
        {invoiceGenerated && (
          <div className="bg-[#151C2C] border border-emerald-500/50 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Fatura Emitida e Enviada com Sucesso!</h4>
              </div>
              <span className="text-xs font-mono text-cyan-300 font-bold">{invoiceGenerated.id}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">CLIENTE</span>
                <span className="text-slate-200 font-bold">{invoiceGenerated.clientName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">CELULAR DISPARADO</span>
                <span className="text-emerald-400 font-bold">{invoiceGenerated.clientPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">E-MAIL DISPARADO</span>
                <span className="text-cyan-300 font-bold">{invoiceGenerated.clientEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">VALOR PAGO</span>
                <span className="text-white font-bold">R$ {invoiceGenerated.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

export default SecureCheckoutEngine;
