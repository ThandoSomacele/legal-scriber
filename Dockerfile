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
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

# Expose necessary ports
EXPOSE 8000
EXPOSE 5173

# Start both server and Vite with hot reloading enabled
CMD ["npm", "run", "dev"]

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy necessary files from build stage and source
COPY --from=build /app/dist ./dist/
COPY server.js ./
COPY src/ ./src/
COPY envConfig.js ./

# Add healthcheck (new addition)
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8000/health || exit 1

# Set production environment
ENV NODE_ENV=production
ENV PORT=8000

# Expose the port
EXPOSE 8000

# Start the server
CMD ["node", "server.js"]