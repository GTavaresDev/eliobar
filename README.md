# Eliobar - Painel Administrativo e Cardário

## Objetivo
Este projeto é um sistema simples de painel administrativo para cadastro e gerenciamento de usuários e produtos, além de uma página pública de cardário. Ele é ideal para bares, lanchonetes ou estabelecimentos que desejam gerenciar seu cardário e usuários de forma prática.

## Funcionalidades
- Cadastro e login de usuários (com autenticação JWT)
- CRUD de usuários (criar, listar, editar, remover)
- CRUD de produtos (criar, listar, editar, remover)
- Página pública de cardário (menu)
- Interface web moderna e responsiva

## Tecnologias Utilizadas
- **Backend:** Node.js, Express, JWT
- **Frontend:** HTML, CSS, JavaScript puro

## Como rodar o projeto

### 1. Instale as dependências do backend
```bash
npm install
```

### 2. Inicie o servidor backend (API)
```bash
node server.js
```
A API estará disponível em `http://localhost:3000/api`

### 3. Inicie o servidor para o frontend (HTML/CSS/JS)
Você pode usar o Python para servir os arquivos estáticos:
```bash
python -m http.server 8080
```
Acesse o frontend em `http://localhost:8080/index.html`

> **Obs:** O backend e o frontend são independentes. O backend serve apenas a API, enquanto o frontend é servido por um servidor estático (como o Python HTTP Server).

## Estrutura de Pastas
- `server.js` - API backend (Node.js)
- `app.js` - Lógica do frontend (consome a API)
- `index.html`, `register.html`, `users.html`, `products.html`, `menu.html` - Páginas do frontend
- `style.css`, `cardapio.css` - Estilos
- `package.json` - Dependências do backend

## Endpoints principais da API
- `POST /api/register` - Cadastro de usuário
- `POST /api/login` - Login de usuário
- `GET /api/users` - Listar usuários (protegido)
- `POST /api/users` - Criar usuário (protegido)
- `PUT /api/users/:id` - Editar usuário (protegido)
- `DELETE /api/users/:id` - Remover usuário (protegido)
- `GET /api/products` - Listar produtos (protegido)
- `POST /api/products` - Criar produto (protegido)
- `PUT /api/products/:id` - Editar produto (protegido)
- `DELETE /api/products/:id` - Remover produto (protegido)
- `GET /api/menu` - Listar produtos (público)

## Observações
- Os dados são mantidos em memória (ao reiniciar o servidor, tudo é perdido).
- O projeto é para fins didáticos e pode ser expandido para uso com banco de dados.

---

Se tiver dúvidas ou quiser contribuir, fique à vontade para abrir uma issue ou PR! 