import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'Dark Modern' | 'High Contrast Cyber' | 'Minimalist Light';

export interface ThemeConfig {
  id: ThemeMode;
  slug: 'dark-modern' | 'high-contrast-cyber' | 'minimalist-light';
  label: string;
  description: string;
  colorScheme: 'dark' | 'light';
  primaryColor: string;
  badgeBg: string;
}

export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: 'Dark Modern',
    slug: 'dark-modern',
    label: 'Dark Modern (Cores Vivas & Moda Suave)',
    description: 'Interface profissional com cores vivas balanceadas, fundo roxo aveludado e brilho suave de alta precisão.',
    colorScheme: 'dark',
    primaryColor: '#c084fc',
    badgeBg: 'bg-purple-950/70 text-purple-200 border-purple-500/40 shadow-[0_0_12px_rgba(192,132,252,0.3)]',
  },
  {
    id: 'High Contrast Cyber',
    slug: 'high-contrast-cyber',
    label: 'High Contrast Cyber',
    description: 'Modo tático OLED com fundo preto absoluto, bordas de neon ciano e contraste máximo sem vazamento.',
    colorScheme: 'dark',
    primaryColor: '#00f0ff',
    badgeBg: 'bg-cyan-950 text-cyan-300 border-cyan-400',
  },
  {
    id: 'Minimalist Light',
    slug: 'minimalist-light',
    label: 'Minimalist Light',
    description: 'Visual nórdico limpo com superfícies brancas puras, tipografia slate legível e micro-bordas suaves.',
    colorScheme: 'light',
    primaryColor: '#3b82f6',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
  },
];

export interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  availableThemes: ThemeConfig[];
  currentThemeConfig: ThemeConfig;
  toggleNextTheme: () => void;
  resolvedTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'vpsnsa-app-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (
        stored === 'Dark Modern' ||
        stored === 'High Contrast Cyber' ||
        stored === 'Minimalist Light'
      ) {
        return stored;
      }
      // Suporte a migração de chaves antigas
      if (stored === 'dark') return 'Dark Modern';
      if (stored === 'light') return 'Minimalist Light';
    } catch (e) {
      console.warn('LocalStorage error reading theme:', e);
    }
    return 'Dark Modern'; // Padrão soberano da vpsNsA
  });

  const currentThemeConfig =
    AVAILABLE_THEMES.find(t => t.id === theme) || AVAILABLE_THEMES[0];

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const slug = currentThemeConfig.slug;
    const isDark = currentThemeConfig.colorScheme === 'dark';

    // 1. Atualizar atributos de dados e classes no <html> e <body>
    root.setAttribute('data-theme', slug);
    root.setAttribute('data-theme-name', currentThemeConfig.id);
    root.style.colorScheme = currentThemeConfig.colorScheme;

    body.setAttribute('data-theme', slug);

    // Ajustar classes dark/light para compatibilidade com Tailwind variant
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    // Classes específicas para cada tema
    root.classList.remove('theme-dark-modern', 'theme-high-contrast-cyber', 'theme-minimalist-light');
    root.classList.add(`theme-${slug}`);

    // 2. Atualizar dinamicamente as variáveis CSS globais no :root para feedback imediato
    if (theme === 'Dark Modern') {
      root.style.setProperty('--bg-app', '#0c0414');
      root.style.setProperty('--bg-surface', '#150826');
      root.style.setProperty('--bg-surface-elevated', '#1e0c37');
      root.style.setProperty('--bg-surface-hover', '#2b114e');
      root.style.setProperty('--bg-header', 'rgba(21, 8, 38, 0.92)');
      root.style.setProperty('--bg-sidebar', '#120622');
      root.style.setProperty('--bg-ticker', '#0a0312');
      root.style.setProperty('--bg-input', '#1b0c34');
      root.style.setProperty('--text-main', '#fbf8ff');
      root.style.setProperty('--text-sub', '#f3e8ff');
      root.style.setProperty('--text-muted', '#d8b4fe');
      root.style.setProperty('--border-app', 'rgba(192, 132, 252, 0.35)');
      root.style.setProperty('--border-subtle', 'rgba(147, 51, 234, 0.28)');
      root.style.setProperty('--border-accent', '#c084fc');
      root.style.setProperty('--shadow-card', '0 0 24px -2px rgba(168, 85, 247, 0.35), 0 8px 32px -4px rgba(0, 0, 0, 0.7)');
      root.style.setProperty('--accent-primary', '#c084fc');
      root.style.setProperty('--accent-glow', 'rgba(192, 132, 252, 0.65)');
    } else if (theme === 'High Contrast Cyber') {
      root.style.setProperty('--bg-app', '#000000');
      root.style.setProperty('--bg-surface', '#040608');
      root.style.setProperty('--bg-surface-elevated', '#080e14');
      root.style.setProperty('--bg-surface-hover', '#0c1822');
      root.style.setProperty('--bg-header', 'rgba(0, 0, 0, 0.95)');
      root.style.setProperty('--bg-sidebar', '#000000');
      root.style.setProperty('--bg-ticker', '#020202');
      root.style.setProperty('--bg-input', '#04080c');
      root.style.setProperty('--text-main', '#ffffff');
      root.style.setProperty('--text-sub', '#00f0ff');
      root.style.setProperty('--text-muted', '#7095a5');
      root.style.setProperty('--border-app', '#00f0ff');
      root.style.setProperty('--border-subtle', 'rgba(0, 240, 255, 0.45)');
      root.style.setProperty('--border-accent', '#00f0ff');
      root.style.setProperty('--shadow-card', '0 0 15px rgba(0, 240, 255, 0.35), inset 0 0 10px rgba(0, 240, 255, 0.05)');
      root.style.setProperty('--accent-primary', '#00f0ff');
      root.style.setProperty('--accent-glow', 'rgba(0, 240, 255, 0.6)');
    } else if (theme === 'Minimalist Light') {
      root.style.setProperty('--bg-app', '#f8fafc');
      root.style.setProperty('--bg-surface', '#ffffff');
      root.style.setProperty('--bg-surface-elevated', '#f1f5f9');
      root.style.setProperty('--bg-surface-hover', '#e2e8f0');
      root.style.setProperty('--bg-header', 'rgba(255, 255, 255, 0.92)');
      root.style.setProperty('--bg-sidebar', '#ffffff');
      root.style.setProperty('--bg-ticker', '#f1f5f9');
      root.style.setProperty('--bg-input', '#ffffff');
      root.style.setProperty('--text-main', '#0f172a');
      root.style.setProperty('--text-sub', '#334155');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border-app', '#e2e8f0');
      root.style.setProperty('--border-subtle', '#cbd5e1');
      root.style.setProperty('--border-accent', '#3b82f6');
      root.style.setProperty('--shadow-card', '0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)');
      root.style.setProperty('--accent-primary', '#3b82f6');
      root.style.setProperty('--accent-glow', 'rgba(59, 130, 246, 0.2)');
    }
  }, [theme, currentThemeConfig]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('LocalStorage error setting theme:', e);
    }
  };

  const toggleNextTheme = () => {
    const currentIndex = AVAILABLE_THEMES.findIndex(t => t.id === theme);
    const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length;
    setTheme(AVAILABLE_THEMES[nextIndex].id);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        availableThemes: AVAILABLE_THEMES,
        currentThemeConfig,
        toggleNextTheme,
        resolvedTheme: currentThemeConfig.colorScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
