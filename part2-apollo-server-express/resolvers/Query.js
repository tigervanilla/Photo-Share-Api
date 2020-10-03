module.exports = {
  totalPhotos: (parent, args, {db}) => {
    return db.collection('photos').estimatedDocumentCount()
  },

  allPhotos: (parent, args, {db}) => {
    return db.collection('photos').find().toArray()
  },

  totalUsers: (parent, args, {db}) => {
    return db.collection('users').estimatedDocumentCount()
  },

  allUsers: (parent, args, {db}) => {
    return db.collection('users').find().toArray()
  },

  me: (parent, args, {currentUser}) => currentUser,
}