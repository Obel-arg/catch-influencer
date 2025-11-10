import axios from 'axios';
import { setupTokenInterceptors } from '../http/tokenInterceptor';
import { getApiBaseUrl } from './apiBase';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
});

// Configurar los interceptores mejorados
setupTokenInterceptors(api);

export { api }; 