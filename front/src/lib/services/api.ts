import axios from 'axios';
import { setupTokenInterceptors } from '../http/tokenInterceptor';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // FORZADO A LOCALHOST
  timeout: 10000,
});

// Configurar los interceptores mejorados
setupTokenInterceptors(api);

export { api }; 