import { Categoria } from '../models/index.js';
import { Op } from 'sequelize';

class CategoriaController {
  // Listar todas as categorias
  static async getAll(req, res) {
    try {
      // Se o usuário estiver autenticado, busca categorias do sistema + do usuário
      // Se não, busca apenas categorias do sistema
      const usuario_id = req.usuario ? req.usuario.id : null;
      
      let whereCondition;
      
      if (usuario_id) {
        // Usuário autenticado: categorias do sistema + do usuário
        whereCondition = {
          [Op.or]: [
            { usuario_id: null }, // Categorias padrão do sistema
            { usuario_id: usuario_id } // Categorias do usuário
          ]
        };
      } else {
        // Não autenticado: apenas categorias do sistema
        whereCondition = {
          usuario_id: null
        };
      }
      
      const categorias = await Categoria.findAll({
        where: whereCondition,
        order: [['tipo', 'ASC'], ['nome', 'ASC']]
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
      const { nome, tipo, icone } = req.body;
      const usuario_id = req.usuario.id;

      // Validações
      if (!nome || !tipo) {
        return res.status(400).json({ 
          error: 'Nome e tipo são obrigatórios' 
        });
      }

      if (!['receita', 'despesa'].includes(tipo)) {
        return res.status(400).json({ 
          error: 'Tipo deve ser "receita" ou "despesa"' 
        });
      }

      // Verificar se o usuário já tem uma categoria com este nome
      const categoriaExistente = await Categoria.findOne({ 
        where: { 
          nome,
          usuario_id 
        } 
      });
      
      if (categoriaExistente) {
        return res.status(400).json({ 
          error: 'Você já tem uma categoria com este nome' 
        });
      }

      const novaCategoria = await Categoria.create({ 
        nome,
        tipo,
        icone: icone || '📂',
        usuario_id
      });

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