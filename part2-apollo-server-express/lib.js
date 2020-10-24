const fetch = require('node-fetch')
const fs = require('fs');

const requestGithubToken = async (credentials) => {
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials)
    })
    return response.json();
  } catch(error) {
    console.log('ERROR::requestGithubToken::', error)
  }
}

const requestGithubUserAccount = async (token) => {
  try {
    const response = await fetch(`https://api.github.com/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  } catch (error) {
    console.log('ERROR::requestGithubUserAccount::', error)
  }
}

const authorizeWithGithub = async (credentials) => {
  const { access_token } = await requestGithubToken(credentials)
  const githubUser = await requestGithubUserAccount(access_token)
  return { ...githubUser, access_token }
}

const createFakeUsers = async (count=1) => {
  const randomUserApi = `https://randomuser.me/api/?results=${count}`
  const response = await fetch(randomUserApi)
  return response.json()
}

const uploadStream = async (stream, path) => {
  console.log('PATH::', path)
  const promise = new Promise((resolve, reject) => {
    stream
    .on('error', error => {
      if (stream.truncated) {
        fs.unlinkSync(path)
      }
      reject(error)
    })
    .on('end', resolve)
    .pipe(fs.createWriteStream(path))
  });
  return promise;
}

module.exports = {
  authorizeWithGithub,
  createFakeUsers,
  uploadStream,
}