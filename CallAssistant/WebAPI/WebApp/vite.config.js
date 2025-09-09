import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';


export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd());
  const basePath = env.VITE_BASE_PATH || (mode === 'production' ? '/webapp/dist/' : '/');

  return {
    base: basePath,
    plugins: [react(), tailwindcss(), VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      injectManifest: true,
      devOptions: {
        enabled: true,  // Enable PWA in development mode
        type: 'module'  // Use module type for dev service worker
      },
      manifest: {
        name: 'On-Call Bot',
        short_name: 'OnCall',
        start_url: basePath,
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        icons: [
          {
            src: `${basePath}pwa/icon-192.png`,
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: `${basePath}pwa/icon-512.png`,
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
        navigateFallback: `${basePath}index.html`
      }
    })],
    build: {
      sourcemap: true
    },
    server: {
      allowedHosts: [
        '132446eb8251.ngrok-free.app',
        '46f7b0e23ab9.ngrok-free.app'
      ]
    }
  }
});
