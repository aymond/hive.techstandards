import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import TechnologyFilter from './components/TechnologyFilter';
import TechnologyList from './components/TechnologyList';
import TechnologyForm from './components/TechnologyForm';
import { 
  fetchTechnologies, 
  createTechnology, 
  updateTechnology, 
  deleteTechnology,
  getCurrentUser
} from './services/api';
import fallbackTechnologies from './data/technologies';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('Checking user authentication...');
        const userData = await getCurrentUser();
        console.log('User data received:', userData);
        setUser(userData);
      } catch (err) {
        console.log('User not authenticated:', err);
        setUser(null);
      } finally {
        setIsAuthChecked(true);
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  // Authentication handlers
  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleRegisterSuccess = () => {
    // Registration success, redirect to login happens in component
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Simple loading screen
  if (isLoading) {
    return <div className="loading">Loading application...</div>;
  }

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthChecked) {
      return <div className="loading">Checking authentication...</div>;
    }
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  // Dashboard Component
  const Dashboard = () => {
    const [technologies, setTechnologies] = useState([]);
    const [filteredTechnologies, setFilteredTechnologies] = useState([]);
    const [filters, setFilters] = useState({
      capability: '',
      vendor: '',
      lifecycleStatus: ''
    });
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingTechnology, setEditingTechnology] = useState(null);

    useEffect(() => {
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
            <div className="header-content">
              <h1>Technology Lifecycle Manager</h1>
              {user && (
                <div className="user-info">
                  <span>Welcome, {user.name || user.email}</span>
                  <button onClick={handleLogout} className="btn btn-outline">Logout</button>
                </div>
              )}
            </div>
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
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/register" element={<Register onRegisterSuccess={handleRegisterSuccess} />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App; 