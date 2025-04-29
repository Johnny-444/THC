FROM node:18-alpine

# Install build dependencies for node-gyp if needed
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies after build is complete
RUN npm prune --production

# Set runtime environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Run the application
CMD ["npm", "start"]
