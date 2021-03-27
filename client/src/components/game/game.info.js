import React, { useEffect, useRef } from 'react';
import { useSprings, animated, interpolate } from 'react-spring'
const reOrder = (order) => index => ({ y: order.indexOf(index) * 100, scale: 1, zIndex: '0', shadow: 1, immediate: false })

function GameInfo(props) {
  const { me, message, setLabels, users, round, handleQuit } = props
  const userOrder = useRef(users.sort((u1, u2) => (u1.matches < u2.matches) ? -1 : 1))
  const [springs, setSprings] = useSprings(users.length, reOrder(userOrder.current))
  useEffect(() => {
    setSprings(userOrder)
  }, [userOrder])
  return (
    <div className="gameInfo">
      <div className="gameStats">
        <div className="stat">{message}</div>
        <div className="stat" > Attempts: {round}</div>
      </div>
      <div className="gameControl">
        <button
          className="gameButton btn"
          onClick={() => setLabels()}>Toggle Labels</button>

        <button
          className="gameButton btn"
          onClick={() => { if (window.confirm('Are you sure you wish to leave this game?')) handleQuit() }}>FF 11</button>
      </div>

      <div className="userStats">
        {springs.map(({ zIndex, shadow, y, scale }, i) => (
          <animated.div
            className="userStat"
            items={users}
            key={i}
            style={{
              zIndex,
              boxShadow: shadow.interpolate(s => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`),
              //transform: interpolate([y, scale], (y, s) => `translate3d(0,${y}px,0) scale(${s})`)
            }}
          > <div style={{ backgroundColor: users[i].color }} className="userColor" /><div className="userText">{users[i].username} - Matches: {users[i].matches}</div>
          </animated.div>
        ))}
      </div>

    </div>
  )
}


export default GameInfo;
