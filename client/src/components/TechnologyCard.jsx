import React, { useState } from 'react';
import './TechnologyCard.css';

const TechnologyCard = ({ technology, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Ongoing';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return '#2ecc71';
      case 'Deprecated': return '#f39c12';
      case 'Planned': return '#3498db';
      case 'Proposed': return '#9b59b6';
      case 'Retired': return '#e74c3c';
      default: return '#95a5a6';
    }
  };
  
  const getStatusClass = (status) => {
    if (!status) return '';
    return `status-${status.toLowerCase()}`;
  };

  // Get current version details if available
  const getCurrentVersionDetails = () => {
    if (!technology.versions || technology.versions.length === 0) {
      return null;
    }
    
    const currentVersion = technology.versions.find(v => 
      v.versionNumber === technology.currentVersion
    );
    
    return currentVersion || technology.versions[0];
  };

  const currentVersionDetails = getCurrentVersionDetails();

  return (
    <div className={`tech-card ${expanded ? 'expanded' : ''} ${getStatusClass(technology.lifecycleStatus)}`}>
      <div className="tech-card-header">
        <h3 className="tech-name">
          {technology.name}
          {technology.currentVersion && (
            <span className="version-badge">v{technology.currentVersion}</span>
          )}
        </h3>
        <div 
          className="status-badge" 
          style={{ backgroundColor: getStatusColor(technology.lifecycleStatus) }}
        >
          {technology.lifecycleStatus}
        </div>
      </div>
      
      <div className="tech-card-content">
        <div className="tech-meta">
          <span className="tech-vendor">{technology.vendor}</span>
          {technology.type && <span className="tech-type">{technology.type}</span>}
          <span className="tech-capability">{technology.capability}</span>
        </div>
        
        <p className="tech-description">{technology.description}</p>
        
        {currentVersionDetails && (
          <div className="tech-version-info">
            <h4>Current Version: {currentVersionDetails.versionNumber}</h4>
            <div className="version-meta">
              <span className="version-release">Released: {formatDate(currentVersionDetails.releaseDate)}</span>
              {currentVersionDetails.endOfSupportDate && (
                <span className="version-eos">End of Support: {formatDate(currentVersionDetails.endOfSupportDate)}</span>
              )}
              <span 
                className="version-status-badge" 
                style={{ backgroundColor: getStatusColor(currentVersionDetails.lifecycleStatus) }}
              >
                {currentVersionDetails.lifecycleStatus}
              </span>
            </div>
            {currentVersionDetails.notes && (
              <p className="version-notes">{currentVersionDetails.notes}</p>
            )}
          </div>
        )}

        {expanded && (
          <div className="tech-details">
            <div className="tech-lifecycle">
              <p><strong>Lifecycle:</strong> {formatDate(technology.startDate)} - {formatDate(technology.endDate)}</p>
            </div>
            
            {technology.versions && technology.versions.length > 1 && (
              <div className="tech-all-versions">
                <h4>All Versions</h4>
                <ul className="versions-list">
                  {technology.versions.map((version, index) => (
                    <li key={index} className={`version-item ${version.versionNumber === technology.currentVersion ? 'current' : ''}`}>
                      <div className="version-item-header">
                        <span className="version-item-number">
                          {version.versionNumber}
                          {version.versionNumber === technology.currentVersion && (
                            <span className="current-label"> (Current)</span>
                          )}
                        </span>
                        <span 
                          className="version-status-badge small" 
                          style={{ backgroundColor: getStatusColor(version.lifecycleStatus) }}
                        >
                          {version.lifecycleStatus}
                        </span>
                      </div>
                      <div className="version-item-dates">
                        Released: {formatDate(version.releaseDate)}
                        {version.endOfSupportDate && ` | End of Support: ${formatDate(version.endOfSupportDate)}`}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {technology.useCase && (
              <div className="tech-use-case">
                <h4>Use Case</h4>
                <p>{technology.useCase}</p>
              </div>
            )}
            
            {technology.limitations && (
              <div className="tech-limitations">
                <h4>Limitations</h4>
                <p>{technology.limitations}</p>
              </div>
            )}
            
            {technology.alternatives && (
              <div className="tech-alternatives">
                <h4>Alternatives</h4>
                <p>{technology.alternatives}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="tech-card-footer">
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="btn-text"
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
        
        <div className="tech-actions">
          <button onClick={() => onEdit(technology)} className="btn-text edit">
            Edit
          </button>
          <button onClick={() => onDelete(technology._id)} className="btn-text delete">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnologyCard; 