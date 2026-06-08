import '../styles/Header.css'
import { supabase } from '../supabase.js'

function Header() {

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.log(error)
  }

return (
    <>
    <div id="navbar">
        <div id="logo">
            <h1>ChoreTracker</h1>
            <p>Keep your home sparkling clean</p>
        </div>
        <div id="nav-links">
            <ul>
                <li><a href="#">Dashboard</a></li>
                <li><a href="#">Tasks</a></li>
                <li><a href="#">Users</a></li>
                <li><a href="#">Analytics</a></li>
            </ul>
        </div>
        <button onClick={handleSignOut}>Sign out</button>
    </div>
    </>
)
}

export default Header