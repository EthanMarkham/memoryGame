import React, { useContext } from 'react';
import {SocketContext} from '../context/socket';

function Nav(props) {
  const {setAuth, auth} = props
  const socket = useContext(SocketContext);
  
  const Logout = () => {
    socket.emit("LOGOUT")
    setAuth(false)
  }

  return (
    <nav>
      <h1> AOE2 MEMORY </h1>
      <div className="navItems">
        {auth.isAuth && <div className="btn item"><div className="logoutBtn btn" onClick={Logout}>Logout</div></div>}
      </div>
    </nav>
  )
}

export default Nav