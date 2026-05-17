import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      error.config?.url?.includes('login') ||
      error.config?.url?.includes('cadastro') ||
      error.config?.url?.includes('auth');

    // Só redireciona se NÃO for uma rota de login/cadastro
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);