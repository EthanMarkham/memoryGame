import React, { useState } from 'react';
import { login } from '../../helpers/helpers'

function Login(props) {
    const { dispatch } = props;
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [action, setAction] = useState("login");

    const validateForm = () => {
        if (!user && !password) return false
        else return user.length > 3 && password.length > 3 && user.length < 13 && password.length < 13;
    };

    function handleSubmit(event) {
        event.preventDefault();
        //instead of strings we just use bool for action. if true we want to login, if false we want to register
        if (validateForm()) {
            login({ username: user, password: password }, action).then(data => dispatch({ type: "LOGIN", payload: data }))
            .catch(e => dispatch({ type: "ERROR", payload: e }))
        } else {
            let outputMsg = '';
            let validUsername = (user.length > 3 && user.length < 13)
            let validPassword = (password.length > 3 && password.length < 13)
            if (!validUsername && !validPassword) outputMsg = "Username and Password requirements not met";
            else if (!validPassword) outputMsg = "Password requirements not met";
            else if (!validUsername) outputMsg = "Username requirements not met";
            dispatch({ type: "ERROR", payload: outputMsg });
        }
    };

    function toggleMethod() {
        let nextAction = (action === 'login') ? 'register' : 'login'
        setAction(nextAction)
    };

    return (
        <div className="loginContainer">
            <form onSubmit={handleSubmit}>
                <div className="formGroup">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        placeholder="Enter user"
                        onChange={(event) => { setUser(event.target.value) }}
                        value={user}
                    />
                    <small className="text-muted form-text text-muted">Length: 4-12</small>
                    <small className="text-muted form-text text-muted">Appropriate or <b>BANNED</b></small>
                </div>
                <div className="formGroup">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Password"
                        onChange={(event) => { setPassword(event.target.value) }}
                        value={password}
                    />
                    <small className="text-muted form-text text-muted">Length: 4-12</small>
                </div>
                <br />
                <div className="row">
                    <div className="col-6">
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-block"
                            onClick={() => { toggleMethod() }}>{action === 'login' ? "Need an Account?" : "Have an Account?"}
                        </button>
                    </div>
                    <div className="col-6">
                        <button
                            className="btn btn-primary btn-block"
                            type="submit"
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