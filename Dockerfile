# Use BuildKit syntax
# syntax = docker/dockerfile:1

# Stage 1: Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy only necessary files
COPY package*.json ./
COPY core/swagger/swagger.yaml ./core/swagger/swagger.yaml
COPY docker-entrypoint.sh ./

# Install dependencies and Prism CLI
RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps && \
    npm install -g @stoplight/prism-cli@5.14.2 && \
    npx @stoplight/prism-cli --version && \
    npm list --depth=0 && \
    npm cache clean --force

# Set entrypoint and user
USER node
ENTRYPOINT ["./docker-entrypoint.sh"]

# Stage 2: Production stage
FROM node:20-alpine

WORKDIR /app

# Set environment variables and expose port
ENV NODE_OPTIONS="--max-old-space-size=512"
ENV SWAGGER_PATH="/app/core/swagger/swagger.yaml"
EXPOSE 4010

# Copy only necessary files
COPY core/swagger/swagger.yaml ./core/swagger/swagger.yaml
COPY docker-entrypoint.sh ./

# Copy only necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Set permissions
RUN chmod +x docker-entrypoint.sh

# Set user and command
USER node
CMD ["node", "--max-old-space-size=512", "./node_modules/.bin/prism", "mock", "$SWAGGER_PATH", "-p", "4010", "--host", "0.0.0.0", "--verboseLevel", "debug", "--dynamic", "--seed", "123456", "--errors", "false", "--cors", "true"]
