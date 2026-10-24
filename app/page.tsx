import Link from 'next/link'
import type { Metadata } from 'next'
import AdSlot from '@/components/AdSlot'
import Spark from '@/components/Spark'
import { jsonLdScript } from '@/lib/jsonld'
import { BASE, SITE_NAME, bigNum, fullNum } from '@/lib/site'
import { categoryNames, extsInCategory, meta, slugifyCategory, topByInstalls } from '@/lib/mp'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'VS Code Extension Stats — Installs, Ratings, Daily Growth',
  description: `The top 2,000 VS Code extensions by install count, with ratings, categories, and a daily install-history series you can't get anywhere else. Official Visual Studio Marketplace data.`,
  alternates: { canonical: '/' },
}

export default function Home() {
  const m = meta()
  const top = topByInstalls(20)
  const cats = categoryNames()
    .map((c) => ({ c, n: extsInCategory(c).length }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 12)

  const siteLd = jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${BASE}/`,
    description: 'VS Code extension install counts, ratings, and daily growth.',
  })

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: siteLd }} />

      <p className="text-[13px] font-semibold uppercase tracking-widest text-brand">
        {m.count.toLocaleString('en-US')} extensions · daily snapshots
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        VS Code extension stats
      </h1>
      <p className="mt-3 text-[15px] text-ink/65">
        The top {m.count.toLocaleString('en-US')} Visual Studio Marketplace extensions by install
        count, refreshed daily from the official gallery API — plus a per-extension{' '}
        <strong>daily install-count history</strong> that starts from the day we began tracking.
        No other site publishes this series for the VS Code market.
      </p>

      <AdSlot slot="home-top" />

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Top 20 by installs</h2>
        <ul className="mt-4 divide-y divide-ink/8 text-[14px]">
          {top.map((e, i) => (
            <li key={e.id} className="flex items-center gap-3 py-2.5">
              <span className="w-6 shrink-0 text-right text-ink/40">{i + 1}</span>
              <Link href={`/extension/${e.id}`} className="min-w-0 flex-1 hover:text-brand">
                <span className="block truncate font-medium">{e.disp}</span>
                <span className="block truncate text-[12.5px] text-ink/50">
                  {e.id} · ★ {e.rating != null ? e.rating.toFixed(1) : '—'}
                </span>
              </Link>
              <Spark ts={e.ts} />
              <span className="w-14 shrink-0 text-right font-semibold">{bigNum(e.installs)}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/extensions"
          className="mt-4 inline-block rounded-lg bg-ink px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-ink/85"
        >
          Browse all {m.count.toLocaleString('en-US')} extensions →
        </Link>
      </section>

      <AdSlot slot="home-middle" />

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Browse by category</h2>
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[14px] sm:grid-cols-3">
          {cats.map(({ c, n }) => (
            <li key={c}>
              <Link href={`/category/${slugifyCategory(c)}`} className="font-medium hover:text-brand">
                {c} <span className="text-ink/40">{n}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
