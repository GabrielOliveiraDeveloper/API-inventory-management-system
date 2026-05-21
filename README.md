# 📦 API — Inventory Management System

API RESTful para gerenciamento de estoque, desenvolvida com Node.js, TypeScript e MongoDB. Permite o controle de produtos, registro de movimentações de entrada e saída, autenticação de usuários com controle de acesso por perfil e alertas automáticos por e-mail quando o estoque de um produto cai abaixo do mínimo configurado.

---

## 🛠️ Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js |
| Linguagem | TypeScript 6 |
| Framework | Express 5 |
| Banco de dados | MongoDB + Mongoose 9 |
| Autenticação | JSON Web Token (JWT) |
| Validação | Zod 4 |
| Hash de senha | bcryptjs |
| E-mail | Nodemailer |
| Rate limiting | express-rate-limit |
| Testes | Jest 30 + ts-jest |
| Variáveis de ambiente | dotenv |

---

## ✨ Funcionalidades

- Autenticação com JWT e expiração de token
- Controle de acesso por perfil (`admin` / `employee`)
- Rate limiting global e específico para rotas de autenticação
- CRUD completo de produtos com paginação, busca e filtro por categoria
- Registro de movimentações de estoque (entrada e saída)
- Alerta automático por e-mail quando o estoque cai abaixo do mínimo
- Validação de todos os inputs com Zod
- Paginação em todas as listagens

---

## 📋 Pré-requisitos

- Node.js 18+
- MongoDB (local ou Atlas)
- Conta de e-mail SMTP (para alertas de estoque)

---

## 🚀 Instalação e execução

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/api-inventory-management-system.git
cd api-inventory-management-system

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# edite o arquivo .env com suas configurações

# 4. Inicie o servidor
npm start
```

O servidor sobe em `http://localhost:3000`.

---

## ⚙️ Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de dados
MONGODB_URI=mongodb://localhost:27017/inventory

# Autenticação
JWT_SECRET=sua_chave_secreta_aqui

# E-mail (SMTP)
EMAIL_HOST=smtp.exemplo.com
EMAIL_PORT=587
EMAIL_USER=seu@email.com
EMAIL_PASS=sua_senha

# Destinatário dos alertas de estoque
ADMIN_EMAIL=admin@empresa.com
```

---

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Modo watch
npm run test:watch

# Relatório de cobertura
npm run test:coverage
```

Os testes cobrem os controllers de autenticação, produtos e movimentações, incluindo cenários de erro, validação e casos de sucesso.

---

## 📡 Endpoints

### 🔐 Autenticação — `/api/auth`

| Método | Rota | Autenticação | Perfil | Descrição |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | — | Autentica o usuário e retorna um token JWT |
| `POST` | `/api/auth/register` | ✅ | `admin` | Cadastra um novo usuário |

---

#### `POST /api/auth/login`

**Body:**
```json
{
  "email": "admin@empresa.com",
  "password": "senha123"
}
```

**Resposta de sucesso `200`:**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "...",
    "username": "admin",
    "email": "admin@empresa.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### `POST /api/auth/register`

> Requer token JWT de um usuário com perfil `admin` no header.

**Body:**
```json
{
  "username": "novo_usuario",
  "email": "usuario@empresa.com",
  "password": "senha123",
  "role": "employee"
}
```

O campo `role` é opcional e aceita `"admin"` ou `"employee"` (padrão: `"employee"`).

**Resposta de sucesso `201`:**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "username": "novo_usuario",
    "email": "usuario@empresa.com",
    "role": "employee"
  }
}
```

---

### 📦 Produtos — `/api/products`

Todas as rotas de produtos exigem token JWT válido.

| Método | Rota | Perfil | Descrição |
|---|---|---|---|
| `POST` | `/api/products/create` | `admin` | Cria um novo produto |
| `GET` | `/api/products/list` | qualquer | Lista produtos com paginação e filtros |
| `PUT` | `/api/products/update/:id` | `admin` | Atualiza um produto |
| `DELETE` | `/api/products/delete/:id` | `admin` | Remove um produto |

---

#### `POST /api/products/create`

**Body:**
```json
{
  "name": "Parafuso M6",
  "sku": "PAR-M6-001",
  "description": "Parafuso sextavado M6 x 20mm",
  "category": "Fixadores",
  "costPrice": 0.50,
  "salePrice": 1.20,
  "quantityCurrent": 500,
  "quantityMin": 100
}
```

**Resposta de sucesso `201`:**
```json
{
  "message": "Product created successfully",
  "product": { ... }
}
```

---

#### `GET /api/products/list`

**Query params:**

| Parâmetro | Tipo | Padrão | Descrição |
|---|---|---|---|
| `page` | number | `1` | Página atual |
| `limit` | number | `10` | Itens por página |
| `search` | string | — | Busca por nome (case insensitive) |
| `category` | string | — | Filtra por categoria exata |

**Exemplo:** `GET /api/products/list?page=1&limit=10&search=parafuso&category=Fixadores`

**Resposta de sucesso `200`:**
```json
{
  "message": "Products retrieved successfully",
  "pagination": {
    "totalItems": 42,
    "totalPages": 5,
    "currentPage": 1,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "products": [ ... ]
}
```

---

#### `PUT /api/products/update/:id`

Todos os campos do body são opcionais. Apenas os campos enviados serão atualizados.

**Body (exemplo):**
```json
{
  "salePrice": 1.50,
  "quantityMin": 150
}
```

**Resposta de sucesso `200`:**
```json
{
  "message": "Product updated successfully",
  "product": { ... }
}
```

---

#### `DELETE /api/products/delete/:id`

**Resposta de sucesso `200`:**
```json
{
  "message": "Product removed successfully"
}
```

---

### 🔄 Movimentações — `/api/movements`

Todas as rotas de movimentações exigem token JWT válido.

| Método | Rota | Perfil | Descrição |
|---|---|---|---|
| `POST` | `/api/movements/register/:userId` | `admin` (entrada) / qualquer (saída) | Registra uma movimentação |
| `GET` | `/api/movements/` | qualquer | Lista movimentações com paginação e filtros |

---

#### `POST /api/movements/register/:userId`

> Movimentações do tipo `"in"` (entrada de estoque) são restritas a usuários com perfil `admin`.
> Quando uma saída (`"out"`) faz o estoque cair abaixo de `quantityMin`, um e-mail de alerta é enviado automaticamente para `ADMIN_EMAIL`.

**Params:**
- `:userId` — ID do usuário responsável pela movimentação (MongoDB ObjectId)

**Body:**
```json
{
  "type": "out",
  "quantity": 50,
  "product": "64f1a2b3c4d5e6f7a8b9c0d1"
}
```

O campo `type` aceita `"in"` (entrada) ou `"out"` (saída).

**Resposta de sucesso `201`:**
```json
{
  "message": "Movement registered successfully"
}
```

**Erro de estoque insuficiente `400`:**
```json
{
  "message": "Insufficient stock to decrease"
}
```

---

#### `GET /api/movements/`

**Query params:**

| Parâmetro | Tipo | Padrão | Descrição |
|---|---|---|---|
| `page` | number | `1` | Página atual |
| `limit` | number | `10` | Itens por página |
| `type` | `"in"` \| `"out"` | — | Filtra por tipo de movimentação |
| `product` | string | — | Filtra pelo ID do produto |
| `user` | string | — | Filtra pelo ID do usuário |

**Resposta de sucesso `200`:**
```json
{
  "message": "Movements retrieved successfully",
  "pagination": {
    "totalItems": 200,
    "totalPages": 20,
    "currentPage": 1,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "movements": [
    {
      "type": "out",
      "quantity": 50,
      "product": { "name": "Parafuso M6", "sku": "PAR-M6-001", ... },
      "user": { "username": "joao", "email": "joao@empresa.com", ... },
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 🗂️ Estrutura do projeto

```
src/
├── controllers/
│   ├── auth/
│   │   ├── LoginController.ts
│   │   └── RegisterController.ts
│   ├── movements/
│   │   └── MovementsController.ts
│   └── products/
│       └── ProductsController.ts
├── middlewares/
│   ├── AuthMiddleware.ts
│   ├── RoleMiddleware.ts
│   └── RateLimiter.ts
├── models/
│   ├── User.ts
│   ├── Product.ts
│   └── Movement.ts
├── routes/
│   ├── authRoutes.ts
│   ├── productsRoutes.ts
│   └── movementRoutes.ts
├── services/
│   ├── IncreaseProductInventory.ts
│   ├── DecreasesProductInventory.ts
│   └── EmailSender.ts
├── db/
│   └── connectToDB.ts
└── index.ts
```

---

## 🔒 Rate Limiting

| Escopo | Janela | Máximo de requisições |
|---|---|---|
| Global | 15 minutos | 100 |
| Rota de login | 15 minutos | 10 |

---

## 👤 Perfis de usuário

| Perfil | Permissões |
|---|---|
| `admin` | Acesso total — cadastro de usuários, criação/edição/remoção de produtos, entrada e saída de estoque |
| `employee` | Consulta de produtos, consulta de movimentações, registro de saída de estoque |
