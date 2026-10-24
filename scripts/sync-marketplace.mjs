#!/usr/bin/env node
/**
 * VS Code Marketplace 头部扩展同步。
 *
 *   源  marketplace.visualstudio.com 公开 gallery 接口(extensionquery,免鉴权):
 *        按 installCount 降序取前 TOP_N(每页 100,翻页抓取),拿安装量/评分/版本/类目。
 *
 *   时序  每轮同步给每个扩展追加当日安装量快照(ts 字段),这是本站独家数据——
 *        chrome-stats 不覆盖 VS Code 市场,安装量历史从本站开跑之日起积累,绝不回填编造。
 *        ts 超过 MAX_POINTS 点时对旧段隔点抽稀(保最近,压体积)。
 *
 *   纪律  数值要么来自接口,要么缺失;扩展跌出头部名单即从数据中消失(README 注明),
 *        时序对留存的 id 保持连续。
 *
 * 运行:`node scripts/sync-marketplace.mjs`。幂等:数据本体无变化不写文件。
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA_PATH = join(ROOT, 'data', 'marketplace.json')
const TOP_N = Number(process.env.EXT_TOP_N ?? 2000)
const PAGE_SIZE = 100
const MAX_POINTS = 180

const API = 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery'

function etTodayISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date())
}

async function fetchPage(page) {
  // marketplace 接口对连续快请求会 400/429:重试退避 + 页间温和限速(CI 网快更容易触发)
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json;api-version=3.0-preview.1',
          'User-Agent': 'extstats-sync',
        },
        body: JSON.stringify({
          filters: [
            {
              criteria: [{ filterType: 8, value: 'Microsoft.VisualStudio.Code' }],
              pageNumber: page,
              pageSize: PAGE_SIZE,
              sortBy: 4, // installCount 降序(实测)
              sortOrder: 0,
            },
          ],
          flags: 950,
        }),
        signal: AbortSignal.timeout(60_000),
      })
      if (res.ok) return (await res.json()).results?.[0]?.extensions ?? []
      if (res.status === 400 || res.status === 429) {
        const wait = attempt * 8_000
        console.log(`[sync-mp] page ${page}: HTTP ${res.status}, retry in ${wait / 1000}s (attempt ${attempt})`)
        await new Promise((r) => setTimeout(r, wait))
        continue
      }
      throw new Error(`page ${page}: HTTP ${res.status}`)
    } catch (err) {
      if (attempt === 4) throw err
      await new Promise((r) => setTimeout(r, 8_000))
    }
  }
  throw new Error(`page ${page}: exhausted retries`)
}

function normalize(e) {
  const stats = {}
  for (const s of e.statistics ?? []) stats[s.statisticName] = s.value
  const ver = (e.versions ?? [])[0] ?? {}
  return {
    id: `${e.publisher.publisherName}.${e.extensionName}`,
    pub: e.publisher.publisherName,
    name: e.extensionName,
    disp: e.displayName ?? e.extensionName,
    desc: (e.shortDescription ?? '').trim(),
    cats: e.categories ?? [],
    ver: ver.version ?? '',
    updated: (e.lastUpdated ?? '').slice(0, 10),
    installs: Math.round(stats.install ?? 0),
    rating: stats.averagerating != null ? Number(stats.averagerating.toFixed(2)) : null,
    ratingCount: Math.round(stats.ratingcount ?? 0),
    ts: [], // 由调用方按历史补齐
  }
}

/** 时序抽稀:超过 MAX_POINTS 时,对较旧的一半隔点保留,最近一段原样。 */
function compactTs(ts) {
  if (ts.length <= MAX_POINTS) return ts
  const keepRecent = Math.ceil(MAX_POINTS / 2)
  const recent = ts.slice(0, keepRecent)
  const old = ts.slice(keepRecent).filter((_, i) => i % 2 === 0)
  return [...recent, ...old]
}

async function main() {
  const pages = Math.ceil(TOP_N / PAGE_SIZE)
  const collected = []
  for (let p = 1; p <= pages; p += 1) {
    const items = await fetchPage(p)
    if (items.length === 0) break
    collected.push(...items.map(normalize))
    console.log(`[sync-mp] page ${p}/${pages}: +${items.length} (total ${collected.length})`)
    await new Promise((r) => setTimeout(r, 1500)) // 温和限速:连续快请求会被 400
  }

  const seen = new Set()
  const exts = []
  for (const e of collected) {
    if (seen.has(e.id)) continue
    seen.add(e.id)
    exts.push(e)
  }
  exts.sort((a, b) => b.installs - a.installs)
  const kept = exts.slice(0, TOP_N)

  if (kept.length < 500) throw new Error(`sanity failed: only ${kept.length} extensions`)
  if (kept[0].installs < 50_000_000) {
    throw new Error(`sanity failed: top install ${kept[0].installs} (expected a 100M+ giant)`)
  }

  // 时序合并:今日快照 + 旧时序保留
  const prev = existsSync(DATA_PATH)
    ? JSON.parse(readFileSync(DATA_PATH, 'utf8'))
    : null
  const prevTs = new Map((prev?.exts ?? []).map((e) => [e.id, e.ts ?? []]))
  const today = etTodayISO()
  let freshPoints = 0
  for (const e of kept) {
    const old = prevTs.get(e.id) ?? []
    if (old[0]?.[0] === today) {
      e.ts = old // 今日已记(同日复跑),只刷新即时值
    } else {
      e.ts = [[today, e.installs], ...old]
      freshPoints += 1
    }
    e.ts = compactTs(e.ts)
  }

  const sameData =
    prev &&
    JSON.stringify(
      prev.exts.map((e) => ({ ...e, ts: e.ts.slice(0, 1) })),
    ) === JSON.stringify(
      kept.map((e) => ({ ...e, ts: e.ts.slice(0, 1) })),
    ) &&
    freshPoints === 0
  if (sameData) {
    console.log(`[sync-mp] exts=${kept.length} — no change, skip write`)
    return
  }

  const payload = {
    meta: {
      source: 'Visual Studio Marketplace public gallery API (extensionquery, sorted by installs)',
      fetched_at: new Date().toISOString(),
      count: kept.length,
    },
    exts: kept,
  }
  mkdirSync(join(ROOT, 'data'), { recursive: true })
  writeFileSync(DATA_PATH, JSON.stringify(payload) + '\n')
  console.log(`[sync-mp] exts=${kept.length} freshPoints=${freshPoints} — written`)
}

main().catch((err) => {
  console.error(`[sync-mp] failed: ${err.message}`)
  process.exit(1)
})
