const { authorizeWithGithub, createFakeUsers } = require('../lib')
const { client_id, client_secret } = require('../config.json')

module.exports = {
  async postPhoto(parent, args, {db, currentUser}) {
    if (!currentUser) {
      throw new Error('Only an authorized user can post a photo')
    }
    const newPhoto = {
      ...args.input,
      userID: currentUser.githubLogin,
      created: new Date(),
    }
    const { insertedId } = await db.collection('photos').insertOne(newPhoto)
    newPhoto.id = insertedId
    return newPhoto
  },

  async githubAuth(parent, {code}, {db}) {
    try {
      // 1. Obtain data from GitHub
      const {
        message,
        access_token,
        avatar_url,
        login,
        name
      } = await authorizeWithGithub({
        client_id,
        client_secret,
        code
      })
      // 2. If there is a message, something went wrong
      if (message) {
        throw new Error(message)
      }
      // 3. Package the results into a single object
      const latestUserInfo = {
        name,
        githubLogin: login,
        githubToken: access_token,
        avatar_url: avatar_url,
      }
      // 4. Add or update the record with the new information
      const replaceOneResult = await db.collection('users').replaceOne({
        githubLogin: login
      }, latestUserInfo, {
        upsert: true
      })
      const {
        ops: [user]
      } = replaceOneResult
      // console.log('replaceOneResult::', replaceOneResult)
      // console.log('ops::', ops)
      // 5. Return user data and their token
      return {
        user,
        token: access_token
      }
    } catch (error) {
      console.log('ERROR::githubAuth::', error)
    }
  },

  addFakeUsers: async (parent, {count}, {db}) => {
    const { results } = await createFakeUsers(count)
    const users = results.map(r => ({
      githubLogin: r.login.username,
      name: `${r.name.first} ${r.name.last}`,
      avatar: r.picture.thumbnail,
      githubToken: r.login.sha1,
    }))
    await db.collection('users').insertMany(users)
    return users
  },

  fakeUserAuth: async (parent, {githubLogin}, {db}) => {
    const user = await db.collection('users').findOne({githubLogin})
    if (!user) {
      throw new Error(`Cannot find user with githubLogin "${githubLogin}"`)
    }
    return {
      token: user.githubToken,
      user
    }
  },
}