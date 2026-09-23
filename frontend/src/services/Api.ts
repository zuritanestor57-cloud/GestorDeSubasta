

import axios from 'axios';

// Instancia principal de conexión con el backend
export const api = axios.create({
  baseURL: 'https://localhost:7197', // puerto donde corre tu backend
});