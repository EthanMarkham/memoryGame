import React, { useState, useEffect } from "react";
import { SocketContext } from 'context/socket';

function PreGame(props) {
    const [games, setGames] = useState([]);
    const [gameName, setGameName] = useState("");
    const [playerCount, setPlayerCount] = userState(1);
    const [cardCount, setCardCount] = useState(48);
    const [action, setAction] = 0; //0 for Joining OR 1 for Creating
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.emit("LEAVE_GAME_LIST");
        socket.on("GAME_LIST", data => setGames(data));

        return (() => {
            socket.off("GAME_LIST", data => setGames(data));
        })
    }, []);

    const joinGame = id => socket.emit("JOIN_GAME", id)
    const handleNewGameSubmit = e => {
        e.preventDefault()
        socket.emit("ADD_GAME", { playerCount: playerCount, cardCount: cardCount, name: gameName })
    }

    return (
        <div className="container">
            {(action === 0) ?
                <form onSubmit={handleNewGameSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input type="text" id="name" className="form-control" placeholder="Enter Lobby Name" onChange={(event) => { setGameName(event.target.value) }} value={gameName} />
                    </div>
                    <br />

                    <div className="form-row">
                        <div className="form-group col">
                            <label htmlFor="playerCount">Number of Players</label>
                            <select id="inputState" className="form-control" onChange={(event) => { setPlayerCount(event.target.value) }} value={playerCount} >
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                            </select>
                        </div>
                        <div className="form-group col">
                            <label htmlFor="cardCount">Difficulty</label>
                            <select id="inputState" className="form-control" onChange={(event) => { setCardCount(event.target.value) }} value={cardCount} >
                                <option value={16}>easy</option>
                                <option value={48}>medium</option>
                                <option value={72}>hard</option>
                                <option value={4}>get out of here</option>
                            </select>
                        </div>
                    </div>
                    <br />
                    <div className="row">
                        <div className="col"><button className="btn-lg btn-block btn-secondary" onClick={() => { dispatch({ type: "SWITCH_PAGE", payload: { pageIndex: 1 } }) }} type="button">Join Game</button></div>
                        <div className="col"><button className="btn-lg btn-block btn-primary" type="submit" disabled={gameName === ""}>Create Game</button></div>
                    </div>
                </form>
                :
                <div className="gameList">
                    <h2>{games.length} games found!</h2>
                    {games.length > 0 && <Transition
                        items={games} keys={item => item.id}
                        from={{ transform: 'translate3d(0,-40px,0)' }}
                        enter={{ transform: 'translate3d(0,0px,0)' }}
                        leave={{ transform: 'translate3d(0,-40px,0)' }}>
                        {item => props => <div style={props}>{<GameInfo game={item} joinGame={joinGame} />}</div>}
                    </Transition>}
                </div>
            }
            <div className="row">
                <div className="col"><button className="btn btn-primary btn-large btn-block" onClick={() => setAction(action === 0 ? 1 : 0)} >{action === 0 ? "New Game" : "Join Game"}</button></div>
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
export default PreGame;
