export default function GameOver(props) {
  const { round, users } = props.game;
  let leaderboardInfo = props.leaderboardInfo;
  let rank, allTimeRank

  if (leaderboardInfo.solo) {
    leaderboardInfo = props.leaderboardInfo;
    rank = props.leaderboardInfo.monthlyPos + ' out of ' + props.leaderboardInfo.monthlyCount;
    allTimeRank = props.leaderboardInfo.allTimePos + ' out of ' + props.leaderboardInfo.allTimeCount;

    //check for position stuff here and add in message
    return (
      <div className="gameover">
        <header className="header"><h1>Game Over!</h1></header>
        <div className="gameStats">
          <span className="message">Nice Work! It took you <b>{round} attempts</b>!</span>
          <span className="message">You placed <b>{rank} </b> for monthly scores!</span>
          <span className="message">And <b>{allTimeRank} </b> for all time scores!</span>

        </div>
        <div id='monthly' className='leaderBoard'>
          <h2>Monthly Top 100</h2>
          <div className='scores'>
            {leaderboardInfo.monthly.map((u, i) =>
              (<div className={u.myScore ? 'leaderBoardEntry myScore' : 'leaderBoardEntry'} key={`score${i}`}>#{i + 1}: {u.user} - {u.score} attempts</div>)
            )}
          </div>
        </div>
        <div id='allTime' className='leaderBoard'>
          <h2>All Time Top 100</h2>
          <div className='scores'>
            {leaderboardInfo.allTime.map((u, i) =>
              (<div className={u.myScore ? 'leaderBoardEntry myScore' : 'leaderBoardEntry'} key={`score${i}`}>#{i + 1}: {u.user} - {u.score} attempts</div>)
            )}
          </div>
        </div>

        <div className="buttonHolder">
          <button onClick={() => props.leaveGame()}>Leave Game</button>
        </div>
      </div>
    )
  }
  else {
    //leaderboardInfo = users.sort((u1, u2) => (u1.matches < u2.matches) ? -1 : 1)
    //rank = leaderboardInfo.findIndex(u => u.username === props.me) + 1;
    return (<div>I NEED TO MAKE DIFFERENT PAGE FOR MULTIPLAYER GAMES</div>)
  }
}
