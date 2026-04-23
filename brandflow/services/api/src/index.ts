import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import { authRoutes } from './routes/auth'
import { contentRoutes } from './routes/content'
import { subscriptionRoutes } from './routes/subscriptions'
import { aiCacheRoutes } from './routes/ai-cache'

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
})

await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:4000',
  credentials: true,
})

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'development-secret-change-in-production',
})

await fastify.register(authRoutes, { prefix: '/auth' })
await fastify.register(contentRoutes, { prefix: '/contents' })
await fastify.register(subscriptionRoutes, { prefix: '/subscriptions' })
await fastify.register(aiCacheRoutes, { prefix: '/ai-cache' })

fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  version: '1.0.0',
}))

fastify.get('/', async () => ({
  name: 'BrandFlow API',
  version: '1.0.0',
  endpoints: [
    'GET /health',
    'POST /auth/google',
    'GET /auth/google/callback',
    'POST /auth/logout',
    'GET /auth/me',
    'POST /contents',
    'GET /contents',
    'GET /contents/:id',
    'POST /contents/upload',
    'POST /contents/:id/process',
    'GET /contents/:id/status',
    'POST /subscriptions/create-order',
    'GET /subscriptions/plans',
    'POST /subscriptions/webhook',
    'GET /subscriptions/current',
  ],
}))

const start = async () => {
  try {
    const port = Number(process.env.API_PORT) || 3000
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`BrandFlow API running at http://localhost:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()