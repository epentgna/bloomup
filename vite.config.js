import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    // Fallback hardcoded values used when VITE_FIREBASE_* env vars are absent
    // (e.g. in CI builds where .env is not committed).
    'import.meta.env.VITE_FIREBASE_API_KEY':            JSON.stringify(process.env.VITE_FIREBASE_API_KEY            || 'AIzaSyDtxNDWKbfZmNaZnOdOl4cVHJScj1G2iQ8'),
    'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN':        JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN        || 'focusapp-95fcd.firebaseapp.com'),
    'import.meta.env.VITE_FIREBASE_PROJECT_ID':         JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID         || 'focusapp-95fcd'),
    'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET':     JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET     || 'focusapp-95fcd.firebasestorage.app'),
    'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID':JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| '1083321197212'),
    'import.meta.env.VITE_FIREBASE_APP_ID':             JSON.stringify(process.env.VITE_FIREBASE_APP_ID             || '1:1083321197212:web:bc1b4e982a147ca99b4359'),
    'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID':     JSON.stringify(process.env.VITE_FIREBASE_MEASUREMENT_ID     || 'G-3D596GN9KY'),
  },
})
