import React, { useState, useContext } from 'react';
import { SocketContext } from '../context/socket';

function Login(props) {
    const { setAuth, setError, error } = props
    const socket = useContext(SocketContext);
    
    const [user, setUser] = useState("")
    const [password, setPassword] = useState("")
    const [action, setAction] = useState("Login")

    const validateForm = () => {
        if (!user && !password) return false
        else return user.length > 0 && password.length > 0;
    }

    function handleSubmit(event,) {
        event.preventDefault();
        //instead of strings we just use bool for action. if true we want to login, if false we want to register
        let url = (action === 'login') ? "http://localhost:5000/api/users/login" : "http://localhost:5000/api/users/register"
        fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({ username: user, password: password }) // body data type must match "Content-Type" header
        })
            .then(response => response.json())
            .then((data) => {
                console.log(data)
                if (data.error) setError(data.message)
                else {
                    socket.emit("LOGIN", data.token)
                    setAuth(true, data)
                }
            })
    }

    function toggleMethod() {
        let nextAction = (action === 'login') ? 'register' : 'login'
        setAction(nextAction)
    }

    return (
        <div className="loginContainer">
            <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger"><b>Error!</b> {error}</div>}
                <div class="formGroup">
                    <label for="username">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        placeholder="Enter user"
                        onChange={(event) => { setUser(event.target.value) }}
                        value={user}
                    />
                    <small className="text-muted form-text text-muted">Min. Requirement: 4</small>
                    <small className="text-muted form-text text-muted">Appropriate or <b>BANNED</b></small>
                </div>
                <div class="formGroup">
                    <label for="password">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Password"
                        onChange={(event) => { setPassword(event.target.value) }}
                        value={password}
                    />
                    <small className="text-muted form-text text-muted">Min. Requirement: 4</small>
                </div>
                <br />
                <div className="row">
                    <div className="col-6">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => { toggleMethod() }}>{action === 'login' ? "Have an Account?" : "Need an Account?"}
                        </button>
                    </div>
                    <div className="col-6">
                        <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={!validateForm()}
                            block
                        >
                            {action === 'login' ? "Login" : "Register"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
export default Login