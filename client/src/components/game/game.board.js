import { animated as a } from 'react-spring'
const GameSquare = require('./game.square').default

const GameBoard = ({ state, actions }) => {
    const {squares} = state.game
    const {handleClick} = actions
    return (
        <div className="game-board"
            style={{
                gridTemplateColumns: `repeat(${state.gridSize[0]}, minmax(20px, 1fr))`,
                gridTemplateRows: `repeat(${state.gridSize[1]}, minmax(20px, 1fr))`,
            }}>
            {squares.map(s => {
                return (
                    <a.div
                        //style={style} //transform: hoverStyle.xys.interpolate(trans)
                        key={s.id}
                        className="squareHolder"
                    //onMouseMove={({ clientX: x, clientY: y }) => setHoverStyle({ xys: calc(x, y) })}
                    //onMouseLeave={() => setHoverStyle({ xys: [0, 0, 1] })}
                    >
                        <GameSquare
                            {...s}
                            handleClick={handleClick}
                            showLabels={state.labels.card} />
                    </a.div>
                )
            })}
        </div>)
}
export default GameBoard