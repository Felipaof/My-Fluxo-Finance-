import { Categoria } from '../models/index.js';

class CategoriaController {
  // Listar todas as categorias
  static async getAll(req, res) {
    try {
      const categorias = await Categoria.findAll({
        order: [['nome', 'ASC']]
      });

      // Retornar array direto (não objeto)
      res.json(categorias);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  // Criar categoria
  static async create(req, res) {
    try {
      const { nome } = req.body;

      // Verificar se a categoria já existe
      const categoriaExistente = await Categoria.findOne({ where: { nome } });
      if (categoriaExistente) {
        return res.status(400).json({ 
          error: 'Categoria já existe com este nome' 
        });
      }

      const novaCategoria = await Categoria.create({ nome });

      res.status(201).json({
        message: 'Categoria criada com sucesso!',
        categoria: novaCategoria
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  // Atualizar categoria
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nome } = req.body;

      const categoria = await Categoria.findByPk(id);
      if (!categoria) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      // Verificar se já existe uma categoria com o novo nome (excluindo a atual)
      const categoriaExistente = await Categoria.findOne({ 
        where: { 
          nome,
          id: { [Op.ne]: id } // Excluir a categoria atual
        }
      });
      if (categoriaExistente) {
        return res.status(400).json({ 
          error: 'Já existe uma categoria com este nome' 
        });
      }

      await categoria.update({ nome });

      res.json({
        message: 'Categoria atualizada com sucesso!',
        categoria
      });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  // Deletar categoria
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const categoria = await Categoria.findByPk(id);
      if (!categoria) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      // Verificar se há transações usando esta categoria
      const { Transacao } = await import('../models/index.js');
      const transacoesComCategoria = await Transacao.count({
        where: { categoria_id: id }
      });

      if (transacoesComCategoria > 0) {
        return res.status(400).json({ 
          error: `Não é possível excluir esta categoria pois há ${transacoesComCategoria} transação(ões) vinculada(s) a ela.`
        });
      }

      await categoria.destroy();

      res.json({
        message: 'Categoria deletada com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }
}

export default CategoriaController;