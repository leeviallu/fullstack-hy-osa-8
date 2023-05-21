import { Routes, Route, Link } from "react-router-dom";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";

const App = () => {
    return (
        <div>
            <div>
                <button>
                    <Link to="/authors">authors</Link>
                </button>
                <button>
                    <Link to="/books">books</Link>
                </button>
                <button>
                    <Link to="/newbook">newbook</Link>
                </button>
            </div>
            <Routes>
                <Route path="/authors" element={<Authors />} />
                <Route path="/books" element={<Books />} />
                <Route path="/newbook" element={<NewBook />} />
            </Routes>
        </div>
    );
};

export default App;
