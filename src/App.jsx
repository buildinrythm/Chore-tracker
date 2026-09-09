import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './supabase.js'
import Dashboard from './components/Dashboard.jsx'
import Login from './components/Login.jsx'
import Onboarding from './components/Onboarding.jsx'
import TasksPage from './components/TasksPage.jsx'
import UsersPage from './components/UsersPage.jsx'
import AnalyticsPage from './components/AnalyticsPage.jsx'
import { useChoreData } from './hooks/useChoreData.js'

function AuthenticatedApp() {
  const { me, loading, createHousehold, joinHousehold } = useChoreData()

  if (loading) return null
  if (!me) return <Onboarding onCreate={createHousehold} onJoin={joinHousehold} />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [checkedSession, setCheckedSession] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setCheckedSession(true)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  function handleSession(session) {
    setSession(session)
  }

  if (!checkedSession) return null
  if (!session) return <Login onSession={handleSession} />

  return <AuthenticatedApp />
}

export default App
