import React, {
  } from 'react';
import {
    Link,
    useHistory
  } from "react-router-dom";
import {Button} from "react-bootstrap"

import './styles/nav.css';

function Nav(props){
  const history = useHistory();

  return(
  <nav>
    <h1> AOE2 MEMORY </h1>
    <div className="navItems">
      <div className="item">
        <Link to="/">Home</Link>
      </div>

      <div className="item">
        <Link to="/game">Game</Link>
      </div>
      <div className="item">
      {!props.isAuth ? 
        <Link to="/login">Login</Link>:
        <Button 
          className = "logoutBtn"
          onClick = {() => {
              localStorage.clear()
              props.setAuth(false)
              history.push('/login')
          }}>
          Logout
        </Button>

      }
      </div>

    </div>
  </nav>
  )
}


export default Nav