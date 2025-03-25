const express = require('express');
const tenantController = require('../controllers/tenantController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get the current tenant for the authenticated user
router.get('/current', tenantController.getCurrentTenant);

// Get all tenants (admin only)
router.get('/', tenantController.getAllTenants);

// Create a new tenant (system admin only)
router.post('/', tenantController.createTenant);

// Join a tenant with tenant key
router.post('/join', tenantController.joinTenant);

// Join a tenant with invitation code
router.post('/join-by-invitation', tenantController.joinTenantByInvitation);

// Update tenant info (admin only)
router.put('/', tenantController.updateTenant);

// Regenerate tenant key (admin only)
router.post('/regenerate-key', tenantController.regenerateTenantKey);

// Get users for current tenant (admin only)
router.get('/users', tenantController.getTenantUsers);

// Update user role (admin only)
router.put('/users/role', tenantController.updateUserRole);

// Invitation management (admin only)
router.post('/invitations', tenantController.createInvitation);
router.get('/invitations', tenantController.getTenantInvitations);
router.delete('/invitations/:invitationId', tenantController.revokeInvitation);

// Leave current tenant organization
router.post('/leave', tenantController.leaveTenant);

module.exports = router; 