# Technology Lifecycle Manager

A comprehensive platform for tracking, evaluating, and managing your organization's technology portfolio.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.3.0-green.svg)

## Overview

The Technology Lifecycle Manager helps organizations make informed decisions about their technology stack by providing:

- **Technology Tracking**: Maintain a comprehensive catalog of all technologies used in your organization
- **Lifecycle Management**: Track adoption, maturity, and retirement phases of technologies
- **Multi-Tenant Support**: Manage technology portfolios across different departments or organizations
- **Change Requests**: Streamline the process of requesting and approving technology changes
- **Role-Based Access**: Control permissions with admin, editor, and viewer user roles

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Architecture](#architecture)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Prerequisites

- Docker and Docker Compose
- Node.js 14+ (for development)
- MongoDB (automatically handled via Docker)

### Quick Start with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/technology-lifecycle-manager.git
   cd technology-lifecycle-manager
   ```

2. Start the application:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Web UI: http://localhost:5080
   - API: http://localhost:5081/api

## Usage

### Registration and Login

1. Navigate to http://localhost:5080
2. Click "Register" to create a new account
3. If you have a tenant key, enter it during registration
4. Login with your credentials

### Managing Technologies

1. From the dashboard, click "Add New Technology" to create a new entry
2. Fill in the technology details:
   - Name
   - Vendor
   - Capability
   - Lifecycle Status
   - Description
3. Use the filters to search and organize your technology portfolio
4. Edit or delete technologies as needed

## Features

### Authentication System
- User registration with email/password
- Secure login with JWT token authentication
- Protected routes requiring authentication

### Technology Management
- Complete CRUD operations for technology items
- Filterable technology list by capability, vendor, and lifecycle status
- Public endpoint for non-authenticated access to technology data

### User Interface
- Modern, responsive design
- Professional landing page
- Intuitive dashboard
- Easy-to-use forms

## Architecture

The application follows a modern client-server architecture:

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT, Passport
- **Deployment**: Docker, Nginx

## Development

### Setting Up a Development Environment

1. Clone the repository
2. Install dependencies:
   ```bash
   # Server dependencies
   cd server
   npm install

   # Client dependencies
   cd ../client
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/tech-standards
   JWT_SECRET=your-jwt-secret
   SESSION_SECRET=your-session-secret
   PORT=5081
   ```

4. Start development servers:
   ```bash
   # Start the backend server
   cd server
   npm run dev

   # Start the frontend client
   cd client
   npm start
   ```

## Testing

Run automated tests:

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## Deployment

The application is containerized and can be deployed to any environment that supports Docker.

### Production Deployment

1. Update environment variables in `docker-compose.yml`
2. Build and start the containers:
   ```bash
   docker-compose up -d --build
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.