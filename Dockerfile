# Use official Node.js image to build the app
FROM node:20 AS builder

WORKDIR /app

# copy package files first for better layer caching
COPY package.json bun.lockb ./
COPY . .

# Allow injecting the Vite environment variable at build time
# Usage: podman build --build-arg VITE_API_URL=https://msb-api.local -t localhost/msb-admin:latest .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Use bun if available in the environment; otherwise fallback to npm/yarn
# This assumes the base image has bun installed or your CI provides it.
RUN if command -v bun >/dev/null 2>&1; then \
			bun install && bun run build; \
		else \
			npm ci && npm run build; \
		fi

# Use official Nginx image for serving static files
FROM nginx:1.25-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (SPA-friendly) if present
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]