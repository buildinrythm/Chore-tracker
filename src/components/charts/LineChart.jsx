import '../../styles/Charts.css'

function LineChart({ data, height = 220, color = '#2a78d6' }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const width = Math.max(320, data.length * 60)
  const padding = { left: 20, right: 20, top: 24, bottom: 30 }
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0

  const points = data.map((d, i) => ({
    ...d,
    x: padding.left + i * stepX,
    y: padding.top + innerH - (d.value / max) * innerH,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const baseline = padding.top + innerH
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`
    : ''

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="Line chart">
      {[0, 0.5, 1].map((t) => {
        const y = padding.top + innerH - t * innerH
        return <line key={t} x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="chart-gridline" />
      })}
      {areaPath && <path d={areaPath} fill={color} opacity="0.1" stroke="none" />}
      {linePath && <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
      {points.map((p) => (
        <circle key={p.label} cx={p.x} cy={p.y} r="4" fill={color} stroke="#fcfcfb" strokeWidth="2" />
      ))}
      {points.map((p) => (
        <text key={p.label} x={p.x} y={height - 8} textAnchor="middle" className="chart-axis-label">{p.label}</text>
      ))}
      {points.length > 0 && (
        <text
          x={points[points.length - 1].x}
          y={points[points.length - 1].y - 12}
          textAnchor="middle"
          className="chart-value-label"
        >
          {points[points.length - 1].value}
        </text>
      )}
    </svg>
  )
}

export default LineChart
