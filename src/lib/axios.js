import axios from 'axios';

// ✅ Always use relative /api path.
// - In local dev: Vite proxy (vite.config.ts) forwards /api/* → https://api.samadhantra.com/api/*
// - In production: Vercel rewrite (vercel.json) forwards /api/* → https://api.samadhantra.com/api/*
// Using VITE_API_BASE_URL directly bypasses these proxies → CORS error on Vercel.
const BASE_URL = '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor - Add auth token to requests

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    const tokenType = localStorage.getItem('token_type') || 'bearer';
    
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }
    
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response.status}`);
      
      // Handle specific error codes
      if (error.response.status === 401) {
        // Unauthorized - clear tokens and redirect to login
        // BUT: Don't redirect if we're currently on the login page (avoid redirect loops)
        const currentPath = window.location.pathname;
        console.log("⚠️ 401 Unauthorized error detected. Current path:", currentPath);
        
        // Only redirect if not already on login or home page
        if (currentPath !== '/login' && currentPath !== '/') {
          console.log("⚠️ Redirecting to home due to 401");
          localStorage.removeItem('authToken');
          localStorage.removeItem('token_type');
          localStorage.removeItem('userData');
          window.location.href = '/';
        } else {
          console.log("⚠️ Already on login/home page, skipping redirect to avoid loop");
        }
      }
      
      // Extract error message from response
      const errorData = error.response.data;
      const errorMessage = 
        errorData.detail?.[0]?.msg || 
        errorData.detail || 
        errorData.message || 
        `Request failed with status ${error.response.status}`;
      
      error.message = errorMessage;
    } else if (error.request) {
      // Request made but no response
      console.error('❌ No response received:', error.request);
      error.message = 'No response from server. Please check your connection.';
    } else {
      // Error in request setup
      console.error('❌ Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;