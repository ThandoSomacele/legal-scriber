# Build stage
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Development stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
COPY server.js ./
COPY .env ./
RUN npm ci --only=production
RUN npm install concurrently nodemon --save-dev

EXPOSE 3000
EXPOSE 5173

CMD ["npm", "run", "docker:dev"]