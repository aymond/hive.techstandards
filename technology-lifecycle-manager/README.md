# Technology Lifecycle Manager

A web-based Technology Lifecycle Management platform that allows developers to view, filter, and manage technology lifecycles.

## Features

- View technologies in a responsive, card-based layout
- Filter technologies by capability, vendor, and lifecycle status
- Expandable technology cards with detailed information
- Backend API that serves technology data
- Responsive design that works on both desktop and mobile devices

## Project Structure

```
technology-lifecycle-manager/
├── client/                   # Frontend React application
│   ├── public/               # Static files
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── data/             # Sample data (fallback)
│   │   ├── services/         # API services
│   │   ├── App.jsx           # Main App component
│   │   └── index.js          # Entry point
│   └── package.json          # Frontend dependencies
├── server/                   # Backend Express server
│   ├── src/                  # Source code
│   │   └── index.js          # Express server
│   └── package.json          # Backend dependencies
└── README.md                 # Project documentation
```

## Technologies Used

- **Frontend**: React, CSS3
- **Backend**: Node.js, Express
- **Deployment**: Can be deployed to any static hosting (frontend) and Node.js hosting service (backend)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/technology-lifecycle-manager.git
   cd technology-lifecycle-manager
   ```

2. Install dependencies for both the client and server:
   ```
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   # From the server directory
   npm run dev
   ```

2. Start the frontend development server:
   ```
   # From the client directory
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

> **Note:** If you encounter OpenSSL-related errors when starting the React application, the project includes configuration in `.env` and `package.json` that sets the `NODE_OPTIONS=--openssl-legacy-provider` flag to resolve these issues.

## Building for Production

### Frontend Build

```
# From the client directory
npm run build
```

This will create a `build` directory with optimized production files that can be deployed to any static hosting service.

### Backend Production

For production, you can set the `NODE_ENV` environment variable to "production" when starting the server:

```
# From the server directory
NODE_ENV=production npm start
```

In production mode, the server will serve the static files from the client's build directory.

## Design Decisions

- **Component Structure**: Created reusable components (TechnologyCard, TechnologyFilter, TechnologyList) for better maintainability and reusability.
- **Responsive Design**: Used modern CSS with media queries to ensure the application works well on different screen sizes.
- **API Integration**: Added a service layer for API communication with fallback to local data for better reliability.
- **Clean UI**: Designed with a focus on readability and usability, with clear visual differentiation for different lifecycle statuses.

## Future Enhancements

- Authentication system for admin users
- Technology editing and creation functionality
- Pagination or infinite scrolling for large technology lists
- Advanced filtering and search capabilities
- Dark mode theme
- Export functionality (CSV, PDF, etc.)

## Security Notes

Please note that the current version of this project contains some security vulnerabilities in its dependencies. These are primarily related to development dependencies and don't affect the application's runtime functionality.

In a production environment, it's recommended to:

1. Run `npm audit` to check for vulnerable dependencies
2. Use `npm audit fix` to fix vulnerabilities that don't require breaking changes
3. For more critical security issues, consider creating a new React application using the latest version of create-react-app and migrating the components

The current vulnerabilities are related to older versions of:
- postcss
- nth-check
- svgo
- and other development dependencies

These issues are common in older react-scripts versions and don't affect the actual application functionality for demonstration purposes.

## License

This project is licensed under the MIT License.