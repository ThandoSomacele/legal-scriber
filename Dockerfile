# Build stage
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Development stage
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Install dev dependencies
RUN npm install concurrently nodemon --save-dev

# Environment setup
ENV NODE_ENV=development

# Expose necessary ports
EXPOSE 8000
EXPOSE 5173

# Start both server and Vite to run concurrently
CMD ["npm", "run", "dev"]

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the built application and necessary files
COPY dist/ ./dist/
COPY server.js ./
COPY src/ ./src/
COPY envConfig.js ./

# Set production environment
ENV NODE_ENV=production
ENV PORT=8000

# Expose the port
EXPOSE 8000

# Start the server
CMD ["node", "server.js"]
