export const GameJoiner = ({games, joinGame, toggleAction}) => {
    return (
        <div className="pregameContainer">
            <h2>{games.length > 0 ? games.length + ' GAME' + (games.length > 1 ? 'S' : null) + ' FOUND!' : 'NO GAMES FOUND!'}</h2>
            <div className="gameList">
                {games.map(g => <GameInfo game={g} key={g.id} joinGame={joinGame} />)}
            </div>
            <div className="buttonHolder">
                <button className="btn btn-outline btn-block" onClick={() => toggleAction(0)} >NEW GAME</button>
            </div>
        </div>
    )
}

const GameInfo = (props) => {
    return (
        <button className="row gameList" onClick={() => { props.joinGame(props.game.id) }}>
            <div className="col-8"><h3>{props.game.name}</h3></div>
            <div className="col-4">
                <div className="gameStats">
                    <div className="stat">Players: {props.game.players}</div>
                    <div className="stat">Out of: {props.game.maxPlayers}</div>
                </div>
            </div>
        </button>)
}