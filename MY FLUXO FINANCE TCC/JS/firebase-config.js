// // firebase-config.js - Configuração central do Firebase
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
// import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
// import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

// const firebaseConfig = {
//     apiKey: "AIzaSyCU_jlDrdbWZ780KdBmBMregGqoVFhw2Ag",
//     authDomain: "my-fluxo-finance.firebaseapp.com",
//     projectId: "my-fluxo-finance",
//     storageBucket: "my-fluxo-finance.appspot.com",
//     messagingSenderId: "310977282920",
//     appId: "1:310977282920:web:d003d14bf72f508da0ccdd",
//     measurementId: "G-SBWWBYKLQB"
// };

// // Inicialização do Firebase
// const app = initializeApp(firebaseConfig);

// // Exporta as instâncias para uso em outros arquivos
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export { app };

// firebase-config.js - Configuração central do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-analytics.js";

// Configuração atualizada do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCHl8y8TvzFG2agJX6ulCK9Nge8IXLRTAo",
  authDomain: "myfluxofinance-tcc.firebaseapp.com",
  projectId: "myfluxofinance-tcc",
  storageBucket: "myfluxofinance-tcc.firebasestorage.app",
  messagingSenderId: "637324378259",
  appId: "1:637324378259:web:97dca3eb16092d7ce80d66",
  measurementId: "G-VJT2F4R302"
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Analytics
const analytics = getAnalytics(app);

// Exporta as instâncias para uso em outros arquivos
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app, analytics };