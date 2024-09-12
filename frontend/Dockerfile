# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install 'serve' globally
RUN npm install -g serve

# Copy the rest of the application
COPY . .

# Build the app for production
RUN npm run build

# Serve the app
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
