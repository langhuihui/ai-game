# Use Node.js LTS version
FROM node:20-alpine

# Install dependencies needed for better-sqlite3
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only (this will build native modules for Linux)
RUN npm install --omit=dev

# Copy built application
COPY dist ./dist

# Expose ports for web and super admin servers
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]

