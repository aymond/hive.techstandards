const express = require('express');
const technologyController = require('../controllers/technologyController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Public route to get all technologies
router.get('/public', technologyController.getAllTechnologies);

// All other routes require authentication
router.use(authenticate);

// Get all technologies
router.get('/', technologyController.getAllTechnologies);

// Get a single technology
router.get('/:id', technologyController.getTechnologyById);

// Create a new technology (admin only)
router.post('/', technologyController.createTechnology);

// Update a technology (admin only)
router.put('/:id', technologyController.updateTechnology);

// Delete a technology (admin only)
router.delete('/:id', technologyController.deleteTechnology);

// Request a change (all authenticated users)
router.post('/change-request', technologyController.requestChange);

// Get all change requests (admin only)
router.get('/change-requests/all', technologyController.getChangeRequests);

// Get user's change requests
router.get('/change-requests/my', technologyController.getUserChangeRequests);

// Review a change request (admin only)
router.put('/change-requests/:id', technologyController.reviewChangeRequest);

module.exports = router; 