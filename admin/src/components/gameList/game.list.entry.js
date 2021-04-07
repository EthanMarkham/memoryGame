export const GameListEntry = (props) => {
    const { id, gameName, users, status, viewGame, deleteGame } = props
    return (
        <div className="gameListInfo row">
            <div className="col-2">
                <button
                    className="gameInfo"
                    onClick={() => viewGame(id)}
                > Info
                </button>
            </div>
            <div className="col-3">
                <span>{gameName}</span>
            </div>
            <div className="col-3">
                <span>{status}</span>
            </div>
            <div className="col-2">
                <span>{users.length} Users</span>
            </div>
            <div className="col-2">
                <button
                    className="gameInfo"
                    onClick={() => {if (window.confirm('Are you sure you wish to delete this game?')) deleteGame(id)}}
                > Delete
                </button>
            </div>
        </div>

    )
}
