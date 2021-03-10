import React, {useState, useEffect} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Game from './components/game/game';
var Login = require('./components/login').default
var Nav = require('./components/nav').default

export default function App() {
  const [isAuth, setAuth] = useState(false)


  //on launch check if we are logged in
  useEffect(() => {
    let token = localStorage.getItem('jwtToken');
    if (token) {
      fetch(`api/users/me/${token}`)
      .then(response => response.json())
      .then((data) => {
        if (data.username) {
          console.log(data)
          setAuth(true)
        }
        else {
          localStorage.clear() //if user not set we had error and get rid of the token
        }
      })
    }

  }, [])

  return (
    <Router>
      <div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Nav 
          isAuth={isAuth}
          setAuth={setAuth}
        />

        <Switch>
          <Route path="/login">
            <Login
              isAuth={isAuth}
              setAuth={setAuth}
            />
          </Route>
          <Route path="/game">
            <Game />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="container">
      <h2>Home</h2>
    </div>
  );
}


