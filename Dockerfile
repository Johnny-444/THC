FROM node:20-slim

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json* ./

# Install dependencies with specific flags to handle errors better
RUN npm ci --only=production --no-audit --no-fund --prefer-offline --loglevel verbose --fetch-timeout=300000 || \
    (npm cache clean --force && npm install --no-audit --no-fund --prefer-offline --loglevel verbose --fetch-timeout=300000)

# Copy the rest of the application
COPY . .

# Build the application
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Set runtime environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Run the application
CMD ["npm", "start"]
