# syntax=docker/dockerfile:1.7

# Build stage: compile TypeScript and bundle React 19 application
FROM node:22-alpine AS build

WORKDIR /app

# Cache package dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy full frontend directory and compile production bundle
COPY frontend/ ./
RUN npm run build

# Runtime stage: serve static assets with Nginx Alpine
FROM nginx:alpine AS runtime

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
