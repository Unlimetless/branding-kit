import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { google } from '@brandflow/auth/src/index'

interface GoogleCallbackQuery {
  code?: string
  state?: string
  error?: string
}

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

interface GoogleUser {
  id: string
  email: string
  name: string
  picture?: string
}

function generateState(): string {
  return crypto.randomUUID()
}

async function getGoogleAuthUrl(state: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    scope: 'openid email profile https://www.googleapis.com/auth/drive.readonly',
    access_type: 'offline',
    state,
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/auth?${params}`
}

async function getGoogleTokens(code: string): Promise<TokenResponse> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
    }),
  })
  return response.json()
}

async function getGoogleUser(accessToken: string): Promise<GoogleUser> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return response.json()
}

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/google', async (request, reply) => {
    const state = generateState()
    const url = await getGoogleAuthUrl(state)
    return { url, state }
  })

  fastify.get('/auth/google/callback', async (request: FastifyRequest<{ Querystring: GoogleCallbackQuery }>, reply: FastifyReply) => {
    const { code, state, error } = request.query

    if (error) {
      return reply.status(400).send({ error: `Google auth error: ${error}` })
    }

    if (!code) {
      return reply.status(400).send({ error: 'Missing authorization code' })
    }

    try {
      const tokens = await getGoogleTokens(code)
      const user = await getGoogleUser(tokens.access_token)

      return {
        user: {
          googleId: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.picture,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: Date.now() + tokens.expires_in * 1000,
        },
      }
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Failed to get Google tokens' })
    }
  })

  fastify.post('/auth/logout', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return reply.status(401).send({ error: 'No token provided' })
    }
    return { success: true, message: 'Logged out successfully' }
  })

  fastify.get('/auth/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const token = authHeader.substring(7)
    try {
      const user = await verifyToken(token)
      return { user }
    } catch {
      return reply.status(401).send({ error: 'Invalid or expired token' })
    }
  })
}

async function verifyToken(token: string): Promise<{ id: string; email: string; name: string }> {
  const { decode } = await import('jose')
  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  const { payload } = decode(token, secret)
  return payload as { id: string; email: string; name: string }
}