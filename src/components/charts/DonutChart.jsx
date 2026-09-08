import '../../styles/Charts.css'

function DonutChart({ data, size = 180 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1
  const radius = size / 2
  const innerRadius = radius * 0.6

  function polar(angle, r) {
    return [radius + r * Math.cos(angle), radius + r * Math.sin(angle)]
  }

  function arcPath(startAngle, endAngle) {
    const [x1, y1] = polar(startAngle, radius - 2)
    const [x2, y2] = polar(endAngle, radius - 2)
    const [x3, y3] = polar(endAngle, innerRadius)
    const [x4, y4] = polar(startAngle, innerRadius)
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
    return `M ${x1} ${y1} A ${radius - 2} ${radius - 2} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`
  }

  const slices = data
    .filter((d) => d.value > 0)
    .reduce((acc, d) => {
      const previousEnd = acc.length ? acc[acc.length - 1].end : -Math.PI / 2
      const angle = (d.value / total) * Math.PI * 2
      const end = previousEnd + angle
      acc.push({ ...d, start: previousEnd, end, path: arcPath(previousEnd, end) })
      return acc
    }, [])

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Donut chart">
        {slices.map((slice) => (
          <path key={slice.label} d={slice.path} fill={slice.color} stroke="#fcfcfb" strokeWidth="2" />
        ))}
      </svg>
      <div className="chart-legend">
        {data.map((d) => (
          <div key={d.label} className="legend-item">
            <span className="legend-swatch" style={{ background: d.color }} />
            {d.label} {Math.round((d.value / total) * 100)}%
          </div>
        ))}
      </div>
    </div>
  )
}

export default DonutChart
