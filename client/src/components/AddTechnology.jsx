import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTechnology } from '../services/api';
import './AddTechnology.css';

const AddTechnology = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    links: {
      documentation: '',
      github: '',
      website: ''
    },
    features: [''],
    notes: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested links object
    if (name.startsWith('links.')) {
      const linkType = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        links: {
          ...prev.links,
          [linkType]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleFeatureChange = (index, value) => {
    setFormData(prev => {
      const updatedFeatures = [...prev.features];
      updatedFeatures[index] = value;
      return {
        ...prev,
        features: updatedFeatures
      };
    });
  };
  
  const addFeatureField = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };
  
  const removeFeatureField = (index) => {
    setFormData(prev => {
      const updatedFeatures = [...prev.features];
      updatedFeatures.splice(index, 1);
      return {
        ...prev,
        features: updatedFeatures.length ? updatedFeatures : ['']
      };
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Remove empty features
    const cleanedFormData = {
      ...formData,
      features: formData.features.filter(feature => feature.trim() !== '')
    };
    
    try {
      setLoading(true);
      setError(null);
      
      await createTechnology(cleanedFormData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Error creating technology:', err);
      setError(err.message || 'Failed to create technology. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="add-technology-container">
      <h1>Add New Technology</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="technology-form">
        <div className="form-group">
          <label htmlFor="name">Technology Name *</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            placeholder="e.g., React, Node.js, MongoDB"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select 
            id="category" 
            name="category" 
            value={formData.category} 
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="database">Database</option>
            <option value="devops">DevOps</option>
            <option value="mobile">Mobile</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea 
            id="description" 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            placeholder="Provide a brief description of the technology..."
            rows="4"
            required
          />
        </div>
        
        <div className="form-section">
          <h3>Resources</h3>
          
          <div className="form-group">
            <label htmlFor="links.documentation">Documentation URL</label>
            <input 
              type="url" 
              id="links.documentation" 
              name="links.documentation" 
              value={formData.links.documentation} 
              onChange={handleChange}
              placeholder="e.g., https://docs.example.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="links.github">GitHub Repository</label>
            <input 
              type="url" 
              id="links.github" 
              name="links.github" 
              value={formData.links.github} 
              onChange={handleChange}
              placeholder="e.g., https://github.com/example/repo"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="links.website">Official Website</label>
            <input 
              type="url" 
              id="links.website" 
              name="links.website" 
              value={formData.links.website} 
              onChange={handleChange}
              placeholder="e.g., https://example.com"
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Key Features</h3>
          
          {formData.features.map((feature, index) => (
            <div key={index} className="feature-input">
              <input 
                type="text" 
                value={feature} 
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder="Enter a key feature"
              />
              <button 
                type="button" 
                className="remove-button"
                onClick={() => removeFeatureField(index)}
                title="Remove feature"
              >
                &times;
              </button>
            </div>
          ))}
          
          <button 
            type="button" 
            className="add-button"
            onClick={addFeatureField}
          >
            + Add Feature
          </button>
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea 
            id="notes" 
            name="notes" 
            value={formData.notes} 
            onChange={handleChange}
            placeholder="Any additional notes or comments about this technology..."
            rows="3"
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleCancel}
            className="cancel-button"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Technology'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTechnology; 