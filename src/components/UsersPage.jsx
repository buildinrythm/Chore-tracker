import Header from './Header.jsx'
import { useState } from 'react'
import { useChoreData } from '../hooks/useChoreData.js'
import { startOfWeek } from '../lib/chores.js'
import { Trophy, Pencil, Copy } from 'lucide-react'
import '../styles/UsersPage.css'

const RANK_STYLES = ['rank-gold', 'rank-silver', 'rank-bronze']
const MEDALS = ['🥇', '🥈', '🥉']

function UsersPage() {
  const { household, me, members, tasks, logs, loading, updateMyProfile } = useChoreData()
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', avatar: '' })
  const [copied, setCopied] = useState(false)

  if (loading || !household || !me) return null

  const weekStart = startOfWeek()

  const stats = members
    .map((member) => {
      const memberLogs = logs.filter((log) => log.user_id === member.id)
      const totalCompleted = memberLogs.length
      const thisWeek = memberLogs.filter((log) => new Date(log.completed_at) >= weekStart).length
      const assigned = tasks.filter((task) => task.assigned_to === member.id).length
      return { ...member, totalCompleted, thisWeek, assigned }
    })
    .sort((a, b) => b.totalCompleted - a.totalCompleted)

  const podium = stats.slice(0, 3)

  function startEditing() {
    setEditForm({ name: me.name, avatar: me.avatar })
    setEditing(true)
  }

  async function handleUpdateProfile(e) {
    e.preventDefault()
    if (!editForm.name.trim()) return

    const { error } = await updateMyProfile({ name: editForm.name.trim(), avatar: editForm.avatar.trim() || '🙂' })
    if (!error) setEditing(false)
  }

  async function handleCopyInvite() {
    try {
      await navigator.clipboard.writeText(household.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard access denied - the code is still visible on screen to copy manually
    }
  }

  return (
    <>
      <Header />
      <div className="users-header">
        <h1>Team Members</h1>
      </div>

      <div className="invite-banner">
        <div>
          <strong>{household.name}</strong>
          <p>Invite household members to join with this code:</p>
        </div>
        <div className="invite-code-row">
          <span className="invite-code">{household.invite_code}</span>
          <button type="button" className="btn-secondary" onClick={handleCopyInvite}>
            <Copy size={14} /> {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

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
          if (editing && member.id === me.id) {
            return (
              <form key={member.id} className="member-form member-edit-form" onSubmit={handleUpdateProfile}>
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
                <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </form>
            )
          }

          return (
            <div key={member.id} className="member-row">
              <span className="member-rank">#{index + 1}</span>
              <span className="member-avatar">{member.avatar}</span>
              <div className="member-row-name">
                <strong>{member.name}{member.id === me.id ? ' (you)' : ''}</strong>
                <p>{member.totalCompleted} tasks completed</p>
              </div>
              <div className="member-row-stats">
                <div><span>This Week</span><strong className="stat-green">{member.thisWeek}</strong></div>
                <div><span>Assigned</span><strong>{member.assigned}</strong></div>
                <div><span>Total</span><strong>{member.totalCompleted}</strong></div>
              </div>
              <Trophy size={20} color="#eab308" />
              {member.id === me.id && (
                <button type="button" className="icon-btn" onClick={startEditing} aria-label="Edit your profile">
                  <Pencil size={16} />
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
