let todasMetas = [];
let metasFiltradas = [];
let editandoMeta = null;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Inicializando página de metas...');
  
  // Obter usuário atual
  const usuarioId = getCurrentUser()?.id || 1;
  
  try {
    // Carregar metas
    await carregarMetas(usuarioId);
    
    // Configurar eventos
    setupEventListeners();
    
    console.log('Página de metas carregada!');
  } catch (error) {
    console.error('Erro ao carregar página:', error);
    showNotification('Erro ao carregar dados', 'error');
  }
});

// ===== CARREGAMENTO DE DADOS =====

async function carregarMetas(usuarioId) {
  try {
    console.log(' Carregando metas...');
    showLoading(true);
    
    todasMetas = await api.getMetas(usuarioId);
    metasFiltradas = [...todasMetas];
    
    // Calcular progresso das metas
    await calcularProgressoMetas();
    
    atualizarInterface();
    
    console.log(' Metas carregadas!');
  } catch (error) {
    console.error(' Erro ao carregar metas:', error);
    showNotification('Erro ao carregar metas', 'error');
  } finally {
    showLoading(false);
  }
}

// ===== CÁLCULOS =====

async function calcularProgressoMetas() {
  const usuarioId = getCurrentUser()?.id || 1;
  
  try {
    // Buscar transações para calcular progresso
    const transacoes = await api.getTransacoes(usuarioId);
    
    todasMetas.forEach(meta => {
      // Filtrar transações do período da meta
      const dataInicio = new Date(meta.data_inicio);
      const dataFinal = new Date(meta.data_final);
      
      const transacoesPeriodo = transacoes.filter(t => {
        const dataTransacao = new Date(t.data_criacao);
        return dataTransacao >= dataInicio && dataTransacao <= dataFinal;
      });
      
      // Calcular economia (receitas - despesas)
      const receitas = transacoesPeriodo
        .filter(t => t.tipo_entrada === 'entrada')
        .reduce((sum, t) => sum + parseFloat(t.valor), 0);
      
      const despesas = transacoesPeriodo
        .filter(t => t.tipo_entrada === 'saida')
        .reduce((sum, t) => sum + parseFloat(t.valor), 0);
      
      const economia = receitas - despesas;
      const progresso = Math.max(0, Math.min(100, (economia / meta.valor) * 100));
      
      // Adicionar dados calculados
      meta.economia_atual = economia;
      meta.progresso = progresso;
      meta.status = determinarStatusMeta(meta);
      meta.tempo_restante = calcularTempoRestante(meta);
    });
    
  } catch (error) {
    console.error(' Erro ao calcular progresso:', error);
    // Continuar sem o progresso se houver erro
    todasMetas.forEach(meta => {
      meta.economia_atual = 0;
      meta.progresso = 0;
      meta.status = determinarStatusMeta(meta);
      meta.tempo_restante = calcularTempoRestante(meta);
    });
  }
}

function determinarStatusMeta(meta) {
  if (meta.foi_batida) {
    return 'concluida';
  }
  
  const hoje = new Date();
  const dataFinal = new Date(meta.data_final);
  
  if (hoje > dataFinal) {
    return 'vencida';
  }
  
  return 'ativa';
}

function calcularTempoRestante(meta) {
  const hoje = new Date();
  const dataFinal = new Date(meta.data_final);
  const diffTime = dataFinal - hoje;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (meta.foi_batida) {
    return 'Meta concluída! 🎉';
  }
  
  if (diffDays < 0) {
    return `Vencida há ${Math.abs(diffDays)} dia(s)`;
  }
  
  if (diffDays === 0) {
    return 'Vence hoje!';
  }
  
  if (diffDays <= 7) {
    return `${diffDays} dia(s) restante(s) ⚡`;
  }
  
  if (diffDays <= 30) {
    return `${diffDays} dia(s) restante(s)`;
  }
  
  const meses = Math.floor(diffDays / 30);
  const dias = diffDays % 30;
  return `${meses} mês(es) ${dias} dia(s)`;
}

// ===== INTERFACE =====

function atualizarInterface() {
  atualizarResumo();
  renderizarMetas();
}

function atualizarResumo() {
  const metasAtivas = metasFiltradas.filter(m => m.status === 'ativa');
  const metasConcluidas = metasFiltradas.filter(m => m.status === 'concluida');
  const totalMetas = metasFiltradas.length;
  
  const valorMetasAtivas = metasAtivas.reduce((sum, m) => sum + parseFloat(m.valor), 0);
  const valorMetasConcluidas = metasConcluidas.reduce((sum, m) => sum + parseFloat(m.valor), 0);
  const valorTotalMetas = metasFiltradas.reduce((sum, m) => sum + parseFloat(m.valor), 0);
  
  // Atualizar elementos
  updateElement('total-metas-ativas', metasAtivas.length);
  updateElement('valor-metas-ativas', formatCurrency(valorMetasAtivas));
  updateElement('total-metas-concluidas', metasConcluidas.length);
  updateElement('valor-metas-concluidas', formatCurrency(valorMetasConcluidas));
  updateElement('total-valor-metas', formatCurrency(valorTotalMetas));
  updateElement('count-total-metas', `${totalMetas} meta${totalMetas !== 1 ? 's' : ''}`);
}

function renderizarMetas() {
  const container = document.getElementById('metas-grid');
  if (!container) return;
  
  if (metasFiltradas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎯</div>
        <h3>Nenhuma meta encontrada</h3>
        <p>Defina suas primeiras metas financeiras e comece a conquistar seus objetivos!</p>
        <button class="btn-primary" onclick="openMetaModal()">
          Criar Primeira Meta
        </button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = metasFiltradas.map(meta => `
    <div class="meta-card ${meta.status} ${meta.tempo_restante.includes('⚡') ? 'urgente' : ''}">
      <div class="meta-header">
        <h3 class="meta-title">${meta.nome}</h3>
        <span class="meta-status ${meta.status}">${getStatusText(meta.status)}</span>
      </div>
      
      <div class="meta-valor">${formatCurrency(meta.valor)}</div>
      
      <div class="meta-progress">
        <div class="meta-progress-label">
          <span>Progresso</span>
          <span class="meta-progress-percent">${meta.progresso.toFixed(1)}%</span>
        </div>
        <div class="meta-progress-bar" data-tooltip="Economia atual: ${formatCurrency(meta.economia_atual)}">
          <div class="meta-progress-fill ${meta.status}" style="width: ${Math.min(100, meta.progresso)}%"></div>
        </div>
      </div>
      
      <div class="meta-dates">
        <div class="meta-date">
          <span class="meta-date-label">Início</span>
          <span class="meta-date-value">${formatDate(meta.data_inicio)}</span>
        </div>
        <div class="meta-date">
          <span class="meta-date-label">Final</span>
          <span class="meta-date-value">${formatDate(meta.data_final)}</span>
        </div>
      </div>
      
      <div class="meta-time-remaining ${meta.status === 'concluida' ? 'concluida' : (meta.tempo_restante.includes('⚡') ? 'urgente' : '')}">
        ${meta.tempo_restante}
      </div>
      
      <div class="meta-actions">
        ${!meta.foi_batida && meta.status !== 'vencida' ? `
          <button class="meta-action-btn complete" onclick="marcarMetaConcluida(${meta.id})" title="Marcar como concluída">
            Concluir
          </button>
        ` : ''}
        
        <button class="meta-action-btn edit" onclick="editarMeta(${meta.id})" title="Editar meta">
          Editar
        </button>
        
        <button class="meta-action-btn delete" onclick="confirmarExclusao(${meta.id})" title="Excluir meta">
          Excluir
        </button>
      </div>
    </div>
  `).join('');
}

function getStatusText(status) {
  const statusMap = {
    ativa: 'Ativa',
    concluida: 'Concluída',
    vencida: 'Vencida'
  };
  return statusMap[status] || status;
}

function showLoading(show) {
  const loading = document.getElementById('loading-metas');
  const container = document.getElementById('metas-grid');
  
  if (loading) {
    loading.classList.toggle('show', show);
  }
  if (container) {
    container.style.display = show ? 'none' : 'grid';
  }
}

// ===== MODAL =====

function openMetaModal() {
  editandoMeta = null;
  document.getElementById('modal-title').textContent = 'Nova Meta';
  document.getElementById('meta-form').reset();
  document.getElementById('meta-id').value = '';
  
  // Definir data atual como padrão para início
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('data_inicio').value = hoje;
  
  // Definir data daqui a 1 ano como padrão para final
  const proximoAno = new Date();
  proximoAno.setFullYear(proximoAno.getFullYear() + 1);
  document.getElementById('data_final').value = proximoAno.toISOString().split('T')[0];
  
  clearFormErrors();
  showModal(true);
}

function closeMetaModal() {
  showModal(false);
  setTimeout(() => {
    document.getElementById('meta-form').reset();
    clearFormErrors();
    editandoMeta = null;
  }, 300);
}

function showModal(show) {
  const modal = document.getElementById('meta-modal');
  if (modal) {
    if (show) {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('show'), 10);
    } else {
      modal.classList.remove('show');
      setTimeout(() => modal.style.display = 'none', 300);
    }
  }
}

// ===== CRUD OPERATIONS =====

async function salvarMeta(formData) {
  try {
    const metaData = {
      nome: formData.get('nome').trim(),
      valor: parseFloat(formData.get('valor')),
      data_inicio: formData.get('data_inicio'),
      data_final: formData.get('data_final')
    };
    
    let response;
    if (editandoMeta) {
      response = await api.updateMeta(editandoMeta.id, metaData);
      showNotification('Meta atualizada com sucesso!', 'success');
    } else {
      response = await api.createMeta(metaData);
      showNotification('Meta criada com sucesso!', 'success');
    }
    
    // Recarregar dados
    const usuarioId = getCurrentUser()?.id || 1;
    await carregarMetas(usuarioId);
    
    closeMetaModal();
  } catch (error) {
    console.error(' Erro ao salvar meta:', error);
    showNotification(error.message || 'Erro ao salvar meta', 'error');
  }
}

async function editarMeta(id) {
  const meta = todasMetas.find(m => m.id === id);
  if (!meta) return;
  
  editandoMeta = meta;
  document.getElementById('modal-title').textContent = 'Editar Meta';
  
  // Preencher formulário
  document.getElementById('meta-id').value = meta.id;
  document.getElementById('nome').value = meta.nome || '';
  document.getElementById('valor').value = meta.valor;
  
  // Formatar datas para input date
  const dataInicio = new Date(meta.data_inicio);
  const dataFinal = new Date(meta.data_final);
  document.getElementById('data_inicio').value = dataInicio.toISOString().split('T')[0];
  document.getElementById('data_final').value = dataFinal.toISOString().split('T')[0];
  
  clearFormErrors();
  showModal(true);
}

async function marcarMetaConcluida(id) {
  const meta = todasMetas.find(m => m.id === id);
  if (!meta) return;
  
  const confirmacao = confirm(
    `Parabéns! Deseja marcar a meta "${meta.nome}" como concluída?\n\n` +
    `Valor da meta: ${formatCurrency(meta.valor)}\n\n` +
    `⚠️ ATENÇÃO: O valor da meta será debitado automaticamente da sua conta como uma despesa.`
  );
  
  if (confirmacao) {
    try {
      const response = await api.updateMeta(id, { foi_batida: true });
      
      showNotification(
        `🎉 Parabéns! Meta concluída com sucesso!\n` +
        `💰 Valor de ${formatCurrency(meta.valor)} foi debitado da sua conta.`,
        'success'
      );
      
      // Recarregar dados
      const usuarioId = getCurrentUser()?.id || 1;
      await carregarMetas(usuarioId);
    } catch (error) {
      console.error(' Erro ao marcar meta como concluída:', error);
      
      // Tentar extrair mensagem de erro detalhada
      let errorMessage = error.message || 'Erro ao marcar meta como concluída';
      
      // Acessar dados adicionais do erro (se existirem)
      if (error.data) {
        const data = error.data;
        
        // Se for erro de saldo insuficiente, mostrar detalhes
        if (data.saldoAtual && data.valorNecessario) {
          errorMessage = `<strong>${data.error}</strong><br><br>` +
            `💰 <strong>Saldo atual:</strong> ${formatCurrency(parseFloat(data.saldoAtual))}<br>` +
            `🎯 <strong>Valor da meta:</strong> ${formatCurrency(parseFloat(data.valorNecessario))}<br>` +
            `⚠️ <strong>Faltam:</strong> ${formatCurrency(parseFloat(data.diferenca))}`;
        }
      }
      
      showNotification(errorMessage, 'error');
    }
  }
}

async function confirmarExclusao(id) {
  const meta = todasMetas.find(m => m.id === id);
  if (!meta) return;
  
  const confirmacao = confirm(
    `Tem certeza que deseja excluir a meta "${meta.nome}"?\n\nEsta ação não pode ser desfeita.`
  );
  
  if (confirmacao) {
    await excluirMeta(id);
  }
}

async function excluirMeta(id) {
  try {
    await api.deleteMeta(id);
    showNotification('Meta excluída com sucesso!', 'success');
    
    // Recarregar dados
    const usuarioId = getCurrentUser()?.id || 1;
    await carregarMetas(usuarioId);
  } catch (error) {
    console.error(' Erro ao excluir meta:', error);
    showNotification(error.message || 'Erro ao excluir meta', 'error');
  }
}

// ===== FILTROS =====

function aplicarFiltros() {
  const filtroStatus = document.getElementById('filter-status').value;
  const dataInicio = document.getElementById('filter-data-inicio').value;
  const dataFim = document.getElementById('filter-data-fim').value;
  
  metasFiltradas = todasMetas.filter(meta => {
    // Filtro por status
    if (filtroStatus && meta.status !== filtroStatus) {
      return false;
    }
    
    // Filtro por data
    const dataInicioMeta = new Date(meta.data_inicio);
    const dataFinalMeta = new Date(meta.data_final);
    
    if (dataInicio) {
      const inicio = new Date(dataInicio);
      if (dataFinalMeta < inicio) return false;
    }
    
    if (dataFim) {
      const fim = new Date(dataFim);
      if (dataInicioMeta > fim) return false;
    }
    
    return true;
  });
  
  atualizarInterface();
  showNotification(`${metasFiltradas.length} meta(s) encontrada(s)`, 'info', 2000);
}

function limparFiltros() {
  document.getElementById('filter-status').value = '';
  document.getElementById('filter-data-inicio').value = '';
  document.getElementById('filter-data-fim').value = '';
  
  metasFiltradas = [...todasMetas];
  atualizarInterface();
  showNotification('Filtros limpos', 'info', 2000);
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
  // Form de meta
  const form = document.getElementById('meta-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (validarFormulario()) {
        setLoadingState('save-meta-btn', true);
        try {
          const formData = new FormData(form);
          await salvarMeta(formData);
        } finally {
          setLoadingState('save-meta-btn', false);
        }
      }
    });
  }
  
  // Fechar modal ao clicar fora
  const modal = document.getElementById('meta-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeMetaModal();
      }
    });
  }
  
  // Tecla ESC para fechar modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMetaModal();
    }
  });
}

// ===== VALIDAÇÃO =====

function validarFormulario() {
  clearFormErrors();
  let isValid = true;
  
  const nome = document.getElementById('nome').value.trim();
  const valor = parseFloat(document.getElementById('valor').value);
  const dataInicio = document.getElementById('data_inicio').value;
  const dataFinal = document.getElementById('data_final').value;
  
  // Validar nome
  if (!nome) {
    showFieldError('nome', 'Nome da meta é obrigatório');
    isValid = false;
  } else if (nome.length < 3) {
    showFieldError('nome', 'Nome deve ter pelo menos 3 caracteres');
    isValid = false;
  } else if (nome.length > 100) {
    showFieldError('nome', 'Nome deve ter no máximo 100 caracteres');
    isValid = false;
  }
  
  // Validar valor
  if (!valor || valor <= 0) {
    showFieldError('valor', 'Valor deve ser maior que zero');
    isValid = false;
  } else if (valor > 999999999.99) {
    showFieldError('valor', 'Valor muito alto');
    isValid = false;
  }
  
  // Validar datas
  if (!dataInicio) {
    showFieldError('data_inicio', 'Data de início é obrigatória');
    isValid = false;
  }
  
  if (!dataFinal) {
    showFieldError('data_final', 'Data limite é obrigatória');
    isValid = false;
  }
  
  // Validar se data final é após data inicial
  if (dataInicio && dataFinal) {
    const inicio = new Date(dataInicio);
    const final = new Date(dataFinal);
    
    if (final <= inicio) {
      showFieldError('data_final', 'Data limite deve ser posterior à data de início');
      isValid = false;
    }
    
    // Validar se a meta tem pelo menos 1 dia
    const diffTime = Math.abs(final - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      showFieldError('data_final', 'A meta deve ter pelo menos 1 dia de duração');
      isValid = false;
    }
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

function exportarMetas() {
  if (metasFiltradas.length === 0) {
    showNotification('Nenhuma meta para exportar', 'warning');
    return;
  }
  
  // Implementar exportação CSV
  const csv = gerarCSV(metasFiltradas);
  downloadCSV(csv, 'metas.csv');
  showNotification('Metas exportadas com sucesso!', 'success');
}

function gerarCSV(metas) {
  const headers = ['Nome', 'Valor', 'Data Início', 'Data Final', 'Status', 'Progresso', 'Economia Atual'];
  const rows = metas.map(m => [
    m.nome,
    m.valor,
    formatDate(m.data_inicio),
    formatDate(m.data_final),
    getStatusText(m.status),
    `${m.progresso.toFixed(1)}%`,
    m.economia_atual.toFixed(2)
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