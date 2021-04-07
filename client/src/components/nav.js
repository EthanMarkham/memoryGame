import React, { useState, useEffect } from 'react';

function Nav(props) {
  const { auth, dispatch } = props
  const [logoutBtn, showLogout] = useState(false)
  
  const Logout = () => {
    dispatch({type: "LOGOUT"})
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