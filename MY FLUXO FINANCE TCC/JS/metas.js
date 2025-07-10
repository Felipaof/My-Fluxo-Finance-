// Configuração do Firebase (substitua com suas credenciais)
const firebaseConfig = {
  apiKey: "AIzaSyCU_jlDrdbWZ780KdBmBMregGqoVFhw2Ag",
            authDomain: "my-fluxo-finance.firebaseapp.com",
            projectId: "my-fluxo-finance",
            storageBucket: "my-fluxo-finance.appspot.com",
            messagingSenderId: "310977282920",
            appId: "1:310977282920:web:d003d14bf72f508da0ccdd",
            measurementId: "G-SBWWBYKLQB"
};

// Inicialização do Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Elementos DOM
const btnNovaMeta = document.getElementById('btnNovaMeta');
const modal = document.getElementById('modalMeta');
const closeBtn = document.querySelector('.close');
const formMeta = document.getElementById('formMeta');
const listaMetas = document.getElementById('listaMetas');

// Funções auxiliares
const formatarMoeda = (valor) => {
  return valor.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
};

const calcularDiasRestantes = (prazo) => {
  const hoje = new Date();
  const dataPrazo = new Date(prazo);
  const diff = dataPrazo - hoje;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Abrir modal
btnNovaMeta.addEventListener('click', () => {
  modal.style.display = 'block';
});

// Fechar modal
closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Renderizar metas
const renderizarMetas = () => {
  listaMetas.innerHTML = '';
  
  db.collection('metas').orderBy('prazo').get().then((querySnapshot) => {
    if (querySnapshot.empty) {
      listaMetas.innerHTML = '<p class="sem-metas">Nenhuma meta cadastrada ainda.</p>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const meta = doc.data();
      const progresso = Math.min((meta.valorAtual / meta.valorObjetivo) * 100, 100);
      const diasRestantes = calcularDiasRestantes(meta.prazo);
      const prazoFormatado = new Date(meta.prazo).toLocaleDateString('pt-BR');
      
      listaMetas.innerHTML += `
        <div class="meta-card">
          <div class="meta-header">
            <h3>${meta.nome}</h3>
            <span class="meta-prazo ${diasRestantes < 30 ? 'alerta' : ''}">
              <i class="far fa-calendar-alt"></i> ${prazoFormatado}
            </span>
          </div>
          
          <div class="meta-info">
            <div class="meta-info-item">
              <span class="meta-info-label">Valor Objetivo</span>
              <span class="meta-info-value">${formatarMoeda(meta.valorObjetivo)}</span>
            </div>
            <div class="meta-info-item">
              <span class="meta-info-label">Valor Atual</span>
              <span class="meta-info-value">${formatarMoeda(meta.valorAtual)}</span>
            </div>
            <div class="meta-info-item">
              <span class="meta-info-label">Dias Restantes</span>
              <span class="meta-info-value">${diasRestantes}</span>
            </div>
          </div>
          
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progresso}%"></div>
            </div>
            <div class="progress-info">
              <span>Progresso: ${progresso.toFixed(1)}%</span>
              <span>Faltam: ${formatarMoeda(meta.valorObjetivo - meta.valorAtual)}</span>
            </div>
          </div>
          
          <div class="meta-actions">
            <button class="btn-excluir" onclick="excluirMeta('${doc.id}')">
              <i class="fas fa-trash-alt"></i> Excluir
            </button>
          </div>
        </div>
      `;
    });
  });
};

// Adicionar nova meta
formMeta.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const novaMeta = {
    nome: document.getElementById('metaNome').value.trim(),
    valorObjetivo: parseFloat(document.getElementById('metaValor').value),
    valorAtual: parseFloat(document.getElementById('metaAtual').value),
    prazo: document.getElementById('metaPrazo').value,
    criadoEm: new Date()
  };

  // Validações
  if (novaMeta.valorAtual > novaMeta.valorObjetivo) {
    alert('O valor atual não pode ser maior que o objetivo!');
    return;
  }

  db.collection('metas').add(novaMeta)
    .then(() => {
      modal.style.display = 'none';
      formMeta.reset();
      renderizarMetas();
    })
    .catch((error) => {
      alert('Erro ao salvar meta: ' + error.message);
    });
});

// Excluir meta
window.excluirMeta = (id) => {
  if (confirm('Tem certeza que deseja excluir esta meta permanentemente?')) {
    db.collection('metas').doc(id).delete().then(renderizarMetas);
  }
};

// Inicialização
document.addEventListener('DOMContentLoaded', renderizarMetas);