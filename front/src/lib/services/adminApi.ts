import { getApiBaseUrl } from './apiBase';

export const getAdminApiBaseUrl = () => {
  return getApiBaseUrl().replace('/api', '/api/adminWRK');
}; 