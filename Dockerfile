FROM node:16-alpine

# Install build dependencies for node-gyp if needed
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json* ./

# Install dependencies using a simpler approach
RUN npm install --production

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Set runtime environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Run the application
CMD ["npm", "start"]
