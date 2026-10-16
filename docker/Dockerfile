# ==== Project Builder Image ===
FROM node:24  AS build

# Install pnpm
RUN npm install --global pnpm

WORKDIR /app

# Copy workspace root
COPY ./package*.json .npmrc pnpm-*.yaml tsconfig.common.json ./

# Copy source folders.
COPY ./packages/core ./packages/core
COPY ./packages/application ./packages/application
COPY ./packages/infrastructure ./packages/infrastructure
COPY ./packages/ioc ./packages/ioc


# Also add cli
COPY  ./packages/presentation/cli ./packages/presentation/cli

# WORKSPACE SCRIPTS HERE
# COPY ./scripts/some-task.js ./scripts/some-task.js

# Install dependencies
RUN pnpm fetch
RUN pnpm install --prefer-offline

# build each packages
RUN pnpm exec tsc --project packages/core
RUN pnpm exec tsc --project packages/application
RUN pnpm exec tsc --project packages/infrastructure/database
RUN pnpm exec tsc --project packages/infrastructure/http
RUN pnpm exec tsc --project packages/infrastructure/redis
RUN pnpm exec tsc --project packages/ioc
RUN pnpm exec tsc --project packages/presentation/cli


FROM build AS http-oauth

# Install pnpm (needed for runtime)
RUN npm install --global pnpm

# Create app directory (with user `node`)
WORKDIR /app

# Copy sources from build stage
COPY --from=build /app/package*.json /app/.npmrc /app/pnpm-*.yaml ./
COPY --from=build /app/packages ./packages

# Copy Application sources files
COPY  ./packages/presentation/http-oauth ./packages/presentation/http-oauth

# Install only production dependencies
RUN pnpm install --prefer-offline
RUN pnpm exec tsc --project packages/presentation/http-oauth

# Should add node security options
CMD [ "node", "--enable-source-maps", "packages/presentation/http-oauth"]

# ==== Presenation Application Target Image ===
FROM build AS worker

# Install pnpm (needed for runtime)
RUN npm install --global pnpm

# Create app directory (with user `node`)
WORKDIR /app

# Copy sources from build stage
COPY --from=build /app/package*.json /app/.npmrc /app/pnpm-*.yaml ./
COPY --from=build /app/packages ./packages

# Copy Application sources files
COPY  ./packages/presentation/worker ./packages/presentation/worker

# Install only production dependencies
RUN pnpm install --prefer-offline
RUN pnpm exec tsc --project packages/presentation/worker

# Should add node security options
CMD [ "node", "--enable-source-maps", "packages/presentation/worker"]