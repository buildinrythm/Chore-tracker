import Header from './Header.jsx'
import StatCard from './StatCard.jsx'
import TeamMember from './TeamMember.jsx'
import RoomCard from './RoomCard.jsx'
import { List, CheckCircle, AlertCircle, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useChoreData } from '../hooks/useChoreData.js'
import { getDecayPercentage, timeAgo, isOverdue, isOpenTask, isSameDay, roomIcons, roomColors } from '../lib/chores.js'

function Dashboard() {
  const { rooms, tasks, profiles, addRoom, updateRoom, deleteRoom, markRoomCleaned } = useChoreData()
  const [addingRoom, setAddingRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')

  async function handleAddRoom(e) {
    e.preventDefault()
    if (!newRoomName.trim()) return

    const { error } = await addRoom(newRoomName.trim())
    if (!error) {
      setNewRoomName('')
      setAddingRoom(false)
    }
  }

  const today = new Date()
  const completedToday = tasks.filter((task) => task.completed_at && isSameDay(new Date(task.completed_at), today)).length
  const overdueTasks = tasks.filter(isOverdue)

  return (
    <>
      <Header />
      <div id="statcard-container">
        <StatCard title="Total Tasks" count={tasks.length} icon={<List color="#165DFC"/>} color="#DBEAFF" />
        <StatCard title="Completed Today" count={completedToday} icon={<CheckCircle color="#00A63D"/>} color="#DCFCE6" />
        <StatCard title="Overdue" count={overdueTasks.length} icon={<AlertCircle color="#E7000B"/>} color="#FEE2E2" />
        <StatCard title="Team Members" count={profiles.length} icon={<Users color="#980FFA" />} color="#F3E8FE" />
      </div>
      <div id="team-section">
        <div id="team-header">
          <h2>Team Members</h2>
          <Link to="/users">View All →</Link>
        </div>
        <div id="team-grid">
          {profiles.map((profile) => (
            <TeamMember
              key={profile.id}
              avatar={profile.avatar}
              name={profile.name}
              tasksCompleted={tasks.filter((task) => task.assigned_to === profile.id && task.completed_at).length}
              color="#DCFCE6"
            />
          ))}
        </div>
      </div>
      <div id="room-header">
        <h2>Rooms</h2>
        {addingRoom ? (
          <form id="add-room-form" onSubmit={handleAddRoom}>
            <input
              autoFocus
              type="text"
              placeholder="Room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" className="btn-secondary" onClick={() => { setAddingRoom(false); setNewRoomName('') }}>Cancel</button>
          </form>
        ) : (
          <button type="button" className="btn-primary" onClick={() => setAddingRoom(true)}>+ Add Room</button>
        )}
      </div>

      <div id="room-grid">
        {rooms.map((room) => {
          const roomTasks = tasks.filter((task) => task.room_id === room.id)
          const openTasks = roomTasks.filter(isOpenTask)
          const overdueCount = roomTasks.filter(isOverdue).length

          return (
            <RoomCard
              key={room.id}
              name={room.name}
              decayRate={room.decay_rate}
              decayPercent={getDecayPercentage(room.last_cleaned, room.decay_rate)}
              lastCleaned={timeAgo(room.last_cleaned)}
              pendingTasks={openTasks.length}
              overdueIndicator={overdueCount}
              color={roomColors[room.name] || '#DCFCE6'}
              icon={roomIcons[room.name] || '🏠'}
              onMarkCleaned={() => markRoomCleaned(room.id)}
              onUpdate={(fields) => updateRoom(room.id, fields)}
              onDelete={() => deleteRoom(room.id)}
            />
          )
        })}
      </div>
    </>
  )
}

export default Dashboard
