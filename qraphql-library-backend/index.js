const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid } = require("uuid");

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
        bookCount: () => books.length,
        authorCount: () => authors.length,
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
        addBook: (root, args) => {
            if (
                books.find((b) => b.title === args.title) &&
                authors.find((a) => a.name === args.author)
            ) {
                throw new GraphQLError(
                    "Author must release books with unique title",
                    {
                        extensions: {
                            code: "BAD_USER_INPUT",
                            invalidArgs: [args.title, args.author],
                        },
                    }
                );
            }
            if (!authors.find((a) => a.name === args.author)) {
                const author = { name: args.author, id: uuid() };
                authors = authors.concat(author);
            }
            const book = { ...args, id: uuid() };
            books = books.concat(book);
            return book;
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
