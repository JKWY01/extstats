/** VS Code Marketplace 数据访问层。
 *
 * 数据在 data/marketplace.json(同步脚本写入,随仓库分发),站点读路径零外呼。
 * 纪律:数值要么来自 Marketplace 接口,要么缺失;安装量历史是逐日快照,第一天只有一点,
 * 页面如实说明"历史从本站开跑之日起积累"——绝不回填编造。
 */

import raw from '@/data/marketplace.json'

export interface ExtEntry {
  /** publisher.extension */
  id: string
  pub: string
  name: string
  disp: string
  desc: string
  /** Marketplace 类目(可能多条,取首条做分桶) */
  cats: string[]
  ver: string
  /** YYYY-MM-DD */
  updated: string
  installs: number
  rating: number | null
  ratingCount: number
  /** 安装量时序:[[YYYY-MM-DD, installs], ...] 新→旧;从本站首跑之日起积累 */
  ts: Array<[string, number]>
}

interface DataShape {
  meta: { source: string; fetched_at: string; count: number }
  exts: ExtEntry[]
}

const DATA = raw as unknown as DataShape
const BY_ID = new Map<string, ExtEntry>(DATA.exts.map((e) => [e.id, e]))

export function meta() {
  return DATA.meta
}

export function allExts(): ExtEntry[] {
  return DATA.exts
}

export function extById(id: string): ExtEntry | null {
  return BY_ID.get(id.toLowerCase()) ?? null
}

export function categoryNames(): string[] {
  const set = new Set<string>()
  for (const e of DATA.exts) for (const c of e.cats) set.add(c)
  return [...set].sort((a, b) => a.localeCompare(b))
}

export function slugifyCategory(c: string): string {
  return c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function extsInCategory(cat: string): ExtEntry[] {
  const target = cat.toLowerCase()
  return DATA.exts.filter((e) => e.cats.some((c) => c.toLowerCase() === target))
}

export function topByInstalls(limit = 100): ExtEntry[] {
  return DATA.exts.slice(0, limit)
}

export function topRated(limit = 100, minRatingCount = 50): ExtEntry[] {
  return DATA.exts
    .filter((e) => e.rating != null && e.ratingCount >= minRatingCount && e.rating >= 4)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.ratingCount - a.ratingCount)
    .slice(0, limit)
}

/** 近 N 天安装量增量榜(时序不足 N 天的用现有天数;仅 1 点者无增速,不进榜)。 */
export function fastestGrowing(days = 7, limit = 50): Array<{ ext: ExtEntry; delta: number; pct: number }> {
  const rows: Array<{ ext: ExtEntry; delta: number; pct: number }> = []
  for (const e of DATA.exts) {
    if (e.ts.length < 2) continue
    const latest = e.ts[0]
    const past =
      e.ts.find(([d]) => d <= shiftISO(latest[0], -days)) ?? e.ts[e.ts.length - 1]
    const delta = latest[1] - past[1]
    if (delta <= 0) continue
    rows.push({ ext: e, delta, pct: past[1] > 0 ? (delta / past[1]) * 100 : 0 })
  }
  return rows.sort((a, b) => b.delta - a.delta).slice(0, limit)
}

function shiftISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function rankOf(id: string): number {
  return DATA.exts.findIndex((e) => e.id === id) + 1
}

export function searchExts(q: string, limit = 30): ExtEntry[] {
  const needle = q.trim().toLowerCase()
  if (!needle) return []
  return DATA.exts
    .filter(
      (e) =>
        e.id.toLowerCase().includes(needle) ||
        e.disp.toLowerCase().includes(needle) ||
        e.desc.toLowerCase().includes(needle),
    )
    .slice(0, limit)
}
