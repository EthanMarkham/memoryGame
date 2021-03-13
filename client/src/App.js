import React, { useState, useEffect } from "react";

const Routes = require('./routes').default

export default function App() {
  const [isAuth, setAuth] = useState(true)

  //on launch check if we are logged in
  useEffect(() => {
    let token = localStorage.getItem('jwtToken');
    if (token) {
      fetch(`http://localhost:5000/api/users/me/${token}`)
        .then(response => response.json())
        .then((data) => {
          if (data.username) {
            console.log(data)
            localStorage.setItem('username', data.username)
          }
          else {
            setAuth(false)
            localStorage.clear() //if user not set we had error and get rid of the token
          }
        })
    }
  }, [])
  //when they log in/out make new socket connect with creds

  return (
    <Routes
      isAuth={isAuth}
      setAuth={setAuth}
    ></Routes>
  )
}
