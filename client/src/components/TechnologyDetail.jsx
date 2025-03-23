import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTechnologies } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import './TechnologyDetail.css';

const TechnologyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [technology, setTechnology] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadTechnology = async () => {
      try {
        setLoading(true);
        const data = await fetchTechnologies();
        const tech = data.technologies?.find(t => t._id === id);
        
        if (tech) {
          setTechnology(tech);
        } else {
          setError('Technology not found');
        }
      } catch (err) {
        console.error('Failed to load technology:', err);
        setError(err.message || 'Failed to load technology');
      } finally {
        setLoading(false);
      }
    };
    
    loadTechnology();
  }, [id]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return <LoadingSpinner text="Loading technology details..." />;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleBack} className="back-button">
          Back to Technologies
        </button>
      </div>
    );
  }
  
  if (!technology) {
    return (
      <div className="not-found-container">
        <h2>Technology Not Found</h2>
        <p>The requested technology could not be found.</p>
        <button onClick={handleBack} className="back-button">
          Back to Technologies
        </button>
      </div>
    );
  }
  
  return (
    <div className="technology-detail-container">
      <div className="technology-detail-header">
        <button onClick={handleBack} className="back-button">
          &larr; Back
        </button>
        <h1>{technology.name}</h1>
      </div>
      
      <div className="technology-detail-card">
        <div className="technology-detail-section">
          <div className="detail-badge">{technology.category}</div>
          {technology.status && <div className="detail-badge status">{technology.status}</div>}
        </div>
        
        <div className="technology-detail-section">
          <h2>Description</h2>
          <p>{technology.description}</p>
        </div>
        
        {technology.features && technology.features.length > 0 && (
          <div className="technology-detail-section">
            <h2>Key Features</h2>
            <ul className="features-list">
              {technology.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
        
        {technology.links && Object.keys(technology.links).length > 0 && (
          <div className="technology-detail-section">
            <h2>Resources</h2>
            <div className="resources-list">
              {technology.links.documentation && (
                <a href={technology.links.documentation} target="_blank" rel="noopener noreferrer" className="resource-link">
                  Documentation
                </a>
              )}
              {technology.links.github && (
                <a href={technology.links.github} target="_blank" rel="noopener noreferrer" className="resource-link">
                  GitHub Repository
                </a>
              )}
              {technology.links.website && (
                <a href={technology.links.website} target="_blank" rel="noopener noreferrer" className="resource-link">
                  Official Website
                </a>
              )}
            </div>
          </div>
        )}
        
        {technology.notes && (
          <div className="technology-detail-section">
            <h2>Additional Notes</h2>
            <p>{technology.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnologyDetail; 