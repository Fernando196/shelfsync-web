import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', 'dayjs-nuxt', '@pinia/nuxt', '@nuxt/icon'],
  css: ['~/assets/css/main.css'],
  icon: {
    // Iconos de @iconify-json/lucide empaquetados localmente (sin peticiones a la API de Iconify)
    serverBundle: { collections: ['lucide'] },
    clientBundle: { scan: true },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  dayjs: {
    locales: ['es'],
    defaultLocale: 'es',
    plugins: ['relativeTime'],
  },
  runtimeConfig: {
    // Host del API para las peticiones del SSR (red interna de Docker, ej. http://shelfsync-api:4000).
    // Vacío = usa apiBase. Override: NUXT_API_BASE_SERVER
    apiBaseServer: '',
    public: {
      // Host del API sin /api (las fotos se sirven en <host>/uploads). Override: NUXT_PUBLIC_API_BASE
      apiBase: 'http://localhost:4000',
    },
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },
  app: {
    head: {
      title: 'ShelfSync',
      htmlAttrs: { lang: 'es' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#334155' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/icon.png' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap',
        },
      ],
    },
  },
})
