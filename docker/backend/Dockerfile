# Stage 1: Build NestJS application
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Generate Prisma Client
RUN npx prisma generate

RUN npm run build

# Stage 2: Production runner
FROM node:24-alpine AS runner

WORKDIR /app

COPY package*.json ./

# Only install production dependencies
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run start:prod"]
