// Sistema de configurações usando Firebase
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

// Configurações padrão
const DEFAULT_THEME = {
    bgColor: '#ffffff',
    primaryColor: '#0d6efd',
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px'
};

class ConfigManager {
    constructor() {
        this.currentUser = null;
        this.currentTheme = { ...DEFAULT_THEME };
        this.init();
    }

    init() {
        // Monitora mudanças de autenticação
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            if (user) {
                this.loadUserConfig();
            } else {
                this.loadLocalConfig();
            }
        });
    }

    // Carrega configurações do usuário do Firestore
    async loadUserConfig() {
        if (!this.currentUser) return;

        try {
            const configDoc = await getDoc(doc(db, "usuarios", this.currentUser.uid, "configuracoes", "tema"));
            
            if (configDoc.exists()) {
                this.currentTheme = { ...DEFAULT_THEME, ...configDoc.data() };
            } else {
                this.currentTheme = { ...DEFAULT_THEME };
            }
            
            this.applyTheme();
            
        } catch {
            this.loadLocalConfig();
        }
    }

    // Salva configurações do usuário no Firestore
    async saveUserConfig() {
        if (!this.currentUser) {
            this.saveLocalConfig();
            return;
        }

        try {
            await setDoc(
                doc(db, "usuarios", this.currentUser.uid, "configuracoes", "tema"), 
                this.currentTheme
            );
            
            // Também salva localmente como backup
            this.saveLocalConfig();
        } catch {
            this.saveLocalConfig();
        }
    }

    // Carrega configurações do localStorage
    loadLocalConfig() {
        const savedTheme = localStorage.getItem('siteTheme');
        if (savedTheme) {
            try {
                this.currentTheme = { ...DEFAULT_THEME, ...JSON.parse(savedTheme) };
            } catch {
                this.currentTheme = { ...DEFAULT_THEME };
            }
        }
        this.applyTheme();
    }

    // Salva configurações no localStorage
    saveLocalConfig() {
        localStorage.setItem('siteTheme', JSON.stringify(this.currentTheme));
    }

    // Aplica o tema na página
    applyTheme() {
        const root = document.documentElement;
        
        root.style.setProperty('--bg-color', this.currentTheme.bgColor);
        root.style.setProperty('--primary-color', this.currentTheme.primaryColor);
        root.style.setProperty('--font-family', this.currentTheme.fontFamily);
        root.style.setProperty('--font-size', this.currentTheme.fontSize);

        // Atualiza elementos específicos se existirem
        document.body.style.backgroundColor = this.currentTheme.bgColor;
        document.body.style.fontFamily = this.currentTheme.fontFamily;
        document.body.style.fontSize = this.currentTheme.fontSize;

        // Dispara evento personalizado para outras partes da aplicação
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: this.currentTheme 
        }));
    }

    // Atualiza uma configuração específica
    async updateConfig(key, value) {
        this.currentTheme[key] = value;
        await this.saveUserConfig();
        this.applyTheme();
    }

    // Atualiza múltiplas configurações
    async updateConfigs(configs) {
        this.currentTheme = { ...this.currentTheme, ...configs };
        await this.saveUserConfig();
        this.applyTheme();
    }

    // Reseta para configurações padrão
    async resetToDefault() {
        this.currentTheme = { ...DEFAULT_THEME };
        await this.saveUserConfig();
        this.applyTheme();
    }

    // Obtém configuração atual
    getCurrentTheme() {
        return { ...this.currentTheme };
    }
}

// Instância global
const configManager = new ConfigManager();

// Função para compatibilidade com código existente
window.applyThemeSettings = () => {
    configManager.applyTheme();
};

// Exporta para uso em outros módulos
export { configManager, ConfigManager };
