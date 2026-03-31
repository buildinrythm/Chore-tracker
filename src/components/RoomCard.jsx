import '../styles/RoomCard.css'

function getDecayStatus(decayPercent) {
  if (decayPercent <= 25) {
    return { label: "Sparkling Clean", color: "#22c55e", backgroundColor: "#D8E3E1" }
  } else if (decayPercent <= 50) {
    return { label: "Needs Attention", color: "#eab308", backgroundColor: "#FEFAE4"}
  } else if (decayPercent <= 75) {
    return { label: "Getting Dirty", color: "#f97316", backgroundColor: "#FDECE0"}
  } else {
    return { label: "Critical!", color: "#ef4444", backgroundColor: "#FFE2E1"}
  }
}

function RoomCard({ name, icon, decayPercent, pendingTasks, lastCleaned, color, overdueIndicator }) {
  const decayStatus = getDecayStatus(decayPercent)

  return (
    <>
    <div  className="rc-cont" style={{
    backgroundColor: decayStatus.backgroundColor,
    borderColor: decayStatus.color, // This sets the border color
    borderWidth: '2px',             // Make sure to set a border width
    borderStyle: 'solid'            // And a border style
  }}>
    <div className="rc-cont-top">
        <span className="rc-icon" style={{ backgroundColor: color }}>{icon}</span>
        <div className="rc-name-pt">
            <h2>{name}</h2>
            <p>{pendingTasks} tasks</p>
        </div>
        <span className="overdue-ir">❗️{overdueIndicator}</span>
    </div>
    <div className="rc-cont-mid">
      <p>{decayStatus.label}</p>
      <p>{decayPercent}%</p>
    </div>
    <div className="decay-bar-fill" style={{ width: `${decayPercent}%`,backgroundColor: decayStatus.color }}>
    </div>
    <div>
        <p>☑ Last cleaned {lastCleaned} day/s ago</p>
    </div>
    </div>
    </>
  )
}


export default RoomCard