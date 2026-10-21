# ---------- Stage 1: build ----------
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL (Debian slim doesn't include it by default in some versions)
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install deps first (better layer caching)
COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

# Generate Prisma client for Linux (Debian uses glibc, openssl 3.0)
RUN npx prisma generate

# Copy source and build TS -> dist/
COPY . .
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM node:20-slim AS runtime

WORKDIR /app

# Install OpenSSL + certificates for Prisma runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built output and prisma client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

EXPOSE 5000

EXPOSE 5000

# Run migrations, then start the API server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]