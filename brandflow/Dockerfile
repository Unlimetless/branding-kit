FROM node:22-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/web ./apps/web

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @brandflow/web build

FROM base AS runner

ENV NODE_ENV=production

COPY --from=base /app/apps/web/.next/standalone /app/
COPY --from=base /app/apps/web/.next/static /app/.next/static
COPY --from=base /app/apps/web/public /app/public

WORKDIR /app

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]