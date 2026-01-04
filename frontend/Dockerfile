FROM node:18-alpine

# Create non-root user (use UID/GID 1001 to avoid conflicts with common defaults)
RUN addgroup -g 1001 appuser 2>/dev/null || \
    (getent group 1001 > /dev/null && echo "Group 1001 exists, continuing...") || true && \
    adduser -D -u 1001 -G appuser appuser 2>/dev/null || \
    (getent passwd appuser > /dev/null && echo "User appuser exists, continuing...") || true

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Note: Vite will serve from the frontend directory root
# with src/ as the source and public/ as the public directory

# Change ownership (use numeric ID to avoid issues if user/group names differ)
RUN chown -R 1001:1001 /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Start development server (use production build in production)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
