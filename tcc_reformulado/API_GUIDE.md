# 🚀 API de Gestão Financeira - Guia de Testes

## 📋 Funcionalidades Implementadas

### ✅ **AUTENTICAÇÃO**
- **POST** `/auth/register` - Criar conta
- **POST** `/auth/login` - Fazer login

### ✅ **TRANSAÇÕES (CRUD)**
- **GET** `/transacoes/:usuario_id` - Listar transações
- **POST** `/transacoes` - Criar transação
- **PUT** `/transacoes/:id` - Atualizar transação
- **DELETE** `/transacoes/:id` - Deletar transação

### ✅ **METAS (CRUD)**
- **GET** `/metas/:usuario_id` - Listar metas
- **POST** `/metas` - Criar meta
- **PUT** `/metas/:id` - Atualizar meta
- **DELETE** `/metas/:id` - Deletar meta
- **PATCH** `/metas/:id/toggle` - Marcar como batida/não batida

### ✅ **CATEGORIAS (CRUD)**
- **GET** `/categorias` - Listar categorias
- **POST** `/categorias` - Criar categoria
- **PUT** `/categorias/:id` - Atualizar categoria
- **DELETE** `/categorias/:id` - Deletar categoria

---

## 🧪 Como Testar (usando cURL ou Postman)

### 1️⃣ **REGISTRAR USUÁRIO**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "nome": "João Silva",
    "senha": "123456"
  }'
```

### 2️⃣ **FAZER LOGIN**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "senha": "123456"
  }'
```

### 3️⃣ **LISTAR CATEGORIAS**
```bash
curl -X GET http://localhost:3000/categorias
```

### 4️⃣ **CRIAR TRANSAÇÃO**
```bash
curl -X POST http://localhost:3000/transacoes \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "tipo_entrada": "saida",
    "valor": 50.00,
    "id_categoria": 1
  }'
```

### 5️⃣ **LISTAR TRANSAÇÕES DO USUÁRIO**
```bash
curl -X GET http://localhost:3000/transacoes/1
```

### 6️⃣ **CRIAR META**
```bash
curl -X POST http://localhost:3000/metas \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "nome": "Economizar para viagem",
    "valor": 2000.00,
    "data_inicio": "2024-01-01",
    "data_final": "2024-12-31"
  }'
```

### 7️⃣ **LISTAR METAS DO USUÁRIO**
```bash
curl -X GET http://localhost:3000/metas/1
```

### 8️⃣ **ATUALIZAR TRANSAÇÃO**
```bash
curl -X PUT http://localhost:3000/transacoes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 75.00,
    "tipo_entrada": "saida"
  }'
```

### 9️⃣ **MARCAR META COMO BATIDA**
```bash
curl -X PATCH http://localhost:3000/metas/1/toggle
```

### 🔟 **DELETAR TRANSAÇÃO**
```bash
curl -X DELETE http://localhost:3000/transacoes/1
```

---

## 📊 **Estrutura dos Dados**

### **Usuario**
```json
{
  "id": 1,
  "email": "joao@email.com",
  "nome": "João Silva",
  "senha": "123456",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### **Categoria**
```json
{
  "id": 1,
  "nome": "Alimentação",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### **Transacao**
```json
{
  "id": 1,
  "usuario_id": 1,
  "tipo_entrada": "saida",
  "valor": "50.00",
  "id_categoria": 1,
  "id_meta": null,
  "data_criacao": "2024-01-01T00:00:00.000Z",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "categoria": {
    "id": 1,
    "nome": "Alimentação"
  }
}
```

### **Meta**
```json
{
  "id": 1,
  "usuario_id": 1,
  "nome": "Economizar para viagem",
  "valor": "2000.00",
  "foi_batida": false,
  "data_inicio": "2024-01-01",
  "data_final": "2024-12-31",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🎯 **Categorias Padrão Criadas Automaticamente**

1. Alimentação
2. Transporte  
3. Moradia
4. Saúde
5. Educação
6. Lazer
7. Roupas
8. Investimentos
9. Salário
10. Freelance

---

## ⚡ **Para Executar**

1. Execute: `node index.js`
2. Servidor rodará em: `http://localhost:3000`
3. Use Postman, cURL ou qualquer cliente REST para testar

---

## 🔐 **Observações de Segurança**

⚠️ **IMPORTANTE**: Esta implementação é para desenvolvimento/teste. Em produção:

1. **Hash de senhas**: Use bcrypt para hash das senhas
2. **JWT**: Implemente autenticação com tokens JWT
3. **Validações**: Adicione validações mais robustas
4. **Rate limiting**: Implemente limitação de requests
5. **CORS**: Configure CORS adequadamente