import { Usuario, Categoria, Transacao, Meta } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

class RelatorioController {
  
  // Gerar relatório financeiro geral
  static async getRelatorioFinanceiro(req, res) {
    try {
      const usuario_id = req.usuario.id;
      const { dataInicio, dataFim, periodo } = req.query;

      let whereClause = { usuario_id };
      
      // Aplicar filtros de data se fornecidos
      if (dataInicio && dataFim) {
        whereClause.data_criacao = {
          [Op.between]: [new Date(dataInicio), new Date(dataFim)]
        };
      } else if (periodo) {
        const hoje = new Date();
        let inicioData;
        
        switch (periodo) {
          case 'semana':
            inicioData = new Date(hoje.setDate(hoje.getDate() - 7));
            break;
          case 'mes':
            inicioData = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            break;
          case 'trimestre':
            inicioData = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
            break;
          case 'ano':
            inicioData = new Date(hoje.getFullYear(), 0, 1);
            break;
          default:
            inicioData = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        }
        
        whereClause.data_criacao = {
          [Op.gte]: inicioData
        };
      }

      // Buscar transações
      const transacoes = await Transacao.findAll({
        where: whereClause,
        include: [
          { 
            model: Categoria, 
            as: 'categoria',
            attributes: ['id', 'nome'],
            required: false
          }
        ],
        order: [['data_criacao', 'DESC']]
      });

      // Calcular resumo financeiro
      const resumo = {
        totalReceitas: 0,
        totalDespesas: 0,
        saldoLiquido: 0,
        totalTransacoes: transacoes.length,
        receitasPorCategoria: {},
        despesasPorCategoria: {},
        transacoesPorMes: {}
      };

      transacoes.forEach(transacao => {
        const valor = parseFloat(transacao.valor);
        const mes = new Date(transacao.data_criacao).toLocaleDateString('pt-BR', { 
          year: 'numeric', 
          month: 'long' 
        });
        const categoriaNome = transacao.categoria?.nome || 'Sem categoria';

        if (transacao.tipo_entrada === 'entrada') {
          resumo.totalReceitas += valor;
          resumo.receitasPorCategoria[categoriaNome] = 
            (resumo.receitasPorCategoria[categoriaNome] || 0) + valor;
        } else {
          resumo.totalDespesas += valor;
          resumo.despesasPorCategoria[categoriaNome] = 
            (resumo.despesasPorCategoria[categoriaNome] || 0) + valor;
        }

        // Agrupar por mês
        if (!resumo.transacoesPorMes[mes]) {
          resumo.transacoesPorMes[mes] = { receitas: 0, despesas: 0 };
        }
        
        if (transacao.tipo_entrada === 'entrada') {
          resumo.transacoesPorMes[mes].receitas += valor;
        } else {
          resumo.transacoesPorMes[mes].despesas += valor;
        }
      });

      resumo.saldoLiquido = resumo.totalReceitas - resumo.totalDespesas;

      res.json({
        resumo,
        transacoes: transacoes.slice(0, 10) // Últimas 10 transações para o relatório
      });
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  // Relatório de metas
  static async getRelatorioMetas(req, res) {
    try {
      const usuario_id = req.usuario.id;

      const metas = await Meta.findAll({
        where: { usuario_id },
        order: [['timestamp', 'DESC']]
      });

      const resumoMetas = {
        totalMetas: metas.length,
        metasAtivas: 0,
        metasConcluidas: 0,
        metasVencidas: 0,
        valorTotalMetas: 0,
        valorEconomizado: 0,
        porcentagemGeral: 0
      };

      const hoje = new Date();
      
      metas.forEach(meta => {
        const valorAlvo = parseFloat(meta.valor);
        const dataFinal = new Date(meta.data_final);

        resumoMetas.valorTotalMetas += valorAlvo;

        if (meta.foi_batida) {
          resumoMetas.metasConcluidas++;
          resumoMetas.valorEconomizado += valorAlvo;
        } else if (dataFinal < hoje) {
          resumoMetas.metasVencidas++;
        } else {
          resumoMetas.metasAtivas++;
        }
      });

      resumoMetas.porcentagemGeral = resumoMetas.valorTotalMetas > 0 
        ? ((resumoMetas.valorEconomizado / resumoMetas.valorTotalMetas) * 100).toFixed(1)
        : 0;

      res.json({
        resumoMetas,
        metas
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de metas:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  // Relatório por categorias
  static async getRelatorioCategorias(req, res) {
    try {
      const usuario_id = req.usuario.id;
      const { dataInicio, dataFim } = req.query;

      let whereClause = { usuario_id };
      
      if (dataInicio && dataFim) {
        whereClause.data_criacao = {
          [Op.between]: [new Date(dataInicio), new Date(dataFim)]
        };
      }

      // Usar query SQL direta para obter estatísticas por categoria
      const query = `
        SELECT 
          c.nome as categoria_nome,
          c.id as categoria_id,
          COUNT(t.id) as total_transacoes,
          SUM(CASE WHEN t.tipo_entrada = 'entrada' THEN t.valor ELSE 0 END) as total_receitas,
          SUM(CASE WHEN t.tipo_entrada = 'saida' THEN t.valor ELSE 0 END) as total_despesas,
          SUM(CASE WHEN t.tipo_entrada = 'entrada' THEN t.valor ELSE -t.valor END) as saldo_categoria
        FROM transacao t
        LEFT JOIN categoria c ON t.categoria_id = c.id
        WHERE t.usuario_id = ?
        ${dataInicio && dataFim ? 'AND t.data_criacao BETWEEN ? AND ?' : ''}
        GROUP BY c.id, c.nome
        ORDER BY total_despesas DESC, total_receitas DESC
      `;

      const params = [usuario_id];
      if (dataInicio && dataFim) {
        params.push(dataInicio, dataFim);
      }

      const [resultados] = await sequelize.query(query, {
        replacements: params
      });

      res.json(resultados);
    } catch (error) {
      console.error('Erro ao gerar relatório por categorias:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  // Exportar dados (preparar para CSV)
  static async exportarDados(req, res) {
    try {
      const usuario_id = req.usuario.id;
      const { tipo, dataInicio, dataFim } = req.query;

      if (tipo === 'transacoes') {
        let whereClause = { usuario_id };
        
        if (dataInicio && dataFim) {
          whereClause.data_criacao = {
            [Op.between]: [new Date(dataInicio), new Date(dataFim)]
          };
        }

        const transacoes = await Transacao.findAll({
          where: whereClause,
          include: [
            { 
              model: Categoria, 
              as: 'categoria',
              attributes: ['nome'],
              required: false
            }
          ],
          order: [['data_criacao', 'DESC']],
          raw: false
        });

        // Formatar dados para exportação
        const dadosExportacao = transacoes.map(t => ({
          data: new Date(t.data_criacao).toLocaleDateString('pt-BR'),
          descricao: t.descricao,
          categoria: t.categoria?.nome || 'Sem categoria',
          tipo: t.tipo_entrada === 'entrada' ? 'Receita' : 'Despesa',
          valor: parseFloat(t.valor).toFixed(2)
        }));

        res.json(dadosExportacao);
      } else if (tipo === 'metas') {
        const metas = await Meta.findAll({
          where: { usuario_id },
          order: [['timestamp', 'DESC']]
        });

        const dadosExportacao = metas.map(m => {
          const valor = parseFloat(m.valor);
          const dataFinal = new Date(m.data_final);
          const hoje = new Date();
          
          return {
            nome: m.nome,
            valor_alvo: valor.toFixed(2),
            data_inicio: new Date(m.data_inicio).toLocaleDateString('pt-BR'),
            data_final: dataFinal.toLocaleDateString('pt-BR'),
            status: m.foi_batida ? 'Concluída' : 
                   dataFinal < hoje ? 'Vencida' : 'Ativa'
          };
        });

        res.json(dadosExportacao);
      } else {
        res.status(400).json({ error: 'Tipo de exportação inválido' });
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }
}

export default RelatorioController;