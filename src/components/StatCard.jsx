import '../styles/StatCard.css'

function StatCard({title, count, color, icon}) {

    
    return (
    <>    
    <div className="stat-card" >
    <div className="stat-card-left">
        <h2>{title}</h2>
        <p>{count}</p>
    </div>
    <div className="stat-card-right" style={{ backgroundColor: color }}>
    <span className="stat-card-logo" >{icon}</span>
    </div>
    </div>
    </>
    

    )
}

export default StatCard