# 🏗️ Estrutura Organizada da API

A API foi refatorada para seguir as melhores práticas de organização de código, separando responsabilidades em **Controllers** e **Routes**.

## 📁 **Nova Estrutura de Pastas**

```
c:\RepositoriosGit\tcc_novo_gabriel_biel\
├── 📁 config/
│   └── database.js          # Configuração do SQLite3
├── 📁 controller/           # 🎯 CONTROLLERS (Lógica de negócio)
│   ├── AuthController.js    # Login e registro
│   ├── TransacaoController.js # CRUD de transações
│   ├── MetaController.js    # CRUD de metas
│   └── CategoriaController.js # CRUD de categorias
├── 📁 models/               # 🗄️ MODELOS (Sequelize)
│   ├── index.js             # Relacionamentos
│   ├── Usuario.js
│   ├── Categoria.js
│   ├── Transacao.js
│   └── Metas.js
├── 📁 routes/               # 🛣️ ROTAS (Endpoints)
│   ├── index.js             # Configuração central
│   ├── authRoutes.js        # /auth/*
│   ├── transacaoRoutes.js   # /transacoes/*
│   ├── metaRoutes.js        # /metas/*
│   └── categoriaRoutes.js   # /categorias/*
├── 📁 views/
├── 📁 db/
├── index.js                 # 🚀 SERVIDOR PRINCIPAL
└── package.json
```

---

## 🎯 **Controllers (Lógica de Negócio)**

### **AuthController.js**
- `register()` - Criar conta de usuário
- `login()` - Autenticar usuário

### **TransacaoController.js**
- `listar()` - Buscar transações do usuário
- `criar()` - Criar nova transação
- `atualizar()` - Editar transação existente
- `deletar()` - Remover transação

### **MetaController.js**
- `listar()` - Buscar metas do usuário
- `criar()` - Criar nova meta
- `atualizar()` - Editar meta existente
- `deletar()` - Remover meta
- `toggle()` - Marcar/desmarcar como batida

### **CategoriaController.js**
- `listar()` - Buscar todas as categorias
- `criar()` - Criar nova categoria
- `atualizar()` - Editar categoria existente
- `deletar()` - Remover categoria

---

## 🛣️ **Routes (Endpoints)**

### **authRoutes.js** → `/auth/*`
```javascript
POST /auth/register  → AuthController.register
POST /auth/login     → AuthController.login
```

### **transacaoRoutes.js** → `/transacoes/*`
```javascript
GET    /transacoes/:usuario_id → TransacaoController.listar
POST   /transacoes            → TransacaoController.criar
PUT    /transacoes/:id        → TransacaoController.atualizar
DELETE /transacoes/:id        → TransacaoController.deletar
```

### **metaRoutes.js** → `/metas/*`
```javascript
GET    /metas/:usuario_id     → MetaController.listar
POST   /metas                → MetaController.criar
PUT    /metas/:id            → MetaController.atualizar
DELETE /metas/:id            → MetaController.deletar
PATCH  /metas/:id/toggle     → MetaController.toggle
```

### **categoriaRoutes.js** → `/categorias/*`
```javascript
GET    /categorias           → CategoriaController.listar
POST   /categorias           → CategoriaController.criar
PUT    /categorias/:id       → CategoriaController.atualizar
DELETE /categorias/:id       → CategoriaController.deletar
```

---

## ✅ **Vantagens da Nova Estrutura**

### 🎯 **Separação de Responsabilidades**
- **Controllers**: Contêm toda a lógica de negócio
- **Routes**: Apenas mapeamento de endpoints para controllers
- **Models**: Definição de esquemas de dados

### 🔧 **Manutenibilidade**
- Código mais organizado e fácil de encontrar
- Cada arquivo tem uma responsabilidade específica
- Facilita correções e melhorias

### 📈 **Escalabilidade**
- Fácil adicionar novas funcionalidades
- Padrão seguido em projetos profissionais
- Estrutura preparada para crescimento

### 🧪 **Testabilidade**
- Controllers podem ser testados isoladamente
- Funções estáticas facilitam testes unitários
- Separação clara de responsabilidades

---

## 🚀 **Como Usar**

1. **Execute o servidor:**
   ```bash
   node index.js
   ```

2. **Teste os endpoints:**
   ```bash
   # Registrar usuário
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","nome":"Teste","senha":"123456"}'
   
   # Login
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","senha":"123456"}'
   
   # Listar categorias
   curl http://localhost:3000/categorias
   ```

---

## 📚 **Documentação Completa**

- **API_GUIDE.md** - Guia completo de todos os endpoints
- **DATABASE_SCHEMA.md** - Esquema do banco de dados

---

## 🎉 **Pronto para Produção!**

A API está agora organizada seguindo as melhores práticas de desenvolvimento, pronta para ser expandida e mantida de forma profissional!