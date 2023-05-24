import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";
import { ALL_AUTHORS } from "../queries";

const Books = () => {
    const booksQuery = useQuery(ALL_BOOKS, {
        pollInterval: 2000,
    });
    const authorsQuery = useQuery(ALL_AUTHORS, {
        pollInterval: 2000,
    });
    if (booksQuery.loading || authorsQuery.loading) {
        return null;
    }
    const books = booksQuery.data.allBooks;
    const authors = authorsQuery.data.allAuthors;
    return (
        <div>
            <h2>books</h2>

            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>author</th>
                        <th>published</th>
                    </tr>
                    {books.map((a) => {
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
        </div>
    );
};

export default Books;
