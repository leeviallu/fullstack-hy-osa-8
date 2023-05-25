import { Fragment, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useApolloClient, useSubscription } from "@apollo/client";
import Authors from "./components/Authors";
import Books from "./components/Books";
import AddBook from "./components/AddBook";
import Login from "./components/Login";
import Recommendations from "./components/Recommendations";
import { ALL_BOOKS } from "./queries";
import { BOOK_ADDED } from "./queries";

// function that takes care of manipulating cache
export const updateCache = (cache, query, addedBook) => {
    // helper that is used to eliminate saving same person twice
    const uniqByName = (a) => {
        let seen = new Set();
        return a.filter((item) => {
            let k = item.name;
            return seen.has(k) ? false : seen.add(k);
        });
    };
    cache.updateQuery(query, ({ allBooks }) => {
        return {
            allBooks: uniqByName(allBooks.concat(addedBook)),
        };
    });
};

const App = () => {
    const [token, setToken] = useState(null);
    const client = useApolloClient();

    useSubscription(BOOK_ADDED, {
        onData: ({ data }) => {
            const addedBook = data.data.bookAdded;
            updateCache(client.cache, { query: ALL_BOOKS }, addedBook);
        },
    });

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
