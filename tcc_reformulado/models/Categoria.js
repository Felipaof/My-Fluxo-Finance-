import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Definição do modelo Categoria
const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'despesa',
    validate: {
      isIn: [['receita', 'despesa']]
    }
  },
  icone: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '📂'
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // null para categorias padrão do sistema
    references: {
      model: 'usuario',
      key: 'id'
    }
  }
}, {
  tableName: 'categoria'
});

export default Categoria;