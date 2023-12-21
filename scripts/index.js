const API = 'https://grocery-shop-api-9pgb.onrender.com'

const navAuth = document.getElementById('nav-auth')
let element
const token = localStorage.getItem('token')
if (token) {
  navAuth.innerHTML = `
        <a href="/templates/create.html" style="cursor: pointer;">
            <i class="glyphicon glyphicon-plus" style="padding-right: 5px"></i>
            Create
        </a>
        <a href="/templates/auth.html" id="logout-button">
            <i class="glyphicon glyphicon-log-out" style="padding-right: 5px"></i>
            Logout
        </a>
    `
  const logoutButton = document.getElementById('logout-button')
  logoutButton.addEventListener('click', async function (e) {
    localStorage.removeItem('token')
  })
} else {
  navAuth.innerHTML = `
    <a href="/templates/auth.html" id="login-button">
        <i class="glyphicon glyphicon-log-in" style="padding-right: 5px"></i>
        Login
    </a>
 `
}

const overlayLoading = document.getElementById('loading-overlay-index')
function startLoading () {
  overlayLoading.style.display = 'flex'
}

function stopLoading () {
  overlayLoading.style.display = 'none'
}

const mainGrid = document.getElementById('main-grid')
const cartButton = document.getElementById('shopping-cart-button')

cartButton.addEventListener('click', e => {
  const cart = document.getElementById('cart')
  if (cart.style.display == 'flex') {
    cart.style.display = 'none'
  } else {
    cart.style.display = 'flex'
  }
})

let data = []
let cartData = []

async function deleteProduct (productId) {
  let data = { id: productId }
  let requestOptions = {
    method: 'DELETE',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }
  await fetch(`${API}/api/products`, requestOptions)
}

/**
 * create/view elements for each item
 * @param {object} data data object in JSON format for incoming items data
 * @returns {any}  none
 */
function createItemElements (data) {
  const user = localStorage.getItem('user')
  const userId = user ? JSON.parse(user).id : null
  mainGrid.innerHTML = ''
  for (let i = 0; i < data.length; i++) {
    let dataItem = data[i]
    let item = `
            <div class="grid-item-container">
                <div class="grid-item-name">
                    <h3>
                        ${dataItem.product_name} [<span>${
      dataItem.quantity_in_stock
    }</span>]
                    </h3>
                </div>
                <div class="grid-item-image-container">
                    <img src="${dataItem.image}" />
                </div>
                <div class="grid-item-description-price">
                    <div class="grid-item-description">
                        <p>
                            ${dataItem.brand_name}
                        </p>
                    </div>
                </div>
                <div class="grid-item-description-price">
                    <div class="grid-item-description">
                        <p>
                            Sold by <span style="font-weight: bold">${
                              dataItem.user.name
                            }</span>
                        </p>
                    </div>
                </div>
                
                <div class="grid-item-price">
                    <p> ${dataItem.price}$
                    </p>
                </div>

                <div class="grid-item-country grid-item-${dataItem.country.name.toLowerCase()}">
                    <p> ${dataItem.country.name}
                    </p>
                </div>
            </div>
            <div class="grid-item-buttons">
                <button class="grid-item-button button-add" type="button" id="button-add-${
                  dataItem.id
                }">
                    <i class="material-icons">exposure_plus_1</i>
                </button>
                <button class="grid-item-button button-delete" type="button" id="button-delete-${
                  dataItem.id
                }">
                  <i class="material-icons">exposure_neg_1</i>
                </button>
            </div>
            `
    if (userId == dataItem.user.id) {
      item += `
      <div class="control-buttons">
        <button class="delete-button">Delete</button>
      </div>
      `
    }
    const element = document.createElement('div')
    element.innerHTML = item
    element.className = 'grid-item'
    element.setAttribute('data-id', dataItem.id)
    mainGrid.append(element)
    if (userId == dataItem.user.id) {
      const deleteButton = element.getElementsByClassName('delete-button')[0]
      deleteButton.addEventListener('click', async function (e) {
        deleteButton.innerHTML = 'Deleting...'
        await deleteProduct(dataItem.id)
        deleteButton.innerHTML = 'Delete'
        window.location.reload()
      })
    }
  }
}

/**
 * Add item with itemid input to the purchases table
 * @param {number} itemid id of the cart item to be added
 * @returns {boolean} status flag for valid/invalid addition
 */
async function addItemToCart (itemid) {
  let quantity = 0
  let exists = false
  for (let item of cartData) {
    if (item.product.id == itemid) {
      quantity = item.quantity
      exists = true
      break
    }
  }
  let data = {
    product_id: itemid,
    quantity: quantity + 1
  }
  let requestOptions = {
    method: exists ? 'PUT' : 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }

  let rawResponse = await fetch(`${API}/api/items`, requestOptions)
  let res = await rawResponse.json()
  if (res.response == false) {
    alert(res.message)
    return false
  }
  return true
}

/**
 * Remove item with itemid input to the purchases table
 * @param {number} itemid id of the cart item to be removed
 * @returns {boolean} status flag for valid/invalid removal
 */
async function removeItemToCart (itemid) {
  let data = {
    product_id: itemid
  }
  let requestOptions = {
    method: 'DELETE',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }

  let rawResponse = await fetch(`${API}/api/items`, requestOptions)
  let res = await rawResponse.json()
  if (res.response == false) {
    alert(res.message)
    return false
  }
  return true
}

/**
 * update cart UI with items found in `cartItems`
 * @param {object} cartItems list of items
 * @returns {any}
 */
async function updateCart () {
  let innerHTML = ''
  var data = await fetch(`${API}/api/items`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
  var items = await data.json()
  items = items.items
  cartData = items ?? []
  if (items == null || items.length === 0) {
    innerHTML = 'There is nothing your cart.'
    cart.innerHTML = innerHTML
  } else {
    let totalPrice = 0
    innerHTML = `
        <table>
            <tr>
                <th></th>
                <th>Name</th>
                <th>Price</th>
                <th>QTY</th>
                <th>STotal</th>
            </tr>
        `
    for (var i = 0; i < items.length; i++) {
      var item = items[i]
      let price = parseFloat(item.product.price)
      let quantity = parseInt(item.quantity)
      let subtotalPrice = price * quantity
      totalPrice += subtotalPrice
      subtotalPrice = subtotalPrice.toFixed(2)
      innerHTML += `
                <tr>
                    <td>
                        <img src="${item.product.image}">
                    </td>
                    <td>${item.product.product_name}</td>
                    <td>${item.product.price}$</td>
                    <td>${item.quantity}</td>
                    <td>${subtotalPrice}$</td>
                </tr>
            `
    }
    totalPrice = innerHTML += `
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td>Total:</td>
                <td>${totalPrice}$</td>
            </tr>
        </table>
        <button class="checkout" id="checkout-button">Checkout</button>
        `

    const cart = document.getElementById('cart')
    cart.innerHTML = innerHTML
    cart.style.display = 'flex'

    // setup checkout event listener
    const checkoutButton = document.getElementById('checkout-button')
    checkoutButton.addEventListener('click', async function (e) {
      const cartId = items[0].shopping_cart.id
      let data = {
        id: cartId
      }
      let requestOptions = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
      checkoutButton.innerHTML = 'Checking out...'
      let rawResponse = await fetch(`${API}/api/payments`, requestOptions)
      let res = await rawResponse.json()
      checkoutButton.innerHTML = 'Checkout'
      if (rawResponse.status == 200) {
        alert(res.message)
        updateCart()
      }
    })
  }
}

function setUpCartEventListeners () {
  let elements = document.querySelectorAll('.grid-item')
  for (let element of elements) {
    const elementId = element.dataset.id

    // event listener for add buttons
    const addButton = element.getElementsByClassName(
      'grid-item-button button-add'
    )[0]
    addButton.addEventListener('click', async function (e) {
      addButton.innerHTML = 'Adding...'
      let status = await addItemToCart(elementId)
      addButton.innerHTML = '<i class="material-icons">exposure_plus_1</i>'
      if (status == false) return
      updateCart()
    })

    // event listener for remove button
    const removeButton = element.getElementsByClassName(
      'grid-item-button button-delete'
    )[0]
    removeButton.addEventListener('click', async function (e) {
      removeButton.innerHTML = 'Removing...'
      let status = await removeItemToCart(elementId)
      removeButton.innerHTML = '<i class="material-icons">exposure_neg_1</i>'
      if (status == false) return
      updateCart()
    })
  }
}

async function getAllProducts () {
  let requestOptions = {
    method: 'GET'
  }
  let rawResponse = await fetch(`${API}/api/products`, requestOptions)
  let res = await rawResponse.json()
  return res
}

/**
 * fetch items from api, set event handlers, and view items
 * @returns {any} none
 */
async function main () {
  startLoading()
  const brands = new Set()
  const res = await getAllProducts()
  const data = res.products
  createItemElements(data)
  brands.add('All')
  await updateCart()

  for (let dataItem of data) {
    brands.add(dataItem.brand_name)
  }
  const filterMenu = document.getElementById('filter-menu')
  for (let brand of brands) {
    const brandFilter = document.createElement('a')
    brandFilter.innerHTML = brand
    brandFilter.addEventListener('click', function (e) {
      let filteredData = []
      for (let dataItem of data) {
        if (dataItem.brand_name == brand || brand === 'All') {
          filteredData.push(dataItem)
        }
      }
      createItemElements(filteredData)
      setUpCartEventListeners()
    })
    filterMenu.append(brandFilter)
  }

  // search handler
  const searchInput = document.getElementById('search-input')
  searchInput.addEventListener('input', function (e) {
    const searchParam = searchInput.value
    let filteredData = []
    for (let dataItem of data) {
      const dataName = dataItem.product_name.toLowerCase()
      if (dataName.match(`.*${searchParam}.*`) == null) {
        continue
      }
      filteredData.push(dataItem)
    }
    createItemElements(filteredData)
    setUpCartEventListeners()
  })

  setUpCartEventListeners()
  stopLoading()
}

main()
