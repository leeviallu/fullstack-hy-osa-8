import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";
import Select from "react-select";

const Authors = () => {
    const [name, setName] = useState("");
    const [born, setBorn] = useState("");
    const [editAuthor] = useMutation(EDIT_AUTHOR);

    const submit = async (event) => {
        event.preventDefault();
        editAuthor({ variables: { name, born } });
        setName("");
        setBorn("");
    };
    const result = useQuery(ALL_AUTHORS, {
        pollInterval: 2000,
    });
    if (result.loading) {
        return null;
    }
    const authors = result.data.allAuthors;
    const nameOptions = [];
    authors.map((author) =>
        nameOptions.push({ value: author.name, label: author.name })
    );
    return (
        <div>
            <h2>authors</h2>
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>born</th>
                        <th>books</th>
                    </tr>
                    {authors.map((a) => (
                        <tr key={a.name}>
                            <td>{a.name}</td>
                            <td>{a.born}</td>
                            <td>{a.bookCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <form onSubmit={submit}>
                <div>
                    name
                    <Select
                        className="basic-single"
                        classNamePrefix="select"
                        isClearable={true}
                        isSearchable={true}
                        options={nameOptions}
                        onChange={(selected) => {
                            setName(selected.value);
                        }}
                    />
                </div>
                <div>
                    born
                    <input
                        value={born}
                        onChange={({ target }) => setBorn(Number(target.value))}
                    />
                </div>
                <button type="submit">edit author</button>
            </form>
        </div>
    );
};

export default Authors;
