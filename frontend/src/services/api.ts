

import axios, { type InternalAxiosRequestConfig, AxiosError } from 'axios';

// 1. Instancia principal de conexión con el backend
export const api = axios.create({
  baseURL: 'http://localhost:7197', // Puerto del backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Petición: Inyecta el JWT en el Header Authorization
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtenemos el token guardado en el almacenamiento local
    const token = localStorage.getItem('token');

    // Si el token existe, lo agregamos a los encabezados
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor de Respuesta: Maneja tokens vencidos o no autorizados (401)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // El token es inválido o ha expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirigir a la pantalla de login si no estamos ya allí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);