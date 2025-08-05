// Importa o gerenciador de configurações
import { configManager } from './config-manager.js';

document.addEventListener('DOMContentLoaded', function () {
  const bgPicker = document.getElementById('bg-color-picker');
  const primaryPicker = document.getElementById('primary-color-picker');
  const customColor = document.getElementById('customColor');
  const fontFamily = document.getElementById('fontFamily');
  const fontSize = document.getElementById('fontSize');
  const preview = document.querySelector('.font-preview');
  const resetButton = document.getElementById('resetSettings');

  // cores padrão
  const bgColors = ['#ffffff', '#f8f9fa', '#e9ecef', '#212529', '#f1f8e9', '#e3f2fd'];
  const primaryColors = ['#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545', '#fd7e14'];

  // Cria botões de seleção de cor
  function createColorOptions(container, colors, type) {
    if (!container) return;
    
    container.innerHTML = '';
    
    colors.forEach(color => {
      const btn = document.createElement('button');
      btn.className = 'color-option';
      btn.style.backgroundColor = color;
      btn.dataset.color = color;
      btn.title = color;
      
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Remove classe active de todos os botões do container
        container.querySelectorAll('.color-option').forEach(option => {
          option.classList.remove('active');
        });
        
        // Adiciona active ao botão clicado
        btn.classList.add('active');
        
        // Salva usando o gerenciador de configurações
        if (type === 'bg') {
          await configManager.updateConfig('bgColor', color);
        } else {
          await configManager.updateConfig('primaryColor', color);
        }
      });
      
      container.appendChild(btn);
    });
  }

  // Marca cor selecionada
  function markSelectedColor(container, color) {
    if (!container) return;
    
    container.querySelectorAll('.color-option').forEach(option => {
      option.classList.remove('active');
      if (option.dataset.color === color) {
        option.classList.add('active');
      }
    });
  }

  // Restaura seleções salvas
  function restoreSelections() {
    const theme = configManager.getCurrentTheme();
    
    // Restaura seleção de fonte
    if (theme.fontFamily && fontFamily) {
      fontFamily.value = theme.fontFamily;
      if (preview) preview.style.fontFamily = theme.fontFamily;
    }
    
    // Restaura tamanho da fonte
    if (theme.fontSize && fontSize) {
      fontSize.value = theme.fontSize;
      if (preview) preview.style.fontSize = theme.fontSize;
    }
    
    // Marca as cores selecionadas
    if (theme.bgColor && bgPicker) {
      markSelectedColor(bgPicker, theme.bgColor);
    }
    
    if (theme.primaryColor && primaryPicker) {
      markSelectedColor(primaryPicker, theme.primaryColor);
      if (customColor) customColor.value = theme.primaryColor;
    }
  }

  // Event listeners para fonte
  if (fontFamily) {
    fontFamily.addEventListener('change', async () => {
      if (preview) preview.style.fontFamily = fontFamily.value;
      await configManager.updateConfig('fontFamily', fontFamily.value);
    });
  }

  if (fontSize) {
    fontSize.addEventListener('change', async () => {
      if (preview) preview.style.fontSize = fontSize.value;
      await configManager.updateConfig('fontSize', fontSize.value);
    });
  }

  // Event listener para cor customizada
  if (customColor) {
    customColor.addEventListener('change', async (e) => {
      await configManager.updateConfig('primaryColor', e.target.value);
      if (primaryPicker) {
        markSelectedColor(primaryPicker, e.target.value);
      }
    });
  }

  // Botão de reset
  if (resetButton) {
    resetButton.addEventListener('click', async () => {
      if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
        await configManager.resetToDefault();
        restoreSelections();
      }
    });
  }

  // Inicialização
  createColorOptions(bgPicker, bgColors, 'bg');
  createColorOptions(primaryPicker, primaryColors, 'primary');

  // Escuta mudanças de tema
  window.addEventListener('themeChanged', () => {
    restoreSelections();
  });

  // Carrega configurações iniciais
  setTimeout(() => {
    restoreSelections();
  }, 100);
});