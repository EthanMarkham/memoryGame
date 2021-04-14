import React from 'react';

const GameBoard = ({ state, actions }) => {
    const { squares } = state.game
    const { handleClick } = actions
    return (
        <div className="game-board"
            style={{
                gridTemplateColumns: `repeat(${state.gridSize[0]}, minmax(20px, 1fr))`,
                gridTemplateRows: `repeat(${state.gridSize[1]}, minmax(20px, 1fr))`,
            }}>
            {squares.map(s => {
                return (
                    <button
                        className="square"
                        onClick={() => handleClick(id)}
                        style={{ backgroundImage: `/${s.image})` }}//;fix show labels
                        disabled={!s.clickable}>
                        {showLabels && <label>{s.civ}</label>}
                    </button>)
            })}
        </div>)
}
export default GameBoard