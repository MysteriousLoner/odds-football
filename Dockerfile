# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm test && npm run build:docker

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --chown=node:node docker/healthcheck.mjs ./docker/healthcheck.mjs
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "docker/healthcheck.mjs"]
CMD ["node", "server.js"]
