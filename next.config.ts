import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Scope the workspace root to this project. Without this, a stray
// package-lock.json in the user's home dir makes Next pick C:\Users\<user>
// as the root, so Turbopack tries to watch the entire home directory and
// crashes on Windows with "os error 1450" (insufficient system resources).
const projectRoot = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  // Next 16 bloque par défaut les requêtes dev (HMR, server actions) quand la
  // page est ouverte via une autre origine que localhost — autorise 127.0.0.1.
  allowedDevOrigins: ['127.0.0.1'],
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
