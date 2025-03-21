import React from 'react';
import TechnologyCard from './TechnologyCard';
import './TechnologyList.css';

const TechnologyList = ({ technologies }) => {
  if (technologies.length === 0) {
    return (
      <div className="no-results">
        <p>No technologies found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="technology-list">
      {technologies.map(tech => (
        <TechnologyCard key={tech.id} technology={tech} />
      ))}
    </div>
  );
};

export default TechnologyList; 