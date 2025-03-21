import React, { useState } from 'react';
import './TechnologyCard.css';

const TechnologyCard = ({ technology }) => {
  const [expanded, setExpanded] = useState(false);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Ongoing';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return '#4caf50';
      case 'Deprecated': return '#ff9800';
      case 'Planned': return '#2196f3';
      case 'Retired': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <div className={`tech-card ${expanded ? 'expanded' : ''}`}>
      <div className="tech-card-header">
        <h3 className="tech-name">{technology.name}</h3>
        <div 
          className="status-badge" 
          style={{ backgroundColor: getStatusColor(technology.lifecycleStatus) }}
        >
          {technology.lifecycleStatus}
        </div>
      </div>
      
      <div className="tech-card-content">
        <p className="tech-description">{technology.description}</p>
        
        <div className="tech-metadata">
          <div className="metadata-item">
            <span className="metadata-label">Vendor:</span>
            <span className="metadata-value">{technology.vendor}</span>
          </div>
          
          <div className="metadata-item">
            <span className="metadata-label">Capability:</span>
            <span className="metadata-value">{technology.capability}</span>
          </div>
          
          <div className="metadata-item">
            <span className="metadata-label">Timeline:</span>
            <span className="metadata-value">
              {formatDate(technology.startDate)} - {formatDate(technology.endDate)}
            </span>
          </div>
        </div>
        
        {expanded && (
          <div className="tech-details">
            <h4>Additional Details</h4>
            <p>This section could include more detailed information about the technology, such as:</p>
            <ul>
              <li>Documentation links</li>
              <li>Support contacts</li>
              <li>Version information</li>
              <li>Usage guidelines</li>
              <li>Migration plans (for deprecated technologies)</li>
            </ul>
          </div>
        )}
      </div>
      
      <button 
        className="details-button"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Show Less' : 'Show Details'}
      </button>
    </div>
  );
};

export default TechnologyCard; 