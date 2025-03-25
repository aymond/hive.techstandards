const mongoose = require('mongoose');

// Define the version schema as a subdocument
const VersionSchema = new mongoose.Schema({
  versionNumber: {
    type: String,
    required: true,
    trim: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  endOfSupportDate: {
    type: Date
  },
  lifecycleStatus: {
    type: String,
    required: true,
    enum: ['Active', 'Deprecated', 'Retired', 'Planned'],
    default: 'Active'
  },
  notes: {
    type: String
  }
});

const TechnologySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  vendor: {
    type: String,
    required: true,
    trim: true
  },
  capability: {
    type: String,
    required: true,
    trim: true
  },
  // The overall technology lifecycle status
  lifecycleStatus: {
    type: String,
    required: true,
    enum: ['Active', 'Deprecated', 'Retired', 'Planned'],
    default: 'Active'
  },
  // Array of version objects, each with its own lifecycle
  versions: [VersionSchema],
  // Current/primary version
  currentVersion: {
    type: String
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Additional fields from sample data
  type: {
    type: String
  },
  businessImpact: {
    type: String
  },
  useCase: {
    type: String
  },
  limitations: {
    type: String
  },
  alternatives: {
    type: String
  },
  documentationUrl: {
    type: String
  },
  securityConsiderations: {
    type: String
  },
  costConsiderations: {
    type: String
  },
  complianceRequirements: {
    type: String
  },
  licenseType: {
    type: String
  }
});

// Update the timestamp before saving
TechnologySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Technology', TechnologySchema); 