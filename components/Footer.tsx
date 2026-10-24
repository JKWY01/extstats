import Link from 'next/link'
import { DATA_SOURCE } from '@/lib/site'
import { meta } from '@/lib/mp'

export default function Footer() {
  const m = meta()
  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="mx-auto w-full max-w-4xl px-5 py-8 text-[13px] leading-relaxed text-ink/55">
        <p>
          All figures come from the {DATA_SOURCE} — the top {m.count.toLocaleString('en-US')}{' '}
          extensions by install count, refreshed daily. The install-count history on each page is
          our own daily snapshot series: it starts from the day this site began tracking, and we
          never backfill invented numbers.
        </p>
        <p className="mt-3">
          Not affiliated with Microsoft or the Visual Studio Marketplace.
        </p>
        <p className="mt-3">
          <Link href="/sitemap.xml" className="underline decoration-ink/30 underline-offset-2 hover:text-ink">
            Sitemap
          </Link>{' '}
          ·{' '}
          <Link href="/llms.txt" className="underline decoration-ink/30 underline-offset-2 hover:text-ink">
            llms.txt
          </Link>{' '}
          ·{' '}
          <Link href="/api/extension" className="underline decoration-ink/30 underline-offset-2 hover:text-ink">
            JSON API
          </Link>
        </p>
      </div>
    </footer>
  )
}
