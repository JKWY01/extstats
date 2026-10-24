import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ExtStats — VS Code Extension Stats',
    short_name: 'ExtStats',
    description: 'VS Code extension install counts, ratings, and daily growth.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6fbfa',
    theme_color: '#0d7d72',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
