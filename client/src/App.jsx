import React, { useState, useEffect } from 'react';
import TechnologyFilter from './components/TechnologyFilter';
import TechnologyList from './components/TechnologyList';
import TechnologyForm from './components/TechnologyForm';
import { 
  fetchTechnologies, 
  createTechnology, 
  updateTechnology, 
  deleteTechnology 
} from './services/api';
import fallbackTechnologies from './data/technologies';
import './App.css';

function App() {
  const [technologies, setTechnologies] = useState([]);
  const [filteredTechnologies, setFilteredTechnologies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    capability: '',
    vendor: '',
    lifecycleStatus: ''
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTechnology, setEditingTechnology] = useState(null);

  // Fetch technologies from API
  const loadTechnologies = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTechnologies();
      
      // If API returns empty array, use fallback data
      if (data.length === 0) {
        setTechnologies(fallbackTechnologies);
      } else {
        setTechnologies(data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to load technologies:', err);
      setError('Failed to load technologies. Using fallback data.');
      setTechnologies(fallbackTechnologies);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTechnologies();
  }, []);

  // Extract unique values for filter options
  const capabilities = [...new Set(technologies.map(tech => tech.capability))];
  const vendors = [...new Set(technologies.map(tech => tech.vendor))];
  const statuses = [...new Set(technologies.map(tech => tech.lifecycleStatus))];

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };

  // Apply filters whenever the filters state or technologies change
  useEffect(() => {
    let results = technologies;
    
    if (filters.capability) {
      results = results.filter(tech => tech.capability === filters.capability);
    }
    
    if (filters.vendor) {
      results = results.filter(tech => tech.vendor === filters.vendor);
    }
    
    if (filters.lifecycleStatus) {
      results = results.filter(tech => tech.lifecycleStatus === filters.lifecycleStatus);
    }
    
    setFilteredTechnologies(results);
  }, [filters, technologies]);

  // CRUD operations
  const handleAddNew = () => {
    setEditingTechnology(null);
    setIsFormVisible(true);
  };

  const handleEdit = (technology) => {
    setEditingTechnology(technology);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this technology?')) {
      try {
        await deleteTechnology(id);
        setTechnologies(prevTechnologies => 
          prevTechnologies.filter(tech => tech.id !== id)
        );
      } catch (err) {
        setError('Failed to delete technology. Please try again.');
        console.error(err);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingTechnology) {
        // Update existing technology
        const updated = await updateTechnology(editingTechnology.id, formData);
        setTechnologies(prevTechnologies => 
          prevTechnologies.map(tech => 
            tech.id === editingTechnology.id ? updated : tech
          )
        );
      } else {
        // Create new technology
        const created = await createTechnology(formData);
        setTechnologies(prevTechnologies => [...prevTechnologies, created]);
      }
      setIsFormVisible(false);
      setEditingTechnology(null);
    } catch (err) {
      setError('Failed to save technology. Please try again.');
      console.error(err);
    }
  };

  const handleFormCancel = () => {
    setIsFormVisible(false);
    setEditingTechnology(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>Technology Lifecycle Manager</h1>
          <p>View, filter, and manage your technology portfolio</p>
        </div>
      </header>
      
      <main className="container">
        {isLoading ? (
          <div className="loading">Loading technologies...</div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {isFormVisible ? (
              <div className="form-container">
                <h3>{editingTechnology ? 'Edit Technology' : 'Add New Technology'}</h3>
                <TechnologyForm 
                  technology={editingTechnology}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              </div>
            ) : (
              <>
                <div className="app-actions">
                  <button 
                    onClick={handleAddNew} 
                    className="btn btn-primary"
                  >
                    Add New Technology
                  </button>
                </div>

                <TechnologyFilter 
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  capabilities={capabilities}
                  vendors={vendors}
                  statuses={statuses}
                />
                
                <div className="results-info">
                  <p>Showing {filteredTechnologies.length} of {technologies.length} technologies</p>
                </div>
                
                <TechnologyList 
                  technologies={filteredTechnologies} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </>
            )}
          </>
        )}
      </main>
      
      <footer className="app-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Technology Lifecycle Manager</p>
        </div>
      </footer>
    </div>
  );
}

export default App; 