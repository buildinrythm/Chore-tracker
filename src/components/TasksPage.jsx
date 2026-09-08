import Header from './Header.jsx'
import { useState } from 'react'
import { useChoreData } from '../hooks/useChoreData.js'
import { isOverdue, isCompletedInCurrentCycle, frequencyLabel, timeAgo, roomIcons } from '../lib/chores.js'
import { AlertCircle, Clock, User as UserIcon, Filter } from 'lucide-react'
import '../styles/TasksPage.css'

const FILTERS = [
  { key: 'all', label: 'All Tasks' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'completed', label: 'Completed' },
]

const EMPTY_FORM = { title: '', roomId: '', assignedTo: '', frequency: 'once', dueDate: '' }

function TasksPage() {
  const { rooms, tasks, profiles, addTask, markTaskComplete } = useChoreData()
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const profileById = Object.fromEntries(profiles.map((profile) => [profile.id, profile]))
  const roomById = Object.fromEntries(rooms.map((room) => [room.id, room]))

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'overdue') return isOverdue(task)
    if (filter === 'completed') return isCompletedInCurrentCycle(task)
    return true
  })

  async function handleAddTask(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.roomId) return

    const { error } = await addTask({
      roomId: Number(form.roomId),
      title: form.title.trim(),
      assignedTo: form.assignedTo || null,
      frequency: form.frequency,
      dueDate: form.frequency === 'once' ? (form.dueDate || null) : null,
    })
    if (!error) {
      setForm(EMPTY_FORM)
      setShowForm(false)
    }
  }

  const activeFilter = FILTERS.find((f) => f.key === filter)

  return (
    <>
      <Header />
      <div className="tasks-toolbar">
        <div className="tasks-filter">
          <span className="tasks-filter-label"><Filter size={16} /> Filter:</span>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`filter-pill filter-${f.key}${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowForm((v) => !v)}>+ Add Task</button>
      </div>

      {showForm && (
        <form className="task-form" onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} required>
            <option value="">Room...</option>
            {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
          </select>
          <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
            <option value="">Unassigned</option>
            {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
          </select>
          <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
            <option value="once">Once</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          {form.frequency === 'once' && (
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          )}
          <button type="submit" className="btn-primary">Add</button>
        </form>
      )}

      <h2 className="tasks-heading">{activeFilter.label} ({filteredTasks.length})</h2>

      <div className="task-list">
        {filteredTasks.map((task) => {
          const overdue = isOverdue(task)
          const completed = isCompletedInCurrentCycle(task)
          const assignee = profileById[task.assigned_to]
          const room = roomById[task.room_id]

          return (
            <div key={task.id} className={`task-row${overdue ? ' overdue' : ''}${completed ? ' completed' : ''}`}>
              <div className="task-row-main">
                <div className="task-row-title">
                  {task.title}
                  {overdue && <AlertCircle size={16} color="#dc2626" />}
                </div>
                <div className="task-row-meta">
                  <span><Clock size={14} /> {frequencyLabel(task.frequency)}</span>
                  {room && <span>{roomIcons[room.name] || '🏠'} {room.name}</span>}
                  {assignee && !completed && <span><UserIcon size={14} /> Assigned to {assignee.name}</span>}
                  {completed && assignee && (
                    <span className="task-completed-by">✓ {assignee.name} · {timeAgo(task.completed_at)}</span>
                  )}
                </div>
              </div>
              {!(completed && task.frequency === 'once') && (
                <button type="button" className="btn-secondary" onClick={() => markTaskComplete(task)}>
                  Mark Complete
                </button>
              )}
            </div>
          )
        })}
        {filteredTasks.length === 0 && <p className="tasks-empty">No tasks here.</p>}
      </div>
    </>
  )
}

export default TasksPage
