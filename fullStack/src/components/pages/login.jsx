import React from 'react';

function Login(props) {
    const { dispatch } = props

    function handleSubmit(event) {
        event.preventDefault();
        let username = e.target.username.value;
        let password = e.target.password.value;
        let action = 'register'; //fix this
        if (username.length < 4 || password.length < 4) dispatch({ type: "ERROR", payload: "Check your requirements" });
        //instead of strings we just use bool for action. if true we want to login, if false we want to register
        else {
            login({ username: user, password: password }, action).then(data => dispatch({ type: "LOGIN", payload: data }))
                .catch(e => dispatch({ type: "ERROR", payload: e }))
        }
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
                        name="username"
                        placeholder="Enter user"
                        onChange={(event) => { setUser(event.target.value) }}
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
                        name="password"
                        placeholder="Password"
                        onChange={(event) => { setPassword(event.target.value) }}
                    />
                    <small className="text-muted form-text text-muted">Min. Requirement: 4</small>
                </div>
                <br />
                <div className="row">
                    <div className="col-6">
                        {/*<button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => { toggleMethod() }}>{action === 'login' ? "Need an Account?" : "Have an Account?"}
                        </button>*/}
                    </div>
                    <div className="col-6">
                        <button
                            className="btn btn-primary"
                            type="submit"
                            block
                        >
                            Register
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
export default Login