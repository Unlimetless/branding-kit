import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { sql } from '../lib/db'

interface CacheBody {
  key: string
  data?: object
  ttl?: number
}

export async function aiCacheRoutes(fastify: FastifyInstance) {
  fastify.get('/ai-cache/:key', async (request: FastifyRequest<{ Params: { key: string } }>, reply: FastifyReply) => {
    const { key } = request.params

    try {
      const result = await sql('SELECT data, expires_at FROM ai_cache WHERE cache_key = $1 AND (expires_at IS NULL OR expires_at > NOW())', [key])

      if (result.length === 0) {
        return reply.status(404).send({ message: `AI cache entry not found for key: ${key}`, error: 'Not Found', statusCode: 404 })
      }

      return reply.send({
        key,
        data: result[0].data,
        hit: true,
      })
    } catch (error) {
      return reply.status(404).send({ message: `AI cache entry not found for key: ${key}`, error: 'Not Found', statusCode: 404 })
    }
  })

  fastify.post('/ai-cache', async (request: FastifyRequest<{ Body: CacheBody }>, reply: FastifyReply) => {
    const { key, data, ttl } = request.body

    if (!key) {
      return reply.status(400).send({ error: 'key is required' })
    }

    try {
      if (ttl) {
        await sql('INSERT INTO ai_cache (cache_key, data, expires_at) VALUES ($1, $2, NOW() + $3 * INTERVAL \'1 second\') ON CONFLICT (cache_key) DO UPDATE SET data = $2, expires_at = NOW() + $3 * INTERVAL \'1 second\'', [key, JSON.stringify(data || {}), ttl])
      } else {
        await sql('INSERT INTO ai_cache (cache_key, data, expires_at) VALUES ($1, $2, NULL) ON CONFLICT (cache_key) DO UPDATE SET data = $2, expires_at = NULL', [key, JSON.stringify(data || {})])
      }

      return reply.status(201).send({
        key,
        status: 'cached',
        ttl,
      })
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to cache data' })
    }
  })

  fastify.delete('/ai-cache/:key', async (request: FastifyRequest<{ Params: { key: string } }>, reply: FastifyReply) => {
    const { key } = request.params

    try {
      await sql('DELETE FROM ai_cache WHERE cache_key = $1', [key])
      return reply.send({ key, deleted: true })
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to delete cache entry' })
    }
  })
}