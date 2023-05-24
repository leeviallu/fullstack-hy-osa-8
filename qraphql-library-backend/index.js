const { ApolloServer } = require("@apollo/server");
const { GraphQLError } = require("graphql");
const { startStandaloneServer } = require("@apollo/server/standalone");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");

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
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
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
    createUser(
        username: String!
        favoriteGenre: String!
    ): User
    login(
        username: String!
        password: String!
    ): Token
  }
`;

const resolvers = {
    Query: {
        bookCount: async () => await Book.countDocuments(),
        authorCount: async () => await Author.countDocuments(),
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
        me: (root, args, context) => {
            return context.currentUser;
        },
    },
    Author: {
        name: (root) => root.name,
        bookCount: async (root) =>
            await Book.countDocuments({ author: root.id }),
        id: (root) => root.id,
        born: (root) => root.born,
    },
    Mutation: {
        addBook: async (root, args, context) => {
            let author = await Author.findOne({
                name: args.author,
            });
            const currentUser = context.currentUser;
            if (!currentUser) {
                throw new GraphQLError("not authenticated", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                    },
                });
            }
            try {
                if (!author) {
                    author = new Author({
                        name: args.author,
                    });
                    await author.save();
                }
                const book = new Book({ ...args, author: author._id });
                const newBook = await book.save();
                return newBook;
            } catch (error) {
                throw new GraphQLError("Saving book failed", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                        invalidArgs: args,
                        error,
                    },
                });
            }
        },
        editAuthor: async (root, args, context) => {
            console.log(context);
            const currentUser = context.currentUser;
            if (!currentUser) {
                throw new GraphQLError("not authenticated", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                    },
                });
            }
            try {
                const filter = { name: args.name };
                const update = { born: args.setBornTo };
                const author = await Author.findOneAndUpdate(filter, update, {
                    returnOriginal: false,
                });
                if (!author) {
                    throw new GraphQLError("Author not found");
                }
                return author;
            } catch (error) {
                throw new GraphQLError("Author edit failed", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                        invalidArgs: args,
                        error,
                    },
                });
            }
        },
        createUser: async (root, args) => {
            const user = new User({
                username: args.username,
                favoriteGenre: args.favoriteGenre,
            });
            return user.save().catch((error) => {
                throw new GraphQLError("Creating the user failed", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                        invalidArgs: args,
                        error,
                    },
                });
            });
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username });
            if (!user || args.password !== "salis") {
                throw new GraphQLError("wrong credentials", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                    },
                });
            }
            const userForToken = {
                username: user.username,
                id: user._id,
            };
            return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
        },
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req, res }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.startsWith("Bearer ")) {
            const decodedToken = jwt.verify(
                auth.substring(7),
                process.env.JWT_SECRET
            );
            const currentUser = await User.findById(decodedToken.id);
            return { currentUser };
        }
    },
}).then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
