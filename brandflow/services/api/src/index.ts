// BrandFlow API Server
// Fastify + TypeScript

import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

const fastify = Fastify({
  logger: true,
})

await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:4000',
  credentials: true,
})

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'development-secret',
})

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Auth routes
fastify.post('/auth/google', async (request, reply) => {
  // TODO: Implement Google OAuth
  return { url: 'https://accounts.google.com/o/oauth2/auth/...' }
})

// Content routes
fastify.post('/contents', async (request, reply) => {
  // TODO: Implement content creation
  return { id: 'cnt_xxx', status: 'created' }
})

// Subscription routes (BOG)
fastify.post('/subscriptions/create-order', async (request, reply) => {
  // TODO: Implement BOG payment order
  return { order_id: 'BF_xxx', payment_redirect_url: 'https://bog.ge/...' }
})

fastify.post('/subscriptions/webhook', async (request, reply) => {
  // TODO: Implement BOG webhook
  return { received: true }
})

const start = async () => {
  try {
    await fastify.listen({ port: Number(process.env.API_PORT) || 3000 })
    console.log(`Server running at http://localhost:3000`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()