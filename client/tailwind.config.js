/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'stein-bg': '#0a0e1a',
        'stein-surface': '#111827',
        'stein-surface-alt': '#1a2236',
        'stein-border': '#1e293b',
        'stein-accent': '#3b82f6',
        'stein-accent-bright': '#60a5fa',
        'stein-warning': '#f59e0b',
        'stein-danger': '#ef4444',
        'stein-success': '#10b981',
        'stein-cyan': '#06b6d4',
        'stein-text': '#e2e8f0',
        'stein-text-dim': '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
