const Technology = require('../models/Technology');
const ChangeRequest = require('../models/ChangeRequest');

// Get all technologies for the current tenant
exports.getAllTechnologies = async (req, res) => {
  try {
    const technologies = await Technology.find({ tenantId: req.tenantId });
    res.json(technologies);
  } catch (error) {
    console.error('Error fetching technologies:', error);
    res.status(500).json({ message: 'Failed to fetch technologies' });
  }
};

// Get a single technology by ID
exports.getTechnologyById = async (req, res) => {
  try {
    const technology = await Technology.findOne({ 
      _id: req.params.id,
      tenantId: req.tenantId
    });
    
    if (!technology) {
      return res.status(404).json({ message: 'Technology not found' });
    }
    
    res.json(technology);
  } catch (error) {
    console.error('Error fetching technology:', error);
    res.status(500).json({ message: 'Failed to fetch technology' });
  }
};

// Create a new technology - admin only
exports.createTechnology = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const technologyData = req.body;
    
    // Add tenant and user info
    technologyData.tenantId = req.tenantId;
    technologyData.createdBy = req.user._id;
    technologyData.updatedBy = req.user._id;
    
    const technology = await Technology.create(technologyData);
    res.status(201).json(technology);
  } catch (error) {
    console.error('Error creating technology:', error);
    res.status(500).json({ message: 'Failed to create technology' });
  }
};

// Update a technology - admin only
exports.updateTechnology = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const technologyData = req.body;
    
    // Add user info
    technologyData.updatedBy = req.user._id;
    
    const technology = await Technology.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      technologyData,
      { new: true }
    );
    
    if (!technology) {
      return res.status(404).json({ message: 'Technology not found' });
    }
    
    res.json(technology);
  } catch (error) {
    console.error('Error updating technology:', error);
    res.status(500).json({ message: 'Failed to update technology' });
  }
};

// Delete a technology - admin only
exports.deleteTechnology = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const technology = await Technology.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId
    });
    
    if (!technology) {
      return res.status(404).json({ message: 'Technology not found' });
    }
    
    res.json(technology);
  } catch (error) {
    console.error('Error deleting technology:', error);
    res.status(500).json({ message: 'Failed to delete technology' });
  }
};

// Request a change to a technology - all authenticated users
exports.requestChange = async (req, res) => {
  try {
    const { technologyId, requestType, requestedChanges, comments } = req.body;
    
    // Verify the technology exists and belongs to the user's tenant
    const technology = await Technology.findOne({ 
      _id: technologyId,
      tenantId: req.tenantId
    });
    
    if (!technology) {
      return res.status(404).json({ message: 'Technology not found' });
    }
    
    // Create change request
    const changeRequest = await ChangeRequest.create({
      technology: technologyId,
      requestType,
      requestedChanges,
      comments,
      requestedBy: req.user._id,
      tenantId: req.tenantId
    });
    
    res.status(201).json(changeRequest);
  } catch (error) {
    console.error('Error creating change request:', error);
    res.status(500).json({ message: 'Failed to create change request' });
  }
};

// Get all change requests - admin only
exports.getChangeRequests = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const changeRequests = await ChangeRequest.find({ tenantId: req.tenantId })
      .populate('technology')
      .populate('requestedBy', 'name email')
      .populate('reviewedBy', 'name email');
    
    res.json(changeRequests);
  } catch (error) {
    console.error('Error fetching change requests:', error);
    res.status(500).json({ message: 'Failed to fetch change requests' });
  }
};

// Get user's change requests - all authenticated users
exports.getUserChangeRequests = async (req, res) => {
  try {
    const changeRequests = await ChangeRequest.find({ 
      tenantId: req.tenantId,
      requestedBy: req.user._id
    })
      .populate('technology')
      .populate('reviewedBy', 'name email');
    
    res.json(changeRequests);
  } catch (error) {
    console.error('Error fetching user change requests:', error);
    res.status(500).json({ message: 'Failed to fetch change requests' });
  }
};

// Approve or reject a change request - admin only
exports.reviewChangeRequest = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { status, comments } = req.body;
    
    const changeRequest = await ChangeRequest.findOne({ 
      _id: req.params.id,
      tenantId: req.tenantId
    });
    
    if (!changeRequest) {
      return res.status(404).json({ message: 'Change request not found' });
    }
    
    // Update change request
    changeRequest.status = status;
    changeRequest.comments = comments || changeRequest.comments;
    changeRequest.reviewedBy = req.user._id;
    
    // If approved, apply the changes
    if (status === 'approved') {
      if (changeRequest.requestType === 'create') {
        // Create new technology
        await Technology.create({
          ...changeRequest.requestedChanges,
          tenantId: req.tenantId,
          createdBy: req.user._id,
          updatedBy: req.user._id
        });
      } else if (changeRequest.requestType === 'update') {
        // Update existing technology
        await Technology.findOneAndUpdate(
          { _id: changeRequest.technology, tenantId: req.tenantId },
          {
            ...changeRequest.requestedChanges,
            updatedBy: req.user._id
          }
        );
      } else if (changeRequest.requestType === 'delete') {
        // Delete technology
        await Technology.findOneAndDelete({
          _id: changeRequest.technology,
          tenantId: req.tenantId
        });
      }
    }
    
    await changeRequest.save();
    res.json(changeRequest);
  } catch (error) {
    console.error('Error reviewing change request:', error);
    res.status(500).json({ message: 'Failed to review change request' });
  }
}; 