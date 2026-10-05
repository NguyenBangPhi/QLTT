import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-25',

  // Mọi trang đều nằm sau đăng nhập và token giữ ở localStorage, nên SSR không mang lại
  // lợi ích gì mà còn buộc phải chuyển token sang cookie. Chạy SPA nhưng vẫn giữ trọn
  // file-based routing, layouts, middleware và auto-import của Nuxt.
  ssr: false,

  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxt/eslint'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'vi' },
      title: 'Thư viện Đại học',
      link: [
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
      // Bind-mount của Docker Desktop trên Windows không phát fs event
      watch: { usePolling: true, interval: 500 },
    },
  },

  // Vite watch ở trên chỉ lo module đã biên dịch. Nuxt còn một watcher riêng để quét
  // thư mục pages/composables/components và dựng bảng auto-import — không bật polling
  // cho nó thì file mới tạo sẽ không được đăng ký, dẫn tới lỗi "useXxx is not defined".
  //
  // Mặc định Nuxt dùng watcher native (@parcel/watcher) vốn không có tuỳ chọn polling và
  // không nhận sự kiện qua bind-mount của Docker Desktop trên Windows. Phải đổi sang
  // chokidar thì usePolling mới có tác dụng.
  experimental: {
    watcher: 'chokidar',
  },

  watchers: {
    chokidar: { usePolling: true, interval: 500 },
  },

  // Trình duyệt chỉ nói chuyện với một origin duy nhất nên không dính CORS
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
