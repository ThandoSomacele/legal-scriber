# Build stage
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Development/Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production

# Install development dependencies (for running vite in dev mode)
RUN npm install concurrently --save-dev

# Expose the necessary ports
EXPOSE 3000
EXPOSE 5173

# Command to run both server.js and vite dev concurrently
CMD ["npx", "concurrently", "\"npm:start\"", "\"npm:dev\""]