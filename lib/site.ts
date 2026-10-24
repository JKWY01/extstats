/** 站点身份与全局常量。域名未配置时用 localhost(本地开发),部署时必填 NEXT_PUBLIC_SITE_URL。 */
export const SITE_NAME = 'ExtStats'
export const SITE_TAGLINE = 'VS Code extension install counts, ratings, and daily growth'
export const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')
export const DATA_SOURCE = 'Visual Studio Marketplace public gallery API'

export function bigNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

export function fullNum(n: number | null | undefined): string {
  if (n == null) return '—'
  return Math.round(n).toLocaleString('en-US')
}

export function dateOnly(iso: string): string {
  return iso.slice(0, 10)
}
