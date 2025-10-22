// ===== APLICAR CONFIGURAÇÕES SALVAS =====
// Este script deve ser carregado em todas as páginas para aplicar as configurações do usuário

(function() {
  // Carregar configurações do localStorage
  const configSalva = localStorage.getItem('fluxo-finance-config');
  
  if (!configSalva) {
    return; // Usar padrões se não houver configuração salva
  }
  
  const config = JSON.parse(configSalva);
  
  // Mapa de cores
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
  
  // Aplicar cor de fundo
  if (config.corFundo && coresFundo[config.corFundo]) {
    const cores = coresFundo[config.corFundo];
    document.documentElement.style.setProperty('--primary-color', cores.primary);
    document.documentElement.style.setProperty('--primary-dark', cores.primaryDark);
    
    // Aplicar gradiente na navbar após o DOM carregar
    document.addEventListener('DOMContentLoaded', function() {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        navbar.style.background = cores.gradient;
      }
    });
  }
  
  // Aplicar fonte
  if (config.tipoFonte && fontes[config.tipoFonte]) {
    document.documentElement.style.setProperty('--font-family', fontes[config.tipoFonte]);
    document.addEventListener('DOMContentLoaded', function() {
      document.body.style.fontFamily = fontes[config.tipoFonte];
    });
  }
  
  // Aplicar tamanho da fonte
  if (config.tamanhoFonte) {
    const porcentagem = config.tamanhoFonte / 100;
    document.documentElement.style.fontSize = `${16 * porcentagem}px`;
  }
})();
