# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript after copying the source code
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
