// app.js

// URL base da API
const API_URL = 'http://localhost:3000/api'; // Ajuste se necessário

// --- Funções Utilitárias Globais ---
function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.style.display = message ? 'block' : 'none'; // Mostra se houver mensagem, esconde se vazia
    }
}

function clearError(elementId) {
    showError(elementId, '');
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
    // Retorna um objeto de cabeçalhos, incluindo o Content-Type para JSON por padrão
    return token ? {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    } : {
        'Content-Type': 'application/json'
    };
}

// Redireciona para a página de login/índice se não autenticado
function redirectIfNotAuth() {
    if (!getToken()) {
        window.location.href = 'index.html'; // Ou 'login.html', dependendo do seu ponto de entrada
    }
}

// Lógica de Logout - Pode ser chamada por um botão global no header
function logout() {
    removeToken();
    window.location.href = 'index.html'; // Redireciona para a página inicial/login
}

// --- Lógica Principal dos Event Listeners (Executa após o DOM estar totalmente carregado) ---
document.addEventListener('DOMContentLoaded', () => {

    // --- Login (login.html) ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário
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
                    // *** CORREÇÃO AQUI: Redirecionar para products.html ***
                    window.location.href = 'products.html';
                } else {
                    showError('loginError', data.message || 'Credenciais inválidas.');
                }
            } catch (err) {
                console.error('Erro ao conectar à API de Login:', err);
                showError('loginError', 'Erro ao conectar à API. Verifique sua conexão.');
            }
        });
    }

    // --- Cadastro (register.html) ---
    const registerForm = document.getElementById('registerForm');
    // Adiciona uma verificação para o checkbox de termos, se existir
    const agreeTermsCheckbox = document.getElementById('agreeTerms');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearError('registerError');

            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            // Verifica se os termos foram aceitos (apenas se o checkbox existir)
            if (agreeTermsCheckbox && !agreeTermsCheckbox.checked) {
                showError('registerError', 'Você deve concordar com os termos.');
                return;
            }

            try {
                const res = await fetch(API_URL + '/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await res.json();

                if (res.ok) {
                    // Após o cadastro bem-sucedido, redireciona para a página de login
                    alert('Cadastro realizado com sucesso! Agora você pode fazer login.');
                    window.location.href = 'index.html'; // Assumindo index.html é sua página de login principal
                } else {
                    showError('registerError', data.message || 'Erro ao cadastrar. Tente novamente.');
                }
            } catch (err) {
                console.error('Erro ao conectar à API de Cadastro:', err);
                showError('registerError', 'Erro ao conectar à API. Verifique sua conexão.');
            }
        });
    }

    // --- CRUD Usuários (users.html) ---
    const usersTable = document.getElementById('usersTable');
    const userForm = document.getElementById('userForm'); // Formulário de adicionar/editar usuário
    const userIdInput = document.getElementById('userId');
    const userNameInput = document.getElementById('userName');
    const userEmailInput = document.getElementById('userEmail');
    const userPasswordInput = document.getElementById('userPassword');

    if (usersTable) {
        redirectIfNotAuth(); // Protege a página de usuários
        loadUsers();
    }

    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearError('userError');

            const id = userIdInput.value;
            const name = userNameInput.value;
            const email = userEmailInput.value;
            const password = userPasswordInput.value; // Pode ser vazio para PUT

            try {
                let res;
                if (id) { // Modo Edição (PUT)
                    res = await fetch(API_URL + '/users/' + id, {
                        method: 'PUT',
                        headers: authHeaders(),
                        body: JSON.stringify({ name, email, password: password || undefined }) // Envia senha apenas se preenchida
                    });
                } else { // Modo Adicionar (POST)
                    res = await fetch(API_URL + '/users', {
                        method: 'POST',
                        headers: authHeaders(),
                        body: JSON.stringify({ name, email, password })
                    });
                }
                const data = await res.json();

                if (res.ok) {
                    resetUserForm(); // Função para limpar o formulário de usuário
                    loadUsers(); // Recarrega a lista de usuários
                } else {
                    showError('userError', data.message || 'Erro ao salvar usuário.');
                }
            } catch (err) {
                console.error('Erro ao salvar usuário:', err);
                showError('userError', 'Erro ao conectar à API. Verifique sua conexão.');
            }
        });
    }

    // --- CRUD Produtos (products.html) ---
    const productsTable = document.getElementById('productsTable');
    const productForm = document.getElementById('productForm'); // Formulário de adicionar/editar produto
    const productIdInput = document.getElementById('productId');
    const productNameInput = document.getElementById('productName');
    const productDescriptionInput = document.getElementById('productDescription'); // Pode não existir
    const productPriceInput = document.getElementById('productPrice');


    if (productsTable) {
        redirectIfNotAuth(); // Protege a página de produtos
        loadProducts();
    }

    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearError('productError');

            const id = productIdInput.value;
            const name = productNameInput.value;
            const description = productDescriptionInput ? productDescriptionInput.value : undefined; // Condicional
            const price = productPriceInput.value;

            try {
                let res;
                if (id) { // Modo Edição (PUT)
                    res = await fetch(API_URL + '/products/' + id, {
                        method: 'PUT',
                        headers: authHeaders(),
                        body: JSON.stringify({ name, description, price })
                    });
                } else { // Modo Adicionar (POST)
                    res = await fetch(API_URL + '/products', {
                        method: 'POST',
                        headers: authHeaders(),
                        body: JSON.stringify({ name, description, price })
                    });
                }
                const data = await res.json();

                if (res.ok) {
                    resetProductForm(); // Função para limpar o formulário de produto
                    loadProducts(); // Recarrega a lista de produtos
                } else {
                    showError('productError', data.message || 'Erro ao salvar produto.');
                }
            } catch (err) {
                console.error('Erro ao salvar produto:', err);
                showError('productError', 'Erro ao conectar à API. Verifique sua conexão.');
            }
        });
    }


    // --- View pública do cardápio (menu.html) ---
    const menuTable = document.getElementById('menuTable'); // Assumindo que o cardápio público usa uma tabela também
    if (menuTable) {
        loadMenu();
    }
}); // Fim de document.addEventListener('DOMContentLoaded')

// --- Funções de Renderização e Ação (Chamadas por Event Listeners ou onclick) ---

// Usuários
async function loadUsers() {
    clearError('userError');
    try {
        const res = await fetch(API_URL + '/users', {
            headers: authHeaders()
        });
        const data = await res.json();
        if (res.ok) {
            renderUsers(data);
        } else {
            showError('userError', data.message || 'Erro ao carregar usuários.');
            // Se o erro for 401/403, pode redirecionar para login
            if (res.status === 401 || res.status === 403) redirectIfNotAuth();
        }
    } catch (err) {
        console.error('Erro ao carregar usuários:', err);
        showError('userError', 'Erro ao conectar à API. Verifique sua conexão.');
    }
}

function renderUsers(users) {
    const tbody = document.querySelector('#usersTable tbody'); // Garante que seleciona o tbody correto
    tbody.innerHTML = '';
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <button class="action-btn btn-info btn-sm" onclick="editUser('${user.id}', '${user.name.replace(/'/g, "&#39;")}', '${user.email.replace(/'/g, "&#39;")}')"><i class="fas fa-edit"></i> Editar</button>
                <button class="action-btn btn-danger btn-sm" onclick="deleteUser('${user.id}')"><i class="fas fa-trash"></i> Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editUser(id, name, email) {
    // Preenche o formulário para edição
    document.getElementById('userId').value = id;
    document.getElementById('userName').value = name;
    document.getElementById('userEmail').value = email;
    document.getElementById('userPassword').value = ''; // Senha não é preenchida por segurança

    // Adiciona classes do AdminLTE aos botões do formulário de usuário, se estiverem lá
    const saveButton = document.querySelector('#userForm button[type="submit"]');
    if (saveButton) {
        saveButton.textContent = 'Atualizar Usuário';
        saveButton.classList.remove('btn-primary');
        saveButton.classList.add('btn-info'); // Cor para atualização
    }
    const clearButton = document.querySelector('#userForm button[type="button"]');
    if (clearButton) {
        clearButton.textContent = 'Cancelar Edição';
    }
}

function resetUserForm() {
    // Limpa o formulário após adicionar/editar
    document.getElementById('userId').value = '';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userPassword').value = ''; // Limpa o campo de senha
    clearError('userError');

    // Restaura o texto e a classe do botão Salvar
    const saveButton = document.querySelector('#userForm button[type="submit"]');
    if (saveButton) {
        saveButton.textContent = 'Salvar Usuário';
        saveButton.classList.remove('btn-info');
        saveButton.classList.add('btn-primary');
    }
    const clearButton = document.querySelector('#userForm button[type="button"]');
    if (clearButton) {
        clearButton.textContent = 'Limpar Campos';
    }
}

async function deleteUser(id) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    clearError('userError');
    try {
        const res = await fetch(API_URL + '/users/' + id, {
            method: 'DELETE',
            headers: authHeaders()
        });
        if (res.ok) {
            loadUsers(); // Recarrega a lista
        } else {
            const data = await res.json();
            showError('userError', data.message || 'Erro ao excluir usuário.');
        }
    } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        showError('userError', 'Erro ao conectar à API. Verifique sua conexão.');
    }
}

// Produtos
async function loadProducts() {
    clearError('productError');
    try {
        const res = await fetch(API_URL + '/products', {
            headers: authHeaders()
        });
        const data = await res.json();
        if (res.ok) {
            renderProducts(data);
        } else {
            showError('productError', data.message || 'Erro ao carregar produtos.');
            if (res.status === 401 || res.status === 403) redirectIfNotAuth();
        }
    } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        showError('productError', 'Erro ao conectar à API. Verifique sua conexão.');
    }
}

function renderProducts(products) {
    const tbody = document.querySelector('#productsTable tbody'); // Garante o tbody correto
    tbody.innerHTML = '';
    products.forEach(product => {
        const tr = document.createElement('tr');
        // Adicionando a descrição no HTML da tabela de produtos se você a tiver
        // Adaptei o editProduct para incluir a descrição
        tr.innerHTML = `
            <td>${product.name}</td>
            <td>${product.description || ''}</td>
            <td>R$ ${Number(product.price).toFixed(2)}</td>
            <td>
                <button class="action-btn btn-info btn-sm" onclick="editProduct('${product.id}', '${product.name.replace(/'/g, "&#39;")}', '${(product.description || '').replace(/'/g, "&#39;")}', '${product.price}')"><i class="fas fa-edit"></i> Editar</button>
                <button class="action-btn btn-danger btn-sm" onclick="deleteProduct('${product.id}')"><i class="fas fa-trash"></i> Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editProduct(id, name, description, price) {
    // Preenche o formulário para edição
    document.getElementById('productId').value = id;
    document.getElementById('productName').value = name;
    // Verifica se o campo de descrição existe antes de tentar preencher
    const productDescriptionEl = document.getElementById('productDescription');
    if (productDescriptionEl) {
        productDescriptionEl.value = description;
    }
    document.getElementById('productPrice').value = price;

    // Adiciona classes do AdminLTE aos botões do formulário de produto
    const saveButton = document.querySelector('#productForm button[type="submit"]');
    if (saveButton) {
        saveButton.textContent = 'Atualizar Produto';
        saveButton.classList.remove('btn-primary');
        saveButton.classList.add('btn-info');
    }
    const clearButton = document.querySelector('#productForm button[type="button"]');
    if (clearButton) {
        clearButton.textContent = 'Cancelar Edição';
    }
}

function resetProductForm() {
    // Limpa o formulário após adicionar/editar
    document.getElementById('productId').value = '';
    document.getElementById('productName').value = '';
    const productDescriptionEl = document.getElementById('productDescription');
    if (productDescriptionEl) {
        productDescriptionEl.value = ''; // Limpa a descrição também
    }
    document.getElementById('productPrice').value = '';
    clearError('productError');

    // Restaura o texto e a classe do botão Salvar
    const saveButton = document.querySelector('#productForm button[type="submit"]');
    if (saveButton) {
        saveButton.textContent = 'Salvar Produto';
        saveButton.classList.remove('btn-info');
        saveButton.classList.add('btn-primary');
    }
    const clearButton = document.querySelector('#productForm button[type="button"]');
    if (clearButton) {
        clearButton.textContent = 'Limpar Campos';
    }
}

async function deleteProduct(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    clearError('productError');
    try {
        const res = await fetch(API_URL + '/products/' + id, {
            method: 'DELETE',
            headers: authHeaders()
        });
        if (res.ok) {
            loadProducts();
        } else {
            const data = await res.json();
            showError('productError', data.message || 'Erro ao excluir produto.');
        }
    } catch (err) {
        console.error('Erro ao excluir produto:', err);
        showError('productError', 'Erro ao conectar à API. Verifique sua conexão.');
    }
}

// Cardápio Público (menu.html)
async function loadMenu() {
    clearError('menuError'); // Assume que há um elemento com ID 'menuError'
    try {
        const res = await fetch(API_URL + '/menu'); // Assume que sua API tem um endpoint /menu
        const data = await res.json();
        if (res.ok) {
            renderMenu(data);
        } else {
            showError('menuError', data.message || 'Erro ao carregar cardápio.');
        }
    } catch (err) {
        console.error('Erro ao carregar cardápio:', err);
        showError('menuError', 'Erro ao conectar à API. Verifique sua conexão.');
    }
}

function renderMenu(products) {
    const tbody = document.querySelector('#menuTable tbody'); // Assumindo uma tabela com ID 'menuTable'
    if (!tbody) {
        console.warn('Elemento #menuTable tbody não encontrado para renderizar o cardápio.');
        return;
    }
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