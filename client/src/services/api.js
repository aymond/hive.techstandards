// API service to fetch data from the backend

// In Docker, the service is accessed via relative URL or the /api proxy
// In development, we use the full URL from the proxy in package.json
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

// Get all technologies
export const fetchTechnologies = async () => {
  try {
    const response = await fetch(`${API_URL}/technologies`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching technologies:', error);
    // Fallback to local data if API fails
    return [];
  }
};

// Get a single technology by ID
export const fetchTechnology = async (id) => {
  try {
    const response = await fetch(`${API_URL}/technologies/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching technology ${id}:`, error);
    throw error;
  }
};

// Create a new technology
export const createTechnology = async (technologyData) => {
  try {
    const response = await fetch(`${API_URL}/technologies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(technologyData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating technology:', error);
    throw error;
  }
};

// Update an existing technology
export const updateTechnology = async (id, technologyData) => {
  try {
    const response = await fetch(`${API_URL}/technologies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(technologyData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating technology ${id}:`, error);
    throw error;
  }
};

// Delete a technology
export const deleteTechnology = async (id) => {
  try {
    const response = await fetch(`${API_URL}/technologies/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error deleting technology ${id}:`, error);
    throw error;
  }
}; 