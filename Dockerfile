# =============================================================================
# Stage 1: Build React client
# =============================================================================
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Install dependencies first (better layer caching)
COPY client/package*.json ./
RUN npm ci --silent

# Copy source and build
COPY client/ .

# Build args become VITE_ env vars at build time
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_VAPID_KEY
ARG VITE_API_URL=/api

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_VAPID_KEY=$VITE_FIREBASE_VAPID_KEY
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# =============================================================================
# Stage 2: Production Express server
# =============================================================================
FROM node:20-alpine AS production

WORKDIR /app

# Install server dependencies only
COPY server/package*.json ./
RUN npm ci --only=production --silent

# Copy server source
COPY server/ .

# Copy built React app into server's static directory
COPY --from=client-builder /app/client/dist ./client/dist

# Security: non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S clutch -u 1001 -G nodejs && \
    chown -R clutch:nodejs /app

USER clutch

# Runtime environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

CMD ["node", "server.js"]
