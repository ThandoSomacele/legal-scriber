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
EXPOSE 3000
EXPOSE 5173

# Start both server and Vite to run concurrently
CMD ["npm", "run", "dev"]

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server.js ./
COPY package*.json ./
COPY vite.config.js ./
COPY envConfig.js ./

# Install only production dependencies
RUN npm ci --only=production

# Environment setup
ENV NODE_ENV=production

# Expose only the server port for production
EXPOSE 3000

# Start the server
CMD ["npm", "start"]

# Default to development stage
FROM ${TARGET:-development}