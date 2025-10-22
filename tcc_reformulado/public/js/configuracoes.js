// ===== CONFIGURAÇÕES =====

// Configurações padrão
const configPadrao = {
  corFundo: 'default',
  tipoFonte: 'inter',
  tamanhoFonte: 100
};

// Mapa de cores de fundo
const coresFundo = {
  default: {
    primary: '#667eea',
    primaryDark: '#5568d3',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  blue: {
    primary: '#4299e1',
    primaryDark: '#3182ce',
    gradient: 'linear-gradient(135deg, #667eea 0%, #4299e1 100%)'
  },
  green: {
    primary: '#10b981',
    primaryDark: '#059669',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  orange: {
    primary: '#f59e0b',
    primaryDark: '#d97706',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
  },
  pink: {
    primary: '#ec4899',
    primaryDark: '#db2777',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
  },
  dark: {
    primary: '#374151',
    primaryDark: '#1f2937',
    gradient: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
  }
};

// Mapa de fontes
const fontes = {
  inter: "'Inter', sans-serif",
  roboto: "'Roboto', sans-serif",
  opensans: "'Open Sans', sans-serif",
  poppins: "'Poppins', sans-serif",
  lato: "'Lato', sans-serif",
  montserrat: "'Montserrat', sans-serif"
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
  carregarConfiguracoes();
  aplicarConfiguracoes();
});

// ===== FUNÇÕES DE CONFIGURAÇÃO =====

function carregarConfiguracoes() {
  const config = obterConfiguracoes();
  
  // Marcar opção de cor selecionada
  document.querySelectorAll('.color-option').forEach(option => {
    option.classList.remove('active');
    if (option.dataset.bg === config.corFundo) {
      option.classList.add('active');
    }
  });
  
  // Marcar opção de fonte selecionada
  document.querySelectorAll('.font-option').forEach(option => {
    option.classList.remove('active');
    if (option.dataset.font === config.tipoFonte) {
      option.classList.add('active');
    }
  });
  
  // Configurar slider de tamanho
  const slider = document.getElementById('font-size-range');
  if (slider) {
    slider.value = config.tamanhoFonte;
    atualizarPreviewTamanho(config.tamanhoFonte);
  }
}

function obterConfiguracoes() {
  const configSalva = localStorage.getItem('fluxo-finance-config');
  if (configSalva) {
    return JSON.parse(configSalva);
  }
  return { ...configPadrao };
}

function salvarConfiguracoes(config) {
  localStorage.setItem('fluxo-finance-config', JSON.stringify(config));
}

function aplicarConfiguracoes() {
  const config = obterConfiguracoes();
  
  // Aplicar cor de fundo
  if (coresFundo[config.corFundo]) {
    const cores = coresFundo[config.corFundo];
    document.documentElement.style.setProperty('--primary-color', cores.primary);
    document.documentElement.style.setProperty('--primary-dark', cores.primaryDark);
    
    // Atualizar gradiente da navbar se existir
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.style.background = cores.gradient;
    }
  }
  
  // Aplicar fonte
  if (fontes[config.tipoFonte]) {
    document.documentElement.style.setProperty('--font-family', fontes[config.tipoFonte]);
    document.body.style.fontFamily = fontes[config.tipoFonte];
  }
  
  // Aplicar tamanho da fonte
  const porcentagem = config.tamanhoFonte / 100;
  document.documentElement.style.fontSize = `${16 * porcentagem}px`;
}

// ===== SELEÇÃO DE COR DE FUNDO =====

function selecionarCorFundo(cor) {
  const config = obterConfiguracoes();
  config.corFundo = cor;
  salvarConfiguracoes(config);
  
  // Atualizar interface
  document.querySelectorAll('.color-option').forEach(option => {
    option.classList.remove('active');
    if (option.dataset.bg === cor) {
      option.classList.add('active');
    }
  });
  
  // Aplicar mudança imediatamente
  aplicarConfiguracoes();
  
  // Mostrar feedback
  mostrarFeedback('Cor de fundo alterada com sucesso!');
}

// ===== SELEÇÃO DE FONTE =====

function selecionarFonte(fonte) {
  const config = obterConfiguracoes();
  config.tipoFonte = fonte;
  salvarConfiguracoes(config);
  
  // Atualizar interface
  document.querySelectorAll('.font-option').forEach(option => {
    option.classList.remove('active');
    if (option.dataset.font === fonte) {
      option.classList.add('active');
    }
  });
  
  // Aplicar mudança imediatamente
  aplicarConfiguracoes();
  
  // Mostrar feedback
  mostrarFeedback('Tipo de fonte alterado com sucesso!');
}

// ===== TAMANHO DA FONTE =====

function ajustarTamanhoFonte(tamanho) {
  const config = obterConfiguracoes();
  config.tamanhoFonte = parseInt(tamanho);
  salvarConfiguracoes(config);
  
  // Atualizar preview
  atualizarPreviewTamanho(tamanho);
  
  // Aplicar mudança imediatamente
  aplicarConfiguracoes();
}

function definirTamanhoFonte(tamanho) {
  const slider = document.getElementById('font-size-range');
  if (slider) {
    slider.value = tamanho;
    ajustarTamanhoFonte(tamanho);
    mostrarFeedback('Tamanho da fonte alterado com sucesso!');
  }
}

function atualizarPreviewTamanho(tamanho) {
  const preview = document.getElementById('font-size-value');
  if (preview) {
    preview.textContent = `${tamanho}%`;
  }
  
  // Atualizar escala do texto de exemplo
  const previewText = document.querySelector('.preview-text');
  if (previewText) {
    const escala = tamanho / 100;
    previewText.style.fontSize = `${1.2 * escala}rem`;
  }
  
  const previewValue = document.querySelector('.preview-value');
  if (previewValue) {
    const escala = tamanho / 100;
    previewValue.style.fontSize = `${2 * escala}rem`;
  }
}

// ===== RESETAR CONFIGURAÇÕES =====

function resetarConfiguracoes() {
  if (confirm('Deseja restaurar todas as configurações para o padrão?')) {
    salvarConfiguracoes({ ...configPadrao });
    carregarConfiguracoes();
    aplicarConfiguracoes();
    mostrarFeedback('Configurações restauradas para o padrão!');
  }
}

// ===== FEEDBACK =====

function mostrarFeedback(mensagem) {
  // Remover feedback anterior se existir
  const feedbackAnterior = document.querySelector('.config-feedback');
  if (feedbackAnterior) {
    feedbackAnterior.remove();
  }
  
  // Criar novo feedback
  const feedback = document.createElement('div');
  feedback.className = 'config-feedback';
  feedback.innerHTML = `
    <div class="feedback-content">
      <span class="feedback-icon">✓</span>
      <span class="feedback-message">${mensagem}</span>
    </div>
  `;
  
  // Adicionar estilos inline
  feedback.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(feedback);
  
  // Remover após 3 segundos
  setTimeout(() => {
    feedback.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => feedback.remove(), 300);
  }, 3000);
}

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
  
  .feedback-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .feedback-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    font-weight: bold;
  }
  
  .feedback-message {
    font-weight: 500;
  }
`;
document.head.appendChild(style);
