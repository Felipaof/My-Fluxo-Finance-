// auth-check.js - Verificação de autenticação usando configuração central
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        try {
            const userDoc = await getDoc(doc(db, "usuarios", user.uid));
            if (!userDoc.exists()) {
                console.error("Perfil de usuário não encontrado");
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error("Erro ao verificar perfil:", error);
            window.location.href = 'login.html';
        }
    }
});