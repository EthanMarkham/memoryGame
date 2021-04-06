const GameInfo = ({ state, dispatch, actions }) => {
    const { currentGuesses, gameName, id, message, playerCount, squares, users, status } = state.games[state.indexes.game]
    const { nextPage, nextTurn, deleteGame, removeUser, getGames } = actions
    const completed = squares.defaults.filter(s => s.value != "*").length
    return (
        <div className="pageSection">
            <div className="helpers"><button className="refreshBtn" onClick={getGames}>&#x21bb;</button></div>
            <div className="row">
                <div className="col-6">
                    <h1>{gameName}</h1>
                </div>
                <div className="col-2">
                    <label>Status:</label>
                    <span>{status}</span>
                </div>
                <div className="col-2">
                    <label>Progress:</label>
                    <span>{completed}/{squares.defaults.length}</span>
                </div>
                <div className="col-2">
                    <label>Players:</label>
                    <span>{users.length}/{playerCount}</span>
                </div>
            </div>
            <table class="table table-dark">
                <thead>
                    <tr>
                        <th scope="col">Username</th>
                        <th scope="col">Matches</th>
                        <th scope="col">Upnext?</th>
                        <th scope="col">Status</th>
                        <th scope="col">Remove</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => {
                        return (
                            <tr key={u.id}>
                                <th scope="row">{u.username}</th>
                                <td>{u.matches}</td>
                                <td>{(u.upNext ? "Next" : "")}</td>
                                <td>{(u.active ? "--Active--" : "--Quit--")}</td>
                                <td><button className="btn" onClick={() => { if (window.confirm('Are you sure you want to remove this user?')) removeUser(u.id) }}>Remove</button></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <div className="row row justify-space-between">
                <div className="col">
                    <button
                        className="btn"
                        onClick={() => { if (window.confirm('Are you sure you wish to delete this game?')) deleteGame(id) }}
                    > Delete Game</button>
                </div>
                <div className="col">
                    <button
                        className="btn"
                        onClick={() => { if (window.confirm('Are you sure you wish to skip?')) nextTurn(id) }}
                    > Next Turn</button>
                </div>
                <div className="col">
                    <button
                        className="btn"
                        onClick={() => nextPage({pageIndex: 1})}
                    >&#9166;</button>
                </div>
            </div>
        </div>
    )
}
export default GameInfo