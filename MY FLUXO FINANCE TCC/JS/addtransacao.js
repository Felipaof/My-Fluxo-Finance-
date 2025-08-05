// Configuração do Firebase usando configuração central
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

// Função para salvar transação na subcoleção do usuário
async function saveTransaction(transaction) {
    const user = auth.currentUser;
    
    if (!user) {
        showMessage('Usuário não autenticado. Faça login novamente.', 'error');
        return;
    }

    try {
        // Salva na subcoleção 'transacoes' do usuário no Firestore
        await addDoc(collection(db, "usuarios", user.uid, "transacoes"), {
            ...transaction,
            createdAt: serverTimestamp()
        });
        showMessage('Transação salva com sucesso!', 'success');
        document.getElementById('transactionForm').reset();
        document.getElementById('transactionDate').valueAsDate = new Date();
    } catch (error) {
        console.error("Erro ao salvar:", error);
        showMessage('Erro ao salvar transação: ' + error.message, 'error');
    }
}

// Função para exibir mensagens
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = 'message ' + type;
        messageDiv.style.display = 'block';
        
        // Esconde a mensagem após 5 segundos
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    } else {
        // Fallback para alert se não houver div de mensagem
        alert(text);
    }
}

// Verificação de autenticação
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

// Função principal quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Configura a data atual como padrão
    const transactionDate = document.getElementById('transactionDate');
    if (transactionDate) {
        transactionDate.valueAsDate = new Date();
    }
    
    // Configura o dropdown do usuário
    const userMenu = document.querySelector('.user-menu');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (userMenu && dropdownMenu) {
        userMenu.addEventListener('click', function() {
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });
        
        // Fecha o dropdown quando clicar fora
        document.addEventListener('click', function(event) {
            if (!userMenu.contains(event.target)) {
                dropdownMenu.style.display = 'none';
            }
        });
    }
    
    // Configura o envio do formulário
    const transactionForm = document.getElementById('transactionForm');
    
    if (transactionForm) {
        transactionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Coleta os dados do formulário
            const transactionType = document.querySelector('input[name="transactionType"]:checked')?.value;
            const transactionName = document.getElementById('transactionName')?.value;
            const transactionValue = parseFloat(document.getElementById('transactionValue')?.value);
            const transactionDate = document.getElementById('transactionDate')?.value;
            const category = document.getElementById('category')?.value;
            
            // Validação
            if (!transactionType || !transactionName || !transactionValue || !transactionDate || !category) {
                showMessage('Por favor, preencha todos os campos.', 'error');
                return;
            }
            
            if (isNaN(transactionValue) || transactionValue <= 0) {
                showMessage('Por favor, insira um valor válido maior que zero.', 'error');
                return;
            }
            
            // Valor negativo para despesas
            const finalValue = transactionType === 'despesa' ? -Math.abs(transactionValue) : Math.abs(transactionValue);
            
            const transaction = {
                tipo: transactionType,
                valor: finalValue,
                nome: transactionName.trim(),
                data: transactionDate,
                categoria: category
            };
            
            // Salva no Firebase
            saveTransaction(transaction);
        });
    }
    
    // Função para formatar valor monetário no campo de input
    const transactionValueInput = document.getElementById('transactionValue');
    if (transactionValueInput) {
        transactionValueInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d.,]/g, '');
            // Permite apenas números, vírgula e ponto
            value = value.replace(',', '.');
            e.target.value = value;
        });
    }
    
    // Adiciona máscara de moeda ao perder o foco
    if (transactionValueInput) {
        transactionValueInput.addEventListener('blur', function(e) {
            const value = parseFloat(e.target.value);
            if (!isNaN(value)) {
                e.target.value = value.toFixed(2);
            }
        });
    }
    
    // Configura categorias baseadas no tipo de transação
    const typeRadios = document.querySelectorAll('input[name="transactionType"]');
    const categorySelect = document.getElementById('category');
    
    if (typeRadios.length > 0 && categorySelect) {
        typeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                updateCategoriesBasedOnType(this.value, categorySelect);
            });
        });
        
        // Define categorias iniciais
        const checkedType = document.querySelector('input[name="transactionType"]:checked');
        if (checkedType) {
            updateCategoriesBasedOnType(checkedType.value, categorySelect);
        }
    }
});

// Função para atualizar categorias baseadas no tipo de transação
function updateCategoriesBasedOnType(type, categorySelect) {
    const receitaCategories = [
        'Salário',
        'Freelance',
        'Vendas',
        'Investimentos',
        'Bonificação',
        'Presente',
        'Outros'
    ];
    
    const despesaCategories = [
        'Alimentação',
        'Transporte',
        'Moradia',
        'Saúde',
        'Educação',
        'Lazer',
        'Compras',
        'Contas',
        'Outros'
    ];
    
    const categories = type === 'receita' ? receitaCategories : despesaCategories;
    
    // Limpa as opções existentes
    categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
    
    // Adiciona as novas opções
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}
