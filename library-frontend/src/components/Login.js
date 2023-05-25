import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../queries";

const Login = ({ setToken }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [login, result] = useMutation(LOGIN, {
        onError: (error) => {
            console.error(error);
        },
    });

    useEffect(() => {
        if (result.data) {
            const token = result.data.login.value;
            setToken(token);
            localStorage.setItem("library-user-token", token);
        }
    }, [result.data]); // eslint-disable-line

    const submit = async (event) => {
        event.preventDefault();

        login({ variables: { username, password } });
        setUsername("");
        setPassword("");
    };
    return (
        <form onSubmit={submit}>
            name
            <input
                type="text"
                name="Username"
                value={username}
                onChange={({ target }) => {
                    setUsername(target.value);
                }}
            />
            <br />
            password
            <input
                type="password"
                name="Password"
                value={password}
                onChange={({ target }) => {
                    setPassword(target.value);
                }}
            />
            <br />
            <button type="submit">login</button>
        </form>
    );
};
export default Login;
