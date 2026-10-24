import { NextResponse } from 'next/server'
import { allExts, extById, meta, searchExts } from '@/lib/mp'

/** 机器可读端点(agent/MCP 友好):?id=pub.name 单扩展含时序;?q= 搜索;无参 = 概览。CORS 全开。 */
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const q = searchParams.get('q')

  if (id) {
    const e = extById(id)
    if (!e) return NextResponse.json({ error: 'unknown extension id' }, { status: 404 })
    return NextResponse.json(
      { extension: e, source: 'Visual Studio Marketplace public gallery API' },
      { headers: { 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=3600' } },
    )
  }

  if (q) {
    const rows = searchExts(q, 30)
    return NextResponse.json(
      {
        query: q,
        results: rows.map((e) => ({ id: e.id, name: e.disp, installs: e.installs, rating: e.rating })),
      },
      { headers: { 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=3600' } },
    )
  }

  return NextResponse.json(
    {
      dataset: meta(),
      usage: '?id=<publisher.extension> for full profile incl. install history; ?q=<keyword> to search',
      source: 'Visual Studio Marketplace public gallery API',
    },
    { headers: { 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=3600' } },
  )
}
