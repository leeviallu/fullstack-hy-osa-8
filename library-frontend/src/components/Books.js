import { useState } from "react";
import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";
import { ALL_AUTHORS } from "../queries";

const Books = () => {
    const [genre, setGenre] = useState("");
    const allGenres = [];
    const allBooksQuery = useQuery(ALL_BOOKS, {
        pollInterval: 2000,
    });
    const filteredBooksQuery = useQuery(ALL_BOOKS, {
        variables: { genre },
        pollInterval: 2000,
    });
    const authorsQuery = useQuery(ALL_AUTHORS, {
        pollInterval: 2000,
    });
    if (
        allBooksQuery.loading ||
        filteredBooksQuery.loading ||
        authorsQuery.loading
    ) {
        return null;
    }
    const filteredBooks = filteredBooksQuery.data.allBooks;
    const authors = authorsQuery.data.allAuthors;
    const { allBooks } = allBooksQuery.data;
    allBooks.forEach((book) => {
        book.genres.forEach((genre) => {
            if (!allGenres.includes(genre)) {
                allGenres.push(genre);
            }
        });
    });
    return (
        <div>
            <h2>books</h2>
            {genre ? (
                <p>
                    in genre <b>{genre}</b>
                </p>
            ) : null}
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>author</th>
                        <th>published</th>
                    </tr>
                    {filteredBooks.map((a) => {
                        const author = authors.find((author) => {
                            return a.author === author.id;
                        });
                        return (
                            <tr key={a.title}>
                                <td>{a.title}</td>
                                <td>{author.name}</td>
                                <td>{a.published}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {allGenres.map((genre, i) => {
                return (
                    <button key={i} onClick={() => setGenre(genre)}>
                        {genre}
                    </button>
                );
            })}
            <button onClick={() => setGenre("")}>all genres</button>
        </div>
    );
};

export default Books;
