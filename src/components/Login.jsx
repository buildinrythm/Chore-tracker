import { supabase } from '../supabase.js'
import { useState } from 'react'
import '../styles/Login.css'

function Login({ onSession }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'reset-request' | 'reset-confirm'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
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

  async function handleRequestReset(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    setLoading(false)
    if (error) setError(error.message)
    else {
      setInfo(`We sent a 6-digit code to ${email}. Enter it below with your new password.`)
      setMode('reset-confirm')
    }
  }

  async function handleConfirmReset(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: resetCode.trim(),
      type: 'recovery',
    })
    if (verifyError) {
      setLoading(false)
      setError(verifyError.message)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

    setLoading(false)
    if (updateError) setError(updateError.message)
    else onSession(data.session)
  }

  function backToSignIn() {
    setMode('signin')
    setError('')
    setInfo('')
    setResetCode('')
    setNewPassword('')
  }

  if (mode === 'reset-request') {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={handleRequestReset}>
          <h1>Reset password</h1>
          <p>Enter your account email and we'll send you a reset code.</p>
          {error && <p className="login-error">{error}</p>}
          {info && <p className="login-info">{info}</p>}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="login-actions">
            <button type="submit" className="btn-primary" disabled={loading}>Send reset code</button>
          </div>
          <button type="button" className="login-link" onClick={backToSignIn}>Back to sign in</button>
        </form>
      </div>
    )
  }

  if (mode === 'reset-confirm') {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={handleConfirmReset}>
          <h1>Enter your code</h1>
          <p>Check {email} for a 6-digit code.</p>
          {error && <p className="login-error">{error}</p>}
          {info && <p className="login-info">{info}</p>}
          <input
            type="text"
            inputMode="numeric"
            placeholder="6-digit code"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <div className="login-actions">
            <button type="submit" className="btn-primary" disabled={loading}>Reset password</button>
          </div>
          <button type="button" className="login-link" onClick={backToSignIn}>Back to sign in</button>
        </form>
      </div>
    )
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
        <button type="button" className="login-link" onClick={() => setMode('reset-request')}>Forgot password?</button>
      </form>
    </div>
  )
}

export default Login
