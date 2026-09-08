import '../../styles/Charts.css'

function BarChart({ data, height = 220 }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const barWidth = 28
  const gap = 70
  const width = Math.max(280, data.length * gap + 20)
  const padding = { top: 24, bottom: 30 }
  const innerH = height - padding.top - padding.bottom

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="Bar chart">
      {[0, 0.5, 1].map((t) => {
        const y = padding.top + innerH - t * innerH
        return <line key={t} x1={10} x2={width - 10} y1={y} y2={y} className="chart-gridline" />
      })}
      {data.map((d, i) => {
        const barHeight = (d.value / max) * innerH
        const x = 20 + i * gap
        const y = padding.top + innerH - barHeight
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 1)} rx={4} fill={d.color} />
            <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="chart-value-label">{d.value}</text>
            <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" className="chart-axis-label">{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default BarChart
