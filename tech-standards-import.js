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
    
    // Get cookies for authentication from the browser and add them here
    const cookies = 'YOUR_COOKIES_HERE'; // Replace with actual cookies from your browser
    
    // Setup axios instance with cookies
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      withCredentials: true
    });
    
    // Import each technology
    let successCount = 0;
    let errorCount = 0;
    
    for (const tech of technologies) {
      try {
        // Transform the data to match the server model if needed
        const technologyData = {
          name: tech.name,
          description: tech.description,
          vendor: tech.vendor,
          capability: tech.category, // Map category to capability
          lifecycleStatus: mapStatus(tech.status),
          startDate: new Date(), // Current date as start date
          // Additional fields from the sample data that don't directly map to the model
          // These will be stored but not used by the current model
          type: tech.type,
          version: tech.version,
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
        console.log(`✅ Imported: ${tech.name}`);
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
 * 3. In the console, paste the following code (after replacing the file content):
 * 
 * const technologies = [
 *   // Paste the content of tech-standards-import.json here
 * ];
 * 
 * async function importTech() {
 *   for (const tech of technologies) {
 *     try {
 *       const technologyData = {
 *         name: tech.name,
 *         description: tech.description,
 *         vendor: tech.vendor,
 *         capability: tech.category,
 *         lifecycleStatus: tech.status === 'Approved' ? 'Active' : 
 *                          tech.status === 'Under Review' ? 'Planned' : 
 *                          tech.status,
 *         startDate: new Date(),
 *         // Additional fields
 *         type: tech.type,
 *         version: tech.version
 *       };
 *       
 *       const response = await fetch('/api/technologies', {
 *         method: 'POST',
 *         headers: { 'Content-Type': 'application/json' },
 *         body: JSON.stringify(technologyData),
 *         credentials: 'include'
 *       });
 *       
 *       if (response.ok) {
 *         console.log(`Imported: ${tech.name}`);
 *       } else {
 *         const error = await response.json();
 *         console.error(`Error importing ${tech.name}:`, error.message);
 *       }
 *     } catch (error) {
 *       console.error(`Error importing ${tech.name}:`, error);
 *     }
 *   }
 * }
 * 
 * importTech();
 */ 