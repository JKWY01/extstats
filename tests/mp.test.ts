import { describe, expect, it } from 'vitest'
import {
  allExts,
  categoryNames,
  extById,
  extsInCategory,
  fastestGrowing,
  meta,
  rankOf,
  searchExts,
} from '@/lib/mp'

const HAS_DATA = allExts().length > 0

describe.skipIf(!HAS_DATA)('marketplace data integrity', () => {
  it('has a sane dataset size and unique ids', () => {
    expect(allExts().length).toBeGreaterThanOrEqual(1500)
    expect(new Set(allExts().map((e) => e.id)).size).toBe(allExts().length)
  })

  it('is sorted by installs descending', () => {
    const exts = allExts()
    for (let i = 1; i < exts.length; i += 1) {
      expect(exts[i].installs).toBeLessThanOrEqual(exts[i - 1].installs)
    }
  })

  it('anchor: ms-python.python tops the list with 100M+ installs', () => {
    const top = allExts()[0]
    expect(top.id).toBe('ms-python.python')
    expect(top.installs).toBeGreaterThan(100_000_000)
    expect(rankOf('ms-python.python')).toBe(1)
  })

  it('every extension has at least one history point', () => {
    for (const e of allExts()) expect(e.ts.length, e.id).toBeGreaterThanOrEqual(1)
  })

  it('categories resolve and are non-empty', () => {
    const cats = categoryNames()
    expect(cats.length).toBeGreaterThan(5)
    for (const c of cats.slice(0, 5)) {
      expect(extsInCategory(c).length, c).toBeGreaterThan(0)
    }
  })
})

describe('accessors degrade honestly', () => {
  it('unknown ids return null / empty', () => {
    expect(extById('nope.nope')).toBeNull()
    expect(searchExts('')).toEqual([])
    expect(rankOf('nope.nope')).toBe(0)
  })
})

describe.skipIf(!HAS_DATA)('growth series', () => {
  it('single-day series yields no growth rows (honest, not fabricated)', () => {
    const allSingle = allExts().every((e) => e.ts.length === 1)
    if (allSingle) expect(fastestGrowing(7, 50)).toEqual([])
  })
})

describe.skipIf(!HAS_DATA)('meta', () => {
  it('declares the marketplace source', () => {
    expect(meta().source).toContain('Marketplace')
    expect(meta().count).toBe(allExts().length)
  })
})
