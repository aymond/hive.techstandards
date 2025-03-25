const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const crypto = require('crypto');

// Generate a unique tenant key
const generateTenantKey = () => {
  return crypto.randomBytes(6).toString('hex');
};

// Generate a unique invitation code
const generateInvitationCode = () => {
  return crypto.randomBytes(10).toString('hex');
};

// Get all tenants - admin only (system-wide admin)
exports.getAllTenants = async (req, res) => {
  try {
    // Check for special system-wide admin role
    if (req.user.role !== 'admin' || req.user.email !== process.env.SYSTEM_ADMIN_EMAIL) {
      return res.status(403).json({ message: 'System admin access required' });
    }
    
    const tenants = await Tenant.find();
    res.json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ message: 'Failed to fetch tenants' });
  }
};

// Get current tenant
exports.getCurrentTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.tenantId);
    
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    res.json(tenant);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ message: 'Failed to fetch tenant' });
  }
};

// Create a new tenant - system admin only
exports.createTenant = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { name, domain } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Organization name is required' });
    }
    
    // Generate a tenant key
    const tenantKey = generateTenantKey();
    
    // Create new tenant
    const tenant = await Tenant.create({
      name,
      tenantKey,
      domain: domain || undefined,
      isActive: true
    });
    
    res.status(201).json({
      id: tenant._id,
      name: tenant.name,
      tenantKey: tenant.tenantKey,
      domain: tenant.domain
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ message: 'Failed to create tenant' });
  }
};

// Join a tenant using tenant key
exports.joinTenant = async (req, res) => {
  try {
    const { tenantKey } = req.body;
    
    // Find tenant by key
    const tenant = await Tenant.findOne({ tenantKey });
    if (!tenant) {
      return res.status(404).json({ message: 'Invalid tenant key' });
    }
    
    // Update user's tenant
    req.user.tenantId = tenant._id;
    await req.user.save();
    
    res.json({ 
      message: 'Successfully joined tenant',
      tenant: {
        id: tenant._id,
        name: tenant.name
      }
    });
  } catch (error) {
    console.error('Error joining tenant:', error);
    res.status(500).json({ message: 'Failed to join tenant' });
  }
};

// Update a tenant - tenant admin only
exports.updateTenant = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { name, domain, settings } = req.body;
    
    // Find and update tenant
    const tenant = await Tenant.findByIdAndUpdate(
      req.tenantId,
      { 
        name: name || undefined,
        domain: domain || undefined,
        settings: settings || undefined
      },
      { new: true }
    );
    
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    res.json(tenant);
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ message: 'Failed to update tenant' });
  }
};

// Regenerate tenant key - tenant admin only
exports.regenerateTenantKey = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Generate a new tenant key
    const tenantKey = generateTenantKey();
    
    // Update the tenant
    const tenant = await Tenant.findByIdAndUpdate(
      req.tenantId,
      { tenantKey },
      { new: true }
    );
    
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    res.json(tenant);
  } catch (error) {
    console.error('Error regenerating tenant key:', error);
    res.status(500).json({ message: 'Failed to regenerate tenant key' });
  }
};

// Get users for current tenant - admin only
exports.getTenantUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const users = await User.find(
      { tenantId: req.tenantId },
      'email name role picture lastLogin'
    );
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching tenant users:', error);
    res.status(500).json({ message: 'Failed to fetch tenant users' });
  }
};

// Update user role - admin only
exports.updateUserRole = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { userId, role } = req.body;
    
    // Verify that the user belongs to the current tenant
    const user = await User.findOne({ 
      _id: userId,
      tenantId: req.tenantId
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user role
    user.role = role;
    await user.save();
    
    res.json({ 
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

// Create invitation - admin only
exports.createInvitation = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { email, role, expiresIn } = req.body;
    
    // Validate inputs
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Create expiration date (default 7 days if not specified)
    let expiresAt;
    if (expiresIn) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);
    } else {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days default
    }
    
    // Generate unique invitation code
    const code = generateInvitationCode();
    
    // Create the invitation
    const invitation = await Invitation.create({
      code,
      email,
      role: role || 'user',
      tenantId: req.tenantId,
      createdBy: req.user._id,
      expiresAt
    });
    
    res.status(201).json({
      message: 'Invitation created successfully',
      invitation: {
        id: invitation._id,
        code: invitation.code,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({ message: 'Failed to create invitation' });
  }
};

// Get all invitations for current tenant - admin only
exports.getTenantInvitations = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Get invitations for the current tenant
    const invitations = await Invitation.find({ tenantId: req.tenantId })
      .sort({ createdAt: -1 });
    
    res.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ message: 'Failed to fetch invitations' });
  }
};

// Revoke invitation - admin only
exports.revokeInvitation = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { invitationId } = req.params;
    
    // Find and delete the invitation
    const invitation = await Invitation.findOneAndDelete({
      _id: invitationId,
      tenantId: req.tenantId,
      used: false
    });
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or already used' });
    }
    
    res.json({ message: 'Invitation revoked successfully', id: invitation._id });
  } catch (error) {
    console.error('Error revoking invitation:', error);
    res.status(500).json({ message: 'Failed to revoke invitation' });
  }
};

// Join tenant using invitation code
exports.joinTenantByInvitation = async (req, res) => {
  try {
    const { invitationCode } = req.body;
    
    // Find invitation by code
    const invitation = await Invitation.findOne({ 
      code: invitationCode,
      used: false
    });
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invalid or expired invitation code' });
    }
    
    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invitation has expired' });
    }
    
    // Find tenant
    const tenant = await Tenant.findById(invitation.tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    // Update user's tenant and role if specified in invitation
    req.user.tenantId = tenant._id;
    if (invitation.role) {
      req.user.role = invitation.role;
    }
    await req.user.save();
    
    // Mark invitation as used
    invitation.used = true;
    invitation.usedBy = req.user._id;
    invitation.usedAt = new Date();
    await invitation.save();
    
    res.json({ 
      message: 'Successfully joined tenant',
      tenant: {
        id: tenant._id,
        name: tenant.name
      },
      role: req.user.role
    });
  } catch (error) {
    console.error('Error joining tenant by invitation:', error);
    res.status(500).json({ message: 'Failed to join tenant' });
  }
};

// Leave current tenant organization
exports.leaveTenant = async (req, res) => {
  try {
    // Check for default tenant
    const defaultTenant = await Tenant.findOne({ name: 'Default' });
    if (!defaultTenant) {
      // Create a default tenant if it doesn't exist
      const tenantKey = generateTenantKey();
      const defaultTenant = await Tenant.create({
        name: 'Default',
        tenantKey,
        isActive: true
      });
    }
    
    // Get user count in current tenant to prevent leaving if user is the last admin
    const adminCount = await User.countDocuments({ 
      tenantId: req.tenantId, 
      role: 'admin' 
    });
    
    if (adminCount === 1 && req.user.role === 'admin') {
      return res.status(400).json({ 
        message: 'Cannot leave organization as you are the only admin. Please assign admin role to another user first.' 
      });
    }
    
    // Assign user to default tenant and reset role to 'user'
    req.user.tenantId = defaultTenant._id;
    req.user.role = 'user';
    await req.user.save();
    
    res.json({ 
      message: 'Successfully left organization',
      defaultTenant: {
        id: defaultTenant._id,
        name: defaultTenant.name
      }
    });
  } catch (error) {
    console.error('Error leaving tenant:', error);
    res.status(500).json({ message: 'Failed to leave organization' });
  }
}; 