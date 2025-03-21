FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
# Install latest npm version
RUN npm install -g npm@11.2.0
# Use npm install instead of npm ci to handle package-lock mismatch
RUN npm install

# Copy the rest of the application
COPY . .

# Set NODE_OPTIONS for OpenSSL compatibility
ENV NODE_OPTIONS="--openssl-legacy-provider"
ENV SKIP_PREFLIGHT_CHECK="true"

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 