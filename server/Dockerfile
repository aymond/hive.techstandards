FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
# Install latest npm version
RUN npm install -g npm@11.2.0
# Use npm install instead of npm ci to handle package-lock mismatch
RUN npm install

# Copy the application
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Expose the port the server runs on
EXPOSE 5000

# Start the server using the correct entry point
CMD ["node", "src/index.js"] 