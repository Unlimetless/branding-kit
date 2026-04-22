# BrandFlow — Teknik Mimari ve Ürün Yoldığı

> **Versiyon:** 4.0
> **Son güncelleme:** Nisan 2026
> **Durum:** Mimari kesinleştirildi — Uygulama aşaması

---

## 📌 Vizyon

> "Take the photo. We handle the rest."

Gürcistan'daki küçük işletme sahipleri sosyal medya içeriklerini hâlâ elle, birden fazla uygulama kullanarak ve saatler harcayarak üretiyor. BrandFlow bu engelleri kaldırır — kullanıcı AI görmez, sadece sonucu görür.

**Slogan:**
- 🇬🇪 "გადაიღე ფოტო, დანარჩენს ჩვენ გავაკეთებთ."
- 🇷🇺 "Сфотографируй товар — остальное сделаем мы."
- 🇬🇧 "Take the photo. We handle the rest."

---

## 🎯 Hedef Kitle

| Segment | Örnek | Ödeme İsteği |
|---------|-------|-------------|
| Restoran / Kafe | Günlük menü, özel gün | Orta |
| Güzellik Salonu | Öncesi/sonrası, kampanya | Yüksek |
| Butik / Moda | Ürün tanıtımı, sezon | Yüksek |
| İnşaat / Mimarlık | Proje showcase | Yüksek |
| Küçük üretici / esnaf | Basit ürün paylaşımı | Düşük |

**Öncelikli Pazar:** Gürcistan (Tiflis başlangıç)
**Genişleme:** Azerbaycan, Ermenistan, Türkiye

---

## 🏗️ Teknoloji Stack

### Frontend
```
Web:        Next.js 15 (App Router) + TypeScript
Mobile:     React Native + Expo
Desktop:    Tauri (gelecek faz)
UI:         Tamagui (web + mobile paylaşımlı)
State:      Zustand + TanStack Query
Canvas:     Konva.js (web) + Skia (mobile)
i18n:       next-intl + i18next
```

### Backend
```
API:        Fastify (Node.js) — hafif, hızlı
Database:   Neon PostgreSQL (EU, Finland)
Cache:      AI response cache (PostgreSQL tablosu)
Storage:    MinIO (Coolify'da self-hosted) — S3 uyumlu
Queue:      BullMQ + Redis (Coolify'da)
Auth:       Better Auth (JWT + OAuth)
```

### AI Servisleri
```
Arka plan silme:  CarveKit (self-hosted, Coolify)
Görsel iyileştirme: Real-ESRGAN (Faz 4'te)
Caption üretici:  Gemini Flash (~ $0.001/istek)
Hashtag öneri:    Gemini Flash
Video render:      FFmpeg (VPS'te, ücretsiz)
```

### Otomasyon
```
n8n (Coolify'da) — tüm workflow'ları yönetir
```

### Ödeme
```
Bank of Georgia (BOG) Payment API — RESTful, OAuth 2.0
```

---

## 📊 Veritabanı Schema (Neon PostgreSQL)

### Tablolar

```sql
-- users: Ana kullanıcı tablosu
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  locale TEXT DEFAULT 'ka', -- 'ka' | 'ru' | 'en'
  avatar_url TEXT,

  plan TEXT DEFAULT 'free', -- 'free' | 'starter' | 'pro' | 'agency'
  plan_status TEXT DEFAULT 'active', -- 'active' | 'cancelled' | 'past_due'
  bog_customer_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  is_onboarded BOOLEAN DEFAULT FALSE
);

-- brand_kits: Marka kimliği (logo, renk, font)
CREATE TABLE brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  logo_url TEXT,
  logo_position TEXT DEFAULT 'bottom-right',
  logo_size INTEGER DEFAULT 80,

  primary_color TEXT DEFAULT '#6366F1',
  secondary_color TEXT,
  text_color TEXT DEFAULT '#000000',

  font_family TEXT DEFAULT 'Inter',
  font_size INTEGER DEFAULT 14,

  sector TEXT DEFAULT 'general',
  brand_tone TEXT DEFAULT 'professional',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- contents: Üretilen içerikler
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  type TEXT NOT NULL, -- 'image' | 'video' | 'carousel'
  original_url TEXT,
  processed_url TEXT,

  minio_bucket TEXT,
  minio_key TEXT,

  platform TEXT NOT NULL,
  dimensions TEXT,

  ai_caption_ka TEXT,
  ai_caption_ru TEXT,
  ai_caption_en TEXT,
  ai_hashtags JSONB,

  is_rendered BOOLEAN DEFAULT FALSE,
  render_job_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- social_accounts: Bağlı sosyal medya hesapları
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  platform TEXT NOT NULL, -- 'instagram' | 'facebook' | 'tiktok' | 'linkedin'
  platform_user_id TEXT,
  platform_username TEXT,

  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, platform)
);

-- posts: Yayınlanmış veya zamanlanmış postlar
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES contents(id) ON DELETE SET NULL,

  platform TEXT NOT NULL,
  platform_post_id TEXT,

  caption TEXT,
  hashtags TEXT,

  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  status TEXT DEFAULT 'draft', -- 'draft' | 'scheduled' | 'published' | 'failed'
  error_message TEXT,

  n8n_triggered BOOLEAN DEFAULT FALSE,
  n8n_workflow_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- subscriptions: Abonelik bilgisi
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  plan TEXT NOT NULL,

  bog_subscription_id TEXT,
  bog_customer_id TEXT,

  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,

  posts_this_month INTEGER DEFAULT 0,
  posts_limit INTEGER,
  platforms_limit INTEGER DEFAULT 1,

  status TEXT DEFAULT 'active', -- 'active' | 'cancelled' | 'past_due'
  cancelled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- payment_orders: BOG order takibi
CREATE TABLE payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),

  bog_order_id TEXT UNIQUE,
  merchant_payment_id TEXT,

  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'GEL',
  description TEXT,

  status TEXT DEFAULT 'pending', -- 'pending' | 'completed' | 'failed' | 'expired'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failure_reason TEXT
);

-- ai_cache: AI çıktı cache (maliyet optimizasyonu)
CREATE TABLE ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  cache_key TEXT NOT NULL,
  content_hash TEXT,
  prompt_hash TEXT,

  result JSONB NOT NULL,
  model_used TEXT,

  hit_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),

  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, cache_key)
);

CREATE INDEX idx_ai_cache_expires ON ai_cache(expires_at);

-- drive_connections: Google Drive bağlantıları
CREATE TABLE drive_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,

  brandflow_folder_id TEXT,
  originals_folder_id TEXT,
  processed_folder_id TEXT,
  videos_folder_id TEXT,

  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);
```

### İndeksler

```sql
CREATE INDEX idx_contents_user_id ON contents(user_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled ON posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_payment_orders_bog_id ON payment_orders(bog_order_id);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);
CREATE INDEX idx_payment_orders_expires ON payment_orders(expires_at) WHERE status = 'pending';
```

---

## 🌐 API Endpoint Tasarımı

### Base URL
```
https://api.brandflow.ge/v1
Auth: Bearer token (JWT)
Content-Type: application/json
Accept-Language: ka | ru | en
```

### 1. Auth Endpoints
```
POST   /auth/google              → Google OAuth redirect URL al
GET    /auth/google/callback     → OAuth callback, token döner
POST   /auth/refresh              → Refresh token ile yeni access token
DELETE /auth/logout               → Token iptal et
GET    /auth/me                   → Mevcut kullanıcı bilgisi
```

### 2. User Endpoints
```
GET    /users/:id                         → Kullanıcı bilgisi
PATCH  /users/:id                         → Kullanıcı güncelle
GET    /users/:id/drive-token             → n8n için Drive token
GET    /users/:id/activity                → Onboarding reminder kontrolü
```

### 3. Brand Kit Endpoints
```
GET    /brand-kits                → Tüm brand kit'ler
POST   /brand-kits                → Yeni brand kit oluştur
GET    /brand-kits/:id            → Brand kit detay
PATCH  /brand-kits/:id            → Brand kit güncelle
DELETE /brand-kits/:id            → Brand kit sil
```

### 4. Content Endpoints
```
GET    /contents                  → Tüm içerikler
POST   /contents                  → Yeni içerik oluştur
GET    /contents/:id              → İçerik detay
DELETE /contents/:id              → İçerik sil
POST   /contents/:id/process      → AI işlem başlat
GET    /contents/:id/ai-caption   → AI caption al
```

### 5. Social Accounts Endpoints
```
GET    /social-accounts                    → Bağlı hesaplar
POST   /social-accounts/instagram/connect   → Instagram OAuth
POST   /social-accounts/facebook/connect   → Facebook OAuth
DELETE /social-accounts/:id                 → Hesap kes
POST   /social-accounts/:id/refresh         → Token yenile
```

### 6. Post Endpoints
```
GET    /posts                 → Tüm postlar
POST   /posts                 → Post oluştur
GET    /posts/:id             → Post detay
PATCH  /posts/:id             → Post güncelle
DELETE /posts/:id             → Post sil
POST   /posts/:id/publish     → Hemen yayınla
POST   /posts/:id/schedule     → Zamanla
DELETE /posts/:id/cancel-schedule → Zamanlamayı iptal
```

### 7. AI Endpoints
```
POST   /ai/caption      → Caption üret
POST   /ai/hashtags     → Hashtag öner
POST   /ai/analyze      → Görsel analiz
POST   /ai/bg-remove    → Arka plan kaldır
```

### 8. Subscription Endpoints (BOG)
```
GET    /subscriptions/current          → Mevcut plan

POST   /subscriptions/create-order      → BOG order oluştur
GET    /subscriptions/payment-status/:id → Ödeme durumu
POST   /subscriptions/webhook          → BOG callback
POST   /subscriptions/manage            → Abonelik yönetimi
GET    /subscriptions/invoices          → Fatura geçmişi
```

### 9. Drive Endpoints
```
POST   /drive/upload-complete   → n8n callback
GET    /drive/folders           → Klasör yapısı
```

---

## 🧩 n8n Workflows

### Workflow Listesi

| Dosya | Trigger | Amaç |
|-------|---------|------|
| `drive-upload.json` | Webhook | MinIO → Google Drive |
| `cleanup.json` | Schedule (her saat) | 30 dk+ dosyaları sil |
| `onboarding.json` | Webhook | Hoşgeldin + 3 gün hatırlat |
| `subscription.json` | Webhook (BOG) | Ödeme işleme + recovery |
| `render-notify.json` | Webhook | Video hazır → Drive → email |
| `ai-process.json` | Webhook | AI pipeline (bg removal) |
| `ai-caption.json` | Webhook | Caption üretimi + cache |

### Environment Variables (n8n)
```bash
BACKEND_API_URL=http://[sunucu-ip]:3000
CARVEKIT_URL=http://[sunucu-ip]:8000
GEMINI_API_URL=https://api.gemini.google.com/v1
```

### Credentials (n8n'de ayarlanacak)
```
minio   → AWS S3 (MinIO endpoint, access key, secret)
smtp    → Email gönderimi (SMTP server)
```

---

## 💰 Ödeme Sistemi — Bank of Georgia

### BOG Ödeme Akışı

```
1. Kullanıcı → Plan seçer → "Öde" butonu
2. Backend → POST /subscriptions/create-order
3. BOG API → order_id + redirect_url döner
4. Backend → n8n'e webhook atar (order_id ile)
5. Kullanıcı → BOG payment page'e yönlenir
6. Kullanıcı → Ödeme yapar
7. BOG → Backend callback gönderir
8. n8n subscription workflow tetiklenir
9. Backend → subscription tablosunu günceller
10. Kullanıcı → Email ile bilgilendirilir
```

### BOG Callback Payload
```json
{
  "order_id": "BF_prod_20260422_xxx",
  "status": "completed",
  "amount": 19.00,
  "currency": "GEL",
  "failure_reason": null,
  "timestamp": "2026-04-22T10:35:00Z"
}
```

### Ödeme Durumları
| BOG Status | Action |
|-------------|--------|
| `completed` | Planı aktif et, email gönder |
| `failed` | Hata email, 3 gün bekle, recovery email |
| `expired` | Yeni order iste, recovery email |

---

## 🤖 AI Pipeline

### Pipeline Mimarisi

```
Kullanıcı fotoğraf yükler
        ↓
Backend: MinIO'ya kaydet, DB'ye content oluştur
        ↓
n8n webhook tetiklenir
        ↓
┌──────────────────────────────────┐
│  1. BG Remove (CarveKit)          │
│  2. Resize (Sharp.js)             │
│  3. Watermark (Sharp.js)          │
│  4. Caption (Gemini Flash)        │
│  5. Hashtags (Gemini Flash)       │
│  6. Drive Upload                  │
└──────────────────────────────────┘
        ↓
Kullanıcıya bildirim
```

### AI Maliyet Optimizasyonu

```
Cache Key = MD5(contentId + locale + operation)
TTL = 24 saat
Cache hit = $0 maliyet
Cache miss = ~$0.001/istek (Gemini Flash)
```

### Platform Boyutları

| Platform | Boyut | Oran |
|----------|-------|------|
| Instagram Feed | 1080×1080 | 1:1 |
| Instagram Feed V | 1080×1350 | 4:5 |
| Instagram Story | 1080×1920 | 9:16 |
| Facebook Post | 1200×630 | 1.91:1 |
| TikTok | 1080×1920 | 9:16 |

---

## 📁 Dosya Yapısı

```
brandflow/
├── automation/
│   ├── n8n-workflows/
│   │   ├── README.md
│   │   ├── drive-upload.json
│   │   ├── cleanup.json
│   │   ├── onboarding.json
│   │   ├── subscription.json  (BOG)
│   │   ├── render-notify.json
│   │   ├── ai-process.json
│   │   └── ai-caption.json
│   └── README.md
├── apps/
│   ├── web/
│   ├── mobile/
│   └── admin/
├── packages/
│   ├── auth/
│   ├── db/
│   ├── ui/
│   ├── i18n/
│   ├── brand-engine/
│   └── media-processor/
├── services/
│   ├── api/
│   ├── render-worker/
│   └── ai-gateway/
├── infra/
│   ├── docker/
│   └── .github/workflows/
└── docs/
    └── BRANDFLOW_ARCHITECTURE.md  (bu dosya)
```

---

## 💵 Fiyatlandırma

| Plan | Fiyat (GEL) | İçerik/ay | Platform |
|------|-------------|-----------|----------|
| Free | 0 | 5 | 1 |
| Starter | 49/ay | 30 | 3 |
| Pro | 99/ay | Sınırsız | Tümü |
| Agency | 249/ay | Sınırsız | Tümü + 3 kullanıcı |

---

## 🚀 Faz Planı

### Faz 0 — Altyapı (1-2 hafta)
- [ ] GitHub repo kurulumu
- [ ] Coolify servisleri (PostgreSQL, Redis, MinIO, CarveKit)
- [ ] n8n workflow'ları kurulumu
- [ ] Neon DB schema deployment

### Faz 1 — MVP (10-12 hafta)
- [ ] Web uygulaması (Next.js)
- [ ] Google OAuth + Drive entegrasyonu
- [ ] Fotoğraf yükleme + AI caption
- [ ] Instagram + Facebook entegrasyonu
- [ ] BOG ödeme entegrasyonu
- [ ] 3 dil desteği (ka/ru/en)

### Faz 2 — Büyüme (8-10 hafta)
- [ ] React Native mobil uygulama
- [ ] Görsel editor (boyutlandırma, logo, watermark)
- [ ] Video render (FFmpeg)
- [ ] Yayın takvimi
- [ ] TikTok + LinkedIn entegrasyonu

### Faz 3 — Genişleme (6-8 hafta)
- [ ] AI derinleştirme (Real-ESRGAN)
- [ ] Desktop app (Tauri)
- [ ] Analitik dashboard
- [ ] Agency planı

---

## ✅ Başarı Metrikleri

| Faz | Metrik | Hedef |
|-----|--------|-------|
| Faz 0 | Tüm servisler ayakta | ✅ |
| Faz 1 Beta | Aktif beta kullanıcı | 30 |
| Faz 1 Beta | Haftalık içerik üretim oranı | %50+ |
| Faz 2 Lansman | Aylık aktif kullanıcı | 200 |
| Faz 2 Lansman | Freemium → Pro dönüşüm | %8-12 |
| Faz 2 Lansman | MRR | ₾10,000+ |

---

## 🔑 Kritik Kararlar

| Karar | Seçim | Neden |
|-------|-------|-------|
| Database | Neon PostgreSQL | EU lokasyon, PostgreSQL, serverless |
| Ödeme | BOG API | Gürcistan'da yaygın, VISA/MC destekler |
| AI | Gemini Flash + CarveKit | Maliyet etkin, self-hosted bg removal |
| Storage | Google Drive (kullanıcının) | $0 maliyet, kullanıcı verisi kullanıcıda |
| Otomasyon | n8n | Visual workflow, retry hazır, backend aptal kalır |
| Video | FFmpeg | VPS'te çalışır, $0 maliyet |

---

*Mimari v4.0 — Nisan 2026*
*BrandFlow — Gürcistan odaklı sosyal medja içerik platformu*