// Configuração do Firebase (usando a mesma versão em todos os arquivos)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCU_jlDrdbWZ780KdBmBMregGqoVFhw2Ag",
    authDomain: "my-fluxo-finance.firebaseapp.com",
    projectId: "my-fluxo-finance",
    storageBucket: "my-fluxo-finance.appspot.com",
    messagingSenderId: "310977282920",
    appId: "1:310977282920:web:d003d14bf72f508da0ccdd",
    measurementId: "G-SBWWBYKLQB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Função para salvar transação
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
            createdAt: new Date().toISOString()
        });
        showMessage('Transação salva com sucesso!', 'success');
        document.getElementById('transactionForm').reset();
    } catch (error) {
        console.error("Erro ao salvar:", error);
        showMessage('Erro ao salvar transação: ' + error.message, 'error');
    }
}

    // Adiciona informações adicionais à transação
    transaction.userId = user.uid;
    transaction.dataRegistro = new Date().toISOString();

    const userTransactionsRef = database.ref(`users/${user.uid}/transacoes`);
    
    userTransactionsRef.push(transaction)
        .then(() => {
            showMessage('Transação salva com sucesso!', 'success');
            document.getElementById('transactionForm').reset();
            document.getElementById('transactionDate').valueAsDate = new Date();
        })
        .catch((error) => {
            console.error('Erro ao salvar transação:', error);
            showMessage('Erro ao salvar transação. Tente novamente.', 'error');
        });

// Adicione um observador de autenticação no DOMContentLoaded
auth.onAuthStateChanged((user) => {
    if (!user) {
        // Redireciona para login se não estiver autenticado
        window.location.href = 'login.html';
    }
});

// Função principal quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Configura a data atual como padrão
    document.getElementById('transactionDate').valueAsDate = new Date();
    
    // Configura o dropdown do usuário
    const userMenu = document.querySelector('.user-menu');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    userMenu.addEventListener('click', function() {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });
    
    // Fecha o dropdown quando clicar fora
    document.addEventListener('click', function(event) {
        if (!userMenu.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });
    
    // Configura o envio do formulário
    const transactionForm = document.getElementById('transactionForm');
    const messageDiv = document.getElementById('message');
    
    transactionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtém os valores do formulário
        const transactionType = document.getElementById('transactionType').value;
        const transactionValue = parseFloat(document.getElementById('transactionValue').value);
        const transactionName = document.getElementById('transactionName').value.trim();
        const transactionDate = document.getElementById('transactionDate').value;
        const category = document.querySelector('input[name="category"]:checked').value;
        
        // Validações adicionais
        if (transactionType === '') {
            showMessage('Por favor, selecione o tipo de transação', 'error');
            return;
        }
        
        if (isNaN(transactionValue)) {
            showMessage('Por favor, insira um valor válido', 'error');
            return;
        }
        
        // Ajusta o valor para negativo se for despesa
        const finalValue = transactionType === 'despesa' ? -Math.abs(transactionValue) : Math.abs(transactionValue);
        
        // Cria o objeto da transação
        const transaction = {
            tipo: transactionType,
            valor: finalValue,
            nome: transactionName,
            data: transactionDate,
            categoria: category,
            dataRegistro: new Date().toISOString()
        };
        
        // Salva no Firebase
        saveTransaction(transaction);
    });
});

function saveTransaction(transaction) {
    const messageDiv = document.getElementById('message');
    
    // Referência para as transações no Firebase
    const transactionsRef = database.ref('transacoes');
    
    // Adiciona a nova transação
    transactionsRef.push(transaction)
        .then(() => {
            showMessage('Transação salva com sucesso!', 'success');
            document.getElementById('transactionForm').reset();
            document.getElementById('transactionDate').valueAsDate = new Date();
        })
        .catch((error) => {
            console.error('Erro ao salvar transação:', error);
            showMessage('Erro ao salvar transação. Tente novamente.', 'error');
        });
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    
    // Esconde a mensagem após 5 segundos
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}