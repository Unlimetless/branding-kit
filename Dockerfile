# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app

RUN echo $(date +%s) > /tmp/build_time.txt
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY brandflow ./brandflow

ENV NODE_ENV=development

WORKDIR /app/brandflow
RUN rm -rf node_modules && pnpm install --no-frozen-lockfile

WORKDIR /app/brandflow/apps/web
RUN pnpm build

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