# Dockerfile for AI Quiz Generator backend

# Use the official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the port the server runs on (default 5000)
EXPOSE 5000

# Define the command to run the server
CMD ["node", "server.js"]
