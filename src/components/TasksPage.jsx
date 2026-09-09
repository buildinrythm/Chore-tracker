import Header from './Header.jsx'
import { useState } from 'react'
import { useChoreData } from '../hooks/useChoreData.js'
import { isOverdue, isCompletedInCurrentCycle, frequencyLabel, timeAgo, roomIcons } from '../lib/chores.js'
import { AlertCircle, Clock, User as UserIcon, Filter, Pencil, Trash2 } from 'lucide-react'
import '../styles/TasksPage.css'

const FILTERS = [
  { key: 'all', label: 'All Tasks' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'completed', label: 'Completed' },
]

const EMPTY_FORM = { name: '', roomId: '', assignedTo: '', frequency: 'once', dueDate: '' }

function frequencyToDb(freq) {
  if (freq === 'daily') return 1
  if (freq === 'weekly') return 7
  return null
}

function frequencyFromDb(freq) {
  if (freq === 1) return 'daily'
  if (freq === 7) return 'weekly'
  return 'once'
}

function TaskFields({ form, setForm, rooms, members }) {
  return (
    <>
      <input
        type="text"
        placeholder="Task name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} required>
        <option value="">Room...</option>
        {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
      </select>
      <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
        <option value="">Unassigned</option>
        {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
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
    </>
  )
}

function taskToForm(task) {
  return {
    name: task.name,
    roomId: String(task.room_id),
    assignedTo: task.assigned_to || '',
    frequency: frequencyFromDb(task.frequency),
    dueDate: task.due_date || '',
  }
}

function TasksPage() {
  const { rooms, tasks, members, addTask, updateTask, deleteTask, markTaskComplete } = useChoreData()
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)

  const memberById = Object.fromEntries(members.map((member) => [member.id, member]))
  const roomById = Object.fromEntries(rooms.map((room) => [room.id, room]))

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'overdue') return isOverdue(task)
    if (filter === 'completed') return isCompletedInCurrentCycle(task)
    return true
  })

  async function handleAddTask(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.roomId) return

    const { error } = await addTask({
      roomId: form.roomId,
      name: form.name.trim(),
      assignedTo: form.assignedTo || null,
      frequency: frequencyToDb(form.frequency),
      dueDate: form.frequency === 'once' ? (form.dueDate || null) : null,
    })
    if (!error) {
      setForm(EMPTY_FORM)
      setShowForm(false)
    }
  }

  function startEditing(task) {
    setEditingTaskId(task.id)
    setEditForm(taskToForm(task))
  }

  async function handleUpdateTask(e) {
    e.preventDefault()
    if (!editForm.name.trim() || !editForm.roomId) return

    const { error } = await updateTask(editingTaskId, {
      name: editForm.name.trim(),
      roomId: editForm.roomId,
      assignedTo: editForm.assignedTo || null,
      frequency: frequencyToDb(editForm.frequency),
      dueDate: editForm.dueDate,
    })
    if (!error) setEditingTaskId(null)
  }

  function handleDeleteTask(task) {
    if (window.confirm(`Delete "${task.name}"?`)) deleteTask(task.id)
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
          <TaskFields form={form} setForm={setForm} rooms={rooms} members={members} />
          <button type="submit" className="btn-primary">Add</button>
        </form>
      )}

      <h2 className="tasks-heading">{activeFilter.label} ({filteredTasks.length})</h2>

      <div className="task-list">
        {filteredTasks.map((task) => {
          if (editingTaskId === task.id) {
            return (
              <form key={task.id} className="task-form task-edit-form" onSubmit={handleUpdateTask}>
                <TaskFields form={editForm} setForm={setEditForm} rooms={rooms} members={members} />
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={() => setEditingTaskId(null)}>Cancel</button>
              </form>
            )
          }

          const overdue = isOverdue(task)
          const completed = isCompletedInCurrentCycle(task)
          const assignee = memberById[task.assigned_to]
          const room = roomById[task.room_id]

          return (
            <div key={task.id} className={`task-row${overdue ? ' overdue' : ''}${completed ? ' completed' : ''}`}>
              <div className="task-row-main">
                <div className="task-row-title">
                  {task.name}
                  {overdue && <AlertCircle size={16} color="#dc2626" />}
                </div>
                <div className="task-row-meta">
                  <span><Clock size={14} /> {frequencyLabel(task.frequency)}</span>
                  {room && <span>{roomIcons[room.name] || '🏠'} {room.name}</span>}
                  {assignee && !completed && <span><UserIcon size={14} /> Assigned to {assignee.name}</span>}
                  {completed && assignee && (
                    <span className="task-completed-by">✓ {assignee.name} · {timeAgo(task.last_completed)}</span>
                  )}
                </div>
              </div>
              <div className="task-row-actions">
                {!(completed && !task.frequency) && (
                  <button type="button" className="btn-secondary" onClick={() => markTaskComplete(task)}>
                    Mark Complete
                  </button>
                )}
                <button type="button" className="icon-btn" onClick={() => startEditing(task)} aria-label={`Edit ${task.name}`}>
                  <Pencil size={16} />
                </button>
                <button type="button" className="icon-btn" onClick={() => handleDeleteTask(task)} aria-label={`Delete ${task.name}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}
        {filteredTasks.length === 0 && <p className="tasks-empty">No tasks here.</p>}
      </div>
    </>
  )
}

export default TasksPage
