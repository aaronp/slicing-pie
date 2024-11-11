cimport { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte()],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: 'index.html',
            output: {
                entryFileNames: 'dapp.js',
                assetFileNames: 'dapp.css'
            }
        }
    }
});
