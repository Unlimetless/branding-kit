FROM node:22-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY brandflow/apps/web/package.json brandflow/apps/web/
WORKDIR /app/brandflow/apps/web

ENV NODE_ENV=development
RUN pnpm install

WORKDIR /app

COPY brandflow/packages ./packages
COPY brandflow/apps/web ./apps/web

WORKDIR /app/brandflow/apps/web
RUN pnpm run build

FROM base AS runner

WORKDIR /app

COPY --from=base /app/brandflow/apps/web/.next/standalone ./
COPY --from=base /app/brandflow/apps/web/.next/static ./.next/static
COPY --from=base /app/brandflow/apps/web/public ./public

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["node", "server.js"]