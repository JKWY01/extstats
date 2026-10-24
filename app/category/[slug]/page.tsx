import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import AdSlot from '@/components/AdSlot'
import { breadcrumbLd } from '@/lib/jsonld'
import { BASE, bigNum, fullNum } from '@/lib/site'
import { categoryNames, extsInCategory, slugifyCategory } from '@/lib/mp'

/** 类目页:"best vscode themes / linters" 意图,按安装量排序。 */
export const revalidate = 86400

export function generateStaticParams() {
  return categoryNames().map((c) => ({ slug: slugifyCategory(c) }))
}

function resolveCategory(slug: string): string | null {
  for (const c of categoryNames()) {
    if (slugifyCategory(c) === slug) return c
  }
  return null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const name = resolveCategory(slug)
  if (!name) return {}
  const n = extsInCategory(name).length
  return {
    title: `Best VS Code ${name} Extensions by Installs (${n} in Top 2,000)`,
    description: `The most-installed VS Code ${name.toLowerCase()} extensions, ranked by install count with ratings and daily growth history. ${n} extensions in the top 2,000.`,
    alternates: { canonical: `/category/${slug}` },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const name = resolveCategory(slug)
  if (!name) notFound()
  const exts = extsInCategory(name).sort((a, b) => b.installs - a.installs)

  const breadcrumb = breadcrumbLd([
    { name: 'Home', url: `${BASE}/` },
    { name: name },
  ])

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />

      <p className="text-[13px] font-semibold uppercase tracking-widest text-brand">
        {exts.length} extensions · VS Code Marketplace
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        {name} extensions by installs
      </h1>
      <p className="mt-3 text-[15px] text-ink/65">
        The most-installed {name.toLowerCase()} extensions in the top 2,000, from the official
        Marketplace API.
      </p>

      <AdSlot slot="category-top" />

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10 bg-white">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-ink/10 text-left text-[12px] uppercase tracking-wider text-ink/45">
              <th className="px-4 py-2.5">#</th>
              <th className="px-4 py-2.5">Extension</th>
              <th className="px-4 py-2.5 text-right">Installs</th>
              <th className="hidden px-4 py-2.5 text-right sm:table-cell">Rating</th>
            </tr>
          </thead>
          <tbody>
            {exts.map((e, i) => (
              <tr key={e.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-2 text-ink/40">{i + 1}</td>
                <td className="px-4 py-2">
                  <Link href={`/extension/${e.id}`} className="font-medium hover:text-brand">
                    {e.disp}
                  </Link>
                  <span className="ml-2 hidden text-[12px] text-ink/40 sm:inline">{e.id}</span>
                </td>
                <td className="px-4 py-2 text-right font-semibold">{fullNum(e.installs)}</td>
                <td className="hidden px-4 py-2 text-right text-ink/70 sm:table-cell">
                  {e.rating != null ? `★ ${e.rating.toFixed(1)}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdSlot slot="category-bottom" />

      <nav className="mt-8">
        <Link
          href="/extensions"
          className="rounded-lg bg-ink px-4 py-2 text-[14px] font-semibold text-white hover:bg-ink/85"
        >
          All extensions →
        </Link>
      </nav>
    </div>
  )
}
