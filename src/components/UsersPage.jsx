import Header from './Header.jsx'
import { useState } from 'react'
import { useChoreData } from '../hooks/useChoreData.js'
import { startOfWeek } from '../lib/chores.js'
import { Trophy, Pencil, Trash2 } from 'lucide-react'
import '../styles/UsersPage.css'

const RANK_STYLES = ['rank-gold', 'rank-silver', 'rank-bronze']
const MEDALS = ['🥇', '🥈', '🥉']

function UsersPage() {
  const { profiles, tasks, completions, addMember, updateMember, deleteMember } = useChoreData()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', avatar: '🙂' })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', avatar: '' })

  const weekStart = startOfWeek()

  const stats = profiles
    .map((profile) => {
      const profileCompletions = completions.filter((c) => c.completed_by === profile.id)
      const totalCompleted = profileCompletions.length
      const thisWeek = profileCompletions.filter((c) => new Date(c.completed_at) >= weekStart).length
      const assigned = tasks.filter((task) => task.assigned_to === profile.id).length
      return { ...profile, totalCompleted, thisWeek, assigned }
    })
    .sort((a, b) => b.totalCompleted - a.totalCompleted)

  const podium = stats.slice(0, 3)

  async function handleAddMember(e) {
    e.preventDefault()
    if (!form.name.trim()) return

    const { error } = await addMember({ name: form.name.trim(), avatar: form.avatar.trim() || '🙂' })
    if (!error) {
      setForm({ name: '', avatar: '🙂' })
      setShowForm(false)
    }
  }

  function startEditing(member) {
    setEditingId(member.id)
    setEditForm({ name: member.name, avatar: member.avatar })
  }

  async function handleUpdateMember(e) {
    e.preventDefault()
    if (!editForm.name.trim()) return

    const { error } = await updateMember(editingId, { name: editForm.name.trim(), avatar: editForm.avatar.trim() || '🙂' })
    if (!error) setEditingId(null)
  }

  function handleDeleteMember(member) {
    if (window.confirm(`Remove ${member.name} from the team?`)) deleteMember(member.id)
  }

  return (
    <>
      <Header />
      <div className="users-header">
        <h1>Team Members</h1>
        <button type="button" className="btn-primary" onClick={() => setShowForm((v) => !v)}>+ Add Member</button>
      </div>

      {showForm && (
        <form className="member-form" onSubmit={handleAddMember}>
          <input
            type="text"
            placeholder="🙂"
            maxLength={4}
            value={form.avatar}
            onChange={(e) => setForm({ ...form, avatar: e.target.value })}
            className="member-form-avatar"
          />
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            autoFocus
          />
          <button type="submit" className="btn-primary">Add</button>
        </form>
      )}

      {podium.length > 0 && (
        <div className="podium">
          {podium.map((member, index) => (
            <div key={member.id} className={`podium-card ${RANK_STYLES[index]}`}>
              <span className="podium-medal">{MEDALS[index]}</span>
              <span className="podium-avatar">{member.avatar}</span>
              <h2>{member.name}</h2>
              <div className="podium-stats">
                <div><span>Total Completed:</span><strong>{member.totalCompleted}</strong></div>
                <div><span>This Week:</span><strong className="stat-green">{member.thisWeek}</strong></div>
                <div><span>Assigned:</span><strong>{member.assigned}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="all-members">
        <h2>All Team Members</h2>
        {stats.map((member, index) => {
          if (editingId === member.id) {
            return (
              <form key={member.id} className="member-form member-edit-form" onSubmit={handleUpdateMember}>
                <input
                  type="text"
                  maxLength={4}
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                  className="member-form-avatar"
                />
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  autoFocus
                />
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
              </form>
            )
          }

          return (
            <div key={member.id} className="member-row">
              <span className="member-rank">#{index + 1}</span>
              <span className="member-avatar">{member.avatar}</span>
              <div className="member-row-name">
                <strong>{member.name}</strong>
                <p>{member.totalCompleted} tasks completed</p>
              </div>
              <div className="member-row-stats">
                <div><span>This Week</span><strong className="stat-green">{member.thisWeek}</strong></div>
                <div><span>Assigned</span><strong>{member.assigned}</strong></div>
                <div><span>Total</span><strong>{member.totalCompleted}</strong></div>
              </div>
              <Trophy size={20} color="#eab308" />
              <button type="button" className="icon-btn" onClick={() => startEditing(member)} aria-label={`Edit ${member.name}`}>
                <Pencil size={16} />
              </button>
              {!member.user_id && (
                <button type="button" className="icon-btn" onClick={() => handleDeleteMember(member)} aria-label={`Remove ${member.name}`}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          )
        })}
        {stats.length === 0 && <p className="tasks-empty">No team members yet.</p>}
      </div>
    </>
  )
}

export default UsersPage
