import { useState } from 'react'
import { supabase } from '../supabase.js'
import '../styles/Login.css'
import '../styles/Onboarding.css'

function Onboarding({ onCreate, onJoin }) {
  const [mode, setMode] = useState('create')
  const [householdName, setHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!householdName.trim()) return
    setLoading(true)
    setError('')
    const { error } = await onCreate(householdName.trim())
    setLoading(false)
    if (error) setError(error.message)
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!inviteCode.trim()) return
    setLoading(true)
    setError('')
    const { error } = await onJoin(inviteCode.trim().toUpperCase())
    setLoading(false)
    if (error) setError('That invite code doesn\'t match a household. Double-check it with whoever sent it.')
  }

  return (
    <div className="login-page">
      <div className="login-card onboarding-card">
        <h1>Welcome to ChoreTracker</h1>
        <p>Create a household to get started, or join one with an invite code from a household member.</p>
        <div className="onboarding-tabs">
          <button type="button" className={mode === 'create' ? 'active' : ''} onClick={() => setMode('create')}>Create a household</button>
          <button type="button" className={mode === 'join' ? 'active' : ''} onClick={() => setMode('join')}>Join a household</button>
        </div>
        {error && <p className="login-error">{error}</p>}
        {mode === 'create' ? (
          <form onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="Household name (e.g. The Agbors)"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>Create Household</button>
          </form>
        ) : (
          <form onSubmit={handleJoin}>
            <input
              type="text"
              placeholder="Invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>Join Household</button>
          </form>
        )}
        <button type="button" className="btn-secondary onboarding-signout" onClick={handleSignOut}>Sign out</button>
      </div>
    </div>
  )
}

export default Onboarding
