import React, { Suspense, useEffect } from "react";
import { SocketContext, socket } from './context/socket';

const Login = require('./components/login').default
const Nav = require('./components/nav').default
const GameManager = require('./components/gameManager').default
const useAuth = require('./hooks/useAuth').default

export default function App() {
  const [auth, setAuth] = useAuth()
  const authState = { auth: auth, setAuth: setAuth }

  let isMounted = false
  useEffect(() => {
    if (!isMounted) {
      isMounted = true
      let token = localStorage.getItem('jwt')
      if (token !== "undefined" && token) {
        console.log(token)
        fetch(`http://localhost:5000/api/users/me/${token}`)
          .then(response => response.json())
          .then(data => {
            if (!data.error) setAuth(true, data)
          })
      }
    }
    return () => { isMounted = false }
  }, [])

  return (
    <SocketContext.Provider value={socket}>
      <Suspense fallback={<div>Loading... </div>}>
        <Nav authState={authState} />
        {auth.isAuth
          ? <GameManager authState={authState} />
          : <Login authState={authState} />
        }
      </Suspense>
    </SocketContext.Provider>
  );
}


