import { animated as a } from 'react-spring'
const GameSquare = require('./game.square').default

const GameBoard = ({state, squareSprings, handleClick}) => {

    return (
        <div className="game-board" 
            style={{
                gridTemplateColumns: `repeat(${state.gridSize[0]}, minmax(20px, 1fr))`,
                gridTemplateRows: `repeat(${state.gridSize[1]}, minmax(20px, 1fr))`,
            }}>
            {squareSprings.map(({ item, props, key }) => (
                <a.div
                    style={{ ...props, }} //transform: hoverStyle.xys.interpolate(trans)
                    key={key}
                    className="squareHolder"
                //onMouseMove={({ clientX: x, clientY: y }) => setHoverStyle({ xys: calc(x, y) })}
                //onMouseLeave={() => setHoverStyle({ xys: [0, 0, 1] })}
                >
                    <GameSquare
                        {...item}
                        handleClick={handleClick}
                        showLabels={state.labels.card} />
                </a.div>
            )
            )}
        </div>)
}
export default GameBoard