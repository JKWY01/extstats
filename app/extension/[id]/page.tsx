import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import AdSlot from '@/components/AdSlot'
import Spark from '@/components/Spark'
import { jsonLdScript, breadcrumbLd } from '@/lib/jsonld'
import { BASE, bigNum, fullNum, dateOnly } from '@/lib/site'
import { allExts, extById, extsInCategory, rankOf, slugifyCategory } from '@/lib/mp'

/** 扩展详情页:"X vscode extension installs / rating" 长尾着陆页 + 独家安装量时序。 */
export const revalidate = 86400

export function generateStaticParams() {
  return allExts().map((e) => ({ id: e.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const e = extById(id)
  if (!e) return {}
  return {
    title: `${e.disp} (${e.id}) — VS Code Installs, Rating & Growth`,
    description: `${e.disp} has ${fullNum(e.installs)} installs on the VS Code Marketplace${e.rating != null ? ` with a ${e.rating.toFixed(1)}/5 rating (${fullNum(e.ratingCount)} ratings)` : ''}. Daily install history, rank #${rankOf(e.id)} of the top 2,000, and category neighbors.`,
    alternates: { canonical: `/extension/${e.id}` },
  }
}

export default async function ExtensionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const e = extById(id)
  if (!e) notFound()

  const rank = rankOf(e.id)
  const idx = allExts().findIndex((x) => x.id === e.id)
  const neighbors = allExts().slice(Math.max(0, idx - 1), idx + 2).filter((x) => x.id !== e.id)
  const catSlug = e.cats[0] ? slugifyCategory(e.cats[0]) : null
  const sameCat = catSlug ? extsInCategory(e.cats[0]).filter((x) => x.id !== e.id).slice(0, 8) : []

  const faqLd = jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How many installs does ${e.disp} have?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${e.disp} (${e.id}) has ${fullNum(e.installs)} installs on the Visual Studio Marketplace, ranking #${rank} among the top 2,000 VS Code extensions.`,
        },
      },
      ...(e.rating != null
        ? [
            {
              '@type': 'Question',
              name: `What is the rating of ${e.disp}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${e.disp} is rated ${e.rating.toFixed(1)} out of 5 from ${fullNum(e.ratingCount)} ratings.`,
              },
            },
          ]
        : []),
    ],
  })

  const breadcrumb = breadcrumbLd([
    { name: 'Home', url: `${BASE}/` },
    ...(catSlug && e.cats[0]
      ? [{ name: e.cats[0], url: `${BASE}/category/${catSlug}` }]
      : []),
    { name: e.disp },
  ])

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />

      <p className="text-[13px] font-semibold uppercase tracking-widest text-brand">
        VS Code extension · rank #{rank} of 2,000 · by {e.pub}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{e.disp}</h1>
      <p className="mt-2 text-[14px] text-ink/55">
        <span className="font-mono">{e.id}</span> · v{e.ver || '?'} · updated {e.updated || '—'}
      </p>
      {e.desc ? <p className="mt-3 text-[15px] text-ink/70">{e.desc}</p> : null}

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-ink/10 bg-white p-5">
          <div className="text-[12px] font-medium uppercase tracking-wider text-ink/45">Installs</div>
          <div className="mt-1 text-2xl font-bold">{fullNum(e.installs)}</div>
          <div className="mt-0.5 text-[12px] text-ink/50">{bigNum(e.installs)} · rank #{rank}</div>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white p-5">
          <div className="text-[12px] font-medium uppercase tracking-wider text-ink/45">Rating</div>
          <div className="mt-1 text-2xl font-bold">
            {e.rating != null ? `${e.rating.toFixed(1)} / 5` : '—'}
          </div>
          <div className="mt-0.5 text-[12px] text-ink/50">{fullNum(e.ratingCount)} ratings</div>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white p-5">
          <div className="text-[12px] font-medium uppercase tracking-wider text-ink/45">
            Install history
          </div>
          <div className="mt-2">
            <Spark ts={e.ts} />
          </div>
          <div className="mt-0.5 text-[12px] text-ink/50">
            {e.ts.length > 1
              ? `${e.ts.length} daily points`
              : 'tracking started recently — history builds daily'}
          </div>
        </div>
      </section>

      <AdSlot slot="ext-below-cards" />

      {e.cats.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">Categories</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {e.cats.map((c) => (
              <Link
                key={c}
                href={`/category/${slugifyCategory(c)}`}
                className="rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-[13.5px] font-semibold hover:border-ink/40"
              >
                {c}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <nav className="mt-8 flex flex-wrap gap-3 text-[14px]">
        {neighbors.map((n) => (
          <Link
            key={n.id}
            href={`/extension/${n.id}`}
            className="rounded-lg border border-ink/15 bg-white px-4 py-2 font-semibold text-ink hover:border-ink/35"
          >
            #{rankOf(n.id)} {n.disp} <span className="text-ink/45">({bigNum(n.installs)})</span>
          </Link>
        ))}
      </nav>

      {sameCat.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">
            More in {e.cats[0] ?? 'the marketplace'}
          </h2>
          <ul className="mt-3 divide-y divide-ink/8 text-[14px]">
            {sameCat.map((x) => (
              <li key={x.id} className="py-2">
                <Link
                  href={`/extension/${x.id}`}
                  className="flex items-baseline justify-between gap-3 hover:text-brand"
                >
                  <span className="truncate font-medium">{x.disp}</span>
                  <span className="shrink-0 text-ink/55">{fullNum(x.installs)} installs</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
