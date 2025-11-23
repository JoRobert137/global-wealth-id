# --------------------------------------------------
# Stage 1: Build Frontend
# --------------------------------------------------
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
COPY frontend/tsconfig.json ./
COPY frontend/vite.config.ts ./
COPY frontend/src ./src
COPY frontend/index.html ./

RUN npm install
RUN npm run build


# --------------------------------------------------
# Stage 2: Build Backend (TypeScript → JS)
# --------------------------------------------------
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
COPY backend/tsconfig.json ./
COPY backend/src ./src

RUN npm install
RUN npm run build


# --------------------------------------------------
# Stage 3: Production Runtime
# --------------------------------------------------
FROM node:18-alpine

WORKDIR /app/backend

# Copy backend JS build output
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Create public folder & copy built frontend files
RUN mkdir -p ./dist/public
COPY --from=frontend-builder /app/frontend/dist ./dist/public

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Run backend (which serves frontend)
CMD ["node", "dist/index.js"]
