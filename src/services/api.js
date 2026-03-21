import axios from 'axios';

// 1. Create Axios Instance
const api = axios.create({
  // 2. Configure Base URL from environment variable
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000, // 8. Optional timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Add Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Automatically attach token and tenantId from localStorage
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Authorization: Bearer <token>
    }

    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId; // x-tenant-id: <tenantId>
    }

    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error); // 8. Error logging
    return Promise.reject(error);
  }
);

// 4. Add Response Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
      // 4. Handle errors globally (e.g. 401 Unauthorized)
      if (error.response && error.response.status === 401) {
        console.warn('Session expired or unauthorized. Logging out...');
        
        // Remove credentials
        localStorage.removeItem('token');
        localStorage.removeItem('tenantId');
        localStorage.removeItem('user');

        // Redirect to login page
        window.location.href = '/login';
      }
      
      console.error('API Response Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
);

export default api;
