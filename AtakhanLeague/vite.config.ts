import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import sitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sitemap({
      hostname: 'https://atakhanleague.com',
      dynamicRoutes: [
        '/',
        '/tournaments',
        '/league',
        '/rankings',
        '/contact-us',
        '/terms',
      ],
      exclude: ['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/profile'],
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      robots: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/profile'],
        },
      ],
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
