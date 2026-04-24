# Step 1: Base image
FROM node:22-alpine AS base
WORKDIR /app

# Step 2: Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Step 3: Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/web ./apps/web

# Step 4: Install dependencies
RUN pnpm install --frozen-lockfile

# Step 5: Build the web application
RUN pnpm --filter @brandflow/web build

# Step 6: Final image - only runtime files
FROM base AS runner

ENV NODE_ENV=production

# Copy only the built application
COPY --from=builder /app/apps/web/.next/standalone /app/
COPY --from=builder /app/apps/web/.next/static /app/.next/static
COPY --from=builder /app/apps/web/public /app/public

WORKDIR /app

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]