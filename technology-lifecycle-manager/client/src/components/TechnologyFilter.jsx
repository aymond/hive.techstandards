import React from 'react';
import './TechnologyFilter.css';

const TechnologyFilter = ({ 
  filters, 
  onFilterChange, 
  capabilities, 
  vendors, 
  statuses 
}) => {
  return (
    <div className="filter-container">
      <h2>Filters</h2>
      
      <div className="filter-group">
        <label htmlFor="capability-filter">Capability</label>
        <select 
          id="capability-filter" 
          value={filters.capability || ''} 
          onChange={(e) => onFilterChange('capability', e.target.value)}
        >
          <option value="">All Capabilities</option>
          {capabilities.map(capability => (
            <option key={capability} value={capability}>{capability}</option>
          ))}
        </select>
      </div>
      
      <div className="filter-group">
        <label htmlFor="vendor-filter">Vendor</label>
        <select 
          id="vendor-filter" 
          value={filters.vendor || ''} 
          onChange={(e) => onFilterChange('vendor', e.target.value)}
        >
          <option value="">All Vendors</option>
          {vendors.map(vendor => (
            <option key={vendor} value={vendor}>{vendor}</option>
          ))}
        </select>
      </div>
      
      <div className="filter-group">
        <label htmlFor="status-filter">Lifecycle Status</label>
        <select 
          id="status-filter" 
          value={filters.lifecycleStatus || ''} 
          onChange={(e) => onFilterChange('lifecycleStatus', e.target.value)}
        >
          <option value="">All Statuses</option>
          {statuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      
      <button 
        className="reset-button"
        onClick={() => {
          onFilterChange('capability', '');
          onFilterChange('vendor', '');
          onFilterChange('lifecycleStatus', '');
        }}
      >
        Reset Filters
      </button>
    </div>
  );
};

export default TechnologyFilter; 