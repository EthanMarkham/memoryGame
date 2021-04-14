import React from 'react';

function NewGameForm(props) {
  const { dispatch, addGame } = props;

  const handleSubmit = e => {
    e.preventDefault()
    let gameName = e.target.gameName.value;
    let playerCount = e.target.playerCount.value;
    let cardCount = e.target.cardCount.value;
    //validate
    if (!gameName || ![1, 2, 3, 4].includes(playerCount) || ![16,48,72,4].includes(cardCount)) {
      dispatch({type: "ERROR", payload: "Check your Values!"})
    }
    else addGame({playerCount: playerCount, cardCount: cardCount, name: gameName});
  }
  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="gameName">Name:</label>
          <input type="text" id="gameName" name="gameName" className="form-control" placeholder="Enter Lobby Name" />
        </div>
        <br />

        <div className="form-row">
          <div className="form-group col">
            <label htmlFor="playerCount">Number of Players</label>
            <select id="playerCount" name="playerCount" className="form-control" >
              <option value={1} defaultChecked>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
          <div className="form-group col">
            <label htmlFor="cardCount">Difficulty</label>
            <select id="cardCount" name="cardCount" className="form-control" >
              <option value={16}>easy</option>
              <option value={48} defaultChecked>medium</option>
              <option value={72}>hard</option>
              <option value={4}>get out of here</option>
            </select>
          </div>
        </div>
        <br />
        <div className="row">
          <div className="col"><button className="btn-lg btn-block btn-secondary" onClick={() => { dispatch({type: "SWITCH_PAGE", payload: {pageIndex: 1}}) }} type="button">Join Game</button></div>
          <div className="col"><button className="btn-lg btn-block btn-primary" type="submit">Create Game</button></div>
        </div>
      </form>
    </div>
  )
}
export default NewGameForm;
