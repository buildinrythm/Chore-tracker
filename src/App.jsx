import Header from './components/Header.jsx'
import StatCard from './components/StatCard.jsx'
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
    </>
  )
}

export default App