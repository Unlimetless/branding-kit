FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

FROM base AS builder
COPY . .
RUN pnpm --filter @brandflow/web build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/brandflow/apps/web/.next/standalone ./
COPY --from=builder /app/brandflow/apps/web/.next/static ./
COPY --from=builder /app/brandflow/apps/web/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
