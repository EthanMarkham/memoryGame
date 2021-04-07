const GameSquare = ({ id, clickable, showLabels, civ, image, handleClick }) => {
    return (
        <button
            className="square"
            onClick={() => handleClick(id)}
            style={{ backgroundImage: `url(http://localhost:5000/${image})` }}//;fix show labels
            disabled={!clickable}>
            {showLabels && <label>{civ}</label>}
        </button>
    )
}
export default GameSquare