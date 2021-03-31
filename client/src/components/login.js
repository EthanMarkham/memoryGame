import React, { useState } from 'react';
import { login } from '../helpers'

function Login(props) {
    const { setAuth, setError, dispatch} = props
    const [user, setUser] = useState("")
    const [password, setPassword] = useState("")
    const [action, setAction] = useState("Login")

    const validateForm = () => {
        if (!user && !password) return false
        else return user.length > 0 && password.length > 0;
    }

    function handleSubmit(event) {
        event.preventDefault();
        //instead of strings we just use bool for action. if true we want to login, if false we want to register
        login({username: user, password: password}, action).then(data => dispatch({ type: "LOGIN", payload: data }))
    }

    function toggleMethod() {
        let nextAction = (action === 'login') ? 'register' : 'login'
        setAction(nextAction)
    }

    return (
        <div className="loginContainer">
            <form onSubmit={handleSubmit}>
                <div class="formGroup">
                    <label htmlFor="username">Username</label>
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
                    <label htmlFor="password">Password</label>
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
                            onClick={() => { toggleMethod() }}>{action === 'login' ? "Need an Account?" : "Have an Account?"}
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