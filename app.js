// URL base da API
const API_URL = 'http://localhost:3000/api'; // ajuste se necessário

// Utilidades
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
  }
}
function clearError(id) {
  showError(id, '');
}
function saveToken(token) {
  localStorage.setItem('token', token);
}
function getToken() {
  return localStorage.getItem('token');
}
function removeToken() {
  localStorage.removeItem('token');
}
function authHeaders() {
  const token = getToken();
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}
function redirectIfNotAuth() {
  if (!getToken()) window.location = 'index.html';
}
function logout() {
  removeToken();
  window.location = 'index.html';
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError('loginError');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
      const res = await fetch(API_URL + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        saveToken(data.token);
        window.location = 'users.html';
      } else {
        showError('loginError', data.message || 'Login inválido');
      }
    } catch (err) {
      showError('loginError', 'Erro ao conectar à API');
    }
  });
}

// Cadastro
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError('registerError');
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    try {
      const res = await fetch(API_URL + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        window.location = 'index.html';
      } else {
        showError('registerError', data.message || 'Erro ao cadastrar');
      }
    } catch (err) {
      showError('registerError', 'Erro ao conectar à API');
    }
  });
}

// CRUD Usuários
const usersTable = document.getElementById('usersTable');
if (usersTable) {
  redirectIfNotAuth();
  loadUsers();
}
async function loadUsers() {
  clearError('userError');
  try {
    const res = await fetch(API_URL + '/users', {
      headers: { ...authHeaders() }
    });
    const data = await res.json();
    if (res.ok) {
      renderUsers(data);
    } else {
      showError('userError', data.message || 'Erro ao carregar usuários');
    }
  } catch (err) {
    showError('userError', 'Erro ao conectar à API');
  }
}
function renderUsers(users) {
  const tbody = usersTable.querySelector('tbody');
  tbody.innerHTML = '';
  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>
        <button onclick="editUser('${user.id}', '${user.name}', '${user.email}')">Editar</button>
        <button onclick="deleteUser('${user.id}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
// Adicionar/Editar usuário
const userForm = document.getElementById('userForm');
if (userForm) {
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError('userError');
    const id = document.getElementById('userId').value;
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    try {
      let res, data;
      if (id) {
        res = await fetch(API_URL + '/users/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ name, email, password: password || undefined })
        });
      } else {
        res = await fetch(API_URL + '/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ name, email, password })
        });
      }
      data = await res.json();
      if (res.ok) {
        resetForm();
        loadUsers();
      } else {
        showError('userError', data.message || 'Erro ao salvar usuário');
      }
    } catch (err) {
      showError('userError', 'Erro ao conectar à API');
    }
  });
}
function editUser(id, name, email) {
  document.getElementById('userId').value = id;
  document.getElementById('userName').value = name;
  document.getElementById('userEmail').value = email;
  document.getElementById('userPassword').value = '';
}
function resetForm() {
  document.getElementById('userId').value = '';
  document.getElementById('userName').value = '';
  document.getElementById('userEmail').value = '';
  document.getElementById('userPassword').value = '';
}
async function deleteUser(id) {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
  clearError('userError');
  try {
    const res = await fetch(API_URL + '/users/' + id, {
      method: 'DELETE',
      headers: { ...authHeaders() }
    });
    if (res.ok) {
      loadUsers();
    } else {
      const data = await res.json();
      showError('userError', data.message || 'Erro ao excluir usuário');
    }
  } catch (err) {
    showError('userError', 'Erro ao conectar à API');
  }
}

// CRUD Produtos (painel)
const productsTable = document.getElementById('productsTable');
if (productsTable) {
  redirectIfNotAuth();
  loadProducts();
}
async function loadProducts() {
  clearError('productError');
  try {
    const res = await fetch(API_URL + '/products', {
      headers: { ...authHeaders() }
    });
    const data = await res.json();
    if (res.ok) {
      renderProducts(data);
    } else {
      showError('productError', data.message || 'Erro ao carregar produtos');
    }
  } catch (err) {
    showError('productError', 'Erro ao conectar à API');
  }
}
function renderProducts(products) {
  const tbody = productsTable.querySelector('tbody');
  tbody.innerHTML = '';
  products.forEach(product => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${product.name}</td>
      <td>${product.description || ''}</td>
      <td>R$ ${Number(product.price).toFixed(2)}</td>
      <td>
        <button onclick="editProduct('${product.id}', '${product.name.replace(/'/g, "&#39;")}', '${(product.description||'').replace(/'/g, "&#39;")}', '${product.price}')">Editar</button>
        <button onclick="deleteProduct('${product.id}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
const productForm = document.getElementById('productForm');
if (productForm) {
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError('productError');
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = document.getElementById('productPrice').value;
    try {
      let res, data;
      if (id) {
        res = await fetch(API_URL + '/products/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ name, description, price })
        });
      } else {
        res = await fetch(API_URL + '/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ name, description, price })
        });
      }
      data = await res.json();
      if (res.ok) {
        resetProductForm();
        loadProducts();
      } else {
        showError('productError', data.message || 'Erro ao salvar produto');
      }
    } catch (err) {
      showError('productError', 'Erro ao conectar à API');
    }
  });
}
function editProduct(id, name, description, price) {
  document.getElementById('productId').value = id;
  document.getElementById('productName').value = name;
  document.getElementById('productDescription').value = description;
  document.getElementById('productPrice').value = price;
}
function resetProductForm() {
  document.getElementById('productId').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('productDescription').value = '';
  document.getElementById('productPrice').value = '';
}
async function deleteProduct(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;
  clearError('productError');
  try {
    const res = await fetch(API_URL + '/products/' + id, {
      method: 'DELETE',
      headers: { ...authHeaders() }
    });
    if (res.ok) {
      loadProducts();
    } else {
      const data = await res.json();
      showError('productError', data.message || 'Erro ao excluir produto');
    }
  } catch (err) {
    showError('productError', 'Erro ao conectar à API');
  }
}

// View pública do cardápio
const menuTable = document.getElementById('menuTable');
if (menuTable) {
  loadMenu();
}
async function loadMenu() {
  clearError('menuError');
  try {
    const res = await fetch(API_URL + '/menu');
    const data = await res.json();
    if (res.ok) {
      renderMenu(data);
    } else {
      showError('menuError', data.message || 'Erro ao carregar cardápio');
    }
  } catch (err) {
    showError('menuError', 'Erro ao conectar à API');
  }
}
function renderMenu(products) {
  const tbody = menuTable.querySelector('tbody');
  tbody.innerHTML = '';
  products.forEach(product => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${product.name}</td>
      <td>${product.description || ''}</td>
      <td>R$ ${Number(product.price).toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
} 