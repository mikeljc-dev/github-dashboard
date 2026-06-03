// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],
  runtimeConfig: {
    githubToken: process.env.GITHUB_TOKEN,
    public: {
      githubBaseUrl: 'https://api.github.com',
    }
  },
  typescript: { strict: true },
  vite: {
    optimizeDeps: {
      include: ['chart.js', 'vue-chartjs'],
    }
  },
  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      }
    }
  }
})
