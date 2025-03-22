const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  tenantKey: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  domain: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    sparse: true
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Tenant', TenantSchema); 