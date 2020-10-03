const fetch = require('node-fetch')

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

module.exports = {
  authorizeWithGithub,
  createFakeUsers,
}