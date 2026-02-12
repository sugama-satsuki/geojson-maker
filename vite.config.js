import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/geojson-maker/',
  test: {
    globals: true,
    coverage: { include: ['src/lib/**'] },
  },
})
