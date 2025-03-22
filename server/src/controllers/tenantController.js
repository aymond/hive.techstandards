const Tenant = require('../models/Tenant');
const User = require('../models/User');
const crypto = require('crypto');

// Generate a unique tenant key
const generateTenantKey = () => {
  return crypto.randomBytes(6).toString('hex');
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
    // Check for system-wide admin role
    if (req.user.role !== 'admin' || req.user.email !== process.env.SYSTEM_ADMIN_EMAIL) {
      return res.status(403).json({ message: 'System admin access required' });
    }
    
    const { name, domain, adminEmail } = req.body;
    
    // Generate a tenant key
    const tenantKey = generateTenantKey();
    
    // Create new tenant
    const tenant = await Tenant.create({
      name,
      tenantKey,
      domain: domain || undefined,
      isActive: true
    });
    
    // Create an admin user for this tenant if adminEmail provided
    if (adminEmail) {
      // Check if user already exists
      let adminUser = await User.findOne({ email: adminEmail });
      
      if (adminUser) {
        // Update user's role to admin and assign to this tenant
        adminUser.role = 'admin';
        adminUser.tenantId = tenant._id;
        await adminUser.save();
      } else {
        // Create a temporary password (user should reset it)
        const tempPassword = Math.random().toString(36).slice(-8);
        
        // Create new admin user
        adminUser = await User.create({
          email: adminEmail,
          name: 'Tenant Admin',
          password: tempPassword,
          role: 'admin',
          tenantId: tenant._id
        });
        
        // In a real application, send email with temporary password
        console.log(`Created admin user for tenant ${name} with temporary password: ${tempPassword}`);
      }
    }
    
    res.status(201).json(tenant);
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