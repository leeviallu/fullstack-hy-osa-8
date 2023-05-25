import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_BOOK } from "../queries";
import { ALL_BOOKS } from "../queries";
import { updateCache } from "../App";

const AddBook = ({ token }) => {
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [published, setPublished] = useState("");
    const [genre, setGenre] = useState("");
    const [genres, setGenres] = useState([]);
    const [createBook] = useMutation(CREATE_BOOK, {
        update: (cache, response) => {
            updateCache(cache, { query: ALL_BOOKS }, response.data.addBook);
        },
    });

    const submit = async (event) => {
        event.preventDefault();
        createBook({ variables: { title, author, published, genres } });
        setTitle("");
        setPublished("");
        setAuthor("");
        setGenres([]);
        setGenre("");
    };

    const addGenre = () => {
        setGenres(genres.concat(genre));
        setGenre("");
    };

    if (!token) {
        return <div>No access without logging in</div>;
    }

    return (
        <div>
            <form onSubmit={submit}>
                <div>
                    title
                    <input
                        value={title}
                        onChange={({ target }) => setTitle(target.value)}
                    />
                </div>
                <div>
                    author
                    <input
                        value={author}
                        onChange={({ target }) => setAuthor(target.value)}
                    />
                </div>
                <div>
                    published
                    <input
                        type="number"
                        value={published}
                        onChange={({ target }) =>
                            setPublished(Number(target.value))
                        }
                    />
                </div>
                <div>
                    <input
                        value={genre}
                        onChange={({ target }) => setGenre(target.value)}
                    />
                    <button onClick={addGenre} type="button">
                        add genre
                    </button>
                </div>
                <div>genres: {genres.join(" ")}</div>
                <button type="submit">create book</button>
            </form>
        </div>
    );
};

export default AddBook;
