import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { db } from '../lib/db'
import { contents, brandKits } from '@brandflow/db/src/index'

interface ContentBody {
  type: string
  platform: string
  dimensions?: string
}

interface UploadBody {
  url?: string
  base64?: string
  type: string
  platform: string
  dimensions?: string
}

export async function contentRoutes(fastify: FastifyInstance) {
  fastify.post('/contents', async (request: FastifyRequest<{ Body: ContentBody }>, reply: FastifyReply) => {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const { type, platform, dimensions } = request.body

    if (!type || !platform) {
      return reply.status(400).send({ error: 'type and platform are required' })
    }

    const validTypes = ['image', 'video', 'story']
    if (!validTypes.includes(type)) {
      return reply.status(400).send({ error: `type must be one of: ${validTypes.join(', ')}` })
    }

    const validPlatforms = ['facebook', 'instagram', 'tiktok', 'youtube']
    if (!validPlatforms.includes(platform)) {
      return reply.status(400).send({ error: `platform must be one of: ${validPlatforms.join(', ')}` })
    }

    const contentId = crypto.randomUUID()

    return reply.status(201).send({
      id: contentId,
      type,
      platform,
      dimensions,
      status: 'created',
      createdAt: new Date().toISOString(),
    })
  })

  fastify.get('/contents', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    return { contents: [], message: 'Content list endpoint' }
  })

  fastify.get('/contents/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const { id } = request.params

    return { content: { id, status: 'processing' } }
  })

  fastify.post('/contents/upload', async (request: FastifyRequest<{ Body: UploadBody }>, reply: FastifyReply) => {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const { url, base64, type, platform, dimensions } = request.body

    if (!url && !base64) {
      return reply.status(400).send({ error: 'url or base64 is required' })
    }

    if (!type || !platform) {
      return reply.status(400).send({ error: 'type and platform are required' })
    }

    const contentId = crypto.randomUUID()
    const jobId = `job_${crypto.randomUUID().slice(0, 8)}`

    return reply.status(201).send({
      id: contentId,
      jobId,
      status: 'queued',
      message: 'Content uploaded and queued for processing',
    })
  })

  fastify.post('/contents/:id/process', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const { id } = request.params
    const jobId = `job_${crypto.randomUUID().slice(0, 8)}`

    return {
      id,
      jobId,
      status: 'processing',
      message: 'AI processing started',
    }
  })

  fastify.get('/contents/:id/status', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    return {
      id: request.params.id,
      status: 'completed',
      processedUrl: 'https://storage.brandflow.ge/processed/example.jpg',
    }
  })
}