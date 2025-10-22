// ===== FUNÇÕES GLOBAIS PARA NAVBAR E SIDEBAR =====

// Configurar interações da navbar
function setupNavbarInteractions() {
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown');
  
  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', () => {
      userDropdown.classList.remove('show');
    });
    
    // Fechar dropdown ao pressionar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        userDropdown.classList.remove('show');
      }
    });
  }
}

// Configurar interações da sidebar (principalmente para mobile)
function setupSidebarInteractions() {
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const overlay = document.getElementById('sidebar-overlay');
  
  // Toggle sidebar em dispositivos móveis
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      document.body.classList.toggle('sidebar-open');
    });
  }
  
  // Fechar sidebar ao clicar no overlay
  if (overlay && sidebar) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      document.body.classList.remove('sidebar-open');
    });
  }
  
  // Fechar sidebar ao pressionar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      document.body.classList.remove('sidebar-open');
    }
  });
  
  // Ajustar sidebar em redimensionamento da tela
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && sidebar) {
      sidebar.classList.remove('open');
      document.body.classList.remove('sidebar-open');
    }
  });
}

// Função para verificar autenticação (renomeada para evitar conflito)
function checkAuthentication() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        // Salvar página atual para redirecionar após login
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        console.log('🔐 Usuário não autenticado, redirecionando para login...');
        window.location.href = '/';
        return false;
    }
    
    console.log('✅ Usuário autenticado:', JSON.parse(user).nome);
    return true;
}

// Função para obter dados do usuário atual
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Função para abrir modal de nova transação
function openTransactionModal() {
  // Por enquanto, um alert simples
  // Em breve será substituído por um modal real
  const action = confirm('Deseja ir para a página de transações para adicionar uma nova?');
  if (action) {
    window.location.href = '/transacoes';
  }
}

// Função para atualizar informações do usuário na interface
function updateUserInterface(user) {
  if (!user) return;
  
  // Atualizar nome do usuário na navbar
  const userWelcome = document.querySelector('.user-welcome');
  if (userWelcome) {
    userWelcome.textContent = `Olá, ${user.nome}!`;
  }
  
  // Atualizar avatar com inicial do nome
  const userAvatar = document.querySelector('.user-avatar');
  if (userAvatar && user.nome) {
    userAvatar.textContent = user.nome.charAt(0).toUpperCase();
  }
  
  // Atualizar título da página se necessário
  const dashboardHeader = document.querySelector('.dashboard-header h1');
  if (dashboardHeader && dashboardHeader.textContent.includes('Usuário')) {
    dashboardHeader.textContent = `Bem-vindo de volta, ${user.nome.split(' ')[0]}!`;
  }
}

// Sistema de notificações toast
function showNotification(message, type = 'info', duration = 5000) {
  // Remover notificação anterior se existir
  const existingNotification = document.querySelector('.toast-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Criar elemento de notificação
  const notification = document.createElement('div');
  notification.className = `toast-notification toast-${type}`;
  notification.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${getNotificationIcon(type)}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Adicionar estilos inline (se não estiverem no CSS)
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    min-width: 300px;
    max-width: 500px;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideInRight 0.3s ease-out;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  // Cores baseadas no tipo
  const colors = {
    success: { bg: '#10b981', text: 'white' },
    error: { bg: '#ef4444', text: 'white' },
    warning: { bg: '#f59e0b', text: 'white' },
    info: { bg: '#3b82f6', text: 'white' }
  };
  
  const color = colors[type] || colors.info;
  notification.style.backgroundColor = color.bg;
  notification.style.color = color.text;
  
  // Adicionar ao DOM
  document.body.appendChild(notification);
  
  // Remover automaticamente após o tempo especificado
  if (duration > 0) {
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  }
}

// Função auxiliar para ícones de notificação
function getNotificationIcon(type) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[type] || icons.info;
}

// Função para inicializar componentes comuns
function initializeCommonComponents() {
  console.log('🔧 Inicializando componentes comuns...');
  
  // Configurar navbar e sidebar
  setupNavbarInteractions();
  setupSidebarInteractions();
  
  // Verificar autenticação (opcional, só em páginas protegidas)
  const isProtectedPage = document.body.classList.contains('dashboard-page') || 
                          document.body.classList.contains('protected-page');
  
  if (isProtectedPage) {
    console.log('🔐 Verificando autenticação na página protegida...');
    if (!checkAuthentication()) {
      return; // Usuário será redirecionado
    }
    
    // Atualizar interface com dados do usuário
    const currentUser = getCurrentUser();
    if (currentUser) {
      updateUserInterface(currentUser);
    }
  }
  
  console.log('✅ Componentes comuns inicializados!');
}

// Funções utilitárias que também podem ser globais
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR');
}

function formatDateTime(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('pt-BR');
}

// Função para validar email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Função para debounce (útil para buscas)
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Adicionar estilos CSS para as notificações toast se não existirem
function addToastStyles() {
  if (!document.querySelector('#toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      
      .toast-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .toast-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        opacity: 0.8;
      }
      
      .toast-close:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
}

// Inicializar estilos das notificações quando o script carregar
addToastStyles();

// Auto-inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCommonComponents);
} else {
  initializeCommonComponents();
}

console.log('📦 common.js carregado com sucesso!');