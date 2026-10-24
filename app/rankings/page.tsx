import Link from 'next/link'
import type { Metadata } from 'next'
import AdSlot from '@/components/AdSlot'
import { breadcrumbLd } from '@/lib/jsonld'
import { BASE, bigNum, fullNum } from '@/lib/site'
import { fastestGrowing, meta, topByInstalls, topRated } from '@/lib/mp'

/** 排行页:总安装榜 + 高分榜 + 周增长榜(时序攒够天数前增长榜如实短/空)。 */
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'VS Code Extension Rankings — Installs, Ratings, Weekly Growth',
  description: 'Top VS Code extensions by install count, by rating, and by weekly install growth — daily-refreshed from the official Marketplace API.',
  alternates: { canonical: '/rankings' },
}

export default function RankingsPage() {
  const installs = topByInstalls(50)
  const rated = topRated(25, 200)
  const growing = fastestGrowing(7, 25)

  const breadcrumb = breadcrumbLd([
    { name: 'Home', url: `${BASE}/` },
    { name: 'Rankings' },
  ])

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />

      <p className="text-[13px] font-semibold uppercase tracking-widest text-brand">
        {meta().count.toLocaleString('en-US')} extensions tracked
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Rankings</h1>
      <p className="mt-3 text-[15px] text-ink/65">
        Daily-refreshed from the official Visual Studio Marketplace API.
      </p>

      {growing.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">Fastest growing (7-day installs)</h2>
          <ol className="mt-3 divide-y divide-ink/8 text-[14px]">
            {growing.map((r, i) => (
              <li key={r.ext.id} className="py-2">
                <Link
                  href={`/extension/${r.ext.id}`}
                  className="flex items-baseline justify-between gap-3 hover:text-brand"
                >
                  <span className="truncate font-medium">
                    <span className="mr-2 text-ink/40">{i + 1}</span>
                    {r.ext.disp}
                  </span>
                  <span className="shrink-0 text-ink/55">+{fullNum(r.delta)} / wk</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <div className="mt-8 rounded-lg border border-ink/10 bg-white px-4 py-3 text-[14px] text-ink/60">
          The weekly growth ranking appears once the daily install-history series has at least two
          snapshots — we started tracking {meta().fetched_at.slice(0, 10)}, so check back in a day
          or two. No invented numbers in the meantime.
        </div>
      )}

      <AdSlot slot="rankings-top" />

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Top 50 by installs</h2>
        <ol className="mt-3 divide-y divide-ink/8 text-[14px]">
          {installs.map((e, i) => (
            <li key={e.id} className="py-2">
              <Link
                href={`/extension/${e.id}`}
                className="flex items-baseline justify-between gap-3 hover:text-brand"
              >
                <span className="truncate font-medium">
                  <span className="mr-2 text-ink/40">{i + 1}</span>
                  {e.disp}
                </span>
                <span className="shrink-0 text-ink/55">{bigNum(e.installs)}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Highest rated (200+ ratings)</h2>
        <ol className="mt-3 divide-y divide-ink/8 text-[14px]">
          {rated.map((e, i) => (
            <li key={e.id} className="py-2">
              <Link
                href={`/extension/${e.id}`}
                className="flex items-baseline justify-between gap-3 hover:text-brand"
              >
                <span className="truncate font-medium">
                  <span className="mr-2 text-ink/40">{i + 1}</span>
                  {e.disp}
                </span>
                <span className="shrink-0 text-ink/55">
                  ★ {e.rating?.toFixed(1)} ({fullNum(e.ratingCount)})
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <AdSlot slot="rankings-bottom" />
    </div>
  )
}
