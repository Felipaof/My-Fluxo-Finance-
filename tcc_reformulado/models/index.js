// Arquivo para definir todas as associações entre os modelos
import Usuarios from './Usuario.js';
import Transacao from './Transacao.js';
import Meta from './Meta.js';
import Categorias from './Categoria.js';

// Definir associações

// Usuario tem muitas Transacoes
Usuarios.hasMany(Transacao, {
  foreignKey: 'usuario_id',
  as: 'transacoes'
});

// Transacao pertence a um Usuario
Transacao.belongsTo(Usuarios, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Usuario tem muitas Metas
Usuarios.hasMany(Meta, {
  foreignKey: 'usuario_id',
  as: 'metas'
});

// Meta pertence a um Usuario
Meta.belongsTo(Usuarios, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Categoria tem muitas Transacoes (opcional)
Categorias.hasMany(Transacao, {
  foreignKey: 'categoria_id',
  as: 'transacoes'
});

// Transacao pertence a uma Categoria (opcional)
Transacao.belongsTo(Categorias, {
  foreignKey: 'categoria_id',
  as: 'categoria'
});

export { Usuarios as Usuario, Transacao, Meta, Categorias as Categoria };