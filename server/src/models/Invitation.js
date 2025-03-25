const mongoose = require('mongoose');

const InvitationSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  usedAt: {
    type: Date
  }
});

// Set expiration to 7 days from now if not specified
InvitationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    const now = new Date();
    this.expiresAt = new Date(now.setDate(now.getDate() + 7));
  }
  next();
});

module.exports = mongoose.model('Invitation', InvitationSchema); 