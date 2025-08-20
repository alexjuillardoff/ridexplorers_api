# Dockerfile

# ----- Build stage -----
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=development
# Active corepack pour pnpm
RUN corepack enable

# Copie des manifests (couvre npm et pnpm)
COPY package.json ./
COPY package-lock.json* ./
COPY pnpm-lock.yaml* ./

# Install deps (pnpm prioritaire si lock présent, sinon npm ci, sinon npm install)
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci || npm install; \
    else \
      npm install; \
    fi

# Copie des sources et build
COPY tsconfig.json ./
COPY src ./src
COPY static ./static
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm run build; \
    else \
      npm run build; \
    fi

# ----- Runtime stage -----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    TZ=Europe/Paris \
    HOST=0.0.0.0 \
    PORT=8000
RUN corepack enable

# Copie manifests et install prod deps
COPY package.json ./
COPY package-lock.json* ./
COPY pnpm-lock.yaml* ./
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install --prod --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci --omit=dev || npm install --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

# Copie du build et des assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/static ./static

# Dossier de data JSON persistant
RUN mkdir -p /app/src/db
VOLUME ["/app/src/db"]

EXPOSE 8000
# Laisse package.json décider de l’entrée exacte
CMD ["npm", "run", "start:prod"]

