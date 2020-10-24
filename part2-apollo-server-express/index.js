// 1. Require `apollo-server-express` and `express`
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express').default
const depthLimit = require('graphql-depth-limit')
const { MongoClient } = require('mongodb')
const { ApolloServer, PubSub } = require('apollo-server-express')
const { createComplexityLimitRule } = require('graphql-validation-complexity')
const { readFileSync } = require('fs')
const { createServer } = require('http')
const { join } = require('path')
const { dbUrl } = require('./config.json');

const typeDefs = readFileSync(join(__dirname, 'typeDefs.graphql'), 'utf-8')
const resolvers = require('./resolvers')
let i=0;
// 1. Create Asynchronous Function
async function start() {
    // 2. Call express() to create an Express application
    const app = express()
    app.use('/img/photos', express.static(join(__dirname, 'assets', 'photos')))
    const dbClient = await MongoClient.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true})
    const db = dbClient.db()
    const pubsub = new PubSub()
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        validationRules: [
            depthLimit(5),
            createComplexityLimitRule(1000, { onCost: cost => console.log(`Query Cost = ${cost}`) }),
        ],
        context: async ({req, connection}) => {
            const githubToken = req ? req.headers.authorization : connection.context.Authorization
            const currentUser = await db.collection('users').findOne({githubToken})
            return { db, currentUser, pubsub }
        },
    })
    // 3. Call `applyMiddleware()` to allow middleware mounted on the same path
    server.applyMiddleware({ app })
    // 4. Create a home route ('/'), a GraphQL endpoint ('/graphql'), a playground route ('/playground)
    app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'))
    app.get('/playground', expressPlayground({endpoint: '/graphql'}))
    // 5. Create an HttpServer using the express app instance
    const httpServer = createServer(app)
    // 6. Enable subscription support at ws://localhost:<PORT>/graphql
    server.installSubscriptionHandlers(httpServer)
    httpServer.timeout = 5000;
    // 6. Listen on a specific port
    httpServer.listen(4000, ()=>console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`))
}

start()