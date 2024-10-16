// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  modules: ['@vite-pwa/nuxt'],
  devtools: { enabled: true },

  pwa: {
    manifest: {
      name: 'Hisab Notes',
      short_name: 'Hisab',
      description: 'A simple note app for managing and calculating hisab',
      theme_color: '#1976d2',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        }
      ]
    },
    registerType: 'autoUpdate',
    workbox: {
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
    }
  }
})
