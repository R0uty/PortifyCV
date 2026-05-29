export const UI_THEME_STORAGE_KEY = 'portifycv-ui-theme'
export const UI_ACCENT_STORAGE_KEY = 'portifycv-ui-accent'
export const defaultAccentId = 'sky'

const accentThemeMap = {
  sky: {
    id: 'sky',
    label: 'Sky',
    swatchClassName: 'from-sky-400 to-cyan-400',
    dark: {
      solid: '#38bdf8',
      text: '#bae6fd',
      textStrong: '#e0f2fe',
      border: 'rgba(56, 189, 248, 0.34)',
      soft: 'rgba(14, 165, 233, 0.14)',
      softStrong: 'rgba(14, 165, 233, 0.22)',
      ring: 'rgba(56, 189, 248, 0.26)',
      glow: 'rgba(56, 189, 248, 0.18)',
    },
    light: {
      solid: '#0284c7',
      text: '#075985',
      textStrong: '#0c4a6e',
      border: 'rgba(14, 165, 233, 0.22)',
      soft: 'rgba(14, 165, 233, 0.1)',
      softStrong: 'rgba(14, 165, 233, 0.16)',
      ring: 'rgba(14, 165, 233, 0.22)',
      glow: 'rgba(14, 165, 233, 0.14)',
    },
  },
  violet: {
    id: 'violet',
    label: 'Violet',
    swatchClassName: 'from-violet-400 to-fuchsia-400',
    dark: {
      solid: '#a78bfa',
      text: '#ddd6fe',
      textStrong: '#ede9fe',
      border: 'rgba(167, 139, 250, 0.34)',
      soft: 'rgba(139, 92, 246, 0.14)',
      softStrong: 'rgba(139, 92, 246, 0.22)',
      ring: 'rgba(167, 139, 250, 0.24)',
      glow: 'rgba(139, 92, 246, 0.2)',
    },
    light: {
      solid: '#7c3aed',
      text: '#6d28d9',
      textStrong: '#581c87',
      border: 'rgba(139, 92, 246, 0.22)',
      soft: 'rgba(139, 92, 246, 0.1)',
      softStrong: 'rgba(139, 92, 246, 0.16)',
      ring: 'rgba(139, 92, 246, 0.2)',
      glow: 'rgba(139, 92, 246, 0.12)',
    },
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald',
    swatchClassName: 'from-emerald-400 to-teal-400',
    dark: {
      solid: '#34d399',
      text: '#a7f3d0',
      textStrong: '#d1fae5',
      border: 'rgba(52, 211, 153, 0.32)',
      soft: 'rgba(16, 185, 129, 0.14)',
      softStrong: 'rgba(16, 185, 129, 0.22)',
      ring: 'rgba(52, 211, 153, 0.22)',
      glow: 'rgba(16, 185, 129, 0.18)',
    },
    light: {
      solid: '#059669',
      text: '#047857',
      textStrong: '#065f46',
      border: 'rgba(16, 185, 129, 0.2)',
      soft: 'rgba(16, 185, 129, 0.1)',
      softStrong: 'rgba(16, 185, 129, 0.16)',
      ring: 'rgba(16, 185, 129, 0.2)',
      glow: 'rgba(16, 185, 129, 0.14)',
    },
  },
  rose: {
    id: 'rose',
    label: 'Rose',
    swatchClassName: 'from-rose-400 to-orange-300',
    dark: {
      solid: '#fb7185',
      text: '#fecdd3',
      textStrong: '#ffe4e6',
      border: 'rgba(251, 113, 133, 0.34)',
      soft: 'rgba(244, 63, 94, 0.14)',
      softStrong: 'rgba(244, 63, 94, 0.22)',
      ring: 'rgba(251, 113, 133, 0.24)',
      glow: 'rgba(251, 113, 133, 0.18)',
    },
    light: {
      solid: '#e11d48',
      text: '#be123c',
      textStrong: '#9f1239',
      border: 'rgba(244, 63, 94, 0.2)',
      soft: 'rgba(244, 63, 94, 0.1)',
      softStrong: 'rgba(244, 63, 94, 0.16)',
      ring: 'rgba(244, 63, 94, 0.2)',
      glow: 'rgba(244, 63, 94, 0.12)',
    },
  },
  amber: {
    id: 'amber',
    label: 'Amber',
    swatchClassName: 'from-amber-400 to-orange-400',
    dark: {
      solid: '#fbbf24',
      text: '#fde68a',
      textStrong: '#fef3c7',
      border: 'rgba(251, 191, 36, 0.34)',
      soft: 'rgba(245, 158, 11, 0.14)',
      softStrong: 'rgba(245, 158, 11, 0.22)',
      ring: 'rgba(251, 191, 36, 0.24)',
      glow: 'rgba(245, 158, 11, 0.18)',
    },
    light: {
      solid: '#d97706',
      text: '#b45309',
      textStrong: '#92400e',
      border: 'rgba(245, 158, 11, 0.22)',
      soft: 'rgba(245, 158, 11, 0.1)',
      softStrong: 'rgba(245, 158, 11, 0.16)',
      ring: 'rgba(245, 158, 11, 0.2)',
      glow: 'rgba(245, 158, 11, 0.12)',
    },
  },
  indigo: {
    id: 'indigo',
    label: 'Indigo',
    swatchClassName: 'from-indigo-400 to-sky-400',
    dark: {
      solid: '#818cf8',
      text: '#c7d2fe',
      textStrong: '#e0e7ff',
      border: 'rgba(129, 140, 248, 0.34)',
      soft: 'rgba(99, 102, 241, 0.14)',
      softStrong: 'rgba(99, 102, 241, 0.22)',
      ring: 'rgba(129, 140, 248, 0.24)',
      glow: 'rgba(99, 102, 241, 0.18)',
    },
    light: {
      solid: '#4f46e5',
      text: '#4338ca',
      textStrong: '#3730a3',
      border: 'rgba(99, 102, 241, 0.22)',
      soft: 'rgba(99, 102, 241, 0.1)',
      softStrong: 'rgba(99, 102, 241, 0.16)',
      ring: 'rgba(99, 102, 241, 0.2)',
      glow: 'rgba(99, 102, 241, 0.12)',
    },
  },
  graphite: {
    id: 'graphite',
    label: 'Graphite',
    swatchClassName: 'from-slate-500 to-zinc-500',
    dark: {
      solid: '#cbd5e1',
      text: '#e2e8f0',
      textStrong: '#f8fafc',
      border: 'rgba(148, 163, 184, 0.32)',
      soft: 'rgba(71, 85, 105, 0.2)',
      softStrong: 'rgba(71, 85, 105, 0.28)',
      ring: 'rgba(148, 163, 184, 0.22)',
      glow: 'rgba(148, 163, 184, 0.14)',
    },
    light: {
      solid: '#475569',
      text: '#334155',
      textStrong: '#0f172a',
      border: 'rgba(148, 163, 184, 0.22)',
      soft: 'rgba(148, 163, 184, 0.1)',
      softStrong: 'rgba(148, 163, 184, 0.16)',
      ring: 'rgba(148, 163, 184, 0.2)',
      glow: 'rgba(148, 163, 184, 0.12)',
    },
  },
}

export const accentOptions = Object.values(accentThemeMap)

export function getAccentOption(accentId) {
  return accentThemeMap[accentId] ?? accentThemeMap[defaultAccentId]
}

export function getAccentThemeStyles(theme, accentId) {
  const palette = getAccentOption(accentId)[theme === 'dark' ? 'dark' : 'light']

  return {
    '--accent-solid': palette.solid,
    '--accent-text': palette.text,
    '--accent-text-strong': palette.textStrong,
    '--accent-border': palette.border,
    '--accent-soft': palette.soft,
    '--accent-soft-strong': palette.softStrong,
    '--accent-ring': palette.ring,
    '--accent-glow': palette.glow,
  }
}

export function getUiTheme(theme = 'dark') {
  const isDark = theme === 'dark'

  return {
    isDark,
    pageText: isDark ? 'text-slate-100' : 'text-slate-900',
    shell: isDark
      ? 'border-white/10 bg-slate-950/72 shadow-slate-950/35'
      : 'border-slate-200 bg-white/88 shadow-slate-300/35',
    sidebar: isDark
      ? 'border-white/10 bg-slate-950/40'
      : 'border-slate-200 bg-white/70',
    main: isDark ? 'bg-slate-950/15' : 'bg-slate-50/55',
    surface: isDark
      ? 'border-white/10 bg-white/5 shadow-slate-950/10'
      : 'border-slate-200 bg-white shadow-slate-300/20',
    surfaceMuted: isDark
      ? 'border-white/10 bg-slate-950/45'
      : 'border-slate-200 bg-slate-50',
    surfaceStrong: isDark
      ? 'border-white/10 bg-slate-950/70'
      : 'border-slate-200 bg-white',
    button: isDark
      ? 'border-white/10 bg-white/5 text-slate-100 hover:border-[var(--accent-border)] hover:bg-white/8'
      : 'border-slate-300 bg-white text-slate-700 hover:border-[var(--accent-border)] hover:text-slate-900',
    buttonActive:
      'border-[color:var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-text-strong)] shadow-[0_0_0_1px_var(--accent-border)]',
    buttonDanger: isDark
      ? 'border-rose-400/20 bg-rose-400/10 text-rose-100 hover:border-rose-300/50'
      : 'border-rose-300 bg-rose-50 text-rose-700 hover:border-rose-400',
    input: isDark
      ? 'border-white/10 bg-slate-950/65 text-white placeholder:text-slate-500'
      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400',
    inputShell: isDark
      ? 'border-white/10 bg-slate-950/60'
      : 'border-slate-300 bg-white',
    textPrimary: isDark ? 'text-white' : 'text-slate-900',
    textSecondary: isDark ? 'text-slate-200' : 'text-slate-600',
    textMuted: isDark ? 'text-slate-300' : 'text-slate-500',
    textSoft: isDark ? 'text-slate-200' : 'text-slate-700',
    toastOffset: 'bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-4',
  }
}
