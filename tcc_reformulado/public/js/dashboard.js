document.addEventListener('DOMContentLoaded', async () => {
  console.log('Inicializando dashboard...');
  
  // As funções comuns já foram inicializadas pelo common.js
  // Não precisamos mais chamar setupNavbarInteractions() e setupSidebarInteractions()
  
  // Simulando usuário logado (em produção, pegar do localStorage/session)
  const usuarioId = getCurrentUser()?.id || 1;
  
  try {
    // Carregar dados do dashboard
    await Promise.all([
      carregarResumoFinanceiro(usuarioId),
      carregarUltimasTransacoes(usuarioId),
      carregarMetasResumo(usuarioId)
    ]);
    
    console.log(' Dashboard carregado com sucesso!');
  } catch (error) {
    console.error(' Erro ao carregar dashboard:', error);
    showNotification('Erro ao carregar dados do dashboard', 'error');
  }
});

// ===== FUNÇÕES ESPECÍFICAS DO DASHBOARD =====

async function carregarResumoFinanceiro(usuarioId) {
  try {
    console.log(' Carregando resumo financeiro...');
    const transacoes = await api.getTransacoes(usuarioId);
    
    let totalReceitas = 0;
    let totalDespesas = 0;
    
    transacoes.forEach(transacao => {
      const valor = parseFloat(transacao.valor) || 0;
      if (transacao.tipo_entrada === 'entrada') {
        totalReceitas += valor;
      } else {
        totalDespesas += valor;
      }
    });
    
    const saldo = totalReceitas - totalDespesas;
    
    // Atualizar interface com verificação se elementos existem
    const elementoReceitas = document.getElementById('total-receitas');
    const elementoDespesas = document.getElementById('total-despesas');
    const elementoSaldo = document.getElementById('saldo-total');
    
    if (elementoReceitas) elementoReceitas.textContent = formatCurrency(totalReceitas);
    if (elementoDespesas) elementoDespesas.textContent = formatCurrency(totalDespesas);
    if (elementoSaldo) elementoSaldo.textContent = formatCurrency(saldo);
    
    console.log(' Resumo financeiro carregado!');
    
  } catch (error) {
    console.error(' Erro ao carregar resumo financeiro:', error);
    showNotification('Erro ao carregar resumo financeiro', 'error');
  }
}

async function carregarUltimasTransacoes(usuarioId) {
  try {
    console.log('📋 Carregando últimas transações...');
    const transacoes = await api.getTransacoes(usuarioId);
    const ultimasTransacoes = transacoes.slice(0, 5);
    
    const container = document.getElementById('ultimas-transacoes');
    if (!container) return;
    
    if (ultimasTransacoes.length === 0) {
      container.innerHTML = `
        <p class="empty-state">
          Nenhuma transação encontrada. 
          <a href="/transacoes" class="btn-link">Adicione sua primeira transação</a>
        </p>
      `;
      return;
    }
    
    container.innerHTML = ultimasTransacoes.map(transacao => `
      <div class="transaction-item ${transacao.tipo_entrada}">
        <div class="transaction-info">
          <span class="transaction-category">${transacao.categoria?.nome || 'Sem categoria'}</span>
          <span class="transaction-date">${formatDate(transacao.data_criacao)}</span>
        </div>
        <span class="transaction-value ${transacao.tipo_entrada}">
          ${transacao.tipo_entrada === 'entrada' ? '+' : '-'} ${formatCurrency(transacao.valor)}
        </span>
      </div>
    `).join('');
    
    console.log('Últimas transações carregadas!');

  } catch (error) {
    console.error('Erro ao carregar últimas transações:', error);
    showNotification('Erro ao carregar transações', 'error');
  }
}

async function carregarMetasResumo(usuarioId) {
  try {
    console.log(' Carregando resumo de metas...');
    const metas = await api.getMetas(usuarioId);
    const container = document.getElementById('metas-resumo');
    if (!container) return;
    
    if (metas.length === 0) {
      container.innerHTML = `
        <p class="empty-state">
          Nenhuma meta definida. 
          <a href="/metas" class="btn-link">Crie sua primeira meta</a>
        </p>
      `;
      return;
    }
    
    container.innerHTML = metas.slice(0, 3).map(meta => {
      const progresso = meta.foi_batida ? 100 : 0;
      return `
        <div class="meta-card">
          <h4>${meta.nome}</h4>
          <div class="meta-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progresso}%"></div>
            </div>
            <span class="meta-value">${formatCurrency(meta.valor)}</span>
          </div>
          <span class="meta-status ${meta.foi_batida ? 'completed' : 'pending'}">
            ${meta.foi_batida ? '✅ Concluída' : '⏳ Em andamento'}
          </span>
        </div>
      `;
    }).join('');
    
    console.log(' Resumo de metas carregado!');
    
  } catch (error) {
    console.error(' Erro ao carregar metas:', error);
    showNotification('Erro ao carregar metas', 'error');
  }
}

// Função específica do dashboard para atualizar dados
async function atualizarDashboard() {
  const usuarioId = getCurrentUser()?.id || 1;
  
  showNotification('Atualizando dados...', 'info', 2000);
  
  try {
    await Promise.all([
      carregarResumoFinanceiro(usuarioId),
      carregarUltimasTransacoes(usuarioId),
      carregarMetasResumo(usuarioId)
    ]);
    
    showNotification('Dados atualizados com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao atualizar dashboard:', error);
    showNotification('Erro ao atualizar dados', 'error');
  }
}

// Adicionar botão de atualizar (opcional)
function adicionarBotaoAtualizar() {
  const dashboardHeader = document.querySelector('.dashboard-header');
  if (dashboardHeader && !document.getElementById('refresh-btn')) {
    const refreshBtn = document.createElement('button');
    refreshBtn.id = 'refresh-btn';
    refreshBtn.className = 'btn-refresh';
    refreshBtn.innerHTML = '🔄 Atualizar';
    refreshBtn.onclick = atualizarDashboard;
    
    dashboardHeader.appendChild(refreshBtn);
  }
}

// Chamar função para adicionar botão de atualizar
setTimeout(adicionarBotaoAtualizar, 1000);