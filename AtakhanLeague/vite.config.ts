import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import sitemap from 'vite-plugin-sitemap'

// The stylesheet is one small file, but it blocks the first render for a whole
// round trip on a throttled connection — Lighthouse measured ~320ms of it.
// Folding it into the HTML removes that hop entirely. It costs the CSS its own
// cache entry, which is a fair trade here: this is a single-page app, so full
// document loads are rare after the first.
function inlineStylesheet() {
  return {
    name: 'inline-stylesheet',
    apply: 'build' as const,
    enforce: 'post' as const,
    transformIndexHtml(html: string, ctx: { bundle?: Record<string, { type: string; fileName: string; source?: unknown }> }) {
      if (!ctx.bundle) return html
      for (const [key, asset] of Object.entries(ctx.bundle)) {
        if (asset.type !== 'asset' || !asset.fileName.endsWith('.css')) continue
        const tag = new RegExp(`<link[^>]+href="[^"]*${asset.fileName.replace(/[.*+?^$()|[\]\\]/g, '\\$&')}"[^>]*>`)
        if (!tag.test(html)) continue
        html = html.replace(tag, `<style>${String(asset.source)}</style>`)
        // Inlined, so don't ship it as a separate file too.
        delete ctx.bundle[key]
      }
      return html
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    inlineStylesheet(),
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
