import axios from 'axios';

// Create a configured Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Axios Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // 1. Get the Auth Token (usually saved after login)
    const token = localStorage.getItem('token');
    
    // 2. Get the Tenant ID (subdomain string like 'dps') saved after login
    // Or you can dynamically fetch it from window.location.hostname in a real app
    const tenantId = localStorage.getItem('tenantId');

    // Attach Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ⭐ STEP 7: Attach the x-tenant-id header with EVERY request!
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
    } else {
      console.warn('Warning: x-tenant-id is missing. API calls might fail multi-tenant check.');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Example usage to get students:
// apiClient.get('/students') -> Automatically sends x-tenant-id!

export default apiClient;
