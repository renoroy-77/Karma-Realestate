import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 25000,
});

api.interceptors.request.use(
  (config) => {
    // Admin token
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }

    // Lead token (for public routes)
    const leadToken = localStorage.getItem('lead_token');
    if (leadToken) {
      config.headers['X-Lead-Token'] = leadToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally if needed
    if (error.response && error.response.status === 401) {
      // If it's an admin route, we might want to log out
      if (window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('admin_token');
        // Redirect logic can be handled in components or history
      }
    }
    return Promise.reject(error);
  }
);

export default api;
