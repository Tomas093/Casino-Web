import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@css': path.resolve(__dirname, 'src/Css'),
            '@context': path.resolve(__dirname, 'src/React/context'),
            '@components': path.resolve(__dirname, 'src/React/components'),
            '@assets': path.resolve(__dirname, 'src/assets'),
            '@api': path.resolve(__dirname, 'src/React/api'),
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