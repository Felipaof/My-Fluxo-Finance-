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
        throw new Error(data.error || data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('Erro na requisição:', error);
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
}

// Instância global da API
const api = new ApiService();