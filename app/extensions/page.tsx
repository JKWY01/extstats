import Link from 'next/link'
import type { Metadata } from 'next'
import AdSlot from '@/components/AdSlot'
import { breadcrumbLd } from '@/lib/jsonld'
import { BASE, bigNum } from '@/lib/site'
import { allExts } from '@/lib/mp'

/** 全量目录:前 2000 按安装量降序一张表(站内最大内链枢纽)。 */
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'All Top VS Code Extensions by Installs — Complete List',
  description: 'Every extension in the top 2,000 by install count, with ratings and one-click access to daily install history pages.',
  alternates: { canonical: '/extensions' },
}

export default function ExtensionsPage() {
  const exts = allExts()
  const breadcrumb = breadcrumbLd([
    { name: 'Home', url: `${BASE}/` },
    { name: 'Extensions' },
  ])

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />

      <p className="text-[13px] font-semibold uppercase tracking-widest text-brand">Directory</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Top {exts.length.toLocaleString('en-US')} VS Code extensions
      </h1>
      <p className="mt-3 text-[15px] text-ink/65">
        Sorted by install count. Each row links to the extension&rsquo;s stats page with rating,
        version, and daily install history.
      </p>

      <AdSlot slot="extensions-top" />

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
                <td className="px-4 py-2 text-right font-semibold">{bigNum(e.installs)}</td>
                <td className="hidden px-4 py-2 text-right text-ink/70 sm:table-cell">
                  {e.rating != null ? `★ ${e.rating.toFixed(1)}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdSlot slot="extensions-bottom" />
    </div>
  )
}
