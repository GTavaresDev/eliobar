import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;
const SECRET = 'segredo123';

app.use(cors());
app.use(bodyParser.json());

let users = [
  // Exemplo: { id: '1', name: 'Admin', email: 'admin@email.com', password: '123456' }
];
let nextId = 1;

let products = [
  // Exemplo: { id: '1', name: 'Cerveja', description: 'Long neck', price: 10.0 }
];
let nextProductId = 1;

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '2h' });
}
function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ message: 'Token não fornecido' });
  const token = auth.split(' ')[1];
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
}

// Cadastro
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Preencha todos os campos' });
  if (users.find(u => u.email === email)) return res.status(400).json({ message: 'Email já cadastrado' });
  const user = { id: String(nextId++), name, email, password };
  users.push(user);
  res.status(201).json({ message: 'Usuário cadastrado' });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Email ou senha inválidos' });
  const token = generateToken(user);
  res.json({ token });
});

// Listar usuários
app.get('/api/users', authMiddleware, (req, res) => {
  res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email })));
});
// Criar usuário
app.post('/api/users', authMiddleware, (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Preencha todos os campos' });
  if (users.find(u => u.email === email)) return res.status(400).json({ message: 'Email já cadastrado' });
  const user = { id: String(nextId++), name, email, password };
  users.push(user);
  res.status(201).json({ id: user.id, name: user.name, email: user.email });
});
// Atualizar usuário
app.put('/api/users/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  if (email && users.some(u => u.email === email && u.id !== id)) return res.status(400).json({ message: 'Email já cadastrado' });
  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = password;
  res.json({ id: user.id, name: user.name, email: user.email });
});
// Deletar usuário
app.delete('/api/users/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Usuário não encontrado' });
  users.splice(idx, 1);
  res.json({ message: 'Usuário removido' });
});

// CRUD de produtos (protegido)
app.get('/api/products', authMiddleware, (req, res) => {
  res.json(products);
});
app.post('/api/products', authMiddleware, (req, res) => {
  const { name, description, price } = req.body;
  if (!name || !price) return res.status(400).json({ message: 'Preencha nome e preço' });
  const product = { id: String(nextProductId++), name, description: description || '', price: Number(price) };
  products.push(product);
  res.status(201).json(product);
});
app.put('/api/products/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
  if (name) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = Number(price);
  res.json(product);
});
app.delete('/api/products/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Produto não encontrado' });
  products.splice(idx, 1);
  res.json({ message: 'Produto removido' });
});

// Rota pública para cardápio
app.get('/api/menu', (req, res) => {
  res.json(products);
});

app.listen(PORT, () => {
  console.log('API rodando em http://localhost:' + PORT + '/api');
}); 