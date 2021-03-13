import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useHistory } from 'react-router-dom';
const Game = require('./components/game/game.function').default
const Login = require('./components/login').default
const Nav = require('./components/nav').default
const GameJoiner = require('./components/game/game.join').default

export default function Routes(props) {
  const history = useHistory();

  return (
    <Router>
      <Nav
        isAuth={props.isAuth}
        setAuth={props.setAuth}
      />
      {/*switch for the routes*/}
      <Switch>
        <Route path="/login">
          <Login
            isAuth={props.isAuth}
            setAuth={props.setAuth}
          />
        </Route>

        <Route path="/game">
          <Game
            isAuth={props.isAuth}
            history={history}
          />
        </Route>

        <Route path="/join">
          <GameJoiner isAuth={props.isAuth} />
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
