const { ApolloServer } = require('apollo-server')
const { GraphQLScalarType } = require('graphql')

const typeDefs = `
    scalar DateTime 

    type Photo {
      id: ID!
      created: DateTime
      url: String
      name: String!
      description: String
      category: PhotoCategory!
      postedBy: User!
      taggedUsers: [User!]!
    }

    type User {
      githubLogin: ID!
      name: String
      avatar: String
      postedPhotos: [Photo!]!
      inPhotos: [Photo!]!
    }
    
    type Query {
      totalPhotos: Int!
      allPhotos: [Photo!]!
    }
    
    type Mutation {
      postPhoto(input: PostPhotoInput): Photo!
    }

    enum PhotoCategory {
      SELFIE
      PORTRAIT
      ACTION
      LANDSCAPE
      GRAPHIC
    }

    input PostPhotoInput {
      name: String!
      category: PhotoCategory=PORTRAIT
      description: String
    }
    `;

let _id = 0;

const users = [
  { "githubLogin": "mHattrup", "name": "Mike Hattrup" },
  { "githubLogin": "gPlake", "name": "Glen Plake" },
  { "githubLogin": "sSchmidt", "name": "Scot Schmidt" },
]

const photos = [{
    "id": "1",
    "created": "3-28-1977",
    "name": "Dropping the Heart Chute",
    "description": "The heart chute is one of my favorite chutes",
    "category": "ACTION",
    "githubUser": "gPlake"
  },
  {
    "id": "2",
    "created": "1-2-1985",
    "name": "Enjoying the sunshine",
    "category": "SELFIE",
    "githubUser": "sSchmidt"
  },
  {
    id: "3",
    "created": "2018-04-15T19:09:57.308Z",
    "name": "Gunbarrel 25",
    "description": "25 laps on gunbarrel today",
    "category": "LANDSCAPE",
    "githubUser": "sSchmidt"
  }
];

const tags = [{
    "photoID": "1",
    "userID": "gPlake"
  },
  {
    "photoID": "2",
    "userID": "sSchmidt"
  },
  {
    "photoID": "2",
    "userID": "mHattrup"
  },
  {
    "photoID": "2",
    "userID": "gPlake"
  }
]

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos,
  },

  Mutation: {
    postPhoto(parent, args) {
      const newPhoto = {
        id: _id++,
        created: new Date(),
        githubUser: users[Math.round(Math.random()*10) % 3].githubLogin,
        ...args.input,
      }
      photos.push(newPhoto)
      return newPhoto
    }
  },

  Photo: {
    url: parent => `https://duckduckgo.com/`,
    postedBy: parent => users.find(u => u.githubLogin === parent.githubUser),
    taggedUsers: parent => tags.filter(tag => tag.photoID === parent.id).map(tag => tag.userID).map(userID => users.find(u => u.githubLogin === userID)),
  },

  User: {
    postedPhotos: parent => photos.filter(p => p.githubUser === parent.githubLogin),
    inPhotos: parent => tags.filter(t => t.userID === parent.githubLogin).map(t => t.photoID).map(photoID => photos.find(p => p.id === photoID)),
  },

  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value',
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  }),
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({
  url
}) => console.log(`GraphQL service running on ${url}`))