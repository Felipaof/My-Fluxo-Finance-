import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import setupRoutes from './routes/index.js';
import sequelize from './config/database.js';
import { Usuario, Transacao, Meta, Categoria } from './models/index.js';
import { requireAuth } from './middleware/auth.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configurar EJS e arquivos estáticos
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));


// Rota do frontend (Páginas EJS)
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'FinanceFlow - Controle Financeiro',
    pageClass: 'landing-page'
  });
});

app.get('/login', (req, res) => {
  res.render('auth/login', { 
    title: 'Login - FinanceFlow',
    pageClass: 'auth-page'
  });
});

app.get('/register', (req, res) => {
  res.render('auth/register', { 
    title: 'Cadastro - FinanceFlow',
    pageClass: 'auth-page'
  });
});

// Rotas protegidas
app.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', { 
    title: 'Dashboard - FinanceFlow',
    pageClass: 'dashboard-page',
    user: req.usuario
  });
});

app.get('/transacoes', requireAuth, (req, res) => {
  res.render('transacoes', { 
    title: 'Transações - FinanceFlow',
    pageClass: 'dashboard-page',
    user: req.usuario
  });
});

app.get('/metas', requireAuth, (req, res) => {
  res.render('metas', { 
    title: 'Metas - FinanceFlow',
    pageClass: 'dashboard-page',
    user: req.usuario
  });
});

app.get('/relatorios', requireAuth, (req, res) => {
  res.render('relatorios', { 
    title: 'Relatórios - FinanceFlow',
    pageClass: 'dashboard-page',
    user: req.usuario
  });
});

app.get('/categorias', requireAuth, (req, res) => {
  res.render('categorias', { 
    title: 'Categorias - FinanceFlow',
    pageClass: 'dashboard-page',
    user: req.usuario
  });
});

app.get('/configuracoes', requireAuth, (req, res) => {
  res.render('configuracoes', { 
    title: 'Configurações - FinanceFlow',
    pageClass: 'dashboard-page',
    user: req.usuario
  });
});

// Middleware para rotas da API
app.use('/api', (req, res, next) => {
  console.log(` API: ${req.method} ${req.path}`);
  next();
});

// Configurar todas as rotas da API
setupRoutes(app, '/api');

// Função para testar conexão com banco
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(' Conexão com SQLite estabelecida!');
  } catch (error) {
    console.error(' Erro ao conectar com banco:', error);
    throw error;
  }
}

// Função para sincronizar banco de dados
async function syncDatabase() {
  try {
    console.log(' Sincronizando banco de dados...');
    
    // Sincronização simples sem problemas de backup
    await sequelize.sync({ 
      force: false,
      // Removido alter que causava problemas no SQLite
      logging: false // Desabilitar logs para limpeza
    });
    
    console.log(' Banco de dados sincronizado!');
  } catch (error) {
    console.error(' Erro ao sincronizar banco:', error);
    
    // Se der erro, tentar recriar (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(' Tentando recriar banco em modo desenvolvimento...');
      try {
        await sequelize.sync({ force: true });
        console.log(' Banco recriado com sucesso!');
      } catch (recreateError) {
        console.error(' Erro ao recriar banco:', recreateError);
        throw recreateError;
      }
    } else {
      throw error;
    }
  }
}

// Função para criar dados iniciais
async function criarDadosIniciais() {
  try {
    console.log(' Criando dados iniciais...');
    
    // Criar categorias padrão se não existirem
    const categoriasIniciais = [
      'Alimentação',
      'Transporte', 
      'Moradia',
      'Saúde',
      'Educação',
      'Lazer',
      'Compras',
      'Salário',
      'Freelance',
      'Investimentos',
      'Outros'
    ];

    for (const nomeCategoria of categoriasIniciais) {
      const [categoria, created] = await Categoria.findOrCreate({
        where: { nome: nomeCategoria },
        defaults: { nome: nomeCategoria }
      });
      
      if (created) {
        console.log(` Categoria criada: ${nomeCategoria}`);
      }
    }

    console.log(' Dados iniciais criados!');
  } catch (error) {
    console.error(' Erro ao criar dados iniciais:', error);
    throw error;
  }
}

// Inicializar aplicação
async function inicializarApp() {
  try {
    // 1. Testar conexão
    await testConnection();
    
    // 2. Sincronizar banco
    await syncDatabase();
    
    // 3. Criar dados iniciais
    await criarDadosIniciais();
    
    // 4. Iniciar servidor
    app.listen(port, () => {
      console.log(' FinanceFlow iniciado com sucesso!');
      console.log(` Frontend: http://localhost:${port}`);
     
    });
    
  } catch (error) {
    console.error(' Erro ao inicializar aplicação:', error);
    process.exit(1);
  }
}

// Inicializar
inicializarApp();

