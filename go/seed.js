use library
db.books.drop()
db.books.insertMany(
    [
        {
            title: "The Go Programming Language",
            author: "Alan A. A. Donovan",
            year: 2016
        },
        {
            title: "MongoDB: The Definitive Guide",
            author: "Kristina Chodorow",
            year: 2013
        },
        {
            title: "Clean Code",
            author: "Robert C. Martin",
            year: 2008
        }
    ]
)
db.books.createIndex({
    title: 1
})
db.books.find().pretty()