const { GameListEntry } = require('./game.list.entry')
function GameList({ state, dispatch, actions }) {
    const { viewGame, deleteGame, getGames } = actions
    const { games } = state
    return (
        <div className="pageSection">
            <div className="helpers"><button className="refreshBtn" onClick={() => getGames()}>&#x21bb;</button></div>

            {games.map(g => {
                const { id, gameName, users, status } = g
                return <GameListEntry id={id} key={id} gameName={gameName} users={users} status={status} viewGame={viewGame} deleteGame={deleteGame} />
            })}
        </div>
    )
}
export default GameList