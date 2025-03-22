const express = require('express');
const tenantController = require('../controllers/tenantController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all tenants (system admin only)
router.get('/all', tenantController.getAllTenants);

// Get current tenant
router.get('/current', tenantController.getCurrentTenant);

// Create a new tenant (system admin only)
router.post('/', tenantController.createTenant);

// Join a tenant with tenant key
router.post('/join', tenantController.joinTenant);

// Update tenant settings (tenant admin only)
router.put('/current', tenantController.updateTenant);

// Regenerate tenant key (tenant admin only)
router.post('/regenerate-key', tenantController.regenerateTenantKey);

// Get users for current tenant (admin only)
router.get('/users', tenantController.getTenantUsers);

// Update user role (admin only)
router.put('/users/role', tenantController.updateUserRole);

module.exports = router; 