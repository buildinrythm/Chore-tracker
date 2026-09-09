import '../styles/RoomCard.css'
import { useState } from 'react'
import { AlertCircle, Pencil, Trash2 } from 'lucide-react'

function getDecayStatus(decayPercent) {
  if (decayPercent <= 25) {
    return { label: "Sparkling Clean", color: "#22c55e", backgroundColor: "#D8E3E1" }
  } else if (decayPercent <= 50) {
    return { label: "Needs Attention", color: "#eab308", backgroundColor: "#FEFAE4"}
  } else if (decayPercent <= 75) {
    return { label: "Getting Dirty", color: "#f97316", backgroundColor: "#FDECE0"}
  } else {
    return { label: "Critical!", color: "#ef4444", backgroundColor: "#FFE2E1"}
  }
}


function RoomCard({ name, icon, decayPercent, pendingTasks, lastCleaned, color, overdueIndicator, decayRate, onMarkCleaned, onUpdate, onDelete }) {
  const decayStatus = getDecayStatus(decayPercent)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [editDecayRate, setEditDecayRate] = useState(decayRate)

  function startEditing() {
    setEditName(name)
    setEditDecayRate(decayRate)
    setEditing(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!editName.trim()) return
    const { error } = await onUpdate({ name: editName.trim(), decayRate: Number(editDecayRate) || 7 })
    if (!error) setEditing(false)
  }

  function handleDelete() {
    if (window.confirm(`Delete ${name}? This also deletes its tasks.`)) {
      onDelete()
    }
  }

  if (editing) {
    return (
      <form className="rc-cont rc-edit-form" onSubmit={handleSave}>
        <input
          autoFocus
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Room name"
        />
        <label className="rc-edit-label">
          Cleaning cadence (days)
          <input
            type="number"
            min="1"
            value={editDecayRate}
            onChange={(e) => setEditDecayRate(e.target.value)}
          />
        </label>
        <div className="rc-edit-actions">
          <button type="submit" className="btn-primary">Save</button>
          <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </form>
    )
  }

  return (
    <div className="rc-cont" style={{
      backgroundColor: decayStatus.backgroundColor,
      borderColor: decayStatus.color,
      borderWidth: '2px',
      borderStyle: 'solid'
    }}>
      <div className="rc-cont-top">
        <span className="rc-icon" style={{ backgroundColor: color }}>{icon}</span>
        <div className="rc-name-pt">
          <h2>{name}</h2>
          <p>{pendingTasks} tasks</p>
        </div>
        <div className="rc-card-actions">
          {overdueIndicator > 0 && (
            <span className="overdue-ir"><AlertCircle size={14} />{overdueIndicator}</span>
          )}
          <button type="button" className="icon-btn" onClick={startEditing} aria-label={`Edit ${name}`}>
            <Pencil size={14} />
          </button>
          <button type="button" className="icon-btn" onClick={handleDelete} aria-label={`Delete ${name}`}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="rc-cont-mid">
        <p>{decayStatus.label}</p>
        <p>{decayPercent}%</p>
      </div>
      <div className="decay-bar-bg">
        <div className="decay-bar-fill" style={{ width: `${decayPercent}%`, backgroundColor: decayStatus.color }} />
      </div>
      <div className="rc-last-cleaned-row">
        <p>☑ Last cleaned {lastCleaned}</p>
        <button type="button" className="rc-mark-clean" onClick={onMarkCleaned}>Mark Clean</button>
      </div>
    </div>
  )
}


export default RoomCard
