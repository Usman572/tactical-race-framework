# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Create logs and uploads directories
RUN mkdir -p logs uploads

# Expose port
EXPOSE 5005

# Environment variables (defaults)
ENV PORT=5005
ENV NODE_ENV=production

# Start script
CMD ["node", "server.js"]
