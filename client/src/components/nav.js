import React, { useState, useEffect, useContext } from 'react';
import {SocketContext} from '../context/socket';

function Nav(props) {
  const { auth, setAuth } = props.authState
  const socket = useContext(SocketContext);
  const [logoutBtn, showLogout] = useState(false)
  const Logout = () => {
    socket.emit("LOGOUT")
    setAuth(false)
  }
  useEffect(() => {
    if (auth.isAuth) showLogout(true)
  }, [auth, showLogout])

  const logOut = <div className="btn item"><div className="logoutBtn btn" onClick={Logout}>Logout</div>
  </div>
  return (
    <nav>
      <h1> AOE2 MEMORY </h1>
      <div className="navItems">
        {logoutBtn ? logOut : ' '}
        </div>
    </nav>
  )
}

export default Nav