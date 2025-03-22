// API service to fetch data from the backend
import axios from 'axios';

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

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
    
    // Make sure withCredentials is always set
    config.withCredentials = true;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.log('Authentication error detected');
      
      // You can dispatch an event or use a central auth state manager
      const authErrorEvent = new CustomEvent('auth:error', { 
        detail: { message: 'Authentication failed' } 
      });
      window.dispatchEvent(authErrorEvent);
    }
    
    return Promise.reject(error);
  }
);

// If we have an absolute API, add the same interceptors
if (absoluteApi) {
  absoluteApi.interceptors.request.use(
    (config) => {
      console.log(`Making ${config.method.toUpperCase()} request to absolute URL: ${config.url}`);
      config.withCredentials = true;
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
  const baseUrl = apiUrl.replace(/\/api$/, ''); // Remove /api suffix if present
  window.location.href = `${baseUrl}/api/auth/google`;
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

// Technology APIs
export const fetchTechnologies = async () => {
  try {
    // First try the authenticated endpoint
    const response = await fetchWithFallback('/technologies');
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // If authentication fails, try the public endpoint
      console.log('Authentication failed, falling back to public technologies endpoint');
      try {
        const publicResponse = await fetchWithFallback('/technologies/public');
        return publicResponse.data;
      } catch (publicError) {
        console.error('Error fetching public technologies:', publicError.message);
        throw handleApiError(publicError);
      }
    } else {
      // For other errors, try the public endpoint as well
      try {
        console.log('Error accessing protected endpoint, trying public endpoint');
        const publicResponse = await fetchWithFallback('/technologies/public');
        return publicResponse.data;
      } catch (publicError) {
        // If both fail, throw the original error
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
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateTechnology = async (id, technologyData) => {
  try {
    const response = await api.put(`/technologies/${id}`, technologyData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteTechnology = async (id) => {
  try {
    const response = await api.delete(`/technologies/${id}`);
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

// Error handling helper
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with an error status code
    return {
      status: error.response.status,
      message: error.response.data.message || 'An error occurred'
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      status: 0,
      message: 'No response from server'
    };
  } else {
    // Error setting up the request
    return {
      status: 0,
      message: error.message
    };
  }
}; 