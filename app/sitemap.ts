import type { MetadataRoute } from 'next'
import { BASE } from '@/lib/site'
import { allExts, categoryNames, slugifyCategory } from '@/lib/mp'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/extensions`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/rankings`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
  ]
  const extEntries: MetadataRoute.Sitemap = allExts().map((e) => ({
    url: `${BASE}/extension/${e.id}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))
  const catEntries: MetadataRoute.Sitemap = categoryNames().map((c) => ({
    url: `${BASE}/category/${slugifyCategory(c)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))
  return [...staticEntries, ...catEntries, ...extEntries]
}
