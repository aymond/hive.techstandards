const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample data
const technologies = [
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
app.get('/api/technologies', (req, res) => {
  res.json(technologies);
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