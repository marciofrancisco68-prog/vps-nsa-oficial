import React from 'react';

export function InteractiveRoundLogo({ size = 42 }: { size?: number }) {
  const handleLogoClick = () => {
    // Redireciona para o domínio oficial da vpsNsA
    window.location.href = 'https://www.nsaoficial.com.br';
  };

  return (
    <button 
      onClick={handleLogoClick}
      className="relative rounded-full flex items-center justify-center bg-gradient-to-tr from-[#080B11] via-[#0D121F] to-[#151C2C] border-2 border-cyan-400 shadow-xl shadow-cyan-500/30 overflow-hidden cursor-pointer group transition-transform hover:scale-105 shrink-0"
      style={{ width: size, height: size }}
      title="Ir para a página inicial (www.nsaoficial.com.br)"
    >
      <svg viewBox="0 0 512 512" className="w-full h-full p-1 drop-shadow-[0_0_8px_rgba(0,216,255,0.6)] group-hover:rotate-6 transition-transform">
        <defs>
          <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#00D8FF" />
          </linearGradient>
        </defs>

        <circle cx="256" cy="256" r="230" fill="none" stroke="#00D8FF" strokeWidth="10" opacity="0.4" />

        <g fill="url(#brandGradient)" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="130">
          <text x="70" y="295">N</text>
          <text x="170" y="295">S</text>
          <text x="265" y="295">A</text>
        </g>

        <path d="M 150 330 C 240 340, 320 300, 395 200 L 370 205 L 430 155 L 425 225 L 395 200 C 320 290, 240 325, 150 330 Z" fill="url(#brandGradient)" />
      </svg>
    </button>
  );
}

export default InteractiveRoundLogo;
