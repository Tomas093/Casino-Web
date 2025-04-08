import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'
    import path from 'path'

    export default defineConfig({
      base: "/Casino-Web",
        plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src')
        }
      },
      server: {
        proxy: {
          '/auth': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          }
        }
      }
    })