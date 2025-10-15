import { Meta } from '../models/index.js';

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
      const { nome, valor, data_inicio, data_final } = req.body;

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

      await meta.update({
        nome: nome || meta.nome,
        valor: valor ? parseFloat(valor) : meta.valor,
        data_inicio: data_inicio || meta.data_inicio,
        data_final: data_final || meta.data_final
      });

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

      await meta.update({
        foi_batida: !meta.foi_batida
      });

      res.json({
        message: `Meta marcada como ${meta.foi_batida ? 'batida' : 'não batida'}!`,
        meta
      });
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