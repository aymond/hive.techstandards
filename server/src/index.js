const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection code - only if MongoDB package is already installed
try {
  // Check if mongoose is installed before requiring it
  const mongoose = require('mongoose');
  
  // Connect to MongoDB using the MONGO_URI from environment variables
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/todo-app')
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      console.log('Continuing without MongoDB as it might not be required for initial setup');
    });
} catch (err) {
  console.log('Mongoose not installed, continuing without MongoDB connection');
  console.log('If MongoDB is needed, install it with: npm install mongoose');
}

// Sample data
let technologies = [
  {
    id: 1,
    name: "React",
    description: "A JavaScript library for building user interfaces.",
    vendor: "Meta",
    capability: "Frontend Framework",
    lifecycleStatus: "Active",
    startDate: "2013-05-29",
    endDate: null
  },
  {
    id: 2,
    name: "PostgreSQL",
    description: "A powerful, open source object-relational database system.",
    vendor: "PostgreSQL Global Development Group",
    capability: "Database",
    lifecycleStatus: "Active",
    startDate: "1996-09-01",
    endDate: null
  },
  {
    id: 3,
    name: "AngularJS",
    description: "An older JavaScript-based open-source front-end web framework.",
    vendor: "Google",
    capability: "Frontend Framework",
    lifecycleStatus: "Deprecated",
    startDate: "2010-10-20",
    endDate: "2021-12-31"
  },
  {
    id: 4,
    name: "AWS Lambda",
    description: "Serverless compute service.",
    vendor: "Amazon",
    capability: "Cloud Service",
    lifecycleStatus: "Active",
    startDate: "2014-11-13",
    endDate: null
  },
  {
    id: 5,
    name: "MongoDB",
    description: "A source-available cross-platform document-oriented database program.",
    vendor: "MongoDB Inc.",
    capability: "Database",
    lifecycleStatus: "Active",
    startDate: "2009-02-11",
    endDate: null
  },
  {
    id: 6,
    name: "jQuery",
    description: "A fast, small, and feature-rich JavaScript library.",
    vendor: "JS Foundation",
    capability: "Frontend Library",
    lifecycleStatus: "Deprecated",
    startDate: "2006-08-26",
    endDate: null
  },
  {
    id: 7,
    name: "Azure Functions",
    description: "Event-driven serverless compute platform.",
    vendor: "Microsoft",
    capability: "Cloud Service",
    lifecycleStatus: "Active",
    startDate: "2016-03-31",
    endDate: null
  },
  {
    id: 8,
    name: "Vue.js",
    description: "An approachable, performant and versatile framework for building web user interfaces.",
    vendor: "Evan You",
    capability: "Frontend Framework",
    lifecycleStatus: "Active",
    startDate: "2014-02-01",
    endDate: null
  },
  {
    id: 9,
    name: "Oracle Database",
    description: "Multi-model database management system.",
    vendor: "Oracle Corporation",
    capability: "Database",
    lifecycleStatus: "Active",
    startDate: "1979-06-01",
    endDate: null
  },
  {
    id: 10,
    name: "Angular",
    description: "Platform for building mobile and desktop web applications.",
    vendor: "Google",
    capability: "Frontend Framework",
    lifecycleStatus: "Active",
    startDate: "2016-09-14",
    endDate: null
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// GET all technologies
app.get('/api/technologies', (req, res) => {
  res.json(technologies);
});

// GET single technology by ID
app.get('/api/technologies/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const technology = technologies.find(tech => tech.id === id);
  
  if (!technology) {
    return res.status(404).json({ message: 'Technology not found' });
  }
  
  res.json(technology);
});

// POST - Create new technology
app.post('/api/technologies', (req, res) => {
  const newTechnology = req.body;
  
  // Generate a new ID (simple approach for demo)
  const maxId = technologies.reduce((max, tech) => Math.max(max, tech.id), 0);
  newTechnology.id = maxId + 1;
  
  technologies.push(newTechnology);
  res.status(201).json(newTechnology);
});

// PUT - Update technology
app.put('/api/technologies/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = technologies.findIndex(tech => tech.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Technology not found' });
  }
  
  // Preserve the ID
  const updatedTechnology = { ...req.body, id };
  technologies[index] = updatedTechnology;
  
  res.json(updatedTechnology);
});

// DELETE - Remove technology
app.delete('/api/technologies/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = technologies.findIndex(tech => tech.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Technology not found' });
  }
  
  const deletedTechnology = technologies[index];
  technologies = technologies.filter(tech => tech.id !== id);
  
  res.json(deletedTechnology);
});

// If in production, serve static files from client/build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 