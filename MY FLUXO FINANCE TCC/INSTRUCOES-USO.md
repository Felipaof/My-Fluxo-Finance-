# Como Usar a Nova Estrutura Firebase

## 🔧 Configuração Inicial

### 1. Firebase Rules (OBRIGATÓRIO - ainda nao realizado - Realizar durante o desenvolvimento)

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Vá em **Firestore Database > Rules**
3. Cole o conteúdo do arquivo `firebase-rules.txt`
4. Clique em **Publicar**

### 2. Verificar Imports nos HTMLs

Certifique-se que todos os arquivos HTML usem `` nos scripts:

```html
<script  src="../JS/login.js"></script>
<script  src="../JS/addtransacao.js"></script>
<script  src="../JS/metas.js"></script>
<script  src="../JS/relatorios.js"></script>
<script  src="../JS/config-manager.js"></script>
<script  src="../JS/Config.js"></script>
```

## 📊 Como Trabalhar com Dados

### Transações

```javascript
// Salvar transação (já implementado em addtransacao.js)
await addDoc(collection(db, "usuarios", user.uid, "transacoes"), {
    tipo: 'receita', // ou 'despesa'
    valor: 100.50,
    nome: 'Salário',
    data: '2025-01-15',
    categoria: 'Trabalho',
    createdAt: serverTimestamp()
});

// Buscar transações do usuário
const q = query(
    collection(db, "usuarios", user.uid, "transacoes"),
    where("data", ">=", "2025-01-01"),
    orderBy("data", "desc")
);
const querySnapshot = await getDocs(q);
```

### Metas

```javascript
// Salvar meta (já implementado em metas.js)
await addDoc(collection(db, "usuarios", user.uid, "metas"), {
    nome: 'Carro novo',
    valorObjetivo: 50000,
    valorAtual: 10000,
    prazo: '2025-12-31',
    createdAt: serverTimestamp()
});

// Buscar metas do usuário
const q = query(
    collection(db, "usuarios", user.uid, "metas"),
    orderBy('prazo')
);
const querySnapshot = await getDocs(q);
```

### Configurações de Tema

```javascript
// Usar o ConfigManager (já implementado)
import { configManager } from './config-manager.js';

// Atualizar uma configuração
await configManager.updateConfig('primaryColor', '#ff5722');

// Atualizar múltiplas configurações
await configManager.updateConfigs({
    bgColor: '#f5f5f5',
    primaryColor: '#2196f3',
    fontFamily: 'Roboto, sans-serif'
});

// Obter configuração atual
const theme = configManager.getCurrentTheme();
```

## 🔐 Autenticação

### Login

```javascript
// Já implementado em login.js
import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from "firebase/auth";

const userCredential = await signInWithEmailAndPassword(auth, email, senha);
const user = userCredential.user;
```

### Verificar se usuário está logado

```javascript
// Já implementado em auth-check.js
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário logado
        console.log("Usuário:", user.uid);
    } else {
        // Usuário não logado
        window.location.href = 'login.html';
    }
});
```

## 🛠️ Estrutura de Arquivos

```
JS/
├── firebase-config.js      # ✅ Configuração central
├── login.js               # ✅ Sistema de login
├── auth-check.js          # ✅ Verificação de auth
├── addtransacao.js        # ✅ Adicionar transações
├── metas.js              # ✅ Gerenciar metas
├── relatorios.js         # ✅ Relatórios
├── config-manager.js     # ✅ Gerenciar configurações
└── Config.js             # ✅ Interface de configurações
```

## 🚨 Pontos Importantes

1. **Sempre use `auth.currentUser`** para obter o usuário atual
2. **Todas as operações são assíncronas** - use `await`
3. **Dados são separados por usuário** automaticamente
4. **Configurações sincronizam** entre dispositivos
5. **Rules do Firebase protegem** os dados

## 🔄 Migração de Dados Antigos

Se você tem dados antigos no Realtime Database:

```javascript
// Script de migração (executar uma vez)
async function migrarDados() {
    // 1. Exportar dados do Realtime Database
    // 2. Transformar formato
    // 3. Importar para nova estrutura
  
    const user = auth.currentUser;
    if (!user) return;
  
    // Exemplo: migrar transações
    const transacoesAntigas = []; // seus dados antigos
  
    for (const transacao of transacoesAntigas) {
        await addDoc(collection(db, "usuarios", user.uid, "transacoes"), {
            ...transacao,
            createdAt: serverTimestamp()
        });
    }
}
```

## 📱 Testando a Aplicação

1. **Criar conta** ou **fazer login**
2. **Adicionar transações** em `/addtransacao.html`
3. **Criar metas** em `/metas.html`
4. **Ver relatórios** em `/relatorios.html`
5. **Alterar tema** em `/config.html`

Todos os dados serão salvos automaticamente na nova estrutura!
