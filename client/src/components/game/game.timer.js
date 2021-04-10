const GameTimer = ({ time, enabled }) => {
    return (
        <div className="stat timer">
            <div className="time">Timer: {time}</div>
        </div>
    )
}
export default GameTimer