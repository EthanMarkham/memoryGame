import React  from 'react';
import { Button } from "react-bootstrap"
import '../styles/nav.css';


function Nav(props) {
  const { auth, setAuth } = props.authState
  const Logout = () => {
    setAuth(false)
  }
  return (
    <nav>
      <h1> AOE2 MEMORY </h1>
      {auth.isAuth ??
        <div className="navItems">
          <div className="item">
            <Button className="logoutBtn" onClick={Logout}>Logout</Button>
          </div>
        </div>
      }
    </nav>
  )
}

export default Nav