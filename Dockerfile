# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
# Explicitly copy the entire dist directory
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/server.js ./server.js
RUN npm install --production
# Ensure the server uses the PORT environment variable provided by Railway
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
