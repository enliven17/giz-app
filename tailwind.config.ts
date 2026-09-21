import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#050706', soft: '#0b100d' },
        neon: { DEFAULT: '#31c47e', dim: '#238a5a', deep: '#123423' },
      },
      boxShadow: {
        glass: '0 18px 40px -30px rgba(0,0,0,0.9)',
        neon: 'none',
      },
    },
  },
  plugins: [],
} satisfies Config
