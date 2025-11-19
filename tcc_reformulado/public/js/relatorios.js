// ===== RELATÓRIOS PAGE JAVASCRIPT =====

// Estado da aplicação
let periodoAtual = 'mes';
let dataInicio = null;
let dataFim = null;
let charts = {};

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
  console.log(' Inicializando página de relatórios...');
  inicializarPagina();
});

async function inicializarPagina() {
  try {
    mostrarLoading(true);
    
    // Configurar datas padrão
    configurarDatasPadrao();
    
    // Carregar dados iniciais
    await Promise.all([
      carregarRelatorioFinanceiro(),
      carregarRelatorioMetas(),
      carregarRelatorioCategorias()
    ]);
    
    console.log(' Página de relatórios carregada com sucesso!');
  } catch (error) {
    console.error(' Erro ao carregar relatórios:', error);
    showNotification('Erro ao carregar relatórios', 'error');
  } finally {
    mostrarLoading(false);
  }
}

function configurarDatasPadrao() {
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  
  document.getElementById('data-inicio').value = formatarDataParaInput(primeiroDia);
  document.getElementById('data-fim').value = formatarDataParaInput(hoje);
}

// ===== CONTROLE DE PERÍODOS =====
function selecionarPeriodo(periodo) {
  // Remover classe active de todos os botões
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Adicionar classe active ao botão clicado
  document.querySelector(`[data-period="${periodo}"]`).classList.add('active');
  
  periodoAtual = periodo;
  
  // Mostrar/esconder filtro personalizado
  const customRange = document.getElementById('custom-date-range');
  if (periodo === 'personalizado') {
    customRange.style.display = 'flex';
  } else {
    customRange.style.display = 'none';
    
    // Configurar datas baseado no período
    const hoje = new Date();
    let inicio;
    
    switch (periodo) {
      case 'mes':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        break;
      case 'trimestre':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
        break;
      case 'ano':
        inicio = new Date(hoje.getFullYear(), 0, 1);
        break;
      default:
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }
    
    dataInicio = inicio;
    dataFim = hoje;
    
    // Recarregar relatórios
    recarregarRelatorios();
  }
}

function aplicarFiltroPersonalizado() {
  const inicioInput = document.getElementById('data-inicio').value;
  const fimInput = document.getElementById('data-fim').value;
  
  if (!inicioInput || !fimInput) {
    showNotification('Por favor, selecione as datas de início e fim', 'warning');
    return;
  }
  
  dataInicio = new Date(inicioInput);
  dataFim = new Date(fimInput);
  
  if (dataInicio > dataFim) {
    showNotification('Data de início deve ser anterior à data final', 'warning');
    return;
  }
  
  recarregarRelatorios();
}

async function recarregarRelatorios() {
  try {
    mostrarLoading(true);
    
    await Promise.all([
      carregarRelatorioFinanceiro(),
      carregarRelatorioCategorias()
    ]);
    
    // Atualizar texto do período nos gráficos
    atualizarTextoPeriodo();
    
  } catch (error) {
    console.error('Erro ao recarregar relatórios:', error);
    showNotification('Erro ao atualizar relatórios', 'error');
  } finally {
    mostrarLoading(false);
  }
}

function atualizarTextoPeriodo() {
  const elemento = document.getElementById('grafico-periodo');
  if (!elemento) return;
  
  let texto;
  
  switch (periodoAtual) {
    case 'mes':
      texto = 'Este mês';
      break;
    case 'trimestre':
      texto = 'Último trimestre';
      break;
    case 'ano':
      texto = 'Este ano';
      break;
    case 'personalizado':
      texto = `${dataInicio.toLocaleDateString('pt-BR')} - ${dataFim.toLocaleDateString('pt-BR')}`;
      break;
    default:
      texto = 'Este mês';
  }
  
  elemento.textContent = texto;
}

// ===== CARREGAMENTO DE DADOS =====
async function carregarRelatorioFinanceiro() {
  try {
    const params = new URLSearchParams();
    
    if (periodoAtual === 'personalizado' && dataInicio && dataFim) {
      params.append('dataInicio', formatarDataParaAPI(dataInicio));
      params.append('dataFim', formatarDataParaAPI(dataFim));
    } else if (periodoAtual !== 'personalizado') {
      params.append('periodo', periodoAtual);
    }
    
    const response = await api.getRelatorioFinanceiro(params.toString());
    
    if (response && response.resumo) {
      atualizarResumoFinanceiro(response.resumo);
      atualizarTransacoesRecentes(response.transacoes || []);
      criarGraficoReceitasDespesas(response.resumo);
      criarGraficoReceitasLinha(response.resumo.transacoesPorMes);
      criarGraficoDespesasLinha(response.resumo.transacoesPorMes);
    }
  } catch (error) {
    console.error('Erro ao carregar relatório financeiro:', error);
    throw error;
  }
}

async function carregarRelatorioMetas() {
  try {
    const response = await api.getRelatorioMetas();
    
    if (response && response.resumoMetas) {
      atualizarResumoMetas(response.resumoMetas);
    }
  } catch (error) {
    console.error('Erro ao carregar relatório de metas:', error);
    throw error;
  }
}

async function carregarRelatorioCategorias() {
  try {
    const params = new URLSearchParams();
    
    if (periodoAtual === 'personalizado' && dataInicio && dataFim) {
      params.append('dataInicio', formatarDataParaAPI(dataInicio));
      params.append('dataFim', formatarDataParaAPI(dataFim));
    }
    
    const response = await api.getRelatorioCategorias(params.toString());
    
    if (Array.isArray(response)) {
      atualizarTabelaCategorias(response);
      criarGraficoCategorias(response);
    }
  } catch (error) {
    console.error('Erro ao carregar relatório de categorias:', error);
    throw error;
  }
}

// ===== ATUALIZAÇÃO DA INTERFACE =====
function atualizarResumoFinanceiro(resumo) {
  // Atualizar valores
  document.getElementById('total-receitas').textContent = formatarMoeda(resumo.totalReceitas);
  document.getElementById('total-despesas').textContent = formatarMoeda(resumo.totalDespesas);
  document.getElementById('saldo-liquido').textContent = formatarMoeda(resumo.saldoLiquido);
  document.getElementById('total-transacoes').textContent = resumo.totalTransacoes;
  
  // Atualizar status do saldo
  const saldoStatus = document.getElementById('saldo-status');
  if (resumo.saldoLiquido >= 0) {
    saldoStatus.textContent = 'Positivo';
    saldoStatus.className = 'stat-change valor-positivo';
  } else {
    saldoStatus.textContent = 'Negativo';
    saldoStatus.className = 'stat-change valor-negativo';
  }
  
  // Calcular e mostrar contadores
  const totalEntradas = Object.values(resumo.receitasPorCategoria || {}).length;
  const totalSaidas = Object.values(resumo.despesasPorCategoria || {}).length;
  
  document.getElementById('count-receitas').textContent = `${totalEntradas} categorias`;
  document.getElementById('count-despesas').textContent = `${totalSaidas} categorias`;
}

function atualizarResumoMetas(resumoMetas) {
  document.getElementById('metas-ativas').textContent = resumoMetas.metasAtivas;
  document.getElementById('metas-concluidas').textContent = resumoMetas.metasConcluidas;
  document.getElementById('metas-vencidas').textContent = resumoMetas.metasVencidas;
  document.getElementById('progresso-geral').textContent = `${resumoMetas.porcentagemGeral}%`;
  document.getElementById('valor-total-metas').textContent = formatarMoeda(resumoMetas.valorTotalMetas);
  document.getElementById('valor-economizado').textContent = formatarMoeda(resumoMetas.valorEconomizado);
}

function atualizarTabelaCategorias(dados) {
  const tbody = document.querySelector('#categorias-table tbody');
  tbody.innerHTML = '';
  
  dados.forEach(categoria => {
    const row = tbody.insertRow();
    
    row.innerHTML = `
      <td>${categoria.categoria_nome || 'Sem categoria'}</td>
      <td class="valor-positivo">${formatarMoeda(categoria.total_receitas)}</td>
      <td class="valor-negativo">${formatarMoeda(categoria.total_despesas)}</td>
      <td class="${categoria.saldo_categoria >= 0 ? 'valor-positivo' : 'valor-negativo'}">
        ${formatarMoeda(categoria.saldo_categoria)}
      </td>
      <td>${categoria.total_transacoes}</td>
    `;
  });
}

function atualizarTransacoesRecentes(transacoes) {
  const container = document.getElementById('transacoes-resumo');
  container.innerHTML = '';
  
  if (transacoes.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin: 2rem 0;">Nenhuma transação encontrada no período selecionado.</p>';
    return;
  }
  
  transacoes.forEach(transacao => {
    const item = document.createElement('div');
    item.className = 'transacao-item';
    
    item.innerHTML = `
      <div class="transacao-info">
        <div class="transacao-descricao">${transacao.descricao}</div>
        <div class="transacao-categoria">${transacao.categoria?.nome || 'Sem categoria'}</div>
        <div class="transacao-data">${new Date(transacao.data_criacao).toLocaleDateString('pt-BR')}</div>
      </div>
      <div class="transacao-valor">
        <span class="valor ${transacao.tipo_entrada === 'entrada' ? 'valor-positivo' : 'valor-negativo'}">
          ${transacao.tipo_entrada === 'entrada' ? '+' : '-'}${formatarMoeda(Math.abs(transacao.valor))}
        </span>
        <span class="tipo tipo-${transacao.tipo_entrada}">
          ${transacao.tipo_entrada === 'entrada' ? 'Receita' : 'Despesa'}
        </span>
      </div>
    `;
    
    container.appendChild(item);
  });
}

// ===== GRÁFICOS =====
function criarGraficoReceitasDespesas(resumo) {
  const ctx = document.getElementById('chart-receitas-despesas');
  
  // Destruir gráfico existente
  if (charts.receitasDespesas) {
    charts.receitasDespesas.destroy();
  }
  
  charts.receitasDespesas = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Receitas', 'Despesas'],
      datasets: [{
        data: [resumo.totalReceitas, resumo.totalDespesas],
        backgroundColor: [
          '#10B981', // Verde moderno para receitas
          '#F43F5E'  // Vermelho moderno para despesas
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        }
      }
    }
  });
}

function criarGraficoCategorias(dados) {
  const ctx = document.getElementById('chart-categorias');
  const tipo = document.getElementById('categoria-tipo').value;
  
  // Destruir gráfico existente
  if (charts.categorias) {
    charts.categorias.destroy();
  }
  
  // Preparar dados baseado no tipo selecionado
  const dadosGrafico = dados
    .filter(cat => (tipo === 'receitas' ? cat.total_receitas > 0 : cat.total_despesas > 0))
    .slice(0, 8) // Top 8 categorias
    .map(cat => ({
      nome: cat.categoria_nome || 'Sem categoria',
      valor: tipo === 'receitas' ? cat.total_receitas : cat.total_despesas
    }));
  
  if (dadosGrafico.length === 0) {
    ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
    const context = ctx.getContext('2d');
    context.font = '16px Arial';
    context.fillStyle = 'var(--text-secondary)';
    context.textAlign = 'center';
    context.fillText('Nenhum dado disponível', ctx.width / 2, ctx.height / 2);
    return;
  }
  
  charts.categorias = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: dadosGrafico.map(d => d.nome),
      datasets: [{
        data: dadosGrafico.map(d => d.valor),
        backgroundColor: [
          '#8B5CF6', // Roxo
          '#EC4899', // Rosa
          '#3B82F6', // Azul
          '#10B981', // Verde
          '#F59E0B', // Laranja
          '#06B6D4', // Ciano
          '#EF4444', // Vermelho
          '#6366F1'  // Índigo
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 15,
            usePointStyle: true,
            generateLabels: function(chart) {
              const data = chart.data;
              return data.labels.map((label, index) => ({
                text: `${label}: ${formatarMoeda(data.datasets[0].data[index])}`,
                fillStyle: data.datasets[0].backgroundColor[index],
                hidden: false,
                index: index
              }));
            }
          }
        }
      }
    }
  });
}

function criarGraficoReceitasLinha(transacoesPorMes) {
  const ctx = document.getElementById('chart-receitas-linha');
  
  // Destruir gráfico existente
  if (charts.receitasLinha) {
    charts.receitasLinha.destroy();
  }
  
  // Pegar os últimos 6 meses
  const meses = Object.keys(transacoesPorMes).slice(-6);
  const receitas = meses.map(mes => transacoesPorMes[mes].receitas);
  
  charts.receitasLinha = new Chart(ctx, {
    type: 'line',
    data: {
      labels: meses,
      datasets: [
        {
          label: 'Receitas',
          data: receitas,
          backgroundColor: 'rgba(16, 185, 129, 0.1)', // Verde com transparência
          borderColor: '#10B981', // Verde moderno
          borderWidth: 2,
          fill: true,
          tension: 0.4, // Curva suave
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatarMoeda(value);
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatarMoeda(context.parsed.y)}`;
            }
          }
        }
      }
    }
  });
}

function criarGraficoDespesasLinha(transacoesPorMes) {
  const ctx = document.getElementById('chart-despesas-linha');
  
  // Destruir gráfico existente
  if (charts.despesasLinha) {
    charts.despesasLinha.destroy();
  }
  
  // Pegar os últimos 6 meses
  const meses = Object.keys(transacoesPorMes).slice(-6);
  const despesas = meses.map(mes => transacoesPorMes[mes].despesas);
  
  charts.despesasLinha = new Chart(ctx, {
    type: 'line',
    data: {
      labels: meses,
      datasets: [
        {
          label: 'Despesas',
          data: despesas,
          backgroundColor: 'rgba(244, 63, 94, 0.1)', // Vermelho com transparência
          borderColor: '#F43F5E', // Vermelho moderno
          borderWidth: 2,
          fill: true,
          tension: 0.4, // Curva suave
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#F43F5E',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatarMoeda(value);
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatarMoeda(context.parsed.y)}`;
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoCategoria() {
  carregarRelatorioCategorias(); // Recarrega e recria o gráfico
}

// ===== EXPORTAÇÃO =====
function exportarRelatorio() {
  document.getElementById('export-modal').classList.add('show');
}

function fecharModalExport() {
  document.getElementById('export-modal').classList.remove('show');
}

async function confirmarExportacao() {
  try {
    const tipo = document.querySelector('input[name="export-tipo"]:checked').value;
    const formato = document.querySelector('input[name="export-formato"]:checked').value;
    const periodo = document.getElementById('export-period').value;
    
    const params = new URLSearchParams();
    params.append('tipo', tipo);
    
    // Configurar período para exportação
    if (periodo === 'atual' && periodoAtual === 'personalizado' && dataInicio && dataFim) {
      params.append('dataInicio', formatarDataParaAPI(dataInicio));
      params.append('dataFim', formatarDataParaAPI(dataFim));
    } else if (periodo !== 'todos') {
      const hoje = new Date();
      let inicio;
      
      switch (periodo) {
        case 'mes':
          inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          break;
        case 'ano':
          inicio = new Date(hoje.getFullYear(), 0, 1);
          break;
      }
      
      if (inicio) {
        params.append('dataInicio', formatarDataParaAPI(inicio));
        params.append('dataFim', formatarDataParaAPI(hoje));
      }
    }
    
    const response = await api.exportarDados(params.toString());
    
    if (Array.isArray(response)) {
      if (formato === 'csv') {
        exportarCSV(response, tipo);
      } else {
        exportarJSON(response, tipo);
      }
      
      showNotification('Dados exportados com sucesso!', 'success');
      fecharModalExport();
    }
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    showNotification('Erro ao exportar dados', 'error');
  }
}

function exportarCSV(dados, tipo) {
  let csv = '';
  
  if (tipo === 'transacoes') {
    csv = 'Data,Descrição,Categoria,Tipo,Valor\n';
    dados.forEach(item => {
      csv += `"${item.data}","${item.descricao}","${item.categoria}","${item.tipo}","${item.valor}"\n`;
    });
  } else if (tipo === 'metas') {
    csv = 'Nome,Valor Alvo,Valor Atual,Progresso,Data Limite,Status\n';
    dados.forEach(item => {
      csv += `"${item.nome}","${item.valor_alvo}","${item.valor_atual}","${item.porcentagem}%","${item.data_limite}","${item.status}"\n`;
    });
  }
  
  baixarArquivo(csv, `${tipo}-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`, 'text/csv');
}

function exportarJSON(dados, tipo) {
  const json = JSON.stringify(dados, null, 2);
  baixarArquivo(json, `${tipo}-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`, 'application/json');
}

function baixarArquivo(conteudo, nomeArquivo, tipoArquivo) {
  const blob = new Blob([conteudo], { type: tipoArquivo });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  
  window.URL.revokeObjectURL(url);
}

// ===== IMPRESSÃO =====
function imprimirRelatorio() {
  // Criar versão simplificada para impressão
  const printWindow = window.open('', '_blank');
  const printContent = criarConteudoImpressao();
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Relatório Financeiro - FinanceFlow</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
        .stat-card { border: 1px solid #ddd; padding: 15px; text-align: center; }
        .stat-value { font-size: 1.5em; font-weight: bold; color: #007bff; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      ${printContent}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.print();
}

function criarConteudoImpressao() {
  const hoje = new Date().toLocaleDateString('pt-BR');
  const usuario = window.usuarioLogado?.nome || 'Usuário';
  
  return `
    <div class="header">
      <h1>Relatório Financeiro</h1>
      <p>Usuário: ${usuario} | Data: ${hoje}</p>
    </div>
    
    <div class="section">
      <h2>Resumo Financeiro</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Receitas</h3>
          <div class="stat-value">${document.getElementById('total-receitas').textContent}</div>
        </div>
        <div class="stat-card">
          <h3>Despesas</h3>
          <div class="stat-value">${document.getElementById('total-despesas').textContent}</div>
        </div>
        <div class="stat-card">
          <h3>Saldo</h3>
          <div class="stat-value">${document.getElementById('saldo-liquido').textContent}</div>
        </div>
        <div class="stat-card">
          <h3>Transações</h3>
          <div class="stat-value">${document.getElementById('total-transacoes').textContent}</div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2>Análise por Categorias</h2>
      ${document.getElementById('categorias-table').outerHTML}
    </div>
  `;
}

// ===== UTILITÁRIOS =====
function mostrarLoading(mostrar) {
  const loading = document.getElementById('loading-relatorios');
  if (mostrar) {
    loading.classList.add('show');
  } else {
    loading.classList.remove('show');
  }
}

function formatarDataParaInput(data) {
  return data.toISOString().split('T')[0];
}

function formatarDataParaAPI(data) {
  return data.toISOString().split('T')[0];
}

// Usar formatCurrency do common.js
function formatarMoeda(valor) {
  return formatCurrency(valor);
}

// Event listeners para modais
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    fecharModalExport();
  }
});

console.log(' Relatórios JavaScript carregado!');

