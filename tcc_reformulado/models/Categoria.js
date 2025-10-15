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
  }
}, {
  tableName: 'categoria'
});

export default Categoria;