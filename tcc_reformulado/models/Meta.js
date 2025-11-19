import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Definição do modelo Metas
const Meta = sequelize.define('Meta', {
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
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  data_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  data_final: {
    type: DataTypes.DATE,
    allowNull: false
  },
  foi_batida: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'meta',
  timestamps: false // Desabilita os timestamps automáticos já que temos campo customizado
});

export default Meta;