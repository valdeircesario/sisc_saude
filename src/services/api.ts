import axios from 'axios';
import { toast } from 'react-toastify';

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let last429ToastAt = 0;
const TOAST_429_COOLDOWN_MS = 10000;

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

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

// Interceptor para lidar com erros de autenticação e rate limit
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthRoute =
      error.config?.url?.includes('login') ||
      error.config?.url?.includes('cadastro') ||
      error.config?.url?.includes('auth');

    if (status === 429) {
      const now = Date.now();
      if (now - last429ToastAt > TOAST_429_COOLDOWN_MS) {
        last429ToastAt = now;
        const message =
          error.response?.data?.message ||
          'Muitas requisições. Aguarde alguns instantes e tente novamente.';
        toast.error(message);
      }
    }

    // Token ausente, expirado ou inválido — redireciona apenas fora de rotas de login
    if ((status === 401 || status === 403) && !isAuthRoute) {
      clearSession();
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);
