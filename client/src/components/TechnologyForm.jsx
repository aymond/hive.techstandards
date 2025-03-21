import React, { useState, useEffect } from 'react';
import './TechnologyForm.css';

const TechnologyForm = ({ technology, onSubmit, onCancel }) => {
  const initialState = {
    name: '',
    description: '',
    vendor: '',
    capability: '',
    lifecycleStatus: 'Active',
    startDate: '',
    endDate: ''
  };

  const [formData, setFormData] = useState(technology || initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (technology) {
      setFormData({
        ...technology,
        startDate: technology.startDate ? technology.startDate.substring(0, 10) : '',
        endDate: technology.endDate ? technology.endDate.substring(0, 10) : ''
      });
    }
  }, [technology]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.vendor) newErrors.vendor = 'Vendor is required';
    if (!formData.capability) newErrors.capability = 'Capability is required';
    if (!formData.lifecycleStatus) newErrors.lifecycleStatus = 'Lifecycle Status is required';
    if (!formData.startDate) newErrors.startDate = 'Start Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="technology-form">
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={errors.description ? 'error' : ''}
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="vendor">Vendor</label>
        <input
          type="text"
          id="vendor"
          name="vendor"
          value={formData.vendor}
          onChange={handleChange}
          className={errors.vendor ? 'error' : ''}
        />
        {errors.vendor && <span className="error-message">{errors.vendor}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="capability">Capability</label>
        <input
          type="text"
          id="capability"
          name="capability"
          value={formData.capability}
          onChange={handleChange}
          className={errors.capability ? 'error' : ''}
        />
        {errors.capability && <span className="error-message">{errors.capability}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="lifecycleStatus">Lifecycle Status</label>
        <select
          id="lifecycleStatus"
          name="lifecycleStatus"
          value={formData.lifecycleStatus}
          onChange={handleChange}
          className={errors.lifecycleStatus ? 'error' : ''}
        >
          <option value="Active">Active</option>
          <option value="Deprecated">Deprecated</option>
          <option value="Retired">Retired</option>
          <option value="Proposed">Proposed</option>
        </select>
        {errors.lifecycleStatus && <span className="error-message">{errors.lifecycleStatus}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="startDate">Start Date</label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className={errors.startDate ? 'error' : ''}
        />
        {errors.startDate && <span className="error-message">{errors.startDate}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="endDate">End Date</label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={formData.endDate || ''}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {technology ? 'Update Technology' : 'Add Technology'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TechnologyForm; 