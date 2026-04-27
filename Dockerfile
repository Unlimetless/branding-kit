FROM node:22-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY brandflow/apps/web ./apps/web

WORKDIR /app/apps/web
RUN pnpm install

ENV NODE_ENV=production
RUN pnpm run build

FROM base AS runner

WORKDIR /app

COPY --from=base /app/apps/web/.next/standalone ./
COPY --from=base /app/apps/web/.next/static ./.next/static
COPY --from=base /app/apps/web/public ./public

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["node", "server.js"]