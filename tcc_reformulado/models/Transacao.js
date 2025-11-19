import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Definição do modelo Transacao
const Transacao = sequelize.define('Transacao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuario',
      key: 'id'
    }
  },
  categoria_id: { 
    type: DataTypes.INTEGER,
    references: {
      model: 'categoria',
      key: 'id'
    }
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tipo_entrada: {
    type: DataTypes.ENUM('entrada', 'saida'),
    allowNull: false
  },
  data_criacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'transacao',
  timestamps: false // Desabilita os timestamps automáticos já que temos campos customizados
});

export default Transacao;