# syntax=docker/dockerfile:1.6

# ---------- Stage 1: Install production dependencies ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Copy manifests first so this layer is cached when only source code changes.
COPY package.json package-lock.json* ./

# Install only the production dependencies into /app/node_modules. We prefer
# `npm ci` when a lockfile is present so the install is reproducible.
RUN if [ -f package-lock.json ]; then \
        npm ci --omit=dev; \
    else \
        npm install --omit=dev --no-audit --no-fund; \
    fi

# ---------- Stage 2: Final image ----------
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3030

# Run as the non-root `node` user that the base image already provides.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src

USER node
EXPOSE 3030

CMD ["node", "src/server.js"]
