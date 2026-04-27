FROM node:22-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY brandflow/package.json brandflow/pnpm-lock.yaml brandflow/pnpm-workspace.yaml brandflow/turbo.json ./
COPY brandflow/packages ./packages
COPY brandflow/apps/web ./apps/web

RUN rm -rf node_modules && pnpm install --ignore-scripts --include=devDependencies
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