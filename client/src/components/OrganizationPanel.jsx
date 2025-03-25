import React, { useState, useEffect } from 'react';
import { 
  getCurrentTenant, 
  getTenantUsers, 
  getTenantInvitations,
  createInvitation,
  revokeInvitation,
  updateUserRole 
} from '../services/api';
import './OrganizationPanel.css';

const OrganizationPanel = () => {
  const [tenant, setTenant] = useState(null);
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state for new invitation
  const [invitationForm, setInvitationForm] = useState({
    email: '',
    role: 'user',
    expiresIn: 7
  });
  
  // Toggle states
  const [showNewInvitation, setShowNewInvitation] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  
  // Fetch data on component mount
  useEffect(() => {
    fetchOrganizationData();
  }, []);
  
  const fetchOrganizationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch tenant details
      const tenantData = await getCurrentTenant();
      setTenant(tenantData);
      
      // Fetch users
      const usersData = await getTenantUsers();
      setUsers(usersData);
      
      // Fetch invitations
      const invitationsData = await getTenantInvitations();
      setInvitations(invitationsData);
    } catch (err) {
      console.error('Error fetching organization data:', err);
      setError(err.message || 'Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInvitationChange = (e) => {
    const { name, value } = e.target;
    setInvitationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleInvitationSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await createInvitation(invitationForm);
      
      // Add the new invitation to the list
      setInvitations(prev => [response.invitation, ...prev]);
      
      // Reset form
      setInvitationForm({
        email: '',
        role: 'user',
        expiresIn: 7
      });
      
      // Hide form
      setShowNewInvitation(false);
    } catch (err) {
      console.error('Error creating invitation:', err);
      setError(err.message || 'Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRevokeInvitation = async (invitationId) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) {
      return;
    }
    
    try {
      setLoading(true);
      await revokeInvitation(invitationId);
      
      // Remove invitation from list
      setInvitations(prev => prev.filter(inv => inv._id !== invitationId));
    } catch (err) {
      console.error('Error revoking invitation:', err);
      setError(err.message || 'Failed to revoke invitation');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      await updateUserRole(userId, newRole);
      
      // Update user in list
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err.message || 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
      });
  };
  
  if (loading && !tenant) {
    return <div className="loading">Loading organization data...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Organization</h2>
        <p>{error}</p>
        <button onClick={fetchOrganizationData}>Try Again</button>
      </div>
    );
  }
  
  return (
    <div className="organization-panel">
      <div className="org-header">
        <h1>{tenant?.name || 'Organization'}</h1>
        <p className="org-subtitle">Manage your organization members and invitations</p>
      </div>
      
      {/* Organization Details */}
      <div className="org-details">
        <div className="org-info-card">
          <h3>Organization Details</h3>
          <div className="org-info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{tenant?.name}</span>
          </div>
          
          <div className="org-info-row">
            <span className="info-label">Tenant Key:</span>
            <div className="key-container">
              <span className="info-value key-value">{tenant?.tenantKey}</span>
              <button 
                className="copy-button"
                onClick={() => copyToClipboard(tenant?.tenantKey)}
                title="Copy to clipboard"
              >
                Copy
              </button>
            </div>
          </div>
          
          <div className="org-info-row">
            <span className="info-label">Domain:</span>
            <span className="info-value">{tenant?.domain || 'Not specified'}</span>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="org-tabs">
        <button 
          className={`tab-button ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
        <button 
          className={`tab-button ${activeTab === 'invitations' ? 'active' : ''}`}
          onClick={() => setActiveTab('invitations')}
        >
          Invitations
        </button>
      </div>
      
      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="org-members-section">
          <h2>Organization Members</h2>
          
          <div className="members-list">
            <div className="members-header">
              <span className="member-name-header">Name</span>
              <span className="member-email-header">Email</span>
              <span className="member-role-header">Role</span>
              <span className="member-actions-header">Actions</span>
            </div>
            
            {users.length === 0 ? (
              <div className="no-data">No members found</div>
            ) : (
              users.map(user => (
                <div key={user._id} className="member-row">
                  <span className="member-name">{user.name}</span>
                  <span className="member-email">{user.email}</span>
                  <span className="member-role">{user.role}</span>
                  <div className="member-actions">
                    {user.role === 'user' ? (
                      <button 
                        className="role-button make-admin"
                        onClick={() => handleRoleChange(user._id, 'admin')}
                      >
                        Make Admin
                      </button>
                    ) : (
                      <button 
                        className="role-button remove-admin"
                        onClick={() => handleRoleChange(user._id, 'user')}
                      >
                        Remove Admin
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Invitations Tab */}
      {activeTab === 'invitations' && (
        <div className="org-invitations-section">
          <div className="invitations-header">
            <h2>Invitations</h2>
            <button 
              className="new-invitation-button"
              onClick={() => setShowNewInvitation(!showNewInvitation)}
            >
              {showNewInvitation ? 'Cancel' : 'New Invitation'}
            </button>
          </div>
          
          {/* New Invitation Form */}
          {showNewInvitation && (
            <div className="invitation-form-container">
              <h3>Create New Invitation</h3>
              <form onSubmit={handleInvitationSubmit} className="invitation-form">
                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={invitationForm.email}
                    onChange={handleInvitationChange}
                    required
                    placeholder="Enter recipient's email"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="role">Role:</label>
                  <select
                    id="role"
                    name="role"
                    value={invitationForm.role}
                    onChange={handleInvitationChange}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="expiresIn">Expires In (days):</label>
                  <select
                    id="expiresIn"
                    name="expiresIn"
                    value={invitationForm.expiresIn}
                    onChange={handleInvitationChange}
                  >
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  className="create-invitation-button"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Invitation'}
                </button>
              </form>
            </div>
          )}
          
          {/* Invitations List */}
          <div className="invitations-list">
            <div className="invitations-header-row">
              <span className="invitation-email-header">Email</span>
              <span className="invitation-code-header">Invitation Code</span>
              <span className="invitation-role-header">Role</span>
              <span className="invitation-expires-header">Expires</span>
              <span className="invitation-actions-header">Actions</span>
            </div>
            
            {invitations.length === 0 ? (
              <div className="no-data">No invitations found</div>
            ) : (
              invitations.filter(inv => !inv.used).map(invitation => (
                <div key={invitation._id} className="invitation-row">
                  <span className="invitation-email">{invitation.email}</span>
                  <div className="invitation-code">
                    <span className="code-value">{invitation.code}</span>
                    <button 
                      className="copy-button small"
                      onClick={() => copyToClipboard(invitation.code)}
                      title="Copy to clipboard"
                    >
                      Copy
                    </button>
                  </div>
                  <span className="invitation-role">{invitation.role}</span>
                  <span className="invitation-expires">
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </span>
                  <div className="invitation-actions">
                    <button 
                      className="revoke-button"
                      onClick={() => handleRevokeInvitation(invitation._id)}
                      disabled={loading}
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Used Invitations */}
          {invitations.some(inv => inv.used) && (
            <div className="used-invitations">
              <h3>Used Invitations</h3>
              <div className="invitations-list">
                <div className="invitations-header-row">
                  <span className="invitation-email-header">Email</span>
                  <span className="invitation-role-header">Role</span>
                  <span className="invitation-used-header">Used By</span>
                  <span className="invitation-used-at-header">Used On</span>
                </div>
                
                {invitations.filter(inv => inv.used).map(invitation => (
                  <div key={invitation._id} className="invitation-row used">
                    <span className="invitation-email">{invitation.email}</span>
                    <span className="invitation-role">{invitation.role}</span>
                    <span className="invitation-used-by">
                      {invitation.usedBy ? invitation.usedBy.name : 'Unknown'}
                    </span>
                    <span className="invitation-used-at">
                      {new Date(invitation.usedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default OrganizationPanel; 