// Importa configuração central do Firebase
import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

// Função para mostrar erro
function mostrarErro(mensagem) {
    const erroElement = document.getElementById('erro-cadastro');
    if (erroElement) {
        erroElement.textContent = mensagem;
        erroElement.style.display = 'block';
        window.scrollTo(0, 0);
    } else {
        alert(mensagem);
    }
}

// Função para limpar erro
function limparErro() {
    const erroElement = document.getElementById('erro-cadastro');
    if (erroElement) {
        erroElement.style.display = 'none';
    }
}

// Função de cadastro usando Firebase Auth (SIMPLIFICADA)
async function cadastrarUsuario(e) {
    e.preventDefault();
    
    // Limpa erros anteriores
    limparErro();
    
    // Coleta dados do formulário
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    const telefone = document.getElementById('telefone').value.trim();
    
    // Validações básicas
    if (!nome || !cpf || !email || !senha || !confirmarSenha || !telefone) {
        mostrarErro("Todos os campos são obrigatórios!");
        return;
    }
    
    if (senha !== confirmarSenha) {
        mostrarErro("As senhas não coincidem!");
        return;
    }
    
    if (senha.length < 6) {
        mostrarErro("A senha deve ter pelo menos 6 caracteres!");
        return;
    }
    
    if (!document.getElementById('terms').checked) {
        mostrarErro("Você deve aceitar os termos de serviço!");
        return;
    }
    
    // Validação básica de CPF (11 dígitos)
    const cpfNumbers = cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
        mostrarErro("CPF deve ter 11 dígitos!");
        return;
    }
    
    try {
        // Cria usuário no Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        
        // Prepara dados do usuário principal
        const userData = {
            nome: nome.trim(),
            cpf: cpfNumbers,
            telefone: telefone.trim(),
            email: email.toLowerCase().trim(),
            dataCadastro: new Date(),
            ativo: true,
            versao: "1.0"
        };
        
        // Prepara configurações padrão
        const configData = {
            bgColor: '#ffffff',
            primaryColor: '#0d6efd',
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            criadoEm: new Date()
        };
        
        // 1. Salva documento principal do usuário
        await setDoc(doc(db, "usuarios", user.uid), userData);
        
        // 2. Cria subcoleção de configurações
        await setDoc(doc(db, "usuarios", user.uid, "configuracoes", "tema"), configData);
        
        
        // Redireciona para o dashboard
        window.location.href = "dashboard.html";
        
    } catch (error) {
        let mensagemErro;
        
        switch(error.code) {
            case "auth/email-already-in-use":
                mensagemErro = "Este e-mail já está em uso.";
                break;
            case "auth/invalid-email":
                mensagemErro = "E-mail inválido.";
                break;
            case "auth/weak-password":
                mensagemErro = "Senha fraca (mínimo 6 caracteres).";
                break;
            case "auth/operation-not-allowed":
                mensagemErro = "Cadastro não permitido. Contate o administrador.";
                break;
            default:
                mensagemErro = "Erro ao cadastrar: " + error.message;
        }
        
        mostrarErro(mensagemErro);
    }
}

// // Verifica se usuário já está logado
// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         // Se já estiver logado, redireciona para dashboard
//         window.location.href = "dashboard.html";
//     }
// });

// Event listener quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    const cadastroForm = document.getElementById('cadastroForm');
    
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', cadastrarUsuario);
    }
    
    // Validação em tempo real da confirmação de senha
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmar-senha');
    
    if (confirmarSenhaInput) {
        confirmarSenhaInput.addEventListener('input', function() {
            const senha = senhaInput.value;
            const confirmarSenha = this.value;
            
            if (confirmarSenha && senha !== confirmarSenha) {
                this.setCustomValidity('As senhas não coincidem');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    // Validação de força da senha em tempo real
    if (senhaInput) {
        senhaInput.addEventListener('input', function() {
            const senha = this.value;
            
            if (senha.length > 0 && senha.length < 6) {
                this.setCustomValidity('A senha deve ter pelo menos 6 caracteres');
            } else {
                this.setCustomValidity('');
            }
        });
    }
});
