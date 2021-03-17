import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useHistory } from 'react-router-dom';

const Game = require('./game/game.function').default
const Login = require('./login').default
const Nav = require('./nav').default
const GameJoiner = require('./game/game.join').default

export default function Routes(props) {
  const history = useHistory();
  return (
    <Router>
      <Nav />
      {/*switch for the routes*/}
      <Switch>
        <Route path="/login">
          <Login />
        </Route>

        <Route path="/game">
          <Game />
        </Route>

        <Route path="/join">
          <GameJoiner/>
        </Route>

        <Route path="/">
          <Home />
        </Route>
      </Switch>
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
