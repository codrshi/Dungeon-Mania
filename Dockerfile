# ---------- Stage 1: Build Stage ----------
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy only package.json first for better caching
COPY package.json ./

# Install all dependencies (including dev) for the build
RUN npm install

# Copy all source code
COPY . .

# ---------- Stage 2: Production Stage ----------
FROM node:20-alpine AS production

# Set environment variable for production
ENV NODE_ENV=production

WORKDIR /app

# Copy only the package.json for prod install
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built app from build stage (excluding node_modules)
COPY --from=build /app . 

# Expose app port
EXPOSE 3030

# Start the application
CMD ["node", "src/server.js"]