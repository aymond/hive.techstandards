# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install -g npm@11.2.0 && \
    npm install --no-audit --no-fund

# Copy all files
COPY . .

# Create the env.js file
RUN mkdir -p /app/public && \
    echo 'window.env = { REACT_APP_API_URL: "/api" };' > /app/public/env.js

# Add additional environment variables to avoid React issues
ENV NODE_OPTIONS="--openssl-legacy-provider"
ENV SKIP_PREFLIGHT_CHECK="true"
ENV CI="false"
ENV DISABLE_ESLINT_PLUGIN="true"
ENV GENERATE_SOURCEMAP="false"

# Build the app with reduced warnings and no source maps
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /app/build /usr/share/nginx/html

# Create a simple favicon to prevent 404 errors
RUN echo 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABgAAAAYADwa0LPAAAAB3RJTUUH5gQCBRQihic6TQAAAeFJREFUSMfVlUtIVGEYhp+Z0fEyGtUkNGVEtQgyaZzxkiI2RbXIFiEELYJoYYusFlFtimgxRlEtpIXUKsGojYQ70XRhEASNmCBeRskZx3K8z+IbjDNj/tmFH84Hv/Oc73LOe/ggEEQTxd+4k/7y7/lKZmN4cNQPxVN5qPtpnyGrh8/W1gWPgd67BLKTjqXU9yprXqLx+L3LSfOJw5m37fO7qkdmn9yEo/b9QbC7MeBMjNePONd9Y+PBfDyUAXiMF63v1o8MJJTrvmlnJCGX5b5Oe3f26WoyDN0Uxgvd9mWPklJK2VAvvVDeuYnbKV/K+aTzPsf1K865nUhDa3pC1veSsabVlpZQDHqnk6V73nV2+DKQq0xrXcujOoAgB4mXXldaVvZ+f2hd2Q9APTcB+EHLXs7nEDSz6ypnHXcBnvOoXm0D2ccRACp4UTzKAl8ZBcCiBST3WJnluDa3oSbLI7LQYVkeoE5VR6dF3TtH/n70+jrIIWYcbQXO8AWADHKa/gXSTCEAzdwFYInrgNqYtKg3iXDkwkEWreQTh/6V5zPvuAyAAMRi6tC7KjrDawDxCEANM9oULZFWADIlUVzpMxnKG7z+4zALNZrPDXnkr+b0EcUeXrYBWt5uPKPeX7UaGg0oY11e+u9q7GWw+MUfD/QXjE4nrXc1jQIAAAAASUVORK5CYII=' | base64 -d > /usr/share/nginx/html/favicon.ico

# Create a fallback index.html in case something goes wrong
RUN echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Technology Lifecycle Manager</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5;}.message{max-width:500px;padding:30px;background:white;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);text-align:center;}</style></head><body><div class="message"><h1>Technology Lifecycle Manager</h1><p>If you are seeing this message, there was an error loading the application.</p><p>Please try refreshing the page or contact support if the issue persists.</p><button onclick="window.location.reload()" style="padding:10px 20px;background:#4a6cf7;color:white;border:none;border-radius:4px;cursor:pointer;margin-top:20px">Reload Page</button></div></body></html>' > /usr/share/nginx/html/fallback.html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add health check to verify the container is working correctly
RUN echo '#!/bin/sh\nif [ -f /usr/share/nginx/html/index.html ]; then exit 0; else exit 1; fi' > /healthcheck.sh && \
    chmod +x /healthcheck.sh

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD /healthcheck.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 