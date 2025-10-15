import authRoutes from './authRoutes.js';
import transacaoRoutes from './transacaoRoutes.js';
import metaRoutes from './metaRoutes.js';
import categoriaRoutes from './categoriaRoutes.js';

// Função para configurar todas as rotas
const setupRoutes = (app, prefix = '') => {
  console.log(`Configurando rotas com prefixo: ${prefix}`);
  
  // Rotas de autenticação
  app.use(`${prefix}/auth`, authRoutes);
  console.log(`✅ Rotas de auth configuradas: ${prefix}/auth`);
  
  // Rotas de transações  
  app.use(`${prefix}/transacoes`, transacaoRoutes);
  console.log(`✅ Rotas de transações configuradas: ${prefix}/transacoes`);
  
  // Rotas de metas
  app.use(`${prefix}/metas`, metaRoutes);
  console.log(`✅ Rotas de metas configuradas: ${prefix}/metas`);
  
  // Rotas de categorias
  app.use(`${prefix}/categorias`, categoriaRoutes);
  console.log(`✅ Rotas de categorias configuradas: ${prefix}/categorias`);
};

export default setupRoutes;