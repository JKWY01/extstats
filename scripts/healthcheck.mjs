#!/usr/bin/env node
/** 线上体检(放养哨兵):每天对真站黑盒检查,任一失败退出 1(workflow 自动开 issue)。 */

const SITE_URL = (process.env.SITE_URL ?? '').replace(/\/+$/, '')
if (!SITE_URL) {
  console.error('[health] SITE_URL not configured')
  process.exit(1)
}

const failures = []
const check = async (name, fn) => {
  try {
    await fn()
    console.log(`[health] ✓ ${name}`)
  } catch (err) {
    failures.push(name)
    console.error(`[health] ✗ ${name}: ${err.message}`)
  }
}

const get = async (path, timeout = 30_000) => {
  const res = await fetch(`${SITE_URL}${path}`, {
    signal: AbortSignal.timeout(timeout),
    headers: { 'User-Agent': 'extstats-healthcheck' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

await check('home renders with marketplace attribution', async () => {
  const html = await get('/')
  if (!/Marketplace/i.test(html)) throw new Error('no attribution')
  if (!/extension stats/i.test(html)) throw new Error('missing hero')
})

await check('api returns the top extension with history', async () => {
  const body = JSON.parse(await get('/api/extension?id=ms-python.python'))
  if (body.extension?.installs == null || body.extension.installs < 100_000_000) {
    throw new Error(`bad installs: ${body.extension?.installs}`)
  }
  if (!Array.isArray(body.extension?.ts) || body.extension.ts.length < 1) {
    throw new Error('missing install history')
  }
})

await check('extension page renders stats', async () => {
  const html = await get('/extension/ms-python.python')
  if (!/ms-python\.python/.test(html)) throw new Error('id missing')
  if (!/rank #1/i.test(html)) throw new Error('rank missing')
})

await check('extensions directory lists the matrix', async () => {
  const html = await get('/extensions')
  const count = (html.match(/\/extension\//g) ?? []).length
  if (count < 1500) throw new Error(`only ${count} links`)
})

await check('sitemap covers extensions', async () => {
  const xml = await get('/sitemap.xml', 60_000)
  const count = (xml.match(/<url>/g) ?? []).length
  if (count < 1500) throw new Error(`only ${count} URLs`)
})

await check('llms.txt documents the API', async () => {
  const body = await get('/llms.txt')
  if (!body.includes('/api/extension')) throw new Error('api not documented')
})

if (failures.length > 0) {
  console.error(`[health] FAILED: ${failures.join(' | ')}`)
  process.exit(1)
}
console.log('[health] all checks passed')
