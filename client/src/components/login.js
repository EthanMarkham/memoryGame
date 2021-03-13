import React, { useState, useEffect } from "react";
import "./styles/login.css";
import { Alert, Form, Row, Col, Button } from "react-bootstrap"
import { useHistory } from "react-router-dom";

function Login(props) {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null)
    const [action, setAction] = useState(true)
    const history = useHistory();

    //if logged in get out of here
    if (props.isAuth) history.push("/game");

    const validateForm = () => {
        if (!username && !password) return false
        else return username.length > 0 && password.length > 0;
    }

    function handleSubmit(event) {
        event.preventDefault();
        //instead of strings we just use bool for action. if true we want to login, if false we want to register
        let url = action ? "http://localhost:5000/api/users/login" : "http://localhost:5000/api/users/register"
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
            body: JSON.stringify({ username: username, password: password }) // body data type must match "Content-Type" header
        })
            .then(response => response.json())
            .then((data) => {
                console.log(data)
                if (data.error) {
                    setError(data)
                    return
                } else {
                    setError(null) //else set errors to nada so we dont render old ones
                    localStorage.setItem('jwtToken', data.token);
                    props.setAuth(true);
                    //history.push("/game");
                }
            })

    }

    useEffect(() => {
        //let user = localStorage.getItem('user');
        //if(!user) user = JSON.parse(user)
        //console.log(user);
    }, [])

    return (
        <div className="loginContainer">
            <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger"><b>Error!</b> <ul>{error.messages.map(e => <li>{e}</li>)}</ul></Alert>}
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter username"
                        onChange={(event) => { setUserName(event.target.value) }}
                        value={username}
                    />
                    <Form.Text className="text-muted">
                        Min. Requirement: 4
                    </Form.Text>
                    <Form.Text className="text-muted">
                        Appropriate or <b>BANNED</b>
                    </Form.Text>
                </Form.Group>
                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        onChange={(event) => { setPassword(event.target.value) }}
                        value={password}
                    />
                    <Form.Text className="text-muted">
                        Min. Requirement: 4
                    </Form.Text>
                </Form.Group>
                <br />
                <Row>
                    <Col>
                        <Button
                            variant="outline-secondary"
                            onClick={() => { setAction(!action) }}>{action ? "Need an Account?" : "Already have an Account?"}
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={!validateForm()}
                            block
                        >
                            {action ? "Login" : "Register"}
                        </Button>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}
export default Login