import { NextResponse } from 'next/server'
import { BASE, SITE_NAME } from '@/lib/site'
import { meta } from '@/lib/mp'

/** llms.txt:给 AI 爬虫/agent 的站点说明书。 */
export const revalidate = 86400

export function GET(): Response {
  const m = meta()
  const body = `# ${SITE_NAME}

> VS Code extension stats: the top ${m.count.toLocaleString('en-US')} Marketplace extensions by installs, with ratings, categories, and a daily install-count history series.
> Live at ${BASE} . Data from the official Visual Studio Marketplace gallery API; AI crawlers and agents are welcome.

## Endpoints

- ${BASE}/api/extension?id=<publisher.extension> — full profile including install history (ts: [date, installs][])
- ${BASE}/api/extension?q=<keyword> — search by name/id/description
- ${BASE}/sitemap.xml — full URL list

## Pages

- /extension/<publisher.extension> — one page per extension: installs, rating, version, rank, categories, install-history sparkline
- /category/<slug> — category rankings by installs (themes, linters, formatters, ...)
- /rankings — installs / rating / 7-day-growth leaderboards
- /extensions — the full top-${m.count} table

## Facts & policy

- Source: Visual Studio Marketplace public gallery API (extensionquery), sorted by install count; refreshed daily.
- The install history is our own daily snapshot series starting ${m.fetched_at.slice(0, 10)} — never backfilled or estimated.
- Extensions that fall out of the top ${m.count} drop from the dataset (noted in the README).
`
  return new NextResponse(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400' },
  })
}
