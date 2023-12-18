// const BASEURL = "https://container-service-2.e41513gjaiic0.eu-central-1.cs.amazonlightsail.com/"
// var API = "https://container-service-1.e41513gjaiic0.eu-central-1.cs.amazonlightsail.com";
const BASEURL = 'https://grocery-shop-api-9pgb.onrender.com'
const API = 'https://grocery-shop-api-9pgb.onrender.com'

if (localStorage.getItem('cookie') !== '') {
  location.replace(BASEURL)
}
const signUpButton = document.getElementById('signUp')
const signInButton = document.getElementById('signIn')
const container = document.getElementById('container')
const loginButton = document.getElementById('login-button')

signUpButton.addEventListener('click', () => {
  container.classList.add('right-panel-active')
})

signInButton.addEventListener('click', () => {
  container.classList.remove('right-panel-active')
})

/**
 * login with username and password
 * @returns {boolean} status flag for operation success
 */
async function login (email, password) {
  data = {
    email: email,
    password: password
  }

  let requestOptions = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const loginButton = document.getElementById('login-button')
  loginButton.innerHTML = 'Loading...'
  let rawResponse = await fetch(`${API}/api/user/login/`, requestOptions)
  let res = await rawResponse.json()
  loginButton.innerHTML = 'Login'
  if (rawResponse.status == 200) {
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res.user))
    return true
  }
  const errorLabel = document.getElementById('login-error')
  errorLabel.innerHTML = `* ${res.message}`
  errorLabel.style.display = 'flex'

  if (res.message.toLowerCase().includes('email')) {
    const email = document.getElementById('login-email')
    email.style.border = '1px red solid'
    email.classList.add('error')
  } else {
    const password = document.getElementById('login-password')
    password.style.border = '1px red solid'
    password.classList.add('error')
  }
  return false
}

async function singUp (name, email, password) {
  let data = {
    name: name,
    email: email,
    password: password
  }

  let requestOptions = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  }
  const signupSubmit = document.getElementById('signup-button')
  signupSubmit.innerHTML = 'Loading...'
  let rawResponse = await fetch(`${API}/api/user/signup/`, requestOptions)
  signupSubmit.innerHTML = 'Sign Up'
  let res = await rawResponse.json()

  if (rawResponse.status == 200) {
    alert('Check your email for verification link')
    return true
  }

  const errorLabel = document.getElementById('signup-error')
  errorLabel.innerHTML = `* ${res.message}`
  errorLabel.style.display = 'block'

  if (res.message.toLowerCase().includes('email')) {
    const email = document.getElementById('signup-email')
    email.style.border = '1px red solid'
    email.classList.add('error')
  } else {
    const password = document.getElementById('signup-password')
    password.style.border = '1px red solid'
    password.classList.add('error')
  }
  return false
}

const loginForm = document.getElementById('login-form')
loginForm.addEventListener('submit', async function (e) {
  e.preventDefault()
  const email = document.getElementById('login-email').value
  const password = document.getElementById('login-password').value

  const status = await login(email, password)

  if (status) {
    location.replace('/index.html')
  }
})

const signUpForm = document.getElementById('signup-form')
signUpForm.addEventListener('submit', async e => {
  e.preventDefault()
  const name = document.getElementById('signup-name').value
  const email = document.getElementById('signup-email').value
  const password = document.getElementById('signup-password').value

  const status = await singUp(name, email, password)

  if (status) {
    location.replace('templates/auth.html')
  }
})
