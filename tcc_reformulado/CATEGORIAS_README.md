# 🏷️ Sistema de Categorias Personalizadas

## 📋 Visão Geral
Sistema que permite aos usuários criar suas próprias categorias de transações, podendo ser de **receita** ou **despesa**, com ícones personalizados.

## ✨ Funcionalidades

### 1. **Categorias do Sistema**
- Categorias padrão disponíveis para todos os usuários
- Não podem ser editadas ou excluídas
- `usuario_id = NULL` no banco de dados

### 2. **Categorias Personalizadas**
- Criadas pelos usuários
- Específicas para cada usuário (`usuario_id` preenchido)
- Podem ser editadas e excluídas
- Tipos: **receita** ou **despesa**
- Ícone personalizável (emoji)

## 🗄️ Estrutura do Banco de Dados

### Tabela `categoria`
```sql
id              INTEGER PRIMARY KEY
nome            VARCHAR(255) NOT NULL
tipo            VARCHAR(255) NOT NULL DEFAULT 'despesa' -- 'receita' ou 'despesa'
icone           VARCHAR(255) DEFAULT '📂'
usuario_id      INTEGER REFERENCES usuario(id) -- NULL para categorias do sistema
created_at      DATETIME
updated_at      DATETIME
```

## 🎨 Interface do Usuário

### Página de Categorias
**Localização:** `/categorias`

**Componentes:**
1. **Header com botão "Nova Categoria"**
2. **Filtros de período** (mês, trimestre, ano, personalizado)
3. **Cards de resumo** (Receitas, Despesas, Saldo)
4. **Tabela detalhada** com:
   - Nome e ícone da categoria
   - Total de receitas
   - Total de despesas
   - Saldo
   - Número de transações
   - Porcentagem do total

### Modal de Nova Categoria
**Campos:**
- **Nome** (obrigatório, 2-100 caracteres)
- **Tipo** (obrigatório, receita ou despesa)
- **Ícone** (opcional, emoji)

**Ícones sugeridos:**
🍔 🚗 🏠 ⚕️ 📚 🎮 👔 💼 📈 🎁 ✈️ 🎨

## 🔧 API Endpoints

### Listar Categorias
```
GET /api/categorias
Authorization: Bearer {token}
```
**Retorna:** Categorias do sistema + categorias do usuário logado

### Criar Categoria
```
POST /api/categorias
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Streaming",
  "tipo": "despesa",
  "icone": "📺"
}
```

### Deletar Categoria
```
DELETE /api/categorias/:id
Authorization: Bearer {token}
```
**Nota:** Apenas categorias personalizadas podem ser deletadas

## 💻 Código JavaScript

### Funções Principais

```javascript
// Abrir modal
abrirModalCategoria()

// Fechar modal
fecharModalCategoria()

// Selecionar ícone
selecionarIcone(icone)

// Salvar categoria
salvarCategoria(event)
```

### Exemplo de Uso
```javascript
// Criar nova categoria
const categoria = {
  nome: 'Netflix',
  tipo: 'despesa',
  icone: '📺'
};

await api.createCategoria(categoria);
```

## 🎯 Validações

### Backend (CategoriaController)
- ✅ Nome obrigatório (2-100 caracteres)
- ✅ Tipo obrigatório ('receita' ou 'despesa')
- ✅ Verifica duplicação de nome por usuário
- ✅ Ícone padrão se não fornecido

### Frontend (categorias.js)
- ✅ Nome mínimo 2 caracteres
- ✅ Tipo selecionado
- ✅ Validação antes do envio
- ✅ Loading state durante criação
- ✅ Notificações de sucesso/erro

## 📝 Categorias Padrão

### Despesas
- 🍔 Alimentação
- 🚗 Transporte
- 🏠 Moradia
- ⚕️ Saúde
- 📚 Educação
- 🎮 Lazer
- 📦 Outros

### Receitas
- 💼 Salário
- 📈 Investimentos

## 🔄 Migração

Para adicionar os novos campos ao banco existente:
```bash
node migrate-categorias.js
```

Isso adiciona:
- Coluna `tipo`
- Coluna `icone`
- Coluna `usuario_id`
- Atualiza categorias existentes com ícones

## 🎨 Estilos CSS

### Classes Principais
- `.modal-overlay` - Overlay do modal
- `.modal-content` - Conteúdo do modal
- `.icone-selector` - Seletor de ícones
- `.icone-btn` - Botões de ícone
- `.form-info-box` - Caixa de informações

### Responsividade
- Desktop: Layout completo
- Tablet: Adaptado
- Mobile: Single column

## 🚀 Fluxo de Uso

1. **Usuário acessa** `/categorias`
2. **Clica em** "Nova Categoria"
3. **Preenche:**
   - Nome da categoria
   - Tipo (receita/despesa)
   - Ícone (opcional)
4. **Salva**
5. **Sistema:**
   - Valida dados
   - Verifica duplicação
   - Cria no banco
   - Atualiza interface
   - Mostra notificação

## 🔒 Segurança

- ✅ Autenticação obrigatória
- ✅ Categorias isoladas por usuário
- ✅ Validação de dados no backend
- ✅ Proteção contra SQL injection (Sequelize ORM)
- ✅ Sanitização de inputs

## 📊 Relatórios

As categorias personalizadas aparecem automaticamente em:
- Dashboard
- Relatórios financeiros
- Análise de categorias
- Gráficos de distribuição

## 🐛 Troubleshooting

### Categoria não aparece na lista
- Verifique se está logado
- Confirme que a categoria foi criada com sucesso
- Recarregue a página

### Erro ao criar categoria
- Verifique se o nome já existe
- Confirme que selecionou o tipo
- Verifique conexão com API

### Ícone não exibe
- Use apenas emojis
- Máximo 2 caracteres
- Teste com ícones sugeridos

## 🎉 Benefícios

✅ **Flexibilidade** - Crie categorias específicas para sua realidade
✅ **Organização** - Separe receitas e despesas
✅ **Visual** - Ícones facilitam identificação
✅ **Privacidade** - Cada usuário tem suas categorias
✅ **Praticidade** - Interface simples e intuitiva
