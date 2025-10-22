class AuthService {
    constructor() {
        this.baseURL = '/api';
        console.log('AuthService initialized');
    }

    // Fazer requisição para a API
    async request(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Adicionar token se existir
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            console.log(`Fazendo requisição para: ${this.baseURL}${endpoint}`);
            console.log('Dados enviados:', config.body);

            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            const data = await response.json();

            console.log('Resposta recebida:', data);

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    // Registrar usuário
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData
        });
    }

    // Login do usuário
    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: credentials
        });
    }
}

// Utilitários para UI
class UIHelper {
    static showMessage(message, type = 'success') {
        const container = document.getElementById('message-container');
        if (!container) return;

        container.textContent = message;
        container.className = `message-container ${type}`;
        container.classList.remove('hidden');

        // Auto-hide após 5 segundos
        setTimeout(() => {
            container.classList.add('hidden');
        }, 5000);
    }

    static showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorDiv = document.getElementById(`${fieldName}-error`);
        
        if (field) field.classList.add('error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
        }
    }

    static clearFieldErrors() {
        document.querySelectorAll('.form-group input').forEach(input => {
            input.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
        });
    }

    static setLoadingState(buttonId, loading = true) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');  
            button.disabled = false;
        }
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}

// Funções globais para salvar dados de autenticação
function saveAuthData(user, token) {
    console.log('💾 Salvando dados de autenticação:', { user: user.nome, hasToken: !!token });
    
    // Salvar no localStorage para uso no frontend
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    
    // Salvar token no cookie para o backend
    document.cookie = `token=${token}; path=/; max-age=${24 * 60 * 60}`; // 24 horas
    
    console.log('✅ Dados salvos com sucesso!');
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando auth...');
    
    const authService = new AuthService();
    
    // === REGISTER FORM ===
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        console.log('Formulário de registro encontrado');

        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Formulário de registro submetido');

            // Limpar erros anteriores
            UIHelper.clearFieldErrors();

            // Obter dados do formulário
            const formData = new FormData(registerForm);
            const userData = {
                nome: formData.get('nome').trim(),
                email: formData.get('email').trim(),
                senha: formData.get('senha').trim()
            };
            const confirmarSenha = formData.get('confirmar-senha').trim();

            console.log('Dados do registro:', userData);

            // Validações
            let hasError = false;

            if (!userData.nome) {
                UIHelper.showFieldError('nome', 'Nome é obrigatório');
                hasError = true;
            }

            if (!userData.email) {
                UIHelper.showFieldError('email', 'E-mail é obrigatório');
                hasError = true;
            } else if (!UIHelper.validateEmail(userData.email)) {
                UIHelper.showFieldError('email', 'E-mail inválido');
                hasError = true;
            }

            if (!userData.senha) {
                UIHelper.showFieldError('senha', 'Senha é obrigatória');
                hasError = true;
            } else if (userData.senha.length < 6) {
                UIHelper.showFieldError('senha', 'Senha deve ter pelo menos 6 caracteres');
                hasError = true;
            }

            if (!confirmarSenha) {
                UIHelper.showFieldError('confirmar-senha', 'Confirmação de senha é obrigatória');
                hasError = true;
            } else if (userData.senha !== confirmarSenha) {
                UIHelper.showFieldError('confirmar-senha', 'Senhas não coincidem');
                hasError = true;
            }

            if (hasError) return;

            // Fazer registro
            UIHelper.setLoadingState('register-btn', true);

            try {
                const response = await authService.register(userData);
                console.log('Registro bem-sucedido:', response);

                // Salvar dados de autenticação automaticamente após registro
                saveAuthData(response.usuario, response.token);

                UIHelper.showMessage('Conta criada com sucesso! Redirecionando...', 'success');
                
                // Redirecionar para dashboard após 2 segundos
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);

            } catch (error) {
                console.error('Erro no registro:', error);
                UIHelper.showMessage(error.message || 'Erro ao criar conta', 'error');
            } finally {
                UIHelper.setLoadingState('register-btn', false);
            }
        });
    }

    // === LOGIN FORM ===
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('Formulário de login encontrado');
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Formulário de login submetido');

            // Limpar erros anteriores
            UIHelper.clearFieldErrors();

            // Obter dados do formulário
            const formData = new FormData(loginForm);
            const credentials = {
                email: formData.get('email').trim(),
                senha: formData.get('senha').trim()
            };

            console.log('Dados do login:', credentials);

            // Validações básicas
            let hasError = false;

            if (!credentials.email) {
                UIHelper.showFieldError('email', 'E-mail é obrigatório');
                hasError = true;
            } else if (!UIHelper.validateEmail(credentials.email)) {
                UIHelper.showFieldError('email', 'E-mail inválido');
                hasError = true;
            }

            if (!credentials.senha) {
                UIHelper.showFieldError('senha', 'Senha é obrigatória');
                hasError = true;
            }

            if (hasError) return;

            // Fazer login
            UIHelper.setLoadingState('login-btn', true);

            try {
                const response = await authService.login(credentials);
                console.log('Login bem-sucedido:', response);

                // Salvar dados de autenticação
                saveAuthData(response.usuario, response.token);

                UIHelper.showMessage('Login realizado com sucesso!', 'success');
                
                // Verificar se há página para redirecionar
                const redirectTo = localStorage.getItem('redirectAfterLogin') || '/dashboard';
                console.log('Redirecionando para:', redirectTo);
                
                localStorage.removeItem('redirectAfterLogin');
                
                // Redirecionar após 1 segundo
                setTimeout(() => {
                    console.log('Executando redirecionamento...');
                    window.location.href = redirectTo;
                }, 1000);

            } catch (error) {
                console.error('Erro no login:', error);
                UIHelper.showMessage(error.message || 'Erro ao fazer login', 'error');
            } finally {
                UIHelper.setLoadingState('login-btn', false);
            }
        });
    }
});

console.log('📝 auth.js carregado!');
