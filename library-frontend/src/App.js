import { Fragment, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useApolloClient } from "@apollo/client";
import Authors from "./components/Authors";
import Books from "./components/Books";
import AddBook from "./components/AddBook";
import Login from "./components/Login";
import Recommendations from "./components/Recommendations";

const App = () => {
    const [token, setToken] = useState(null);
    const client = useApolloClient();

    const logout = () => {
        setToken(null);
        localStorage.clear();
        client.resetStore();
    };
    return (
        <div>
            <div>
                <button>
                    <Link to="/authors">authors</Link>
                </button>
                <button>
                    <Link to="/books">books</Link>
                </button>
                {token ? (
                    <Fragment>
                        <button>
                            <Link to="/addbook">add book</Link>
                        </button>
                        <button>
                            <Link to="/recommendations">recommendations</Link>
                        </button>
                        <button onClick={logout}>logout</button>
                    </Fragment>
                ) : (
                    <button>
                        <Link to="/login">log in</Link>
                    </button>
                )}
            </div>
            <Routes>
                <Route path="/authors" element={<Authors token={token} />} />
                <Route path="/books" element={<Books />} />
                <Route path="/addbook" element={<AddBook token={token} />} />
                <Route
                    path="/recommendations"
                    element={<Recommendations token={token} />}
                />
                <Route path="/login" element={<Login setToken={setToken} />} />
            </Routes>
        </div>
    );
};

export default App;
