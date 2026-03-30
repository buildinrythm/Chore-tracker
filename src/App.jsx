import Header from './components/Header.jsx'
import StatCard from './components/StatCard.jsx'
import TeamMember from './components/TeamMember.jsx'
import { List, CheckCircle, AlertCircle, Users } from 'lucide-react'



function App() {
  return (
    <>
      <Header />
      <div id="statcard-container">
      <StatCard title="Total Tasks" count={12} icon={<List color="#165DFC"/>} color="#DBEAFF" />
      <StatCard title="Completed Today" count={0} icon={<CheckCircle color="#00A63D"/>} color="#DCFCE6" />
      <StatCard title="Overdue" count={8} icon={<AlertCircle color="#E7000B"/>} color="#FEE2E2" />
      <StatCard title="Team Members" count={4} icon={<Users color="#980FFA" />} color="#F3E8FE" />
      </div>
      <div id="team-section">
  <div id="team-header">
    <h2>Team Members</h2>
    <a href="#">View All →</a>
  </div>
  <div id="team-grid">
    <TeamMember avatar="😭" name="John" tasksCompleted={12} color="#DBEAFF" />
    <TeamMember avatar="😭" name="John" tasksCompleted={12} color="#DCFCE6"/>
    <TeamMember avatar="😭" name="John" tasksCompleted={12} color="#FEE2E2"/>
    <TeamMember avatar="😭" name="John" tasksCompleted={12} color="#F3E8FE"/>
  </div>
</div>
    </>
  )
}

export default App