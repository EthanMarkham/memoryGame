export const GameCreator = ({ gameName, cardCount, playerCount, setGameName, setCardCount, setPlayerCount, toggleAction, handleSubmit  }) => {
    return (<div className="pregameContainer">
        <h2>ENTER GAME INFO</h2>

        <div className="inputForm">

            <div className="row">
                <div id='nameInput' className="form-group col">
                    <label id='nameLabel' htmlFor="name">NAME</label>
                    <input type="text" autocomplete="off" id="name" placeholder="LOBBY NAME" onChange={event => { setGameName(event.target.value) }} value={gameName} />
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
                <button className="btn btn-outline btn-block" onClick={() => toggleAction(1)} type="button">LIST OPEN GAMES</button>
                <button className="btn btn-block" onClick={() => handleSubmit()} disabled={gameName === ""}>START GAME</button>
            </div>
        </div>
    </div>)
}