import { Meta, Transacao, Categoria } from '../models/index.js';
import { Op } from 'sequelize';

class MetaController {
  // Listar metas por usuário
  static async getByUsuario(req, res) {
    try {
      const { usuario_id } = req.params;
      
      // Verificar se o usuário está acessando suas próprias metas
      if (req.usuario.id != usuario_id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const metas = await Meta.findAll({
        where: { usuario_id },
        order: [['data_inicio', 'DESC']]
      });

      res.json(metas);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar nova meta
  static async create(req, res) {
    try {
      const { nome, valor, data_inicio, data_final } = req.body;
      const usuario_id = req.usuario.id;

      // Validar datas
      if (new Date(data_final) <= new Date(data_inicio)) {
        return res.status(400).json({ 
          error: 'Data final deve ser maior que data inicial' 
        });
      }

      const novaMeta = await Meta.create({
        usuario_id,
        nome,
        valor: parseFloat(valor),
        data_inicio,
        data_final,
        foi_batida: false
      });

      res.status(201).json({
        message: 'Meta criada com sucesso!',
        meta: novaMeta
      });
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar meta
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, valor, data_inicio, data_final, foi_batida } = req.body;

      const meta = await Meta.findByPk(id);
      
      if (!meta) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }

      // Verificar se o usuário é dono da meta
      if (meta.usuario_id !== req.usuario.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Validar datas se fornecidas
      const novaDataInicio = data_inicio || meta.data_inicio;
      const novaDataFinal = data_final || meta.data_final;
      
      if (new Date(novaDataFinal) <= new Date(novaDataInicio)) {
        return res.status(400).json({ 
          error: 'Data final deve ser maior que data inicial' 
        });
      }

      // Construir objeto de atualização
      const dadosAtualizacao = {
        nome: nome || meta.nome,
        valor: valor ? parseFloat(valor) : meta.valor,
        data_inicio: data_inicio || meta.data_inicio,
        data_final: data_final || meta.data_final
      };

      // Verificar se está tentando marcar como concluída
      if (foi_batida !== undefined && foi_batida === true && !meta.foi_batida) {
        // Calcular saldo atual
        const transacoes = await Transacao.findAll({
          where: { usuario_id: req.usuario.id }
        });

        let saldoAtual = 0;
        transacoes.forEach(t => {
          if (t.tipo_entrada === 'entrada') {
            saldoAtual += parseFloat(t.valor);
          } else {
            saldoAtual -= parseFloat(t.valor);
          }
        });

        // Verificar saldo suficiente
        const valorMeta = parseFloat(dadosAtualizacao.valor);
        if (saldoAtual < valorMeta) {
          return res.status(400).json({ 
            error: 'Saldo insuficiente para concluir esta meta',
            saldoAtual: saldoAtual.toFixed(2),
            valorNecessario: valorMeta.toFixed(2),
            diferenca: (valorMeta - saldoAtual).toFixed(2)
          });
        }

        // Buscar/criar categoria Metas
        let categoriaMetas = await Categoria.findOne({
          where: { 
            nome: 'Metas',
            [Op.or]: [
              { usuario_id: null },
              { usuario_id: req.usuario.id }
            ]
          }
        });

        if (!categoriaMetas) {
          categoriaMetas = await Categoria.create({
            nome: 'Metas',
            tipo: 'despesa',
            icone: '🎯',
            usuario_id: null
          });
        }

        // Criar transação de despesa
        await Transacao.create({
          usuario_id: req.usuario.id,
          tipo_entrada: 'saida',
          valor: valorMeta,
          categoria_id: categoriaMetas.id,
          descricao: `Meta concluída: ${dadosAtualizacao.nome}`,
          data_criacao: new Date()
        });

        dadosAtualizacao.foi_batida = true;
      } else if (foi_batida !== undefined && foi_batida === false && meta.foi_batida) {
        // Não permitir desmarcar meta concluída
        return res.status(400).json({ 
          error: 'Não é possível desmarcar uma meta já concluída'
        });
      } else if (foi_batida !== undefined) {
        dadosAtualizacao.foi_batida = foi_batida;
      }

      await meta.update(dadosAtualizacao);

      res.json({
        message: 'Meta atualizada com sucesso!',
        meta
      });
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Marcar/desmarcar meta como batida
  static async toggle(req, res) {
    try {
      const { id } = req.params;

      const meta = await Meta.findByPk(id);
      
      if (!meta) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }

      // Verificar se o usuário é dono da meta
      if (meta.usuario_id !== req.usuario.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Se está marcando como concluída (de false para true)
      if (!meta.foi_batida) {
        // Calcular saldo atual do usuário
        const transacoes = await Transacao.findAll({
          where: { usuario_id: req.usuario.id }
        });

        let saldoAtual = 0;
        transacoes.forEach(t => {
          if (t.tipo_entrada === 'entrada') {
            saldoAtual += parseFloat(t.valor);
          } else {
            saldoAtual -= parseFloat(t.valor);
          }
        });

        // Verificar se há saldo suficiente
        const valorMeta = parseFloat(meta.valor);
        if (saldoAtual < valorMeta) {
          return res.status(400).json({ 
            error: 'Saldo insuficiente para concluir esta meta',
            saldoAtual: saldoAtual.toFixed(2),
            valorNecessario: valorMeta.toFixed(2),
            diferenca: (valorMeta - saldoAtual).toFixed(2)
          });
        }

        // Buscar categoria "Metas" ou criar se não existir
        let categoriaMetas = await Categoria.findOne({
          where: { 
            nome: 'Metas',
            [Op.or]: [
              { usuario_id: null },
              { usuario_id: req.usuario.id }
            ]
          }
        });

        if (!categoriaMetas) {
          categoriaMetas = await Categoria.create({
            nome: 'Metas',
            tipo: 'despesa',
            icone: '🎯',
            usuario_id: null // Categoria do sistema
          });
        }

        // Criar transação de despesa para debitar o valor da meta
        await Transacao.create({
          usuario_id: req.usuario.id,
          tipo_entrada: 'saida',
          valor: valorMeta,
          categoria_id: categoriaMetas.id,
          descricao: `Meta concluída: ${meta.nome}`,
          data_criacao: new Date()
        });

        // Marcar meta como concluída
        await meta.update({ foi_batida: true });

        res.json({
          message: 'Meta concluída com sucesso! O valor foi debitado da sua conta.',
          meta,
          transacao: {
            valor: valorMeta,
            tipo: 'despesa',
            categoria: 'Metas'
          }
        });
      } else {
        // Se está desmarcando (de true para false)
        // Não permitir desmarcar meta já concluída para evitar problemas com transações
        return res.status(400).json({ 
          error: 'Não é possível desmarcar uma meta já concluída. A transação já foi registrada.'
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar meta
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const meta = await Meta.findByPk(id);
      
      if (!meta) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }

      // Verificar se o usuário é dono da meta
      if (meta.usuario_id !== req.usuario.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      await meta.destroy();
      
      res.json({ message: 'Meta deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar meta:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default MetaController;