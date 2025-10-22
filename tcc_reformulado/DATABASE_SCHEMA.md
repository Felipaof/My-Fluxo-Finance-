# 📊 Sistema de Gestão Financeira - Database Schema

## 🗄️ Modelos do Banco de Dados

Aqui estão todos os modelos criados baseados no seu schema:

### 👤 Usuario
```javascript
{
  id: INTEGER (PK, auto-increment)
  email: STRING (unique, required, validação de email)
  nome: STRING (required, 2-100 chars)
  senha: STRING (required, 6-255 chars)
}
```

### 🏷️ Categoria
```javascript
{
  id: INTEGER (PK, auto-increment)
  nome: STRING (required, 2-100 chars)
}
```

### 💰 Transacao
```javascript
{
  id: INTEGER (PK, auto-increment)
  usuario_id: INTEGER (FK -> usuario.id)
  tipo_entrada: STRING ('entrada' ou 'saida')
  valor: DECIMAL(10,2) (required, >= 0)
  id_categoria: INTEGER (FK -> categoria.id)
  id_meta: INTEGER (FK -> metas.id, nullable)
  data_criacao: DATE (default: NOW)
  timestamp: DATE (default: NOW)
}
```

### 🎯 Metas
```javascript
{
  id: INTEGER (PK, auto-increment)
  usuario_id: INTEGER (FK -> usuario.id)
  nome: STRING (required, 2-100 chars)
  valor: DECIMAL(10,2) (required, >= 0)
  foi_batida: BOOLEAN (default: false)
  data_inicio: DATE (required)
  data_final: DATE (required)
  timestamp: DATE (default: NOW)
}
```

## 🔗 Relacionamentos Configurados

- **Usuario → Transacao**: Um usuário tem muitas transações
- **Usuario → Metas**: Um usuário tem muitas metas
- **Categoria → Transacao**: Uma categoria tem muitas transações
- **Metas → Transacao**: Uma meta pode ter uma transação (opcional)

## 💡 Exemplos de Uso

### Criar um usuário
```javascript
const novoUsuario = await Usuario.create({
  email: 'joao@email.com',
  nome: 'João Silva',
  senha: 'minhasenha123'
});
```

### Criar uma categoria
```javascript
const categoria = await Categoria.create({
  nome: 'Alimentação'
});
```

### Criar uma transação
```javascript
const transacao = await Transacao.create({
  usuario_id: 1,
  tipo_entrada: 'saida',
  valor: 50.00,
  id_categoria: 1,
  data_criacao: new Date()
});
```

### Criar uma meta
```javascript
const meta = await Metas.create({
  usuario_id: 1,
  nome: 'Economizar para viagem',
  valor: 2000.00,
  data_inicio: '2024-01-01',
  data_final: '2024-12-31'
});
```

### Buscar dados com relacionamentos
```javascript
// Buscar usuário com suas transações
const usuario = await Usuario.findByPk(1, {
  include: [
    {
      model: Transacao,
      as: 'transacoes',
      include: [
        { model: Categoria, as: 'categoria' }
      ]
    },
    {
      model: Metas,
      as: 'metas'
    }
  ]
});

// Buscar transações de um período
const transacoes = await Transacao.findAll({
  where: {
    usuario_id: 1,
    data_criacao: {
      [Op.between]: ['2024-01-01', '2024-12-31']
    }
  },
  include: [
    { model: Categoria, as: 'categoria' },
    { model: Usuario, as: 'usuario' }
  ]
});
```

## 🚀 Para executar

1. Execute: `node index.js`
2. O Sequelize criará todas as tabelas automaticamente
3. As tabelas serão criadas no arquivo `./db/banco.sqlite3`

## 📁 Estrutura de Arquivos

```
models/
├── index.js        # Exporta todos os modelos e define relacionamentos
├── Usuario.js      # Modelo do usuário
├── Categoria.js    # Modelo de categorias
├── Transacao.js    # Modelo de transações
└── Metas.js        # Modelo de metas
```