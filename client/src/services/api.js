// API service to fetch data from the backend

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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