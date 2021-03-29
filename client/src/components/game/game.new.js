import { useState} from "react";

function NewGameForm(props) {
  const { dispatch, setError } = props

  const [gameName, setGameName] = useState("");
  const [playerCount, setPlayerCount] = useState(1);
  const [cardCount, setCardCount] = useState(48);

  function addGame(event) {
    event.preventDefault();
    console.log("adding game")
    dispatch({type: "ADD_GAME", payload: { name: gameName, playerCount: playerCount, cardCount: cardCount }})
  }

  return (
    <div className="container">
      <form onSubmit={addGame}>
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
          <div className="col"><button className="btn-lg btn-block btn-secondary" onClick={() => { dispatch({type: "GAME_JOIN"}) }} type="button">Join Game</button></div>
          <div className="col"><button className="btn-lg btn-block btn-primary" type="submit" disabled={gameName === ""}>Create Game</button></div>
        </div>
      </form>
    </div>
  )
}
export default NewGameForm;
