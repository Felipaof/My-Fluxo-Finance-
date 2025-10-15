import { Usuario, Categoria, Transacao } from '../models/index.js';

class TransacaoController {
  
  // Listar todas as transações de um usuário
  static async getByUsuario(req, res) {
    try {
      const { usuario_id } = req.params;
      
      // Verificar se o usuário está acessando suas próprias transações
      if (req.usuario.id != usuario_id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const transacoes = await Transacao.findAll({
        where: { usuario_id },
        include: [
          { 
            model: Categoria, 
            as: 'categoria',
            attributes: ['id', 'nome'],
            required: false // LEFT JOIN - permite transações sem categoria
          }
        ],
        order: [['data_criacao', 'DESC']]
      });

      res.json(transacoes);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  // Criar nova transação
  static async create(req, res) {
    try {
      const { descricao, valor, tipo_entrada, categoria_id, data_criacao } = req.body;
      const usuario_id = req.usuario.id;

      console.log('Dados recebidos:', { descricao, valor, tipo_entrada, categoria_id, data_criacao });

      // Verificar se a categoria existe (se fornecida)
      if (categoria_id) {
        const categoria = await Categoria.findByPk(categoria_id);
        if (!categoria) {
          return res.status(404).json({ error: 'Categoria não encontrada' });
        }
      }

      // Preparar dados para criação
      const dadosTransacao = {
        usuario_id,
        descricao: descricao?.trim(),
        valor: parseFloat(valor),
        tipo_entrada,
        data_criacao: data_criacao || new Date()
      };

      // Adicionar categoria apenas se fornecida
      if (categoria_id && categoria_id !== '' && categoria_id !== 'null') {
        dadosTransacao.categoria_id = parseInt(categoria_id);
      }

      console.log('Criando transação com dados:', dadosTransacao);

      const novaTransacao = await Transacao.create(dadosTransacao);

      // Buscar transação com categoria
      const transacaoComCategoria = await Transacao.findByPk(novaTransacao.id, {
        include: [{
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nome'],
          required: false
        }]
      });

      res.status(201).json({
        message: 'Transação criada com sucesso!',
        transacao: transacaoComCategoria
      });
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  // Atualizar transação
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { descricao, valor, tipo_entrada, categoria_id } = req.body;

      const transacao = await Transacao.findByPk(id);
      
      if (!transacao) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      // Verificar se o usuário é dono da transação
      if (transacao.usuario_id !== req.usuario.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Verificar categoria se fornecida
      if (categoria_id && categoria_id !== '' && categoria_id !== 'null') {
        const categoria = await Categoria.findByPk(categoria_id);
        if (!categoria) {
          return res.status(404).json({ error: 'Categoria não encontrada' });
        }
      }

      // Preparar dados para atualização
      const dadosAtualizacao = {};
      
      if (descricao !== undefined) dadosAtualizacao.descricao = descricao.trim();
      if (valor !== undefined) dadosAtualizacao.valor = parseFloat(valor);
      if (tipo_entrada !== undefined) dadosAtualizacao.tipo_entrada = tipo_entrada;
      
      // Tratar categoria_id especialmente
      if (categoria_id !== undefined) {
        if (categoria_id === '' || categoria_id === 'null' || categoria_id === null) {
          dadosAtualizacao.categoria_id = null;
        } else {
          dadosAtualizacao.categoria_id = parseInt(categoria_id);
        }
      }

      await transacao.update(dadosAtualizacao);

      // Buscar transação atualizada com categoria
      const transacaoAtualizada = await Transacao.findByPk(id, {
        include: [{
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nome'],
          required: false
        }]
      });

      res.json({
        message: 'Transação atualizada com sucesso!',
        transacao: transacaoAtualizada
      });
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  // Deletar transação
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const transacao = await Transacao.findByPk(id);
      
      if (!transacao) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      // Verificar se o usuário é dono da transação
      if (transacao.usuario_id !== req.usuario.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      await transacao.destroy();
      
      res.json({ message: 'Transação deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }
}

export default TransacaoController;