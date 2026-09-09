import Header from './Header.jsx'
import { useChoreData } from '../hooks/useChoreData.js'
import { isSameDay } from '../lib/chores.js'
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

function frequencyBucket(frequency) {
  if (!frequency) return 'One-time'
  if (frequency === 1) return 'Daily'
  if (frequency === 7) return 'Weekly'
  return 'Other'
}

function AnalyticsPage() {
  const { rooms, tasks, members, logs } = useChoreData()

  const trendData = lastNDays(7).map((date) => ({
    label: date.toLocaleDateString(undefined, { weekday: 'short' }),
    value: logs.filter((log) => isSameDay(new Date(log.completed_at), date)).length,
  }))

  const byUserData = members.map((member, i) => ({
    label: member.name,
    value: logs.filter((log) => log.user_id === member.id).length,
    color: CATEGORICAL[i % CATEGORICAL.length],
  }))

  const byRoomData = rooms.map((room, i) => ({
    label: room.name,
    value: tasks.filter((task) => task.room_id === room.id).length,
    color: CATEGORICAL[i % CATEGORICAL.length],
  }))

  const frequencyCounts = { 'One-time': 0, Daily: 0, Weekly: 0, Other: 0 }
  tasks.forEach((task) => { frequencyCounts[frequencyBucket(task.frequency)] += 1 })
  const frequencyData = ['Daily', 'Weekly', 'One-time', 'Other']
    .map((label, i) => ({ label, value: frequencyCounts[label], color: CATEGORICAL[i % CATEGORICAL.length] }))
    .filter((d) => d.value > 0)

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
