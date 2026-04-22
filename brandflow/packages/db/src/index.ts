// BrandFlow Database Schema
// Neon PostgreSQL with Drizzle ORM

import { pgTable, uuid, text, timestamp, boolean, numeric, jsonb } from 'drizzle-orm/pg-core'

// ----- Users -----
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name'),
  locale: text('locale').default('ka'),
  avatarUrl: text('avatar_url'),

  plan: text('plan').default('free'),
  planStatus: text('plan_status').default('active'),
  bogCustomerId: text('bog_customer_id'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
  isOnboarded: boolean('is_onboarded').default(false),
})

// ----- Brand Kits -----
export const brandKits = pgTable('brand_kits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),

  logoUrl: text('logo_url'),
  logoPosition: text('logo_position').default('bottom-right'),
  logoSize: numeric('logo_size').default('80'),

  primaryColor: text('primary_color').default('#6366F1'),
  secondaryColor: text('secondary_color'),
  textColor: text('text_color').default('#000000'),

  fontFamily: text('font_family').default('Inter'),
  fontSize: numeric('font_size').default('14'),

  sector: text('sector').default('general'),
  brandTone: text('brand_tone').default('professional'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ----- Contents -----
export const contents = pgTable('contents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),

  type: text('type').notNull(),
  originalUrl: text('original_url'),
  processedUrl: text('processed_url'),

  minioBucket: text('minio_bucket'),
  minioKey: text('minio_key'),

  platform: text('platform').notNull(),
  dimensions: text('dimensions'),

  aiCaptionKa: text('ai_caption_ka'),
  aiCaptionRu: text('ai_caption_ru'),
  aiCaptionEn: text('ai_caption_en'),
  aiHashtags: jsonb('ai_hashtags'),

  isRendered: boolean('is_rendered').default(false),
  renderJobId: text('render_job_id'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ----- Social Accounts -----
export const socialAccounts = pgTable('social_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),

  platform: text('platform').notNull(),
  platformUserId: text('platform_user_id'),
  platformUsername: text('platform_username'),

  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at'),

  isActive: boolean('is_active').default(true),
  lastSyncAt: timestamp('last_sync_at'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ----- Posts -----
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  contentId: uuid('content_id').references(() => contents.id),

  platform: text('platform').notNull(),
  platformPostId: text('platform_post_id'),

  caption: text('caption'),
  hashtags: text('hashtags'),

  scheduledAt: timestamp('scheduled_at'),
  publishedAt: timestamp('published_at'),

  status: text('status').default('draft'),
  errorMessage: text('error_message'),

  n8nTriggered: boolean('n8n_triggered').default(false),
  n8nWorkflowId: text('n8n_workflow_id'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ----- Subscriptions -----
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),

  plan: text('plan').notNull(),

  bogSubscriptionId: text('bog_subscription_id'),
  bogCustomerId: text('bog_customer_id'),

  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),

  postsThisMonth: numeric('posts_this_month').default('0'),
  postsLimit: numeric('posts_limit'),
  platformsLimit: numeric('platforms_limit').default('1'),

  status: text('status').default('active'),
  cancelledAt: timestamp('cancelled_at'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ----- Payment Orders -----
export const paymentOrders = pgTable('payment_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),

  bogOrderId: text('bog_order_id').unique(),
  merchantPaymentId: text('merchant_payment_id'),

  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('GEL'),
  description: text('description'),

  status: text('status').default('pending'),

  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  completedAt: timestamp('completed_at'),
  failureReason: text('failure_reason'),
})

// ----- AI Cache -----
export const aiCache = pgTable('ai_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),

  cacheKey: text('cache_key').notNull(),
  contentHash: text('content_hash'),
  promptHash: text('prompt_hash'),

  result: jsonb('result').notNull(),
  modelUsed: text('model_used'),

  hitCount: numeric('hit_count').default('0'),
  lastUsedAt: timestamp('last_used_at').defaultNow(),

  expiresAt: timestamp('expires_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
})

// ----- Drive Connections -----
export const driveConnections = pgTable('drive_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),

  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  tokenExpiresAt: timestamp('token_expires_at').notNull(),

  brandflowFolderId: text('brandflow_folder_id'),
  originalsFolderId: text('originals_folder_id'),
  processedFolderId: text('processed_folder_id'),
  videosFolderId: text('videos_folder_id'),

  isActive: boolean('is_active').default(true),
  lastSyncAt: timestamp('last_sync_at'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type BrandKit = typeof brandKits.$inferSelect
export type Content = typeof contents.$inferSelect
export type Post = typeof posts.$inferSelect
export type Subscription = typeof subscriptions.$inferSelect
export type PaymentOrder = typeof paymentOrders.$inferSelect