let todasTransacoes = [];
let transacoesFiltradas = [];
let categorias = [];
let editandoTransacao = null;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('📝 Inicializando página de transações...');
  
  // Obter usuário atual
  const usuarioId = getCurrentUser()?.id || 1;
  
  try {
    // Carregar dados necessários
    await Promise.all([
      carregarCategorias(),
      carregarTransacoes(usuarioId)
    ]);
    
    // Configurar eventos
    setupEventListeners();
    
    console.log('✅ Página de transações carregada!');
  } catch (error) {
    console.error('❌ Erro ao carregar página:', error);
    showNotification('Erro ao carregar dados', 'error');
  }
});

// ===== CARREGAMENTO DE DADOS =====

async function carregarCategorias() {
  try {
    console.log('📂 Carregando categorias...');
    const response = await api.getCategorias();
    
    // Verificar se a resposta é um array
    if (Array.isArray(response)) {
      categorias = response;
    } else if (response && Array.isArray(response.categorias)) {
      categorias = response.categorias;
    } else {
      console.error('Formato de resposta inválido para categorias:', response);
      categorias = [];
      throw new Error('Formato de resposta inválido para categorias');
    }
    
    console.log('Categorias carregadas:', categorias);
    
    // Preencher selects
    const selects = ['filter-categoria', 'categoria_id'];
    selects.forEach(selectId => {
      const select = document.getElementById(selectId);
      if (select) {
        // Manter a primeira opção (placeholder)
        while (select.children.length > 1) {
          select.removeChild(select.lastChild);
        }
        
        // Verificar se categorias é um array antes de usar forEach
        if (Array.isArray(categorias)) {
          categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nome;
            select.appendChild(option);
          });
        }
      }
    });
    
    console.log('✅ Categorias carregadas!');
  } catch (error) {
    console.error('❌ Erro ao carregar categorias:', error);
    showNotification('Erro ao carregar categorias: ' + error.message, 'error');
    categorias = []; // Garantir que seja um array vazio
  }
}

async function carregarTransacoes(usuarioId) {
  try {
    console.log('💳 Carregando transações...');
    showLoading(true);
    
    todasTransacoes = await api.getTransacoes(usuarioId);
    transacoesFiltradas = [...todasTransacoes];
    
    atualizarInterface();
    
    console.log('✅ Transações carregadas!');
  } catch (error) {
    console.error('❌ Erro ao carregar transações:', error);
    showNotification('Erro ao carregar transações', 'error');
  } finally {
    showLoading(false);
  }
}

// ===== INTERFACE =====

function atualizarInterface() {
  atualizarResumo();
  renderizarTransacoes();
}

function atualizarResumo() {
  let totalReceitas = 0;
  let totalDespesas = 0;
  let countReceitas = 0;
  let countDespesas = 0;
  
  transacoesFiltradas.forEach(transacao => {
    const valor = parseFloat(transacao.valor) || 0;
    if (transacao.tipo_entrada === 'entrada') {
      totalReceitas += valor;
      countReceitas++;
    } else {
      totalDespesas += valor;
      countDespesas++;
    }
  });
  
  const saldo = totalReceitas - totalDespesas;
  const totalTransacoes = transacoesFiltradas.length;
  
  // Atualizar elementos
  updateElement('total-receitas-periodo', formatCurrency(totalReceitas));
  updateElement('total-despesas-periodo', formatCurrency(totalDespesas));
  updateElement('saldo-periodo', formatCurrency(saldo));
  updateElement('count-receitas', `${countReceitas} transação${countReceitas !== 1 ? 'ões' : ''}`);
  updateElement('count-despesas', `${countDespesas} transação${countDespesas !== 1 ? 'ões' : ''}`);
  updateElement('count-total', `${totalTransacoes} transação${totalTransacoes !== 1 ? 'ões' : ''}`);
}

function renderizarTransacoes() {
  const container = document.getElementById('transactions-list');
  if (!container) return;
  
  if (transacoesFiltradas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <h3>Nenhuma transação encontrada</h3>
        <p>Adicione sua primeira transação ou ajuste os filtros</p>
        <button class="btn-primary" onclick="openTransactionModal()">
          <i>➕</i> Nova Transação
        </button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = transacoesFiltradas.map(transacao => `
    <div class="transaction-row">
      <div class="td-data">${formatDate(transacao.data_criacao)}</div>
      <div class="td-descricao">${transacao.descricao || 'Sem descrição'}</div>
      <div class="td-categoria">${transacao.categoria?.nome || 'Sem categoria'}</div>
      <div class="td-tipo ${transacao.tipo_entrada}">
        <span>${transacao.tipo_entrada === 'entrada' ? '📈' : '📉'}</span>
        ${transacao.tipo_entrada === 'entrada' ? 'Receita' : 'Despesa'}
      </div>
      <div class="td-valor ${transacao.tipo_entrada}">
        ${transacao.tipo_entrada === 'entrada' ? '+' : '-'} ${formatCurrency(transacao.valor)}
      </div>
      <div class="td-acoes">
        <button class="btn-action btn-edit" onclick="editarTransacao(${transacao.id})" title="Editar">
          ✏️
        </button>
        <button class="btn-action btn-delete" onclick="confirmarExclusao(${transacao.id})" title="Excluir">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}

function showLoading(show) {
  const loading = document.getElementById('loading-transactions');
  const container = document.getElementById('transactions-list');
  
  if (loading) {
    loading.classList.toggle('show', show);
  }
  if (container) {
    container.style.display = show ? 'none' : 'block';
  }
}

// ===== MODAL =====

function openTransactionModal() {
  editandoTransacao = null;
  document.getElementById('modal-title').textContent = 'Nova Transação';
  document.getElementById('transaction-form').reset();
  document.getElementById('transaction-id').value = '';
  
  // Definir data atual como padrão
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('data_criacao').value = hoje;
  
  clearFormErrors();
  showModal(true);
}

function closeTransactionModal() {
  showModal(false);
  setTimeout(() => {
    document.getElementById('transaction-form').reset();
    clearFormErrors();
    editandoTransacao = null;
  }, 300);
}

function showModal(show) {
  const modal = document.getElementById('transaction-modal');
  if (modal) {
    modal.classList.toggle('show', show);
  }
}

// ===== CRUD OPERATIONS =====

async function salvarTransacao(formData) {
  try {
    const transacaoData = {
      descricao: formData.get('descricao').trim(),
      valor: parseFloat(formData.get('valor')),
      tipo_entrada: formData.get('tipo_entrada'),
      categoria_id: parseInt(formData.get('categoria_id')),
      data_criacao: formData.get('data_criacao')
    };
    
    let response;
    if (editandoTransacao) {
      response = await api.updateTransacao(editandoTransacao.id, transacaoData);
      showNotification('Transação atualizada com sucesso!', 'success');
    } else {
      response = await api.createTransacao(transacaoData);
      showNotification('Transação criada com sucesso!', 'success');
    }
    
    // Recarregar dados
    const usuarioId = getCurrentUser()?.id || 1;
    await carregarTransacoes(usuarioId);
    
    closeTransactionModal();
  } catch (error) {
    console.error('❌ Erro ao salvar transação:', error);
    showNotification(error.message || 'Erro ao salvar transação', 'error');
  }
}

async function editarTransacao(id) {
  const transacao = todasTransacoes.find(t => t.id === id);
  if (!transacao) return;
  
  editandoTransacao = transacao;
  document.getElementById('modal-title').textContent = 'Editar Transação';
  
  // Preencher formulário
  document.getElementById('transaction-id').value = transacao.id;
  document.getElementById('descricao').value = transacao.descricao || '';
  document.getElementById('valor').value = transacao.valor;
  document.getElementById('tipo_entrada').value = transacao.tipo_entrada;
  document.getElementById('categoria_id').value = transacao.categoria_id || '';
  
  // Formatar data para input date
  const data = new Date(transacao.data_criacao);
  document.getElementById('data_criacao').value = data.toISOString().split('T')[0];
  
  clearFormErrors();
  showModal(true);
}

async function confirmarExclusao(id) {
  const transacao = todasTransacoes.find(t => t.id === id);
  if (!transacao) return;
  
  const confirmacao = confirm(
    `Tem certeza que deseja excluir a transação "${transacao.descricao || 'Sem descrição'}"?\n\nEsta ação não pode ser desfeita.`
  );
  
  if (confirmacao) {
    await excluirTransacao(id);
  }
}

async function excluirTransacao(id) {
  try {
    await api.deleteTransacao(id);
    showNotification('Transação excluída com sucesso!', 'success');
    
    // Recarregar dados
    const usuarioId = getCurrentUser()?.id || 1;
    await carregarTransacoes(usuarioId);
  } catch (error) {
    console.error('❌ Erro ao excluir transação:', error);
    showNotification(error.message || 'Erro ao excluir transação', 'error');
  }
}

// ===== FILTROS =====

function aplicarFiltros() {
  const filtroTipo = document.getElementById('filter-tipo').value;
  const filtroCategoria = document.getElementById('filter-categoria').value;
  const dataInicio = document.getElementById('filter-data-inicio').value;
  const dataFim = document.getElementById('filter-data-fim').value;
  
  transacoesFiltradas = todasTransacoes.filter(transacao => {
    // Filtro por tipo
    if (filtroTipo && transacao.tipo_entrada !== filtroTipo) {
      return false;
    }
    
    // Filtro por categoria
    if (filtroCategoria && transacao.categoria_id != filtroCategoria) {
      return false;
    }
    
    // Filtro por data
    const dataTransacao = new Date(transacao.data_criacao);
    
    if (dataInicio) {
      const inicio = new Date(dataInicio);
      if (dataTransacao < inicio) return false;
    }
    
    if (dataFim) {
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999); // Final do dia
      if (dataTransacao > fim) return false;
    }
    
    return true;
  });
  
  atualizarInterface();
  showNotification(`${transacoesFiltradas.length} transação(ões) encontrada(s)`, 'info', 2000);
}

function limparFiltros() {
  document.getElementById('filter-tipo').value = '';
  document.getElementById('filter-categoria').value = '';
  document.getElementById('filter-data-inicio').value = '';
  document.getElementById('filter-data-fim').value = '';
  
  transacoesFiltradas = [...todasTransacoes];
  atualizarInterface();
  showNotification('Filtros limpos', 'info', 2000);
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
  // Form de transação
  const form = document.getElementById('transaction-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (validarFormulario()) {
        setLoadingState('save-transaction-btn', true);
        try {
          const formData = new FormData(form);
          await salvarTransacao(formData);
        } finally {
          setLoadingState('save-transaction-btn', false);
        }
      }
    });
  }
  
  // Fechar modal ao clicar fora
  const modal = document.getElementById('transaction-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeTransactionModal();
      }
    });
  }
  
  // Tecla ESC para fechar modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTransactionModal();
    }
  });
}

// ===== VALIDAÇÃO =====

function validarFormulario() {
  clearFormErrors();
  let isValid = true;
  
  const descricao = document.getElementById('descricao').value.trim();
  const valor = document.getElementById('valor').value;
  const tipo = document.getElementById('tipo_entrada').value;
  const categoria = document.getElementById('categoria_id').value;
  const data = document.getElementById('data_criacao').value;
  
  if (!descricao) {
    showFieldError('descricao', 'Descrição é obrigatória');
    isValid = false;
  }
  
  if (!valor || valor <= 0) {
    showFieldError('valor', 'Valor deve ser maior que zero');
    isValid = false;
  }
  
  if (!tipo) {
    showFieldError('tipo_entrada', 'Tipo é obrigatório');
    isValid = false;
  }
  
  // Categoria agora é opcional
  // if (!categoria) {
  //   showFieldError('categoria_id', 'Categoria é obrigatória');
  //   isValid = false;
  // }
  
  if (!data) {
    showFieldError('data_criacao', 'Data é obrigatória');
    isValid = false;
  }
  
  return isValid;
}

function showFieldError(fieldName, message) {
  const field = document.getElementById(fieldName);
  const errorElement = document.getElementById(`${fieldName}-error`);
  
  if (field) field.classList.add('error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
}

function clearFormErrors() {
  document.querySelectorAll('.form-group input, .form-group select').forEach(input => {
    input.classList.remove('error');
  });
  document.querySelectorAll('.error-message').forEach(error => {
    error.classList.remove('show');
    error.textContent = '';
  });
}

// ===== EXPORTAR =====

function exportarTransacoes() {
  if (transacoesFiltradas.length === 0) {
    showNotification('Nenhuma transação para exportar', 'warning');
    return;
  }
  
  // Implementar exportação CSV
  const csv = gerarCSV(transacoesFiltradas);
  downloadCSV(csv, 'transacoes.csv');
  showNotification('Transações exportadas com sucesso!', 'success');
}

function gerarCSV(transacoes) {
  const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
  const rows = transacoes.map(t => [
    formatDate(t.data_criacao),
    t.descricao || '',
    t.categoria?.nome || '',
    t.tipo_entrada === 'entrada' ? 'Receita' : 'Despesa',
    t.valor
  ]);
  
  return [headers, ...rows].map(row => 
    row.map(field => `"${field}"`).join(',')
  ).join('\n');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ===== UTILITÁRIOS =====

function updateElement(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

function setLoadingState(buttonId, loading) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  
  if (loading) {
    button.classList.add('loading');
    button.disabled = true;
  } else {
    button.classList.remove('loading');
    button.disabled = false;
  }
}

console.log('📝 transacoes.js carregado!');