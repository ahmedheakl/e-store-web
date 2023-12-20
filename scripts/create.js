const API = 'https://grocery-shop-api-9pgb.onrender.com'

const createProductButton = document.getElementById('create-button')
const countriesSelect = document.getElementById('create-nationality')
const loadingOverlay = document.getElementById('loading-overlay')

function startLoading () {
  loadingOverlay.style.display = 'flex'
}
function stopLoading () {
  loadingOverlay.style.display = 'none'
}

async function listCountries () {
  startLoading()
  let rawResponse = await fetch(`${API}/api/countries/`)
  let res = await rawResponse.json()
  if (rawResponse.status == 200) {
    res.forEach(country => {
      const option = document.createElement('option')
      option.value = country.id
      option.innerHTML = country.name
      countriesSelect.appendChild(option)
    })
  }
  stopLoading()
}

async function createProduct (
  product_name,
  brand_name,
  nationality_id,
  image,
  price,
  quantity
) {
  let data = {
    product_name: product_name,
    brand_name: brand_name,
    brand_nationality_id: nationality_id,
    price: price,
    image: image,
    quantity_in_stock: quantity
  }
  const token = localStorage.getItem('token')
  let requestOptions = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }
  let rawResponse = await fetch(`${API}/api/products/`, requestOptions)
  let res = await rawResponse.json()
  if (rawResponse.status == 200) return ''
  return res.message
}

const createProductForm = document.getElementById('create-product-form')
createProductForm.addEventListener('submit', async e => {
  e.preventDefault()
  const product_name = document.getElementById('create-name').value
  const brand_name = document.getElementById('create-brand').value
  const nationalityId = countriesSelect.value
  const imagePath = document.getElementById('create-image')
  const price = document.getElementById('create-price').value
  const quantity = document.getElementById('create-quantity').value

  // read image from hard
  const reader = new FileReader()
  const imageBlob = imagePath.files[0]
  let waiting = true
  let image = null
  reader.onload = () => {
    image = reader.result
    waiting = false
  }
  reader.readAsDataURL(imageBlob)
  while (waiting) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  createProductButton.innerHTML = 'Loading...'
  const message = await createProduct(
    product_name,
    brand_name,
    nationalityId,
    image,
    price,
    quantity
  )
  const errorLabel = document.getElementById('create-error')
  const successLabel = document.getElementById('create-sucess')
  if (message != '') {
    successLabel.style.display = 'none'
    errorLabel.innerHTML = `* ${message}`
    errorLabel.style.display = 'block'
  } else {
    errorLabel.style.display = 'none'
    successLabel.style.display = 'block'
  }
  createProductButton.innerHTML = 'Create'
})

async function main () {
  await listCountries()
}

main()
