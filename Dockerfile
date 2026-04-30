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
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/server.js ./server.js
RUN npm install --production
# Do NOT hardcode PORT here; Railway provides it automatically.
# EXPOSE is still useful as a hint.
EXPOSE 8080
CMD ["node", "server.js"]
