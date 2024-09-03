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
COPY --from=build /app/dist ./dist
COPY package*.json ./
COPY server.js ./
COPY .env ./
RUN npm ci
RUN npm install concurrently nodemon --save-dev
ENV NODE_ENV=development
EXPOSE 3000
EXPOSE 5173
CMD ["npm", "run", "docker:dev"]

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
COPY server.js ./
COPY .env ./
RUN npm ci --only=production
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]

# Default to development stage
FROM development