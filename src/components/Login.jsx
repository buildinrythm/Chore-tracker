import { supabase } from '../supabase.js'
import { useState } from 'react'
import '../styles/Login.css'

function Login({ onSession }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignIn(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
    if (error) setError(error.message)
    else onSession(data.session)
  }

  async function handleSignUp() {
    setError('')
    setInfo('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name.trim() || undefined } },
    })

    setLoading(false)
    if (error) setError(error.message)
    else setInfo('Account created! Check your email to confirm, or sign in now if confirmations are disabled.')
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSignIn}>
        <h1>ChoreTracker</h1>
        <p>Please log in to continue</p>
        {error && <p className="login-error">{error}</p>}
        {info && <p className="login-info">{info}</p>}
        <input
          type="text"
          placeholder="Name (only needed to sign up)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="login-actions">
          <button type="submit" className="btn-primary" disabled={loading}>Sign in</button>
          <button type="button" className="btn-secondary" onClick={handleSignUp} disabled={loading}>Sign up</button>
        </div>
      </form>
    </div>
  )
}

export default Login
