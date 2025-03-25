/**
 * This script ensures that the first user is set as an admin
 * and is assigned to a tenant organization.
 * 
 * Usage:
 * node scripts/initializeFirstAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Tenant = require('../src/models/Tenant');
const crypto = require('crypto');

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tech-standards';

// Generate a unique tenant key
const generateTenantKey = () => {
  return crypto.randomBytes(6).toString('hex');
};

async function initializeFirstAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Count users
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('No users found in the database. Nothing to do.');
      return;
    }

    // Get the first user (earliest created)
    const firstUser = await User.findOne().sort({ createdAt: 1 });
    
    if (!firstUser) {
      console.log('Could not determine the first user. Exiting.');
      return;
    }
    
    console.log(`Found first user: ${firstUser.name} (${firstUser.email})`);
    
    // Check if user already has an assigned tenant
    let tenant;
    if (firstUser.tenantId) {
      tenant = await Tenant.findById(firstUser.tenantId);
      if (tenant) {
        console.log(`User already belongs to tenant: ${tenant.name}`);
      }
    }
    
    // If no tenant exists or user doesn't have one, create a new tenant
    if (!tenant) {
      const tenantKey = generateTenantKey();
      const tenantName = `${firstUser.name}'s Organization`;
      
      tenant = await Tenant.create({
        name: tenantName,
        tenantKey,
        isActive: true
      });
      
      console.log(`Created new tenant: ${tenantName} with key: ${tenantKey}`);
      
      // Assign tenant to user
      firstUser.tenantId = tenant._id;
      console.log(`Assigned user to tenant: ${tenantName}`);
    }
    
    // Make user an admin if not already
    if (firstUser.role !== 'admin') {
      firstUser.role = 'admin';
      console.log('Set user role to admin');
    } else {
      console.log('User is already an admin');
    }
    
    // Save changes
    await firstUser.save();
    console.log('User updated successfully');
    
    // Log all available tenants and their keys for reference
    const allTenants = await Tenant.find();
    console.log('\nAvailable Tenants:');
    allTenants.forEach(t => {
      console.log(`- ${t.name} (Key: ${t.tenantKey})`);
    });
    
    console.log('\nInitialization complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
initializeFirstAdmin(); 