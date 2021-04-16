import React, { useState, useEffect, useContext } from "react";
import { SocketContext } from '../../context/socket';

function PreGame(props) {
    const [games, setGames] = useState([]);
    const [gameName, setGameName] = useState("");
    const [playerCount, setPlayerCount] = useState(1);
    const [cardCount, setCardCount] = useState(48);
    const [action, setAction] = useState(1); //1 for Joining OR 0 for Creating
    const socket = useContext(SocketContext);

    useEffect(() => {
        let mounted = true;
        if (mounted) socket.emit("JOIN_GAME_LIST"); //join socket room
        if (mounted) socket.emit("GET_GAME_LIST");   //ask for open games
        socket.on("GAME_LIST", data => {if (mounted) setGames(data); });

        return (() => {
            socket.emit("LEAVE_GAME_LIST");
            socket.off("GAME_LIST", data => {if (mounted) setGames(data); });
            mounted = false;
        })
    }, []);

    const joinGame = id => socket.emit("JOIN_GAME", id)
    const handleNewGameSubmit = e => {
        e.preventDefault()
        socket.emit("ADD_GAME", { playerCount: playerCount, cardCount: cardCount, name: gameName })
    }

return (
    <>
        {(action === 0) ?
            <div className="container">
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
                        <div className="col"><button className="btn-lg btn-block btn-secondary" onClick={() => setAction(1)} type="button">Join Game</button></div>
                        <div className="col"><button className="btn-lg btn-block btn-primary" type="submit" disabled={gameName === ""}>Create Game</button></div>
                    </div>
                </form>
            </div>
            :
            <div className="container">
                <div className="gameList">
                    <h2>{games.length} games found!</h2>
                    {games.map(g => <GameInfo game={g} key={g.id} joinGame={joinGame} />)}
                </div>
                <div className="row">
                    <div className="col"><button className="btn btn-primary btn-large btn-block" onClick={() => setAction(0)} >New Game</button></div>
                </div>
            </div>
        }
    </>
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
