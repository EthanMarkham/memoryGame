import React, { useEffect, useRef, useState } from 'react';
import { useSprings, animated, interpolate } from 'react-spring'

const reOrder = (order) => index => ({ y: order.indexOf(index) * 100, scale: 1, zIndex: '0', shadow: 1, immediate: false })

function GameInfo(props) {
  const { me, message, setLabels, users, round, handleQuit } = props
  const [leaveLabel, setLeaveLabel] = useState(false)
  const [labelLabel, setLabelLabel] = useState(false)
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

      <div className="userStats col-5">
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

      <div className="gameControl">
        <div className="gameButton">
          <button
            id="showLabels"
            onMouseOver={() => setLabelLabel(true) }
            onMouseLeave={() =>setLabelLabel(false)}
            className="btn"
            onClick={() => setLabels()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" className="bi bi-info-square" viewBox="0 0 16 16">
              <g fill="currentColor">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                <path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
              </g>
            </svg>
            {labelLabel && <label htmlFor="showLabels">Show Labels</label>}
          </button>
        </div>
        <div
          className="gameButton">
          <button
            className="btn"
            onMouseOver={() => setLeaveLabel(true) }
            onMouseLeave={() =>setLeaveLabel(false)}
            onClick={() => { if (window.confirm('Are you sure you wish to leave this game?')) handleQuit() }}>
            <svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 24 24" width="1.5em"><path d="M0 0h24v24H0z" fill="none" />
              <g fill="currentColor">
                <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
              </g></svg>
              {leaveLabel && <label htmlFor="showLabels">Leave Game</label>}
          </button>
        </div>
      </div>
    </div>
  )
}


export default GameInfo;
