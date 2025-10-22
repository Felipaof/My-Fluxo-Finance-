class ApiService {
  constructor() {
    this.baseURL = '/api';
  }

  // Método genérico para fazer requests
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
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        // Criar erro customizado que preserva os dados adicionais
        const error = new Error(data.error || data.message || 'Erro na requisição');
        error.data = data; // Preservar todos os dados da resposta
        error.statusCode = response.status;
        console.error('Erro na requisição:', error);
        throw error;
      }

      return data;
    } catch (error) {
      // Se o erro já foi criado acima, apenas re-lançar
      // Se for erro de rede/parse, adicionar contexto
      if (!error.data) {
        console.error('Erro na requisição:', error);
      }
      throw error;
    }
  }

  // Métodos de autenticação
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials
    });
  }

  // Métodos de transações
  async getTransacoes(usuarioId) {
    return this.request(`/transacoes/${usuarioId}`);
  }

  async createTransacao(transacao) {
    return this.request('/transacoes', {
      method: 'POST',
      body: transacao
    });
  }

  async updateTransacao(id, transacao) {
    return this.request(`/transacoes/${id}`, {
      method: 'PUT',
      body: transacao
    });
  }

  async deleteTransacao(id) {
    return this.request(`/transacoes/${id}`, {
      method: 'DELETE'
    });
  }

  // Métodos de metas
  async getMetas(usuarioId) {
    return this.request(`/metas/${usuarioId}`);
  }

  async createMeta(meta) {
    return this.request('/metas', {
      method: 'POST',
      body: meta
    });
  }

  async updateMeta(id, meta) {
    return this.request(`/metas/${id}`, {
      method: 'PUT',
      body: meta
    });
  }

  async deleteMeta(id) {
    return this.request(`/metas/${id}`, {
      method: 'DELETE'
    });
  }

  // Métodos de categorias
  async getCategorias() {
    return this.request('/categorias');
  }

  async createCategoria(categoria) {
    return this.request('/categorias', {
      method: 'POST',
      body: categoria
    });
  }

  async deleteCategoria(id) {
    return this.request(`/categorias/${id}`, {
      method: 'DELETE'
    });
  }

  // Métodos de relatórios
  async getRelatorioFinanceiro(params = '') {
    return this.request(`/relatorios/financeiro${params ? '?' + params : ''}`);
  }

  async getRelatorioMetas() {
    return this.request('/relatorios/metas');
  }

  async getRelatorioCategorias(params = '') {
    return this.request(`/relatorios/categorias${params ? '?' + params : ''}`);
  }

  async exportarDados(params = '') {
    return this.request(`/relatorios/exportar${params ? '?' + params : ''}`);
  }

  // Método genérico GET para compatibilidade
  async get(endpoint) {
    return this.request(endpoint);
  }
}

// Instância global da API
const api = new ApiService();