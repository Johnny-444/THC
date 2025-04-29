FROM node:18-alpine

# Install build dependencies for node-gyp if needed
RUN apk add --no-cache python3 make g++ curl

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm install

# Copy the rest of the application
COPY . .

# Output some debugging info
RUN echo "File structure before build:" && ls -la

# Build the application
RUN npm run build

# Output more debugging info
RUN echo "File structure after build:" && ls -la && \
    echo "Dist directory:" && ls -la dist && \
    echo "Dist/public directory:" && ls -la dist/public || echo "dist/public not found"

# Remove development dependencies after build is complete
RUN npm prune --production

# Set runtime environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV DEBUG=express:*

EXPOSE 5000

# Create a startup script
RUN echo '#!/bin/sh\necho "Starting server in $(pwd) with Node.js $(node -v)"\necho "Environment: $NODE_ENV"\necho "Files in current directory:"\nls -la\necho "Files in /app/dist:"\nls -la /app/dist\necho "Files in /app/dist/public:"\nls -la /app/dist/public || echo "dist/public not found"\necho "Starting application..."\nnode dist/index.js' > /app/start.sh && chmod +x /app/start.sh

# Run the application
CMD ["/app/start.sh"]
