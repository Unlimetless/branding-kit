# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app

RUN echo $(date +%s) > /tmp/build_time.txt
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY brandflow/package.json brandflow/pnpm-lock.yaml brandflow/pnpm-workspace.yaml brandflow/turbo.json ./
COPY brandflow/packages ./packages
COPY brandflow/apps/web ./apps/web

ENV NODE_ENV=development

WORKDIR /app/apps/web
RUN touch package.json && rm -rf node_modules && pnpm install -w

WORKDIR /app
RUN pnpm --filter @brandflow/web build

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