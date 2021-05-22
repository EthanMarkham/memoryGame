import { LiquidDistortionText  } from "react-text-fun";

export default function GameOver({ toggleLeaderboard, leaderboardInfo, leaveGame, game, me }) {
  const { round, users } = game;
  let rank, allTimeRank;

  if (leaderboardInfo.solo) {
    rank = leaderboardInfo.monthlyPos + ' out of ' + leaderboardInfo.monthlyCount;
    allTimeRank = leaderboardInfo.allTimePos + ' out of ' + leaderboardInfo.allTimeCount;

    //check for position stuff here and add in message
    return (
      <div className="gameover">
        <div className="title" id='gameOverMessage'>
          <LiquidDistortionText 
            text={"GAME OVER"}
            fontSize={40}
            speed={0.1}
            volatility={0.02}
            //generic
            fontFamily={"trajan-pro-3"}
            fill={"#d0a87d"}
            appendTo={'gameOverMessage'}
            paddingTop={10}
            paddingBottom={10}
            paddingLeft={20}
            paddingRight={20}
          />
        </div>
        <div className="gameStats">
          <span className="message">Nice Work! It took you <b>{round} attempts</b>!</span>
          <span className="message">You placed <b>{rank} </b> for monthly scores!</span>
          <span className="message">And <b>{allTimeRank} </b> for all time scores!</span>

        </div>
        <LeaderBoard
          scores={leaderboardInfo.monthlyOrAlltime == 0 ? leaderboardInfo.monthly : leaderboardInfo.allTime}
          title={leaderboardInfo.monthlyOrAlltime == 0 ? "Monthly" : "All Time"}
          toggle={() => leaderboardInfo.monthlyOrAlltime == 0 ? toggleLeaderboard(1) : toggleLeaderboard(0)} />

        <div className="buttonHolder">
          <button onClick={() => leaveGame()}>Leave Game</button>
        </div>
      </div>
    )
  }
  else {
    //leaderboardInfo = users.sort((u1, u2) => (u1.matches < u2.matches) ? -1 : 1)
    //rank = leaderboardInfo.findIndex(u => u.username === me) + 1;
    return (<div>I NEED TO MAKE DIFFERENT PAGE FOR MULTIPLAYER GAMES</div>)
  }
}

const LeaderBoard = ({ title, scores, toggle }) => {
  return (
    <div className="leaderboardContainer">
      <button className="btn btn-outline btn-block" onClick={() => toggle()} >{ }</button>
      <div className='leaderBoard'>
        <h2>{title}</h2>
        <div className='scores'>
          {scores.map((u, i) =>
            (<div className={u.myScore ? 'leaderBoardEntry myScore' : 'leaderBoardEntry'} key={`score${i}`}>#{i + 1}: {u.user} - {u.score} attempts</div>)
          )}
        </div>
      </div>
    </div>

  )
}