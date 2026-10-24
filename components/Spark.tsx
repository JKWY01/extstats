/** 安装量时序火花线(纯 SVG,无客户端库)。ts 新→旧;单点时退化为一颗点。 */
export default function Spark({ ts }: { ts: Array<[string, number]> }) {
  const W = 240
  const H = 48
  if (ts.length === 0) return null
  const points = [...ts].reverse() // 旧→新
  const values = points.map(([, v]) => v)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const step = points.length > 1 ? W / (points.length - 1) : 0
  const coords = points.map(([, v], i) => {
    const x = points.length > 1 ? i * step : W / 2
    const y = H - 4 - ((v - min) / span) * (H - 8)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="install history">
      {coords.length > 1 ? (
        <>
          <polyline
            points={coords.join(' ')}
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx={coords[coords.length - 1].split(',')[0]} cy={coords[coords.length - 1].split(',')[1]} r="2.5" fill="var(--brand)" />
        </>
      ) : (
        <circle cx={W / 2} cy={H / 2} r="3" fill="var(--brand)" />
      )}
    </svg>
  )
}
