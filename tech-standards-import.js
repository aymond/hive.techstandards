/**
 * Import Script for Technology Standards
 * 
 * This script reads the tech-standards-import.json file and calls
 * the API endpoint to create each technology.
 * 
 * Usage: 
 * 1. Make sure you're logged in as an admin user
 * 2. Run this script with Node.js:
 *    node tech-standards-import.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5081/api';
const TECHNOLOGIES_ENDPOINT = '/technologies';

// Read the JSON file
const importTechnologies = async () => {
  try {
    // Read the JSON file
    const rawData = fs.readFileSync(path.join(__dirname, 'tech-standards-import.json'));
    const technologies = JSON.parse(rawData);
    
    console.log(`Found ${technologies.length} technologies to import`);
    
    // Get an authentication token
    // You need to be logged in as an admin user before running this script
    console.log('Getting authentication info...');
    
    // Setup axios instance
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    // Check if we're authenticated and have admin rights
    try {
      const authCheck = await api.get('/health');
      console.log('Auth status:', authCheck.data.auth);
      
      if (authCheck.data.auth !== 'authenticated' || !authCheck.data.user || authCheck.data.user.role !== 'admin') {
        console.log('You need to be logged in as an admin user.');
        console.log('Please login in your browser at http://localhost:5080 before running this script.');
        process.exit(1);
      }
      
      console.log(`Logged in as: ${authCheck.data.user.name} (${authCheck.data.user.role})`);
    } catch (err) {
      console.error('Authentication check failed:', err.message);
      console.log('Please make sure the server is running and you are logged in as admin.');
      process.exit(1);
    }
    
    // Import each technology
    let successCount = 0;
    let errorCount = 0;
    
    for (const tech of technologies) {
      try {
        // Create version objects from the technology data
        // For the import, we'll create the current version plus any additional versions
        const mainVersion = {
          versionNumber: tech.version,
          releaseDate: new Date(), // Using current date as release date
          lifecycleStatus: mapStatus(tech.status),
          notes: `Initial version of ${tech.name}`
        };

        // Build an array of versions
        const versions = [mainVersion];
        
        // Add additional versions if they exist in the import data
        if (tech.additionalVersions && Array.isArray(tech.additionalVersions)) {
          for (const additionalVersion of tech.additionalVersions) {
            versions.push({
              versionNumber: additionalVersion.versionNumber,
              releaseDate: new Date(additionalVersion.releaseDate || Date.now()),
              endOfSupportDate: additionalVersion.endOfSupportDate ? new Date(additionalVersion.endOfSupportDate) : undefined,
              lifecycleStatus: mapStatus(additionalVersion.status || 'Active'),
              notes: additionalVersion.notes || `Version ${additionalVersion.versionNumber} of ${tech.name}`
            });
          }
        }

        // Transform the data to match the server model
        const technologyData = {
          name: tech.name,
          description: tech.description,
          vendor: tech.vendor,
          capability: tech.category, // Map category to capability
          lifecycleStatus: mapStatus(tech.status),
          startDate: new Date(), // Current date as start date
          endDate: tech.endDate ? new Date(tech.endDate) : undefined,
          
          // Version information
          versions: versions,
          currentVersion: tech.version, // The main version is set as current
          
          // Additional fields from the sample data
          type: tech.type,
          businessImpact: tech.businessImpact,
          useCase: tech.useCase,
          limitations: tech.limitations,
          alternatives: tech.alternatives,
          documentationUrl: tech.documentationUrl,
          securityConsiderations: tech.securityConsiderations,
          costConsiderations: tech.costConsiderations,
          complianceRequirements: tech.complianceRequirements,
          licenseType: tech.licenseType
        };
        
        // Make the API call
        const response = await api.post(TECHNOLOGIES_ENDPOINT, technologyData);
        console.log(`✅ Imported: ${tech.name} v${tech.version} (ID: ${response.data._id})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error importing ${tech.name}:`, error.response?.data?.message || error.message);
        errorCount++;
      }
    }
    
    console.log('\nImport Summary:');
    console.log(`Total: ${technologies.length}`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    
  } catch (error) {
    console.error('Import failed:', error.message);
  }
};

// Map status values to the model's accepted values
function mapStatus(status) {
  const statusMap = {
    'Approved': 'Active',
    'Under Review': 'Planned',
    'Deprecated': 'Deprecated',
    'Retired': 'Retired'
  };
  
  return statusMap[status] || 'Active';
}

// Run the import
importTechnologies();

/**
 * Alternative Manual Import Instructions:
 * 
 * If the script doesn't work, you can manually import the technologies:
 * 
 * 1. Log in to the application as an admin
 * 2. Open your browser's developer tools (F12)
 * 3. In the console, paste the following code:
 * 
 * async function importTechnologies() {
 *   // Fetch the technology data
 *   const response = await fetch('/tech-standards-import.json');
 *   const technologies = await response.json();
 *   
 *   let successCount = 0;
 *   let errorCount = 0;
 *   
 *   for (const tech of technologies) {
 *     try {
 *       // Create main version
 *       const mainVersion = {
 *         versionNumber: tech.version,
 *         releaseDate: new Date(),
 *         lifecycleStatus: mapStatus(tech.status),
 *         notes: `Initial version of ${tech.name}`
 *       };
 *       
 *       // Build array of versions
 *       const versions = [mainVersion];
 *       
 *       // Add additional versions if they exist
 *       if (tech.additionalVersions && Array.isArray(tech.additionalVersions)) {
 *         for (const additionalVersion of tech.additionalVersions) {
 *           versions.push({
 *             versionNumber: additionalVersion.versionNumber,
 *             releaseDate: new Date(additionalVersion.releaseDate || Date.now()),
 *             endOfSupportDate: additionalVersion.endOfSupportDate ? new Date(additionalVersion.endOfSupportDate) : undefined,
 *             lifecycleStatus: mapStatus(additionalVersion.status || 'Active'),
 *             notes: additionalVersion.notes || `Version ${additionalVersion.versionNumber} of ${tech.name}`
 *           });
 *         }
 *       }
 *       
 *       const technologyData = {
 *         name: tech.name,
 *         description: tech.description,
 *         vendor: tech.vendor,
 *         capability: tech.category,
 *         lifecycleStatus: mapStatus(tech.status),
 *         startDate: new Date(),
 *         endDate: tech.endDate ? new Date(tech.endDate) : undefined,
 *         versions: versions,
 *         currentVersion: tech.version,
 *         type: tech.type,
 *         businessImpact: tech.businessImpact,
 *         useCase: tech.useCase,
 *         limitations: tech.limitations,
 *         alternatives: tech.alternatives,
 *         documentationUrl: tech.documentationUrl,
 *         securityConsiderations: tech.securityConsiderations,
 *         costConsiderations: tech.costConsiderations
 *       };
 *       
 *       const createResponse = await fetch('/api/technologies', {
 *         method: 'POST',
 *         headers: { 'Content-Type': 'application/json' },
 *         body: JSON.stringify(technologyData)
 *       });
 *       
 *       if (createResponse.ok) {
 *         console.log(`✅ Imported: ${tech.name} v${tech.version}`);
 *         successCount++;
 *       } else {
 *         const error = await createResponse.json();
 *         console.error(`❌ Error importing ${tech.name}:`, error.message);
 *         errorCount++;
 *       }
 *     } catch (error) {
 *       console.error(`❌ Error importing ${tech.name}:`, error);
 *       errorCount++;
 *     }
 *   }
 *   
 *   console.log('\nImport Summary:');
 *   console.log(`Total: ${technologies.length}`);
 *   console.log(`Success: ${successCount}`);
 *   console.log(`Failed: ${errorCount}`);
 * }
 * 
 * function mapStatus(status) {
 *   const statusMap = {
 *     'Approved': 'Active',
 *     'Under Review': 'Planned',
 *     'Deprecated': 'Deprecated',
 *     'Retired': 'Retired'
 *   };
 *   
 *   return statusMap[status] || 'Active';
 * }
 * 
 * importTechnologies();
 */ 