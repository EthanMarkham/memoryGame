import React, { useState, useEffect } from 'react';
import {Link, useHistory} from "react-router-dom";
import { Button } from "react-bootstrap"
import { useLocalStorage } from "../hooks/useLocalStorage";
import '../styles/nav.css';


function Nav(props) {
  const history = useHistory();
  const [jwt, setJWT] = useLocalStorage("jwt", localStorage.getItem('jwt'));

  useEffect(() => {

  }, [jwt, setJWT])

  const Logout = () => {
    localStorage.setItem('jwt', '')
    setJWT('')
    history.push('/login')
  }
  return (
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
          {jwt === ''
           ? <Link to="/login">Login</Link>
           : <Button
              className="logoutBtn"
              onClick={() => Logout()}>
              Logout
            </Button>

          }
        </div>

      </div>
    </nav>
  )
}


export default Nav