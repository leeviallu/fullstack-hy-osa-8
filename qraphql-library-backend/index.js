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
        allBooks: async (root, args) => {
            if (!args.author && !args.genre) {
                return Book.find({});
            }
            if (
                !(
                    args.author === undefined ||
                    args.author === null ||
                    args.genre === undefined ||
                    args.genre === null
                )
            ) {
                const author = await Author.findOne({ name: args.author });
                const books = await Book.find({
                    author: author.id,
                    genres: args.genre,
                });
                return books;
            }
            if (!(args.author === undefined || args.author === null)) {
                const author = await Author.findOne({ name: args.author });
                const books = await Book.find({
                    author: author.id,
                });
                return books;
            }
            if (!(args.genre === undefined || args.genre === null)) {
                const books = await Book.find({
                    genres: args.genre,
                });
                return books;
            }
        },
        allAuthors: async () => await Author.find({}),
    },
    Author: {
        name: (root) => root.name,
        bookCount: async (root) => {
            const books = await Book.find({ author: root.name });
            return books.length;
        },
        id: (root) => root.id,
        born: (root) => root.born,
    },
    Mutation: {
        addBook: async (root, args) => {
            let author = await Author.findOne({
                name: args.author,
            });
            if (!author) {
                author = new Author({
                    name: args.author,
                });
                await author.save();
            }
            const book = new Book({ ...args, author: author._id });
            const newBook = await book.save();
            return newBook;
        },
        editAuthor: async (root, args) => {
            const filter = { name: args.name };
            const update = { born: args.setBornTo };
            const author = await Author.findOneAndUpdate(filter, update, {
                returnOriginal: false,
            });
            return author;
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
