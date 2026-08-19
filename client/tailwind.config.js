/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'stein-bg': '#070a14',
        'stein-surface': '#0f172a',
        'stein-surface-alt': '#1e293b',
        'stein-surface-glass': 'rgba(15, 23, 42, 0.75)',
        'stein-border': '#1e293b',
        'stein-border-light': '#334155',
        'stein-accent': '#3b82f6',
        'stein-accent-bright': '#60a5fa',
        'stein-warning': '#f59e0b',
        'stein-danger': '#ef4444',
        'stein-success': '#10b981',
        'stein-cyan': '#06b6d4',
        'stein-purple': '#8b5cf6',
        'stein-text': '#f1f5f9',
        'stein-text-muted': '#cbd5e1',
        'stein-text-dim': '#64748b',
      },
      boxShadow: {
        'cyber-blue': '0 0 20px -5px rgba(59, 130, 246, 0.3)',
        'cyber-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.3)',
        'cyber-red': '0 0 20px -5px rgba(239, 68, 68, 0.3)',
        'cyber-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.6))' },
          '50%': { opacity: 0.5, filter: 'drop-shadow(0 0 2px rgba(6,182,212,0.2))' },
        },
      },
    },
  },
  plugins: [],
};
