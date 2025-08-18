import axios from 'axios';
import { setupTokenInterceptors } from '../http/tokenInterceptor';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Configurar los interceptores mejorados
setupTokenInterceptors(api);

export { api }; 