import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// Security headers applied to BOTH dev and preview servers.
// Production deployments should use the _headers file or hosting-provider config.
const securityHeaders = {
  // Force HTTPS once accepted (only meaningful over real HTTPS, harmless otherwise)
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  // Stop the page being framed by other sites (clickjacking defense)
  'X-Frame-Options': 'DENY',
  // Stop MIME-type sniffing
  'X-Content-Type-Options': 'nosniff',
  // Don't leak full URLs to cross-origin resources
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Lock down powerful browser APIs we don't use
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
}

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    port: 5173,
    open: true,
    https: true,
    headers: securityHeaders,
  },
  preview: {
    port: 4173,
    https: true,
    headers: securityHeaders,
  },
})
