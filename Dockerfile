# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY mivo-backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY mivo-backend/ ./

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY mivo-backend/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port (Render will inject PORT env var)
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:${PORT:-3002}/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
