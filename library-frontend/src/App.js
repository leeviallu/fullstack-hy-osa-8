import { Routes, Route, Link } from "react-router-dom";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";

const App = () => {
    return (
        <div>
            <div>
                <Link to="/authors">authors</Link>
                <Link to="/books">books</Link>
                <Link to="/newbook">newbook</Link>
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
