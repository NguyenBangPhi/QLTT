import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-25',

  ssr: false,

  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxt/eslint'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'vi' },
      title: 'Thư viện Đại học',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '16x16 32x32 48x48' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: { usePolling: true, interval: 500 },
    },
  },

  experimental: {
    watcher: 'chokidar',
  },

  watchers: {
    chokidar: { usePolling: true, interval: 500 },
  },

  nitro: {
    devProxy: {
      '/api': {
        target: process.env.NUXT_API_TARGET || 'http://localhost:3000/api',
        changeOrigin: true,
      },
    },
  },

  runtimeConfig: {
    public: {
      apiBase: '/api',
    },
  },

  devServer: { host: '0.0.0.0', port: 3000 },
})
