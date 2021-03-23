import React, { useState, useEffect } from 'react';
import { Button } from "react-bootstrap"

function Nav(props) {
  const { auth, setAuth } = props.authState
  const [logoutBtn, showLogout] = useState(false)
  const Logout = () => {
    setAuth(false)
  }
  useEffect(() => {
    if (auth.isAuth) showLogout(true)
  }, [auth, showLogout])

  const logOut = <div className="item"><div className="logoutBtn btn" onClick={Logout}>Logout</div>
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