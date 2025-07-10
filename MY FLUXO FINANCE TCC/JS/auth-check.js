// auth-check.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

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

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (!userDoc.exists()) {
            console.error("Perfil de usuário não encontrado");
            window.location.href = 'login.html';
        }
    }
});