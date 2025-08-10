# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first for better caching
COPY package*.json ./
RUN npm ci

# Copy rest and build
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy the minimal standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Healthcheck hits our endpoint. Busybox has wget.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-3000}/api/healthz" || exit 1

# Cloud Run sets $PORT; fall back to 3000 locally
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
