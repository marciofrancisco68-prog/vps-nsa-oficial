import React from 'react';
import { Moon, Zap, Sun } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme, availableThemes } = useTheme();

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'Dark Modern':
        return Moon;
      case 'High Contrast Cyber':
        return Zap;
      case 'Minimalist Light':
        return Sun;
    }
  };

  return (
    <div
      className="inline-flex items-center p-0.5 rounded-lg border border-slate-700/60 bg-slate-900/80 backdrop-blur-xs text-xs shadow-xs"
      role="group"
      aria-label="Seletor de Modo de Tema (Dark Modern / High Contrast Cyber / Minimalist Light)"
    >
      {availableThemes.map((opt) => {
        const Icon = getThemeIcon(opt.id);
        const isActive = theme === opt.id;

        const activeStyles =
          opt.id === 'High Contrast Cyber'
            ? 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.5)]'
            : opt.id === 'Minimalist Light'
            ? 'bg-white text-slate-900 border-slate-300 shadow-sm'
            : 'bg-purple-950/90 text-purple-200 border-purple-500 shadow-[0_0_15px_rgba(192,132,252,0.5)]';

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            title={`${opt.label}: ${opt.description}`}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer ${
              isActive
                ? `${activeStyles} border font-bold`
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 shrink-0 ${
                isActive
                  ? opt.id === 'High Contrast Cyber'
                    ? 'text-cyan-400 animate-pulse'
                    : opt.id === 'Minimalist Light'
                    ? 'text-amber-500'
                    : 'text-purple-300 animate-pulse'
                  : 'text-slate-400'
              }`}
            />
            <span className="hidden xl:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
