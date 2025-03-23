import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = React.memo(({ size = 'medium', text = 'Loading...' }) => {
  // Define CSS classes based on size prop
  const sizeClass = size === 'small' ? 'spinner-small' : 
                    size === 'large' ? 'spinner-large' : 
                    'spinner-medium';
  
  return (
    <div className="spinner-container">
      <div className={`spinner ${sizeClass}`}></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
});

// Add displayName for better debugging in React DevTools
LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner; 