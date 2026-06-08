import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'
import Dashboard from './components/Dashboard.jsx'
import Login from './components/Login.jsx'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  function handleSession(session) {
    setSession(session)
  }

  return (
    <>
      {session ? <Dashboard /> : <Login onSession={handleSession} />}
    </>
  )
}

export default App