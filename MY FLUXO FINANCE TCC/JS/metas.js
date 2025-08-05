// Configuração do Firebase usando configuração central
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    updateDoc,
    serverTimestamp,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

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
if (btnNovaMeta) {
  btnNovaMeta.addEventListener('click', () => {
    modal.style.display = 'block';
  });
}

// Fechar modal
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Renderizar metas do usuário logado
const renderizarMetas = async () => {
  const user = auth.currentUser;
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  listaMetas.innerHTML = '';
  
  try {
    const q = query(
      collection(db, "usuarios", user.uid, "metas"), 
      orderBy('prazo')
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      listaMetas.innerHTML = '<p class="sem-metas">Nenhuma meta cadastrada ainda.</p>';
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const meta = docSnap.data();
      const metaId = docSnap.id;
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
            <button class="btn-edit" onclick="editarMeta('${metaId}', '${meta.nome}', ${meta.valorObjetivo}, ${meta.valorAtual}, '${meta.prazo}')">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn-delete" onclick="excluirMeta('${metaId}')">
              <i class="fas fa-trash"></i> Excluir
            </button>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error("Erro ao carregar metas:", error);
    listaMetas.innerHTML = '<p class="erro">Erro ao carregar metas. Tente novamente.</p>';
  }
};

// Salvar nova meta
if (formMeta) {
  formMeta.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
      alert('Usuário não autenticado');
      return;
    }
    
    const nome = document.getElementById('nomeMeta').value;
    const valorObjetivo = parseFloat(document.getElementById('valorObjetivo').value);
    const valorAtual = parseFloat(document.getElementById('valorAtual').value) || 0;
    const prazo = document.getElementById('prazoMeta').value;
    
    if (!nome || !valorObjetivo || !prazo) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    const novaMeta = {
      nome,
      valorObjetivo,
      valorAtual,
      prazo,
      createdAt: serverTimestamp()
    };
    
    try {
      await addDoc(collection(db, "usuarios", user.uid, "metas"), novaMeta);
      modal.style.display = 'none';
      formMeta.reset();
      renderizarMetas();
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
      alert('Erro ao salvar meta: ' + error.message);
    }
  });
}

// Excluir meta
window.excluirMeta = async (metaId) => {
  const user = auth.currentUser;
  if (!user) return;
  
  if (confirm('Tem certeza que deseja excluir esta meta permanentemente?')) {
    try {
      await deleteDoc(doc(db, "usuarios", user.uid, "metas", metaId));
      renderizarMetas();
    } catch (error) {
      console.error("Erro ao excluir meta:", error);
      alert('Erro ao excluir meta');
    }
  }
};

// Editar meta (função placeholder)
window.editarMeta = (metaId, nome, valorObjetivo, valorAtual, prazo) => {
  // Implementar funcionalidade de edição futuramente
  console.log('Editar meta:', metaId, nome, valorObjetivo, valorAtual, prazo);
};

// Verificação de autenticação e inicialização
onAuthStateChanged(auth, (user) => {
  if (user) {
    renderizarMetas();
  } else {
    window.location.href = 'login.html';
  }
});

// Inicialização quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  // A renderização será feita pelo onAuthStateChanged
});