import { supabase } from '../supabase.js'
import { useState } from 'react'

function Login({ onSession }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSignIn() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.log(error)
    } else {
      onSession(data.session)
    }
  }

  async function handleSignUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      console.log(error)
    } else {
      console.log('Check your email to confirm your account')
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <p>Please log in to continue</p>
      <div>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button onClick={handleSignIn}>Sign in</button>
        <button onClick={handleSignUp}>Sign up</button>
      </div>
    </div>
  )
}

export default Login
