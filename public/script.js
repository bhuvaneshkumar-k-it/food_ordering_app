const resolveApiBase = () => {
  const { origin, protocol, hostname, port } = window.location;
  if (origin && origin.startsWith('http') && (port === '' || port === '4000')) {
    return origin;
  }
  if (hostname === '127.0.0.1' || hostname === 'localhost') {
    return `${protocol}//${hostname}:4000`;
  }
  return 'http://localhost:4000';
};

const API_BASE = resolveApiBase();
const DELIVERY_FEE = 3.5;

const restaurantsListEl = document.getElementById('restaurants-list');
const restaurantsEmptyEl = document.getElementById('restaurants-empty');
const menuTitleEl = document.getElementById('menu-title');
const menuSubtitleEl = document.getElementById('menu-subtitle');
const menuListEl = document.getElementById('menu-list');
const menuEmptyEl = document.getElementById('menu-empty');
const cartItemsEl = document.getElementById('cart-items');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const deliveryFeeEl = document.getElementById('delivery-fee');
const cartTotalEl = document.getElementById('cart-total');
const placeOrderBtn = document.getElementById('place-order');
const cartMessageEl = document.getElementById('cart-message');
const ordersListEl = document.getElementById('orders-list');
const ordersEmptyEl = document.getElementById('orders-empty');
const refreshOrdersBtn = document.getElementById('refresh-orders');
const viewRestaurantsBtn = document.getElementById('view-restaurants');
const logoutBtn = document.getElementById('logout-btn');
const authStatusEl = document.getElementById('auth-status');
const userGreetingEl = document.getElementById('user-greeting');

const restaurantTemplate = document.getElementById('restaurant-card-template');
const menuTemplate = document.getElementById('menu-card-template');
const cartTemplate = document.getElementById('cart-item-template');

let restaurants = [];
let currentMenu = [];
let selectedRestaurantId = null;
let cart = [];

const updateMenuHeading = (restaurant) => {
  if (!restaurant) {
    menuTitleEl.textContent = 'Menu';
    menuSubtitleEl.textContent = 'Select a restaurant to view its menu.';
    return;
  }
  menuTitleEl.textContent = restaurant.name;
  menuSubtitleEl.textContent = `${restaurant.cuisine} • Curated specials`;
};

const request = async (path, options = {}, config = {}) => {
  const headers = options.headers ? { ...options.headers } : {};
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
      headers,
    });
    if (response.status === 401 && !config.skipRedirect) {
      window.location.href = 'login.html';
      throw new Error('Unauthorized');
    }
    return response;
  } catch (error) {
    if (!config.silent) {
      console.error('Network error:', error);
      alert('Unable to reach Zwiggato servers. Please ensure the backend (npm start) is running.');
    }
    throw error;
  }
};

const ensureAuthenticated = async () => {
  try {
    const res = await request('/auth/me', {}, { skipRedirect: true });
    if (!res.ok) {
      window.location.href = 'login.html';
      return null;
    }
    const user = await res.json();
    if (userGreetingEl) {
      userGreetingEl.textContent = `Hi, ${user.name}!`;
    }
    if (authStatusEl) {
      authStatusEl.textContent = 'You are signed in.';
    }
    return user;
  } catch (error) {
    window.location.href = 'login.html';
    return null;
  }
};

const handleLogout = async () => {
  if (authStatusEl) {
    authStatusEl.textContent = 'Signing out...';
  }
  try {
    await request('/auth/logout', { method: 'POST' }, { skipRedirect: true });
  } catch (error) {
    console.error(error);
  } finally {
    window.location.href = 'login.html';
  }
};

const formatCurrency = (value) => `$${value.toFixed(2)}`;

const saveCart = () => localStorage.setItem('fo-cart', JSON.stringify(cart));

const loadCart = () => {
  try {
    const stored = localStorage.getItem('fo-cart');
    cart = stored ? JSON.parse(stored) : [];
  } catch {
    cart = [];
  }
};

const selectRestaurant = (restaurantId) => {
  const restaurant = restaurants.find((r) => r.id === restaurantId);
  if (!restaurant) {
    selectedRestaurantId = null;
    updateMenuHeading(null);
    return;
  }
  selectedRestaurantId = restaurant.id;
  updateMenuHeading(restaurant);
  renderRestaurants();
  fetchMenu(restaurant.id);
};

const fetchRestaurants = async () => {
  restaurantsEmptyEl.classList.add('hidden');
  restaurantsListEl.innerHTML = '';
  try {
    const res = await request('/restaurants');
    if (!res.ok) {
      throw new Error('Request failed');
    }
    restaurants = await res.json();
    if (!restaurants.length) {
      restaurantsEmptyEl.classList.remove('hidden');
      updateMenuHeading(null);
      menuEmptyEl.textContent = 'No restaurants available yet.';
      menuEmptyEl.classList.remove('hidden');
      return;
    }

    const keepSelection = restaurants.some((r) => r.id === selectedRestaurantId);
    if (!keepSelection) {
      selectRestaurant(restaurants[0].id);
    } else {
      const activeRestaurant = restaurants.find((r) => r.id === selectedRestaurantId) || null;
      updateMenuHeading(activeRestaurant);
      menuEmptyEl.classList.toggle('hidden', Boolean(currentMenu.length));
      renderRestaurants();
    }
  } catch (error) {
    restaurantsEmptyEl.textContent = 'Unable to load restaurants.';
    restaurantsEmptyEl.classList.remove('hidden');
    console.error(error);
  }
};

const fetchMenu = async (restaurantId) => {
  menuListEl.innerHTML = '';
  menuEmptyEl.textContent = 'Loading menu...';
  menuEmptyEl.classList.remove('hidden');
  try {
    const res = await request(`/restaurants/${restaurantId}/menu`);
    if (!res.ok) {
      throw new Error('Request failed');
    }
    currentMenu = await res.json();
    if (!currentMenu.length) {
      menuEmptyEl.textContent = 'Menu is not available yet.';
    } else {
      menuEmptyEl.classList.add('hidden');
      renderMenu();
    }
  } catch (error) {
    menuEmptyEl.textContent = 'Unable to load menu items.';
    console.error(error);
  }
};

const fetchOrders = async () => {
  ordersListEl.innerHTML = '';
  ordersEmptyEl.textContent = 'Loading order history...';
  ordersEmptyEl.classList.remove('hidden');
  try {
    const res = await request('/orders');
    if (!res.ok) {
      throw new Error('Request failed');
    }
    const orders = await res.json();
    if (!orders.length) {
      ordersEmptyEl.textContent = 'No orders placed yet.';
      return;
    }
    ordersEmptyEl.classList.add('hidden');
    orders.forEach((order) => {
      const card = document.createElement('article');
      card.className = 'order-card';

      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';

      const totalEl = document.createElement('strong');
      totalEl.textContent = `Total: ${formatCurrency(order.total)}`;

      const idEl = document.createElement('span');
      idEl.textContent = `#${order.id}`;
      idEl.style.color = '#64748b';

      header.appendChild(totalEl);
      header.appendChild(idEl);

      const meta = document.createElement('p');
      meta.className = 'order-card__meta';
      meta.textContent = new Date(order.created_at).toLocaleString();

      const list = document.createElement('ul');
      list.className = 'order-card__items';
      order.items.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = `${item.quantity}x ${item.name}`;
        list.appendChild(li);
      });

      card.appendChild(header);
      card.appendChild(meta);
      card.appendChild(list);
      ordersListEl.appendChild(card);
    });
  } catch (error) {
    ordersEmptyEl.textContent = 'Unable to load order history.';
    console.error(error);
  }
};

const renderRestaurants = () => {
  restaurantsListEl.innerHTML = '';
  restaurants.forEach((restaurant) => {
    const clone = restaurantTemplate.content.cloneNode(true);
    const card = clone.querySelector('.restaurant-card');
    card.dataset.id = restaurant.id;
    if (restaurant.id === selectedRestaurantId) {
      card.classList.add('restaurant-card--active');
    }
    clone.querySelector('.restaurant-card__image').src = restaurant.image;
    clone.querySelector('.restaurant-card__image').alt = restaurant.name;
    clone.querySelector('.restaurant-card__name').textContent = restaurant.name;
    clone.querySelector('.restaurant-card__cuisine').textContent = restaurant.cuisine;
    restaurantsListEl.appendChild(clone);
  });
};

const renderMenu = () => {
  menuListEl.innerHTML = '';
  currentMenu.forEach((item) => {
    const clone = menuTemplate.content.cloneNode(true);
    clone.querySelector('.menu-card').dataset.id = item.id;
    clone.querySelector('.menu-card__name').textContent = item.name;
    clone.querySelector('.menu-card__description').textContent = item.description || '';
    clone.querySelector('.menu-card__price').textContent = formatCurrency(item.price);
    clone.querySelector('button').addEventListener('click', () => addToCart(item));
    menuListEl.appendChild(clone);
  });
};

const renderCart = () => {
  cartItemsEl.innerHTML = '';
  if (!cart.length) {
    cartItemsEl.innerHTML = '<p class="empty-state">Your cart is empty.</p>';
  } else {
    cart.forEach((item) => {
      const clone = cartTemplate.content.cloneNode(true);
      clone.querySelector('.cart-item').dataset.id = item.id;
      clone.querySelector('.cart-item__name').textContent = item.name;
      clone.querySelector('.cart-item__details').textContent = formatCurrency(item.price);
      clone.querySelector('.cart-item__quantity').textContent = item.quantity;
      const [decreaseBtn, increaseBtn] = clone.querySelectorAll('button');
      decreaseBtn.addEventListener('click', () => updateQuantity(item.id, -1));
      increaseBtn.addEventListener('click', () => updateQuantity(item.id, 1));
      cartItemsEl.appendChild(clone);
    });
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartSubtotalEl.textContent = formatCurrency(subtotal);
  deliveryFeeEl.textContent = formatCurrency(cart.length ? DELIVERY_FEE : 0);
  const total = cart.length ? subtotal + DELIVERY_FEE : 0;
  cartTotalEl.textContent = formatCurrency(total);
  placeOrderBtn.disabled = cart.length === 0;
  saveCart();
};

const addToCart = (item) => {
  const existing = cart.find((entry) => entry.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: 1,
    });
  }
  renderCart();
  cartMessageEl.textContent = `${item.name} added to cart.`;
};

const updateQuantity = (itemId, delta) => {
  cart = cart
    .map((item) => (item.id === itemId ? { ...item, quantity: item.quantity + delta } : item))
    .filter((item) => item.quantity > 0);
  renderCart();
};

const placeOrder = async () => {
  if (!cart.length) return;
  placeOrderBtn.disabled = true;
  cartMessageEl.textContent = 'Placing order...';

  const totalValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + DELIVERY_FEE;

  try {
    const res = await request('/orders', {
      method: 'POST',
      body: JSON.stringify({ items: cart, total: Number(totalValue.toFixed(2)) }),
    });
    if (!res.ok) {
      throw new Error('Failed to place order');
    }
    await res.json();
    cart = [];
    renderCart();
    cartMessageEl.textContent = 'Order placed! Check recent orders below.';
    fetchOrders();
  } catch (error) {
    cartMessageEl.textContent = 'Unable to place order right now.';
    console.error(error);
  } finally {
    placeOrderBtn.disabled = cart.length === 0;
  }
};

restaurantsListEl.addEventListener('click', (event) => {
  const card = event.target.closest('.restaurant-card');
  if (!card) return;
  const restaurantId = Number(card.dataset.id);
  if (Number.isNaN(restaurantId)) return;
  selectRestaurant(restaurantId);
});

placeOrderBtn.addEventListener('click', placeOrder);

refreshOrdersBtn.addEventListener('click', fetchOrders);

viewRestaurantsBtn.addEventListener('click', () => {
  document.querySelector('.layout').scrollIntoView({ behavior: 'smooth' });
});

const init = async () => {
  const user = await ensureAuthenticated();
  if (!user) return;
  loadCart();
  renderCart();
  fetchRestaurants();
  fetchOrders();
};

document.addEventListener('DOMContentLoaded', () => {
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  init();
});
