// Importa configuração central do Firebase
import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

// Função de login usando Firebase Auth
async function fazerLogin(email, senha) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        
        // Verifica se usuário tem perfil no Firestore
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        
        if (!userDoc.exists()) {
            throw new Error("Perfil de usuário não encontrado");
        }
        
        // Limpa mensagem de erro se existir
        const erroLogin = document.getElementById('erro-login');
        if (erroLogin) {
            erroLogin.style.display = 'none';
        }
        
        window.location.href = "dashboard.html";
        
    } catch (error) {
        console.error("Erro de login:", error);
        let mensagemErro;
        switch(error.code) {
            case "auth/invalid-email": 
                mensagemErro = "E-mail inválido."; 
                break;
            case "auth/user-disabled": 
                mensagemErro = "Conta desativada."; 
                break;
            case "auth/user-not-found": 
                mensagemErro = "Usuário não encontrado."; 
                break;
            case "auth/wrong-password": 
                mensagemErro = "Senha incorreta."; 
                break;
            case "auth/invalid-credential":
                mensagemErro = "E-mail ou senha incorretos.";
                break;
            default: 
                mensagemErro = "Erro ao fazer login. Tente novamente.";
        }
        
        const erroLogin = document.getElementById('erro-login');
        if (erroLogin) {
            erroLogin.textContent = mensagemErro;
            erroLogin.style.display = 'block';
        } else {
            alert(mensagemErro);
        }
    }
}

// Event listener para o formulário de login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById("email").value;
            const senha = document.getElementById("password").value;
            
            if (!email || !senha) {
                const erroLogin = document.getElementById('erro-login');
                if (erroLogin) {
                    erroLogin.textContent = "Por favor, preencha todos os campos.";
                    erroLogin.style.display = 'block';
                } else {
                    alert("Por favor, preencha todos os campos.");
                }
                return;
            }
            
            fazerLogin(email, senha);
        });
    }
});

// Verifica se usuário já está logado
onAuthStateChanged(auth, (user) => {
    if (user) {
        getDoc(doc(db, "usuarios", user.uid)).then((doc) => {
            if (doc.exists()) {
                window.location.href = "dashboard.html";
            }
        });
    }
});