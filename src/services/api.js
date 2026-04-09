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
    async (error) => {
      const originalRequest = error.config;

      // When 401 received, try to refresh before redirecting to login
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          try {
            const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
            localStorage.setItem('token', data.accessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
            return api(originalRequest); // retry original request
          } catch (refreshError) {
            console.error('Refresh token expired or invalid:', refreshError);
            // Refresh failed — clear and redirect
          }
        }
        
        console.warn('Session expired or unauthorized. Logging out...');
        localStorage.clear();
        window.location.href = '/login';
      }
      
      console.error('API Response Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
);

export default api;
