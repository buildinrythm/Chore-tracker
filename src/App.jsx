import { supabase } from './supabase.js'
import Header from './components/Header.jsx'
import StatCard from './components/StatCard.jsx'
import TeamMember from './components/TeamMember.jsx'
import RoomCard from './components/RoomCard.jsx'
import { List, CheckCircle, AlertCircle, Users } from 'lucide-react'
import { useState, useEffect } from 'react'

function getDecayPercentage(lastCleanedDate, maxDays = 7) {
  const now = new Date()
  const lastCleaned = new Date(lastCleanedDate)
  const diffMs = now - lastCleaned
  const daysSinceCleaned = diffMs / (1000 * 60 * 60 * 24)
  return Math.min((daysSinceCleaned / maxDays) * 100, 100)
}

function getLastCleanedText(lastCleanedDate) {
  const now = new Date()
  const lastCleaned = new Date(lastCleanedDate)
  const diffMs = now - lastCleaned
  const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (daysSince === 0) return 'today'
  if (daysSince === 1) return '1 day ago'
  return `${daysSince} days ago`
}

function App() {

  const [rooms, setRooms] = useState([])

  useEffect(() => {
    fetchRooms()
  }, [])

  async function fetchRooms() {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')

    if (error) {
      console.log(error)
    } else {
      setRooms(data)        
    }
  }
  console.log(rooms)
  return (
    <>
      <Header />
      <div id="statcard-container">
      <StatCard title="Total Tasks" count={12} icon={<List color="#165DFC"/>} color="#DBEAFF" />
      <StatCard title="Completed Today" count={0} icon={<CheckCircle color="#00A63D"/>} color="#DCFCE6" />
      <StatCard title="Overdue" count={8} icon={<AlertCircle color="#E7000B"/>} color="#FEE2E2" />
      <StatCard title="Team Members" count={4} icon={<Users color="#980FFA" />} color="#F3E8FE" />
      </div>
      <div id="team-section">
  <div id="team-header">
    <h2>Team Members</h2>
    <a href="#">View All →</a>
  </div>
  <div id="team-grid">
    <TeamMember avatar="😭" name="Sarah" tasksCompleted={12} color="#F3E8FE"/>
    <TeamMember avatar="😎" name="Mike" tasksCompleted={12} color="#DCFCE6"/>
    <TeamMember avatar="😳" name="Emma" tasksCompleted={12} color="#FEE2E2"/>
    <TeamMember avatar="☺️" name="Jake" tasksCompleted={12} color="#DBEAFF"/>
  </div>
</div>
<div id="room-header">
    <h2>Rooms</h2>
    <button>+ Add Room</button>
  </div>

  <div id="room-grid">
  {rooms.map((room) => (
    <RoomCard
      key={room.id}
      name={room.name}
      decayPercent={getDecayPercentage(room.last_cleaned, room.decay_rate)}
      lastCleaned={getLastCleanedText(room.last_cleaned)}
      pendingTasks={0}
      overdueIndicator={0}
      color="#DCFCE6"
      icon="🏠"
    />
  ))}

</div>
    </>
  )
}

export default App