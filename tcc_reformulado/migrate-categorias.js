import sequelize from './config/database.js';
import { Categoria } from './models/index.js';

async function migrateCategorias() {
  try {
    console.log('🔄 Iniciando migração de categorias...');
    
    // Sincronizar o modelo (adiciona as colunas se não existirem)
    await sequelize.sync({ alter: true });
    console.log('✅ Colunas adicionadas com sucesso!');
    
    // Atualizar categorias existentes
    console.log('🔄 Atualizando categorias existentes...');
    
    const categoriasParaAtualizar = [
      { nome: 'Alimentação', icone: '🍔', tipo: 'despesa' },
      { nome: 'Transporte', icone: '🚗', tipo: 'despesa' },
      { nome: 'Saúde', icone: '⚕️', tipo: 'despesa' },
      { nome: 'Educação', icone: '📚', tipo: 'despesa' },
      { nome: 'Lazer', icone: '🎮', tipo: 'despesa' },
      { nome: 'Moradia', icone: '🏠', tipo: 'despesa' },
      { nome: 'Vestuário', icone: '👔', tipo: 'despesa' },
      { nome: 'Salário', icone: '💼', tipo: 'receita' },
      { nome: 'Freelance', icone: '💻', tipo: 'receita' },
      { nome: 'Investimentos', icone: '📈', tipo: 'receita' },
      { nome: 'Outros', icone: '📦', tipo: 'despesa' }
    ];
    
    for (const cat of categoriasParaAtualizar) {
      await Categoria.update(
        { icone: cat.icone, tipo: cat.tipo },
        { where: { nome: cat.nome } }
      );
      console.log(`  ✓ ${cat.nome} atualizada`);
    }
    
    // Verificar resultado
    const categorias = await Categoria.findAll();
    console.log('\n📊 Categorias no banco:');
    categorias.forEach(cat => {
      console.log(`  ${cat.icone} ${cat.nome} (${cat.tipo}) - Usuario: ${cat.usuario_id || 'Sistema'}`);
    });
    
    console.log('\n✅ Migração concluída com sucesso!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

migrateCategorias();
