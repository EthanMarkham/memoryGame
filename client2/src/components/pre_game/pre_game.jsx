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
        socket.on("GAME_LIST", data => { if (mounted) setGames(data); });

        return (() => {
            socket.emit("LEAVE_GAME_LIST");
            socket.removeAllListeners("GAME_LIST");
            mounted = false;
        })
    }, []);

    const joinGame = id => socket.emit("JOIN_GAME", id)
    const handleNewGameSubmit = _ => {
        socket.emit("ADD_GAME", { playerCount: playerCount, cardCount: cardCount, name: gameName })
    }

    return (
        <>
            {(action === 0) ?
                <div className="pregameContainer">
                    <h2>ENTER GAME INFO</h2>

                    <div className="inputForm">

                        <div className="row">
                            <div id='nameInput'  className="form-group col">
                                <label id='nameLabel' htmlFor="name">NAME</label>
                                <input type="text" autocomplete="off" id="name" placeholder="LOBBY NAME" onChange={(event) => { setGameName(event.target.value) }} value={gameName} />
                            </div>
                        </div>

                        <div className="row">

                            <div className="form-group">
                                <label htmlFor="cardCount">DIFFICULTY</label>
                                <select id='difficultySelect' className="dropdown-primary" onChange={(event) => { setCardCount(event.target.value) }} value={cardCount} >
                                    <option value={16}>EASY</option>
                                    <option value={48}>MEDIUM</option>
                                    <option value={72}>HARD</option>
                                    <option value={4}>dev</option>
                                </select>
                            </div>
                        </div>

                        <div className='row'>
                            <div className="form-group">
                                <label htmlFor="playerCount">PLAYERS</label>
                                <select id='playerSelect' className="dropdown-primary" onChange={(event) => { setPlayerCount(event.target.value) }} value={playerCount} >
                                    <option value={1}>ONE</option>
                                    <option value={2}>TWO</option>
                                    <option value={3}>THREE</option>
                                    <option value={4}>FOUR</option>
                                </select>
                            </div>
                        </div>
                        <div className="buttonHolder">
                            <button className="btn btn-outline btn-block" onClick={() => setAction(1)} type="button">LIST OPEN GAMES</button>
                            <button className="btn btn-block" onClick={() => handleNewGameSubmit()} disabled={gameName === ""}>START GAME</button>
                        </div>
                    </div>
                </div>
                :
                <div className="pregameContainer">
                    <h2>{games.length > 0 ? games.length + ' GAME' + (games.length > 1 ? 'S' : null) + ' FOUND!' : 'NO GAMES FOUND!'}</h2>
                    <div className="gameList">
                        {games.map(g => <GameInfo game={g} key={g.id} joinGame={joinGame} />)}
                    </div>
                    <div className="buttonHolder">
                        <button className="btn btn-outline btn-block" onClick={() => setAction(0)} >NEW GAME</button>
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
