import '../styles/Header.css'
import { supabase } from '../supabase.js'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, ListChecks, Users, BarChart3 } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', Icon: Home, end: true },
  { to: '/tasks', label: 'Tasks', Icon: ListChecks },
  { to: '/users', label: 'Users', Icon: Users },
  { to: '/analytics', label: 'Analytics', Icon: BarChart3 },
]

const SUBTITLES = {
  '/': 'Keep your home sparkling clean',
  '/tasks': 'Manage all tasks',
  '/users': 'Team management',
  '/analytics': 'Analytics & Insights',
}

function Header() {
  const location = useLocation()
  const subtitle = SUBTITLES[location.pathname] || 'Keep your home sparkling clean'

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.log(error)
  }

  return (
    <div id="navbar">
      <div id="logo">
        <span id="logo-icon"><Home size={20} /></span>
        <div>
          <h1>ChoreTracker</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <nav id="nav-links">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <item.Icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button type="button" onClick={handleSignOut}>Sign out</button>
    </div>
  )
}

export default Header
