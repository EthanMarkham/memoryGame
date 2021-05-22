import React, { useState, useEffect, useContext } from "react";
import { SocketContext } from '../../context/socket';
import { GameJoiner } from "./gameJoiner";
import { GameCreator } from "./gameCreator";
import { useTransition, animated as a } from 'react-spring'
import {preGameTransition } from '../../helpers/transitions';

function PreGame(props) {
    const [games, setGames] = useState([]);
    const [gameName, setGameName] = useState("");
    const [playerCount, setPlayerCount] = useState(1);
    const [cardCount, setCardCount] = useState(48);
    const [action, setAction] = useState(1); //1 for Joining OR 0 for Creating
    const socket = useContext(SocketContext);

    const pageAnimations = useTransition(action, preGameTransition);

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

    const pages = [
        () => <GameCreator
            gameName={gameName}
            cardCount={cardCount}
            playerCount={playerCount}
            setGameName={setGameName}
            setPlayerCount={setPlayerCount}
            setCardCount={setCardCount}
            toggleAction={setAction}
            handleSubmit={handleNewGameSubmit}
        />,
        () => <GameJoiner
            games={games}
            toggleAction={setAction}
            handleJoin={joinGame}
        />
    ]
    return (
        <>
        {pageAnimations((props, item) => {
            const Page = pages[item]
            return (
              <a.div className='animatedDiv' key={'page' + item} style={props}>
                <Page/>
              </a.div>)
          })}
        </>
    )
}


export default PreGame;
