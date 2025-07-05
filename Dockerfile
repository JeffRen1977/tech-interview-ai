FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy all backend files
COPY backend/ ./

# Expose port
EXPOSE 3000

# Set environment variable for port
ENV PORT=3000

# Start the application
CMD ["node", "server.js"] 