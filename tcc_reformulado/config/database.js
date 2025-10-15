import { Sequelize } from 'sequelize';

// Configuração do banco SQLite3
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/banco.sqlite3', // Caminho para o arquivo do banco
  logging: console.log, // Mostra as queries SQL no console (opcional)
  define: {
    // Configurações padrão para todos os modelos
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    underscored: true, // Usa snake_case ao invés de camelCase para nomes de colunas
    freezeTableName: true, // Impede que o Sequelize pluralize nomes de tabelas
  }
});

// Função para testar a conexão
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco estabelecida com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error);
  }
};

// Função para sincronizar os modelos (criar tabelas)
export const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false }); // force: true apaga e recria as tabelas
    console.log('✅ Banco sincronizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao sincronizar o banco:', error);
  }
};

export default sequelize;