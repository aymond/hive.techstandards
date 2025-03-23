import React from 'react';
import TechnologyCard from './TechnologyCard';
import './TechnologyList.css';

const TechnologyList = ({ technologies, onEdit, onDelete }) => {
  if (!technologies || technologies.length === 0) {
    return (
      <div className="no-results">
        <p>No technologies found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="technology-list">
      {technologies.map(tech => (
        <TechnologyCard 
          key={tech._id || tech.id || Math.random().toString(36)} 
          technology={tech}
          onEdit={() => onEdit && onEdit(tech)}
          onDelete={() => onDelete && tech._id && onDelete(tech._id || tech.id)}
        />
      ))}
    </div>
  );
};

export default TechnologyList; 