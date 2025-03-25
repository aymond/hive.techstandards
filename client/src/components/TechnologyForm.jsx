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
    endDate: '',
    type: '',
    currentVersion: '',
    versions: []
  };

  const initialVersionState = {
    versionNumber: '',
    releaseDate: '',
    endOfSupportDate: '',
    lifecycleStatus: 'Active',
    notes: ''
  };

  const [formData, setFormData] = useState(technology || initialState);
  const [errors, setErrors] = useState({});
  const [showVersionForm, setShowVersionForm] = useState(false);
  const [currentVersionData, setCurrentVersionData] = useState(initialVersionState);
  const [editingVersionIndex, setEditingVersionIndex] = useState(-1);

  useEffect(() => {
    if (technology) {
      // Format dates for the form
      setFormData({
        ...technology,
        startDate: technology.startDate ? technology.startDate.substring(0, 10) : '',
        endDate: technology.endDate ? technology.endDate.substring(0, 10) : '',
        versions: technology.versions || []
      });
    }
  }, [technology]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVersionChange = (e) => {
    const { name, value } = e.target;
    setCurrentVersionData({ ...currentVersionData, [name]: value });
  };

  const addVersion = () => {
    // Reset form for adding a new version
    setCurrentVersionData(initialVersionState);
    setEditingVersionIndex(-1);
    setShowVersionForm(true);
  };

  const editVersion = (index) => {
    const version = formData.versions[index];
    // Format dates for the form
    setCurrentVersionData({
      ...version,
      releaseDate: version.releaseDate ? new Date(version.releaseDate).toISOString().substring(0, 10) : '',
      endOfSupportDate: version.endOfSupportDate ? new Date(version.endOfSupportDate).toISOString().substring(0, 10) : ''
    });
    setEditingVersionIndex(index);
    setShowVersionForm(true);
  };

  const removeVersion = (index) => {
    const newVersions = [...formData.versions];
    newVersions.splice(index, 1);
    
    // Update currentVersion if we're removing the current version
    let newCurrentVersion = formData.currentVersion;
    if (formData.currentVersion === formData.versions[index].versionNumber) {
      newCurrentVersion = newVersions.length > 0 ? newVersions[0].versionNumber : '';
    }
    
    setFormData({
      ...formData,
      versions: newVersions,
      currentVersion: newCurrentVersion
    });
  };

  const saveVersion = () => {
    // Validate version data
    if (!currentVersionData.versionNumber || !currentVersionData.releaseDate) {
      return; // Basic validation
    }

    const newVersions = [...formData.versions];
    
    if (editingVersionIndex >= 0) {
      // Update existing version
      newVersions[editingVersionIndex] = currentVersionData;
    } else {
      // Add new version
      newVersions.push(currentVersionData);
    }

    // If this is the first version or no current version is set, make it the current version
    const newCurrentVersion = formData.currentVersion || 
                             (formData.versions.length === 0 ? currentVersionData.versionNumber : formData.currentVersion);

    setFormData({
      ...formData,
      versions: newVersions,
      currentVersion: newCurrentVersion
    });
    
    setShowVersionForm(false);
    setCurrentVersionData(initialVersionState);
    setEditingVersionIndex(-1);
  };

  const cancelVersionForm = () => {
    setShowVersionForm(false);
    setCurrentVersionData(initialVersionState);
    setEditingVersionIndex(-1);
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="technology-form-container">
      <form onSubmit={handleSubmit} className="technology-form">
        <h2>{technology ? 'Edit Technology' : 'Add New Technology'}</h2>
        
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
          <label htmlFor="type">Type</label>
          <input
            type="text"
            id="type"
            name="type"
            value={formData.type || ''}
            onChange={handleChange}
          />
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
          <label htmlFor="lifecycleStatus">Overall Lifecycle Status</label>
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
            <option value="Planned">Planned</option>
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

        {formData.versions && formData.versions.length > 0 && (
          <div className="form-section">
            <h3>Versions</h3>
            <div className="versions-list">
              {formData.versions.map((version, index) => (
                <div key={index} className="version-item">
                  <div className="version-header">
                    <span className="version-number">
                      {version.versionNumber}
                      {formData.currentVersion === version.versionNumber && (
                        <span className="current-badge"> (Current)</span>
                      )}
                    </span>
                    <span className="version-status">{version.lifecycleStatus}</span>
                  </div>
                  <div className="version-details">
                    <div>Release: {formatDate(version.releaseDate)}</div>
                    {version.endOfSupportDate && (
                      <div>End of Support: {formatDate(version.endOfSupportDate)}</div>
                    )}
                    {version.notes && <div>Notes: {version.notes}</div>}
                  </div>
                  <div className="version-actions">
                    <button type="button" onClick={() => editVersion(index)} className="btn-small">
                      Edit
                    </button>
                    <button type="button" onClick={() => removeVersion(index)} className="btn-small btn-danger">
                      Remove
                    </button>
                    {formData.currentVersion !== version.versionNumber && (
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, currentVersion: version.versionNumber})}
                        className="btn-small btn-secondary"
                      >
                        Set as Current
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="version-controls">
          <button type="button" onClick={addVersion} className="btn btn-secondary">
            Add Version
          </button>
        </div>

        {showVersionForm && (
          <div className="version-form-overlay">
            <div className="version-form">
              <h3>{editingVersionIndex >= 0 ? 'Edit Version' : 'Add Version'}</h3>
              
              <div className="form-group">
                <label htmlFor="versionNumber">Version Number</label>
                <input
                  type="text"
                  id="versionNumber"
                  name="versionNumber"
                  value={currentVersionData.versionNumber}
                  onChange={handleVersionChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="releaseDate">Release Date</label>
                <input
                  type="date"
                  id="releaseDate"
                  name="releaseDate"
                  value={currentVersionData.releaseDate}
                  onChange={handleVersionChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endOfSupportDate">End of Support Date</label>
                <input
                  type="date"
                  id="endOfSupportDate"
                  name="endOfSupportDate"
                  value={currentVersionData.endOfSupportDate || ''}
                  onChange={handleVersionChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="versionLifecycleStatus">Lifecycle Status</label>
                <select
                  id="versionLifecycleStatus"
                  name="lifecycleStatus"
                  value={currentVersionData.lifecycleStatus}
                  onChange={handleVersionChange}
                >
                  <option value="Active">Active</option>
                  <option value="Deprecated">Deprecated</option>
                  <option value="Retired">Retired</option>
                  <option value="Planned">Planned</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={currentVersionData.notes || ''}
                  onChange={handleVersionChange}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={saveVersion} className="btn btn-primary">
                  Save Version
                </button>
                <button type="button" onClick={cancelVersionForm} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {technology ? 'Update Technology' : 'Add Technology'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TechnologyForm; 