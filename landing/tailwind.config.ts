import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#050706', soft: '#0b100d', card: '#0d1211' },
        neon: { DEFAULT: '#31c47e', dim: '#238a5a', deep: '#123423' },
      },
      maxWidth: { shell: '1200px' },
    },
  },
  plugins: [],
} satisfies Config
