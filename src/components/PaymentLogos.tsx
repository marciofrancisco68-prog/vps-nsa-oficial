import React from 'react';

export const VisaLogo: React.FC<{ className?: string }> = ({ className = 'h-5' }) => (
  <svg
    viewBox="0 0 100 32"
    fill="currentColor"
    className={className}
    aria-label="Visa Original Logo"
  >
    <path
      d="M37.7 2.2L24.8 30h-6.2L11.5 8.2c-.5-2.1-1-2.8-2.6-3.7-2.6-1.4-6.9-2.8-10.7-3.6l.3-1.4h16.8c2.2 0 4.1 1.4 4.6 4l4.1 21.6 10.3-23h6.6zm31.7 18.9c0-7.3-10.1-7.7-10-11 0-1 .9-2 3-2.3 1-.1 3.9-.3 7.3 1.2l1.3-6.1c-1.8-.7-4.1-1.3-7-1.3-7.4 0-12.6 3.9-12.6 9.6 0 4.2 3.7 6.5 6.6 7.9 3 1.5 4 2.4 4 3.7 0 2-2.4 2.9-4.7 2.9-3.9 0-6.2-.6-9.5-2.1l-1.3 6.3c1.7.8 4.9 1.5 8.2 1.5 7.8 0 12.9-3.9 12.9-9.7M88.4 30h5.8L89.1 2.2h-5.4c-1.7 0-3.1 1-3.7 2.4l-10.5 25.4h6.5l1.3-3.6h8l1.2 3.6zm-6.9-8.9l3.3-9.1 1.9 9.1h-5.2zm-28.7-19l-5.1 27.9h-6.2l5.1-27.9h6.2z"
      fill="#1A1F71"
    />
    <path
      d="M8.9 4.5c-1.6-.9-5.9-2.3-9.7-3.1l.3-1.4h16.8c2.2 0 4.1 1.4 4.6 4L14.7 24 8.9 4.5z"
      fill="#FAA61A"
    />
  </svg>
);

export const MastercardLogo: React.FC<{ className?: string }> = ({ className = 'h-6' }) => (
  <svg
    viewBox="0 0 130 80"
    className={className}
    aria-label="Mastercard Original Logo"
  >
    <rect width="130" height="80" rx="8" fill="none" />
    <circle cx="48" cy="40" r="28" fill="#EB001B" />
    <circle cx="82" cy="40" r="28" fill="#F79E1B" />
    <path
      d="M65 19.3c5.4 5.3 8.8 12.6 8.8 20.7s-3.4 15.4-8.8 20.7c-5.4-5.3-8.8-12.6-8.8-20.7s3.4-15.4 8.8-20.7z"
      fill="#FF5F00"
    />
  </svg>
);

export const NubankLogo: React.FC<{ className?: string }> = ({ className = 'h-6' }) => (
  <div className={`inline-flex items-center gap-1.5 font-sans ${className}`}>
    <svg viewBox="0 0 100 100" className="h-6 w-6" aria-label="Nubank Logo Emblem">
      <rect width="100" height="100" rx="22" fill="#820AD1" />
      <path
        d="M26 31v38h11.5V47.5c0-4.5 2.5-7.5 6.5-7.5s6.5 3 6.5 7.5V69H62V47.5c0-4.5 2.5-7.5 6.5-7.5s6.5 3 6.5 7.5V69h11V44.5c0-10.5-6.5-16.5-15.5-16.5-5.5 0-10 2.5-13 7-3-4.5-7.5-7-13-7-6.5 0-11.5 3.5-14 8.5V31H26z"
        fill="#FFFFFF"
      />
    </svg>
    <span className="font-extrabold text-sm tracking-tight text-[#820AD1] font-mono">
      nubank
    </span>
  </div>
);

export const EloLogo: React.FC<{ className?: string }> = ({ className = 'h-5' }) => (
  <svg viewBox="0 0 100 34" className={className} aria-label="Elo Original Logo">
    <rect width="100" height="34" rx="4" fill="#000000" />
    <circle cx="22" cy="17" r="9" fill="#FFD100" />
    <circle cx="32" cy="17" r="9" fill="#EE1C25" fillOpacity="0.85" />
    <circle cx="42" cy="17" r="9" fill="#00A4E8" fillOpacity="0.85" />
    <text
      x="56"
      y="23"
      fontFamily="system-ui, sans-serif"
      fontSize="17"
      fontWeight="900"
      fontStyle="italic"
      fill="#FFFFFF"
    >
      elo
    </text>
  </svg>
);

export const PixLogo: React.FC<{ className?: string }> = ({ className = 'h-5' }) => (
  <div className={`inline-flex items-center gap-1.5 ${className}`}>
    <svg viewBox="0 0 100 100" className="h-5 w-5" aria-label="Pix Banco Central Logo">
      <path
        d="M71.4 78.4L54.7 61.7c-2.6-2.6-6.8-2.6-9.4 0L28.6 78.4c-4.8 4.8-12.6 4.8-17.4 0L4.7 71.9c-4.8-4.8-4.8-12.6 0-17.4l16.7-16.7c2.6-2.6 2.6-6.8 0-9.4L4.7 11.7C-.1 6.9-.1-.9 4.7-5.7L11.2-12.2c4.8-4.8 12.6-4.8 17.4 0l16.7 16.7c2.6 2.6 6.8 2.6 9.4 0L71.4-12.2c4.8-4.8 12.6-4.8 17.4 0l6.5 6.5c4.8 4.8 4.8 12.6 0 17.4L78.6 28.4c-2.6 2.6-2.6 6.8 0 9.4l16.7 16.7c4.8 4.8 4.8 12.6 0 17.4l-6.5 6.5c-4.8 4.8-12.6 4.8-17.4 0z"
        transform="translate(0, 16)"
        fill="#32BCAD"
      />
    </svg>
    <span className="font-extrabold text-xs tracking-wider text-[#32BCAD] font-mono uppercase">
      PIX
    </span>
  </div>
);

export const MercadoPagoLogo: React.FC<{ className?: string }> = ({ className = 'h-6' }) => (
  <div className={`inline-flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 100 70" className="h-6 w-8" aria-label="Mercado Pago Logo">
      <rect width="100" height="70" rx="14" fill="#009EE3" />
      {/* Handshake stylized curve */}
      <path
        d="M26 35c0-4.5 3.5-8 8-8h10c2.5 0 5 1 6.5 3l4.5 5 4.5-5c1.5-2 4-3 6.5-3h10c4.5 0 8 3.5 8 8 0 3-1.5 5.5-4 7l-15 12c-2.5 2-6 2-8.5 0L42 42l-5 5c-1.5 1.5-3.5 2-5.5 1.5-3.5-.8-5.5-3.5-5.5-7.5v-6z"
        fill="#FFFFFF"
      />
      <circle cx="36" cy="31" r="3.5" fill="#009EE3" />
      <circle cx="64" cy="31" r="3.5" fill="#009EE3" />
    </svg>
    <div className="flex flex-col leading-none">
      <span className="font-extrabold text-xs text-sky-400 tracking-tight">mercado</span>
      <span className="font-bold text-[10px] text-white tracking-widest uppercase">pago</span>
    </div>
  </div>
);
