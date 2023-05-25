import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";
import { ALL_AUTHORS } from "../queries";
import { LOGGED_USER } from "../queries";

const Recommendations = ({ token }) => {
    const [genre, setGenre] = useState();
    const filteredBooksQuery = useQuery(ALL_BOOKS, {
        variables: { genre },
        pollInterval: 2000,
    });
    const authorsQuery = useQuery(ALL_AUTHORS, {
        pollInterval: 2000,
    });
    const { data, loading } = useQuery(LOGGED_USER, {
        pollInterval: 2000,
    });

    useEffect(() => {
        if (!loading && data) {
            setGenre(data.me.favoriteGenre);
        }
    }, [loading, data]);

    if (!token) {
        return <div>No access without logging in</div>;
    }
    if (filteredBooksQuery.loading || authorsQuery.loading) {
        return null;
    }
    const filteredBooks = filteredBooksQuery.data.allBooks;
    const { allAuthors } = authorsQuery.data;
    return (
        <div>
            <h1>
                <b>recommendations</b>
            </h1>
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>author</th>
                        <th>published</th>
                    </tr>
                    {filteredBooks.map((a) => {
                        const author = allAuthors.find((author) => {
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
        </div>
    );
};
export default Recommendations;
