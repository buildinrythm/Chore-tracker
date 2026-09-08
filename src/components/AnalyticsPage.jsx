import Header from './Header.jsx'
import { useChoreData } from '../hooks/useChoreData.js'
import { isSameDay, frequencyLabel } from '../lib/chores.js'
import { CATEGORICAL } from '../lib/palette.js'
import LineChart from './charts/LineChart.jsx'
import BarChart from './charts/BarChart.jsx'
import DonutChart from './charts/DonutChart.jsx'
import '../styles/AnalyticsPage.css'

function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (n - 1 - i))
    return date
  })
}

function AnalyticsPage() {
  const { rooms, tasks, profiles, completions } = useChoreData()

  const trendData = lastNDays(7).map((date) => ({
    label: date.toLocaleDateString(undefined, { weekday: 'short' }),
    value: completions.filter((c) => isSameDay(new Date(c.completed_at), date)).length,
  }))

  const byUserData = profiles.map((profile, i) => ({
    label: profile.name,
    value: completions.filter((c) => c.completed_by === profile.id).length,
    color: CATEGORICAL[i % CATEGORICAL.length],
  }))

  const byRoomData = rooms.map((room, i) => ({
    label: room.name,
    value: tasks.filter((task) => task.room_id === room.id).length,
    color: CATEGORICAL[i % CATEGORICAL.length],
  }))

  const frequencyCounts = { once: 0, daily: 0, weekly: 0 }
  tasks.forEach((task) => { frequencyCounts[task.frequency] = (frequencyCounts[task.frequency] || 0) + 1 })
  const frequencyData = ['daily', 'weekly', 'once'].map((freq, i) => ({
    label: frequencyLabel(freq),
    value: frequencyCounts[freq],
    color: CATEGORICAL[i % CATEGORICAL.length],
  }))

  return (
    <>
      <Header />
      <h1 className="analytics-title">Analytics &amp; Insights</h1>
      <div className="analytics-grid">
        <div className="analytics-card">
          <h2>Completion Trend (Last 7 Days)</h2>
          <LineChart data={trendData} />
        </div>
        <div className="analytics-card">
          <h2>Tasks Completed by User</h2>
          <BarChart data={byUserData} />
        </div>
        <div className="analytics-card">
          <h2>Tasks by Room</h2>
          <BarChart data={byRoomData} />
        </div>
        <div className="analytics-card">
          <h2>Task Frequency Distribution</h2>
          <DonutChart data={frequencyData} />
        </div>
      </div>
    </>
  )
}

export default AnalyticsPage
