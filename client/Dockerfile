# Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm install --no-audit --no-fund

# Copy the rest of the application
COPY . .

# Set development environment variables
ENV NODE_ENV=development
ENV REACT_APP_API_URL=/api

# Build the application
RUN npm run build

# Serve stage
FROM nginx:alpine

# Copy the build output
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 