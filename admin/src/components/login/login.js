import React, { useState } from 'react';
import { login } from '../../helpers/ajax'

function Login({ state, dispatch, actions }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const validateForm = () => {
        if (!username && !password) return false
        else return username.length > 0 && password.length > 0;
    }
    function handleSubmit(event) {
        event.preventDefault();
        //instead of strings we just use bool for action. if true we want to login, if false we want to register
        login({ username: username, password: password }).then(data => dispatch({ type: "LOGIN", payload: data }))
            .catch(e => dispatch({ type: "ERROR", payload: e }))
    }
    return (
        <>
            <form className="loginForm" onSubmit={handleSubmit}>
                <h1>Login</h1>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        placeholder="Enter user"
                        onChange={(event) => { setUsername(event.target.value) }}
                        value={username}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Password"
                        onChange={(event) => { setPassword(event.target.value) }}
                        value={password}
                    />
                </div>
                <br />
                <div className="row justify-content-center">
                    <div className="col-6">
                        <button
                            className="loginBtn"
                            type="submit"
                            disabled={!validateForm()}
                        > Login
                        </button>
                    </div>
                </div>
            </form>
        </>
    )
}
export default Login