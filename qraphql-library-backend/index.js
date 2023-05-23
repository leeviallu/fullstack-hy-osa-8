const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid } = require("uuid");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Author = require("./models/author");
const Book = require("./models/book");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log("connecting to", MONGODB_URI);

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("connected to MongoDB");
    })
    .catch((error) => {
        console.log("error connection to MongoDB:", error.message);
    });

let authors = [
    {
        name: "Robert Martin",
        id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
        born: 1952,
    },
    {
        name: "Martin Fowler",
        id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
        born: 1963,
    },
    {
        name: "Fyodor Dostoevsky",
        id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
        born: 1821,
    },
    {
        name: "Joshua Kerievsky",
        id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
    },
    {
        name: "Sandi Metz",
        id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
    },
];

let books = [
    {
        title: "Clean Code",
        published: 2008,
        author: "Robert Martin",
        id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
        genres: ["refactoring"],
    },
    {
        title: "Agile software development",
        published: 2002,
        author: "Robert Martin",
        id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
        genres: ["agile", "patterns", "design"],
    },
    {
        title: "Refactoring, edition 2",
        published: 2018,
        author: "Martin Fowler",
        id: "afa5de00-344d-11e9-a414-719c6709cf3e",
        genres: ["refactoring"],
    },
    {
        title: "Refactoring to patterns",
        published: 2008,
        author: "Joshua Kerievsky",
        id: "afa5de01-344d-11e9-a414-719c6709cf3e",
        genres: ["refactoring", "patterns"],
    },
    {
        title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
        published: 2012,
        author: "Sandi Metz",
        id: "afa5de02-344d-11e9-a414-719c6709cf3e",
        genres: ["refactoring", "design"],
    },
    {
        title: "Crime and punishment",
        published: 1866,
        author: "Fyodor Dostoevsky",
        id: "afa5de03-344d-11e9-a414-719c6709cf3e",
        genres: ["classic", "crime"],
    },
    {
        title: "The Demon ",
        published: 1872,
        author: "Fyodor Dostoevsky",
        id: "afa5de04-344d-11e9-a414-719c6709cf3e",
        genres: ["classic", "revolution"],
    },
];

const typeDefs = `
  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }
  type Book {
    title: String
    author: String
    published: Int
    genres: [String]
    id: ID!
  }
  type Author {
    name: String
    bookCount: Int
    id: String
    born: Int
  }
  type Mutation {
    addBook(
        title: String!
        author: String!
        published: Int!
        genres: [String!]
        ): Book
    editAuthor(
        name: String!
        setBornTo: Int!
    ) : Author
  }
`;

const resolvers = {
    Query: {
        bookCount: () => Book.collection.countDocuments(),
        authorCount: () => Author.collection.countDocuments(),
        allBooks: (root, args) => {
            if (!args.author && !args.genre) {
                return books;
            }
            const byAuthor = (book) =>
                args.author === book.author ? book.author : !book.author;

            const byGenre = (book) => {
                for (key in book.genres) {
                    if (book.genres[key].includes(args.genre)) {
                        return book;
                    }
                }
            };

            if (
                !(
                    args.author === undefined ||
                    args.author === null ||
                    args.genre === undefined ||
                    args.genre === null
                )
            ) {
                const filterByAuthor = books.filter(byAuthor);
                const filterByGenre = filterByAuthor.filter(byGenre);
                return filterByGenre;
            }
            if (!(args.author === undefined || args.author === null)) {
                return books.filter(byAuthor);
            }
            if (!(args.genre === undefined || args.genre === null)) {
                return books.filter(byGenre);
            }
        },
        allAuthors: () => authors,
    },
    Author: {
        name: (root) => root.name,
        bookCount: (root) => {
            const authorBooks = books.filter(
                (book) => book.author === root.name
            );
            return authorBooks.length;
        },
        id: (root) => root.id,
        born: (root) => root.born,
    },
    Mutation: {
        addBook: async (root, args) => {
            const findAuthorByName = await Author.collection.findOne({
                name: args.author,
            });
            if (!findAuthorByName) {
                const author = new Author({
                    name: args.author,
                });
                const newAuthor = await author.save();
                const book = new Book({ ...args, author: newAuthor._id });
                const newBook = await book.save();
                return newBook;
            } else {
                const author = findAuthorByName;
                const book = new Book({ ...args, author: author._id });
                const newBook = await book.save();
                return newBook;
            }
        },
        editAuthor: (root, args) => {
            const author = authors.find((a) => a.name === args.name);
            if (!author) {
                return null;
            }
            const updatedAuthor = { ...author, born: args.setBornTo };
            authors = authors.map((author) =>
                author.name === args.name ? updatedAuthor : author
            );
            return updatedAuthor;
        },
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

startStandaloneServer(server, {
    listen: { port: 4000 },
}).then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
