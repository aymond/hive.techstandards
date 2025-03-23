// API service to fetch data from the backend
import axios from 'axios';

// Simple in-memory cache
const cache = {
  data: new Map(),
  ttl: new Map(),
  
  // Get cached data if it exists and hasn't expired
  get(key) {
    if (!this.data.has(key)) return null;
    
    const expirationTime = this.ttl.get(key);
    if (expirationTime && Date.now() > expirationTime) {
      // Expired data, clear it
      this.data.delete(key);
      this.ttl.delete(key);
      return null;
    }
    
    return this.data.get(key);
  },
  
  // Set data in cache with expiration
  set(key, data, ttlMs = 300000) { // Default TTL: 5 minutes
    this.data.set(key, data);
    this.ttl.set(key, Date.now() + ttlMs);
  },
  
  // Clear a specific cache entry
  clear(key) {
    this.data.delete(key);
    this.ttl.delete(key);
  },
  
  // Clear all cache entries
  clearAll() {
    this.data.clear();
    this.ttl.clear();
  }
};

// Get API URL from window.env in production or from env vars in development
const getApiBaseUrl = () => {
  // Try to get from window.env first (production)
  if (window.env && window.env.REACT_APP_API_URL) {
    console.log('Using API URL from window.env:', window.env.REACT_APP_API_URL);
    return window.env.REACT_APP_API_URL;
  }
  
  // Try to get from React env vars (development)
  if (process.env.REACT_APP_API_URL) {
    console.log('Using API URL from process.env:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Default fallback
  console.log('Using default API URL: /api');
  return '/api';
};

// Try to get the absolute API URL for certain operations
const getAbsoluteApiUrl = () => {
  if (window.env && window.env.REACT_APP_ABSOLUTE_API_URL) {
    return window.env.REACT_APP_ABSOLUTE_API_URL;
  }
  return null; // No absolute URL available
};

// Get the actual base URL
const apiBaseUrl = getApiBaseUrl();
console.log('API Base URL configured as:', apiBaseUrl);

// Create an axios instance with default config
const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // Required for cookies
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create a second instance for absolute URLs when needed
const absoluteApi = getAbsoluteApiUrl() ? axios.create({
  baseURL: getAbsoluteApiUrl(),
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
}) : null;

// Helper to get CSRF token from cookie
const getCSRFToken = () => {
  const name = 'csrf_token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return '';
};

// Request interceptor for adding auth token and CSRF token
api.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    
    // Make sure withCredentials is always set
    config.withCredentials = true;
    
    // Add CSRF token for non-GET requests
    if (config.method !== 'get') {
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    console.error('Error details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers
    });
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.log('Authentication error detected');
      
      // You can dispatch an event or use a central auth state manager
      const authErrorEvent = new CustomEvent('auth:error', { 
        detail: { message: 'Authentication failed' } 
      });
      window.dispatchEvent(authErrorEvent);
    }
    
    // Handle CSRF errors
    if (error.response && error.response.status === 403 && 
        error.response.data && error.response.data.message && 
        error.response.data.message.includes('CSRF')) {
      console.log('CSRF error detected, refreshing page');
      window.location.reload();
      return Promise.reject(new Error('CSRF validation failed. Page will refresh.'));
    }
    
    return Promise.reject(error);
  }
);

// If we have an absolute API, add the same interceptors
if (absoluteApi) {
  absoluteApi.interceptors.request.use(
    (config) => {
      console.log(`Making ${config.method?.toUpperCase()} request to absolute URL: ${config.url}`);
      config.withCredentials = true;
      
      // Add CSRF token for non-GET requests
      if (config.method !== 'get') {
        const csrfToken = getCSRFToken();
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  absoluteApi.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('Absolute API Error:', error.message);
      return Promise.reject(error);
    }
  );
}

// Create a standardized error object
const handleApiError = (error) => {
  const errorObj = {
    message: 'An error occurred. Please try again.',
    statusCode: 500,
    details: null
  };
  
  if (error.response) {
    // Server responded with an error status
    errorObj.statusCode = error.response.status;
    errorObj.message = error.response.data?.message || errorObj.message;
    errorObj.details = error.response.data?.details || null;
  } else if (error.request) {
    // Request made but no response received
    errorObj.message = 'No response from server. Please check your connection.';
  }
  
  // Return a standardized error object
  return errorObj;
};

// Attempt to fetch data with fallback to absolute URL if relative fails
const fetchWithFallback = async (endpoint, options = {}) => {
  try {
    // First try with the relative URL
    return await api(endpoint, options);
  } catch (error) {
    console.log(`Error with relative URL, status: ${error.response?.status || 'network error'}`);
    
    // If we have an absolute API and the error was a network error or CORS error, try with absolute URL
    if (absoluteApi && (!error.response || error.response.status === 0)) {
      console.log('Trying with absolute URL instead');
      return await absoluteApi(endpoint, options);
    }
    
    // Otherwise rethrow the original error
    throw error;
  }
};

// Authentication APIs
export const loginUser = async (credentials) => {
  try {
    const response = await fetchWithFallback('/auth/login', {
      method: 'POST',
      data: credentials
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const loginWithGoogle = () => {
  // Try to use the absolute URL if available
  if (window.env && window.env.REACT_APP_ABSOLUTE_API_URL) {
    window.location.href = `${window.env.REACT_APP_ABSOLUTE_API_URL}/auth/google`;
    return;
  }
  
  // Fallback to relative URL
  const apiUrl = getApiBaseUrl();
  window.location.href = `${apiUrl}/auth/google`;
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.get('/auth/logout');
    // Clear all cache on logout
    cache.clearAll();
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Tenant APIs
export const getCurrentTenant = async () => {
  try {
    const response = await api.get('/tenants/current');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const joinTenant = async (tenantKey) => {
  try {
    const response = await api.post('/tenants/join', { tenantKey });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const regenerateTenantKey = async () => {
  try {
    const response = await api.post('/tenants/regenerate-key');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getTenantUsers = async () => {
  try {
    const response = await api.get('/tenants/users');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put('/tenants/users/role', { userId, role });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Technology APIs with caching
export const fetchTechnologies = async (forceRefresh = false) => {
  const cacheKey = 'technologies';
  
  // Use cached data if available and not forcing refresh
  if (!forceRefresh) {
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached technologies data');
      return cachedData;
    }
  }
  
  try {
    // First try the authenticated endpoint
    const response = await fetchWithFallback('/technologies');
    // Cache the result
    cache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // If authentication fails, try the public endpoint
      console.log('Authentication failed, falling back to public technologies endpoint');
      try {
        const publicResponse = await fetchWithFallback('/technologies/public');
        // Cache the result
        cache.set(cacheKey, publicResponse.data);
        return publicResponse.data;
      } catch (publicError) {
        console.error('Error fetching public technologies:', publicError.message);
        throw handleApiError(publicError);
      }
    } else {
      // For other errors, try the public endpoint as well
      try {
        const publicResponse = await fetchWithFallback('/technologies/public');
        // Cache the result
        cache.set(cacheKey, publicResponse.data);
        return publicResponse.data;
      } catch (publicError) {
        console.error('Error fetching technologies:', publicError.message);
        throw handleApiError(error);
      }
    }
  }
};

export const fetchTechnology = async (id) => {
  try {
    const response = await api.get(`/technologies/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createTechnology = async (technologyData) => {
  try {
    const response = await api.post('/technologies', technologyData);
    // Clear cache since data changed
    cache.clear('technologies');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateTechnology = async (id, technologyData) => {
  try {
    const response = await api.put(`/technologies/${id}`, technologyData);
    // Clear cache since data changed
    cache.clear('technologies');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteTechnology = async (id) => {
  try {
    const response = await api.delete(`/technologies/${id}`);
    // Clear cache since data changed
    cache.clear('technologies');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Change request APIs
export const requestChange = async (changeRequestData) => {
  try {
    const response = await api.post('/technologies/change-request', changeRequestData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getUserChangeRequests = async () => {
  try {
    const response = await api.get('/technologies/change-requests/my');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getAllChangeRequests = async () => {
  try {
    const response = await api.get('/technologies/change-requests/all');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const reviewChangeRequest = async (id, reviewData) => {
  try {
    const response = await api.put(`/technologies/change-requests/${id}`, reviewData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}; 