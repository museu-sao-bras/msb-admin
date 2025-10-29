# Use official Node.js image to build the app
FROM node:20 AS builder

WORKDIR /app

COPY package.json bun.lockb ./
COPY . .

# Install dependencies and build
RUN npm install -g bun && bun install && bun run build

# Use official Nginx image for serving static files
FROM nginx:1.25-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]