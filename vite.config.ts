import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import permission from './plugin/permission';
import inspect from 'vite-plugin-inspect';

// https://vite.dev/config/
export default defineConfig({
  plugins: [inspect() ,vue(), permission()],
})
