import { useState, useEffect, useContext, useCallback } from "react";
import { SocketContext } from '../../context/socket';

function NewGameForm(props) {
  const socket = useContext(SocketContext);

  const { setGameState } = props
  const [gameName, setGameName] = useState("");
  const [playerCount, setPlayerCount] = useState(1);
  const [cardCount, setCardCount] = useState(48);
  const [error, setError] = useState("");

  const handleError = useCallback((err) => {
    console.log(err)
    setError(err)
  }, [setError])

  useEffect(() => {
    socket.on("ADD_ERROR", (err) => handleError(err))
    return (() => {
      socket.off("ADD_ERROR", (err) => handleError(err))
    })
  }, [])

  function addGame(event) {
    event.preventDefault();
    console.log("adding game")
    socket.emit("ADD_GAME", { name: gameName, playerCount: playerCount, cardCount: cardCount })
  }

  return (
    <div className="container">
      <form onSubmit={addGame}>
        <div class="form-group">
          <label for="name">Name:</label>
          <input type="text" id="name" className="form-control" placeholder="Enter Lobby Name" onChange={(event) => { setGameName(event.target.value) }} value={gameName} />
        </div>
        <br />

        <div class="form-row">
          <div class="form-group col">
            <label for="playerCount">Number of Players</label>
            <select id="inputState" class="form-control" onChange={(event) => { setPlayerCount(event.target.value) }} value={playerCount} >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
          <div class="form-group col">
            <label for="cardCount">Difficulty</label>
            <select id="inputState" class="form-control" onChange={(event) => { setCardCount(event.target.value) }} value={cardCount} >
              <option value={16}>easy</option>
              <option value={48}>medium</option>
              <option value={72}>hard</option>
              <option value={4}>get out of here</option>
            </select>
          </div>
        </div>
        <br />
        <div className="row">
          <div className="col"><button className="btn-lg btn-block btn-secondary" onClick={() => { setGameState("GAME_JOIN") }} type="button">Join Game</button></div>
          <div className="col"><button className="btn-lg btn-block btn-primary" type="submit" disabled={gameName === ""}>Create Game</button></div>
        </div>
      </form>
    </div>
  )
}
export default NewGameForm;
