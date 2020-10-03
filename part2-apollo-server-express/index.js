// 1. Require `apollo-server-express` and `express`
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express').default
const { MongoClient } = require('mongodb')
const { ApolloServer } = require('apollo-server-express')
const { readFileSync } = require('fs')
const { join } = require('path')
const { dbUrl } = require('./config.json');

const typeDefs = readFileSync(join(__dirname, 'typeDefs.graphql'), 'utf-8')
const resolvers = require('./resolvers')
let i=0;
// 1. Create Asynchronous Function
async function start() {
    // 2. Call express() to create an Express application
    const app = express()
    const dbClient = await MongoClient.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true})
    const db = dbClient.db()
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({req}) => {
            const githubToken = req.headers.authorization
            const currentUser = await db.collection('users').findOne({githubToken})
            return { db, currentUser }
        },
    })
    // 3. Call `applyMiddleware()` to allow middleware mounted on the same path
    server.applyMiddleware({ app })
    // 4. Create a home route ('/'), a GraphQL endpoint ('/graphql'), a playground route ('/playground)
    app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'))
    app.get('/playground', expressPlayground({endpoint: '/graphql'}))
    
    // 5. Listen on a specific port
    app.listen(4000, ()=>console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`))
}

start()