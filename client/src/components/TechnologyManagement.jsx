import React, { useState, useEffect } from 'react';
import { 
  fetchTechnologies, 
  createTechnology, 
  updateTechnology, 
  deleteTechnology 
} from '../services/api';
import TechnologyForm from './TechnologyForm';
import './TechnologyManagement.css';

const TechnologyManagement = () => {
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTechnology, setEditingTechnology] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Load technologies on component mount
  useEffect(() => {
    loadTechnologies();
  }, []);

  const loadTechnologies = async () => {
    try {
      setLoading(true);
      const data = await fetchTechnologies();
      setTechnologies(data);
      setError(null);
    } catch (err) {
      setError('Failed to load technologies. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        setTechnologies(technologies.filter(tech => tech._id !== id));
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
        const updated = await updateTechnology(editingTechnology._id, formData);
        setTechnologies(technologies.map(tech => 
          tech._id === editingTechnology._id ? updated : tech
        ));
      } else {
        // Create new technology
        const created = await createTechnology(formData);
        setTechnologies([...technologies, created]);
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  // Filter technologies based on search term and status filter
  const filteredTechnologies = technologies.filter(tech => {
    const matchesSearch = 
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.capability.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'All' || 
      tech.lifecycleStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div className="loading">Loading technologies...</div>;
  }

  return (
    <div className="technology-management">
      <h2>Technology Standards Management</h2>
      
      {error && <div className="error-banner">{error}</div>}
      
      <div className="management-actions">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search technologies..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          
          <select 
            value={filterStatus} 
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Deprecated">Deprecated</option>
            <option value="Retired">Retired</option>
            <option value="Proposed">Proposed</option>
          </select>
        </div>
        
        <button 
          onClick={handleAddNew} 
          className="btn btn-primary"
          disabled={isFormVisible}
        >
          Add New Technology
        </button>
      </div>
      
      {isFormVisible && (
        <div className="form-container">
          <h3>{editingTechnology ? 'Edit Technology' : 'Add New Technology'}</h3>
          <TechnologyForm 
            technology={editingTechnology}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      )}
      
      {filteredTechnologies.length === 0 ? (
        <div className="no-results">No technologies found matching your criteria.</div>
      ) : (
        <div className="technologies-table-container">
          <table className="technologies-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Vendor</th>
                <th>Capability</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTechnologies.map(tech => (
                <tr key={tech._id} className={`status-${tech.lifecycleStatus.toLowerCase()}`}>
                  <td>{tech.name}</td>
                  <td>{tech.vendor}</td>
                  <td>{tech.capability}</td>
                  <td>{tech.lifecycleStatus}</td>
                  <td>{new Date(tech.startDate).toLocaleDateString()}</td>
                  <td>{tech.endDate ? new Date(tech.endDate).toLocaleDateString() : '-'}</td>
                  <td className="actions">
                    <button 
                      onClick={() => handleEdit(tech)} 
                      className="btn btn-edit"
                      title="Edit this technology"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(tech._id)} 
                      className="btn btn-delete"
                      title="Delete this technology"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TechnologyManagement; 