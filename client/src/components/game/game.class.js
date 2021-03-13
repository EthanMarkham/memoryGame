import React from 'react';
import { Alert, Button } from "react-bootstrap"
import '../styles/game.css';
import { socket } from "../../service/socket"
import { withRouter } from 'react-router-dom';

var Board = require('./game.board').default
var GameInfo = require('./game.info').default

class GameClass extends React.Component {
    constructor(props) {
        console.log(props)
        super(props)
        this.state = {
            squares: [],
            users: [],
            message: "",
            round: 0,
            error: [],
            inProgress: false,
            id: "",
            showLabels: true,
        }
        this.auth = props.isAuth
        if (!this.auth) props.history.push("/login");
    }

    toggleLabels() {
        const newLabels = !this.state.showLabels
        this.setState({ showLabels: newLabels })
    }
    componentDidMount() {
        const history = this.props.history
        //ask for our game with token
        socket.emit("joinGameChannel")
        //we should get response with game data
        socket.on("gameInfo", data => {
            console.log('Getting Game info')
            if (data.error) if (data.error.game) history.push("/join")
            else this.setState({
                squares: data.squares,
                users: data.users,
                message: data.message,
                round: data.round,
                inProgress: data.inProgress,
            })
            console.log(this.state)
        })
        socket.on("error", data => {
            console.log(data)
            this.setState({ error: data.error })
        })
    }
    render(props) {
        const toggleLabels = this.toggleLabels
        const {squares, showLabels, message, round, users, error, inProgress} = this.state
        const upNext = users.find(u=>u.upNext)
        const history = this.props.history

        if (!squares) {
            return (
                <div className="game">
                    <Board
                        squares={squares}
                        showLabels={showLabels}
                        playerTurn={upNext}
                    />
                    <GameInfo
                        round={round}
                        message={message}
                        showLabels={showLabels}
                        setLabels={toggleLabels}
                    />
                </div>
            )
        }
        else return (
            <div>
                <Alert variant="danger"> {error.message} </Alert>
                <Button
                    variant="outline-secondary"
                    onClick={() => { history.push('/join') }}>
                    Join Game
                </Button>
            </div>
        )
    }
}

export default GameClass;