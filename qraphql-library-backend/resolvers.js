const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");

const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

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
                pubsub.publish("BOOK_ADDED", { bookAdded: newBook });
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
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
        },
    },
};

module.exports = resolvers;
