// ===== CATEGORIAS PAGE JAVASCRIPT =====

// Estado da aplicação
let periodoAtual = 'mes';
let dataInicio = null;
let dataFim = null;
let categorias = [];

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
  console.log(' Inicializando página de categorias...');
  inicializarPagina();
});

async function inicializarPagina() {
  try {
    mostrarLoading(true);
    
    // Configurar datas padrão
    configurarDatasPadrao();
    
    // Carregar dados iniciais
    await carregarDados();
    
    console.log(' Página de categorias carregada com sucesso!');
  } catch (error) {
    console.error(' Erro ao carregar categorias:', error);
    showNotification('Erro ao carregar dados', 'error');
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
    
    // Recarregar dados
    carregarDados();
  }
  
  atualizarTextoPeriodo();
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
  
  carregarDados();
}

function atualizarTextoPeriodo() {
  const elemento = document.getElementById('periodo-texto');
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
async function carregarDados() {
  try {
    mostrarLoading(true);
    
    const params = new URLSearchParams();
    
    if (periodoAtual === 'personalizado' && dataInicio && dataFim) {
      params.append('dataInicio', formatarDataParaAPI(dataInicio));
      params.append('dataFim', formatarDataParaAPI(dataFim));
    } else if (periodoAtual !== 'personalizado') {
      params.append('periodo', periodoAtual);
    }
    
    // Buscar dados do relatório de categorias
    const response = await api.getRelatorioCategorias(params.toString());
    
    if (Array.isArray(response) && response.length > 0) {
      categorias = response;
      atualizarInterface();
      document.getElementById('empty-state').style.display = 'none';
    } else {
      categorias = [];
      document.getElementById('empty-state').style.display = 'block';
      limparInterface();
    }
    
  } catch (error) {
    console.error(' Erro ao carregar dados:', error);
    showNotification('Erro ao carregar categorias', 'error');
    limparInterface();
  } finally {
    mostrarLoading(false);
  }
}

// ===== ATUALIZAÇÃO DA INTERFACE =====
function atualizarInterface() {
  calcularResumoGeral();
  renderizarTabela();
}

function calcularResumoGeral() {
  let totalReceitas = 0;
  let totalDespesas = 0;
  let countReceitas = 0;
  let countDespesas = 0;
  
  categorias.forEach(cat => {
    const receitas = parseFloat(cat.total_receitas) || 0;
    const despesas = parseFloat(cat.total_despesas) || 0;
    
    if (receitas > 0) {
      totalReceitas += receitas;
      countReceitas++;
    }
    if (despesas > 0) {
      totalDespesas += despesas;
      countDespesas++;
    }
  });
  
  const saldo = totalReceitas - totalDespesas;
  
  // Atualizar cards
  document.getElementById('total-receitas').textContent = formatarMoeda(totalReceitas);
  document.getElementById('total-despesas').textContent = formatarMoeda(totalDespesas);
  document.getElementById('saldo-total').textContent = formatarMoeda(saldo);
  
  document.getElementById('count-receitas').textContent = `${countReceitas} categoria${countReceitas !== 1 ? 's' : ''}`;
  document.getElementById('count-despesas').textContent = `${countDespesas} categoria${countDespesas !== 1 ? 's' : ''}`;
  
  // Colorir saldo
  const saldoElement = document.getElementById('saldo-total');
  saldoElement.className = 'stat-value';
  if (saldo > 0) {
    saldoElement.classList.add('valor-positivo');
  } else if (saldo < 0) {
    saldoElement.classList.add('valor-negativo');
  } else {
    saldoElement.classList.add('valor-neutro');
  }
}

function renderizarTabela() {
  const tbody = document.getElementById('categorias-tbody');
  tbody.innerHTML = '';
  
  if (categorias.length === 0) {
    return;
  }
  
  // Calcular total geral para porcentagens
  const totalGeral = categorias.reduce((sum, cat) => {
    return sum + parseFloat(cat.total_receitas || 0) + parseFloat(cat.total_despesas || 0);
  }, 0);
  
  categorias.forEach(categoria => {
    const receitas = parseFloat(categoria.total_receitas) || 0;
    const despesas = parseFloat(categoria.total_despesas) || 0;
    const saldo = receitas - despesas;
    const transacoes = parseInt(categoria.total_transacoes) || 0;
    const totalCategoria = receitas + despesas;
    const percentual = totalGeral > 0 ? ((totalCategoria / totalGeral) * 100).toFixed(1) : 0;
    
    const row = tbody.insertRow();
    
    // Nome da categoria com ícone
    const cellNome = row.insertCell();
    const icon = getCategoriaIcon(categoria.categoria_nome);
    cellNome.innerHTML = `
      <div class="categoria-nome">
        <div class="categoria-icon">${icon}</div>
        <span>${categoria.categoria_nome || 'Sem categoria'}</span>
      </div>
    `;
    
    // Receitas
    const cellReceitas = row.insertCell();
    cellReceitas.className = 'text-right valor-positivo';
    cellReceitas.textContent = formatarMoeda(receitas);
    
    // Despesas
    const cellDespesas = row.insertCell();
    cellDespesas.className = 'text-right valor-negativo';
    cellDespesas.textContent = formatarMoeda(despesas);
    
    // Saldo
    const cellSaldo = row.insertCell();
    cellSaldo.className = 'text-right';
    if (saldo > 0) {
      cellSaldo.classList.add('valor-positivo');
    } else if (saldo < 0) {
      cellSaldo.classList.add('valor-negativo');
    } else {
      cellSaldo.classList.add('valor-neutro');
    }
    cellSaldo.textContent = formatarMoeda(saldo);
    
    // Transações
    const cellTransacoes = row.insertCell();
    cellTransacoes.className = 'text-center';
    cellTransacoes.innerHTML = `<span class="badge">${transacoes}</span>`;
    
    // Percentual
    const cellPercent = row.insertCell();
    cellPercent.className = 'text-center';
    cellPercent.innerHTML = `
      <div class="progress-bar-cell">
        <div class="progress-bar-mini">
          <div class="progress-fill-mini" style="width: ${percentual}%"></div>
        </div>
        <span class="progress-percent">${percentual}%</span>
      </div>
    `;
  });
}

function getCategoriaIcon(nome) {
  const icons = {
    'Alimentação': '🍔',
    'Transporte': '🚗',
    'Saúde': '⚕️',
    'Educação': '📚',
    'Lazer': '🎮',
    'Moradia': '🏠',
    'Vestuário': '👔',
    'Salário': '💼',
    'Investimentos': '📈',
    'Outros': '📦'
  };
  
  return icons[nome] || '📂';
}

// ===== MODAL DE CATEGORIA =====
function abrirModalCategoria() {
  const modal = document.getElementById('categoria-modal');
  document.getElementById('categoria-form').reset();
  document.getElementById('categoria-icone').value = '📂';
  
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
  }
}

function fecharModalCategoria() {
  const modal = document.getElementById('categoria-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
  }
}

function selecionarIcone(icone) {
  document.getElementById('categoria-icone').value = icone;
}

async function salvarCategoria(event) {
  event.preventDefault();
  
  const btnSalvar = document.getElementById('btn-salvar-categoria');
  const btnText = btnSalvar.querySelector('.btn-text');
  const btnLoading = btnSalvar.querySelector('.btn-loading');
  
  try {
    // Mostrar loading
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    btnSalvar.disabled = true;
    
    const formData = new FormData(event.target);
    const categoria = {
      nome: formData.get('nome').trim(),
      tipo: formData.get('tipo'),
      icone: formData.get('icone') || '📂'
    };
    
    // Validações
    if (!categoria.nome || categoria.nome.length < 2) {
      showNotification('Nome da categoria deve ter pelo menos 2 caracteres', 'warning');
      return;
    }
    
    if (!categoria.tipo) {
      showNotification('Selecione o tipo da categoria', 'warning');
      return;
    }
    
    // Criar categoria
    await api.createCategoria(categoria);
    
    showNotification('Categoria criada com sucesso!', 'success');
    fecharModalCategoria();
    
    // Recarregar dados
    await carregarDados();
    
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    showNotification(error.message || 'Erro ao criar categoria', 'error');
  } finally {
    // Esconder loading
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
    btnSalvar.disabled = false;
  }
}

// ===== EXPORTAÇÃO =====
function exportarCategorias() {
  if (categorias.length === 0) {
    showNotification('Não há dados para exportar', 'warning');
    return;
  }
  
  let csv = 'Categoria,Receitas,Despesas,Saldo,Transações\n';
  
  categorias.forEach(cat => {
    const receitas = parseFloat(cat.total_receitas) || 0;
    const despesas = parseFloat(cat.total_despesas) || 0;
    const saldo = receitas - despesas;
    const transacoes = parseInt(cat.total_transacoes) || 0;
    
    csv += `"${cat.categoria_nome || 'Sem categoria'}",${receitas.toFixed(2)},${despesas.toFixed(2)},${saldo.toFixed(2)},${transacoes}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `categorias-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Dados exportados com sucesso!', 'success');
}

// ===== UTILITÁRIOS =====
function limparInterface() {
  document.getElementById('total-receitas').textContent = 'R$ 0,00';
  document.getElementById('total-despesas').textContent = 'R$ 0,00';
  document.getElementById('saldo-total').textContent = 'R$ 0,00';
  document.getElementById('count-receitas').textContent = '0 categorias';
  document.getElementById('count-despesas').textContent = '0 categorias';
  document.getElementById('categorias-tbody').innerHTML = '';
}

function mostrarLoading(mostrar) {
  const loading = document.getElementById('loading-categorias');
  const table = document.querySelector('.table-container');
  
  if (loading) {
    loading.classList.toggle('show', mostrar);
  }
  if (table) {
    table.style.display = mostrar ? 'none' : 'block';
  }
}

function formatarDataParaInput(data) {
  return data.toISOString().split('T')[0];
}

function formatarDataParaAPI(data) {
  return data.toISOString().split('T')[0];
}

function formatarMoeda(valor) {
  return formatCurrency(valor);
}
