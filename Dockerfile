# Production build
FROM node:18-alpine

# Cache buster - change this to force rebuild
RUN echo "Build timestamp: $(date)" > /tmp/build-info

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install --production

# Install backend dependencies
WORKDIR /app/backend
RUN npm install --production

# Go back to app root and copy source code
WORKDIR /app
COPY . .

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Change working directory to backend and start server
WORKDIR /app/backend
CMD ["node", "server.js"]