import '../styles/TeamMember.css'

function TeamMember({avatar,name,tasksCompleted,color}) {
    return(
        <>
        <div className="tm-container">
            <div className="tm-cont-left" style={{ backgroundColor: color }}>
            <span className="tm-avatar" >{avatar}</span>
            </div>
            <div className="tm-cont-right">
            <h2>{name}</h2>
            <p>{tasksCompleted} tasks completed</p>
            </div>
        </div>
        </>
    )
}

export default TeamMember