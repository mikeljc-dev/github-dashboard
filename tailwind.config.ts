import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,ts}',
    './app/pages/**/*.vue',
    './app/app.vue',
    './app/layouts/**/*.vue',
  ],
  theme: {
    extend: {
      colors: {
        github: {
          dark: '#0d1117',
          surface: '#161b22',
          border: '#30363d',
          text: '#c9d1d9',
          muted: '#8b949e',
          accent: '#58a6ff',
          green: '#3fb950',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
