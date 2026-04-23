import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

interface CreateOrderBody {
  plan: string
  amount: number
  currency?: string
}

interface WebhookBody {
  merchant_payment_id?: string
  status?: string
  amount?: number
}

const BOG_API_URL = process.env.BOG_API_URL || 'https://api.bog.ge'
const BOG_CLIENT_ID = process.env.BOG_CLIENT_ID
const BOG_CLIENT_SECRET = process.env.BOG_CLIENT_SECRET

interface BOGAccessTokenResponse {
  access_token: string
  expires_in: number
}

async function getBOGAccessToken(): Promise<string> {
  const response = await fetch(`${BOG_API_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: BOG_CLIENT_ID!,
      client_secret: BOG_CLIENT_SECRET!,
    }),
  })

  if (!response.ok) {
    throw new Error(`BOG token error: ${response.status}`)
  }

  const data = (await response.json()) as BOGAccessTokenResponse
  return data.access_token
}

async function createBOGPaymentOrder(accessToken: string, amount: number, description: string) {
  const response = await fetch(`${BOG_API_URL}/api/v1/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      amount,
      currency: 'GEL',
      description,
      callback_url: process.env.BOG_CALLBACK_URL,
    }),
  })

  if (!response.ok) {
    throw new Error(`BOG payment error: ${response.status}`)
  }

  return response.json()
}

export async function subscriptionRoutes(fastify: FastifyInstance) {
  fastify.post('/subscriptions/create-order', async (request: FastifyRequest<{ Body: CreateOrderBody }>, reply: FastifyReply) => {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const { plan, amount, currency = 'GEL' } = request.body

    if (!plan || !amount) {
      return reply.status(400).send({ error: 'plan and amount are required' })
    }

    const validPlans = ['starter', 'professional', 'enterprise']
    if (!validPlans.includes(plan)) {
      return reply.status(400).send({ error: `plan must be one of: ${validPlans.join(', ')}` })
    }

    if (amount <= 0) {
      return reply.status(400).send({ error: 'amount must be positive' })
    }

    try {
      const accessToken = await getBOGAccessToken()
      const orderId = `BF_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
      const description = `BrandFlow ${plan} subscription`

      const bogOrder = await createBOGPaymentOrder(accessToken, amount, description)

      return {
        orderId,
        bogOrderId: bogOrder.order_id,
        amount,
        currency,
        status: 'pending',
        paymentRedirectUrl: bogOrder.redirect_url,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Failed to create BOG payment order' })
    }
  })

  fastify.get('/subscriptions/plans', async (request, reply) => {
    return {
      plans: [
        {
          id: 'starter',
          name: 'Starter',
          price: 49,
          currency: 'GEL',
          postsPerMonth: 30,
          platforms: 2,
          features: ['AI caption generation', 'Background removal', 'Multi-platform posting'],
        },
        {
          id: 'professional',
          name: 'Professional',
          price: 149,
          currency: 'GEL',
          postsPerMonth: 100,
          platforms: 5,
          features: ['Everything in Starter', 'Priority AI processing', 'Brand kit customization', 'Analytics'],
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 499,
          currency: 'GEL',
          postsPerMonth: -1,
          platforms: -1,
          features: ['Everything in Professional', 'Unlimited posts', 'White-label options', 'Dedicated support'],
        },
      ],
    }
  })

  fastify.post('/subscriptions/webhook', async (request: FastifyRequest<{ Body: WebhookBody }>, reply: FastifyReply) => {
    const { merchant_payment_id, status, amount } = request.body

    fastify.log.info({ merchant_payment_id, status, amount }, 'BOG webhook received')

    if (status === 'completed') {
      return { received: true, processed: true }
    }

    if (status === 'failed') {
      return { received: true, processed: true, note: 'Order marked as failed' }
    }

    return { received: true, processed: false, note: 'Status not handled' }
  })

  fastify.get('/subscriptions/current', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    return {
      subscription: {
        plan: 'starter',
        status: 'active',
        postsThisMonth: 5,
        postsLimit: 30,
        currentPeriodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      },
    }
  })
}