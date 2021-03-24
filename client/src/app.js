import React, { useEffect, useState } from "react";
import Loader from "react-loader-spinner";
import { SocketContext, socket } from './context/socket';

const useAuth = require('./hooks/useAuth').default

const Login = require('./components/login').default
const Nav = require('./components/nav').default
const GameManager = require('./components/gameManager').default


export default function App() {
  const [auth, setAuth] = useAuth()
  const authState = { auth: auth, setAuth: setAuth }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let token = localStorage.getItem('jwt')
    if (token !== "undefined" && token) {
      console.log(token)
      fetch(`http://localhost:5000/api/users/me/${token}`)
        .then(response => response.json())
        .then(data => {
          console.log(data)
          if (!data.error) {
            setAuth(true, data)
            socket.emit('LOGIN', token)
          }
          else setAuth(false)
          setLoading(false)
        })
    }
    else {
      setLoading(false)
      setAuth(false)
    }
    socket.on("AUTH_ERROR", () => { setAuth(false) })
    return () => {
      socket.off("AUTH_ERROR", () => { setAuth(false) })
    }
  }, [])

  return (<SocketContext.Provider value={socket}>
    <Nav authState={authState} />
    {loading && <Loader className="loader" type="Rings" color="#00BFFF" height={80} width={80} />}
    {(!loading && !auth.isAuth) && <Login authState={authState} />}
    {(!loading && auth.isAuth) && <GameManager authState={authState} />}
  </SocketContext.Provider>)
}

