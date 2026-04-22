# BrandFlow — n8n Workflows

## Overview

Bu dizin BrandFlow'un n8n otomasyon workflow'larını içerir. Her JSON dosyası n8n'e import edilerek kullanılır.

## Workflows

### 1. drive-upload.json
**Amaç**: MinIO'daki işlenmiş dosyaları kullanıcının Google Drive'ına yükler.
**Trigger**: Webhook (`POST /webhook/brandflow-drive-upload`)
**Payload**:
```json
{
  "userId": "usr_xxx",
  "minioBucket": "brandflow-temp",
  "minioFilePath": "temp/file.png",
  "fileName": "output.png",
  "userDriveToken": "ya29.xxx"
}
```
**Akış**: Download from MinIO → Upload to Google Drive (HTTP Request) → Delete from MinIO → Notify Backend

---

### 2. cleanup.json
**Amaç**: MinIO'daki 30 dakikadan eski geçici dosyaları siler.
**Trigger**: Schedule (her saat)
**Akış**: List files → Filter old files (>30min) → Loop over files → Delete each

---

### 3. onboarding.json
**Amaç**: Yeni kullanıcılara hoşgeldin emaili gönderir, 3 gün sonra hatırlatır.
**Trigger**: Webhook (`POST /webhook/brandflow-onboarding`)
**Payload**:
```json
{
  "userId": "usr_xxx",
  "name": "Nino",
  "email": "nino@example.ge",
  "locale": "ka"
}
```
**Akış**: Parse locale → Prepare email (ka/ru/en) → Send welcome → Wait 3 days → Send reminder

---

### 4. subscription.json (BOG)
**Amaç**: Bank of Georgia ödeme callback'lerini işler, kullanıcı planını günceller.
**Trigger**: Webhook (`POST /webhook/brandflow-subscription`)
**BOG Callback Payload**:
```json
{
  "order_id": "BF_prod_xxx",
  "status": "completed|failed|expired",
  "amount": 19.00,
  "currency": "GEL",
  "failure_reason": null,
  "timestamp": "2026-04-22T10:35:00Z"
}
```
**Akış**: Parse BOG callback → Determine update → Update Backend → Send email → Check recovery (3 days) → Send recovery email if failed

---

### 5. render-notify.json
**Amaç**: Video render tamamlandığında Drive'a yükler ve kullanıcıya bildirir.
**Trigger**: Webhook (`POST /webhook/brandflow-render-complete`)
**Akış**: Parse render data → Download from MinIO → Upload to Google Drive → Cleanup MinIO → Send notification email

---

### 6. ai-process.json
**Amaç**: Fotoğraf AI pipeline (arka plan silme).
**Trigger**: Webhook (`POST /webhook/brandflow-ai-process`)
**Payload**:
```json
{
  "contentId": "cnt_xxx",
  "userId": "usr_xxx",
  "operation": "full",
  "platform": "instagram_feed"
}
```
**Akış**: Parse input → Get content info → Background Remove (CarveKit) → Update content → Respond

---

### 7. ai-caption.json
**Amaç**: AI caption ve hashtag üretimi (cache'li).
**Trigger**: Webhook (`POST /webhook/brandflow-ai-caption`)
**Payload**:
```json
{
  "contentId": "cnt_xxx",
  "userId": "usr_xxx",
  "locale": "ka",
  "sector": "restaurant",
  "brandTone": "professional",
  "imageUrl": "https://..."
}
```
**Akış**: Parse input → Check cache → Generate caption (Gemini Flash) → Store cache → Update content → Respond

---

## n8n Kurulumu

### 1. Credentials Oluştur
n8n'de Settings → Credentials bölümünde:
- `minio` — AWS S3 (MinIO endpoint, access key, secret)
- `smtp` — Email gönderimi (SMTP server)

### 2. Environment Variables
n8n'de ayarlanması gereken değişkenler:
```bash
BACKEND_API_URL=http://[sunucu-ip]:3000
CARVEKIT_URL=http://[sunucu-ip]:8000
GEMINI_API_URL=https://api.gemini.google.com/v1
```

### 3. Import
Her JSON dosyasını n8n'e import et:
1. n8n dashboard → Workflows → Import from JSON
2. Dosyayı yapıştır
3. Credentials'ları node'lara bağla
4. Environment variable'ları ayarla

---

## Webhook URL'leri

Her webhook için URL:
```
https://[sunucu-ip]:5678/webhook/[webhook-id]
```

| Workflow | Webhook ID |
|----------|-----------|
| drive-upload | brandflow-drive-upload |
| onboarding | brandflow-onboarding |
| subscription | brandflow-subscription |
| render-notify | brandflow-render-complete |
| ai-process | brandflow-ai-process |
| ai-caption | brandflow-ai-caption |

---

## BOG Ödeme Entegrasyonu

### Webhook Akışı
```
BOG → POST /webhook/brandflow-subscription
        ↓
Parse callback (order_id, status, amount)
        ↓
Update Backend (/api/subscriptions/update-by-order)
        ↓
Send email (activation / failure)
        ↓
If failed → Wait 3 days → Recovery email
```

### Ödeme Durumları
| BOG Status | n8n Action |
|------------|------------|
| `completed` | Backend güncelle + email gönder |
| `failed` | Backend güncelle + email + 3 gün bekle + recovery |
| `expired` | Backend güncelle + email + recovery |
| `pending` | Logla, bekle |

---

## AI Pipeline

### CarveKit Background Removal
```javascript
// ai-process.json'da
{
  "method": "POST",
  "url": "{{ $env.CARVEKIT_URL }}/remove-background",
  "body": {
    "image_url": "{{ $json.original_url }}"
  }
}
```

### Gemini Caption Generation
```javascript
// ai-caption.json'da
{
  "method": "POST",
  "url": "{{ $env.GEMINI_API_URL }}/generate",
  "body": {
    "prompt": "Generate a social media caption for a {{ $json.sector }} business...",
    "image_url": "{{ $json.imageUrl }}",
    "locale": "{{ $json.locale }}"
  }
}
```

### Cache Stratejisi
- Cache Key: MD5(contentId + locale + operation)
- TTL: 24 saat
- Cache hit = $0 maliyet
- Cache miss = ~$0.001/istek

---

## Workflow Durumları

| Workflow | Durum | Trigger Type |
|----------|-------|-------------|
| drive-upload | ✅ Aktif | Webhook |
| cleanup | ✅ Aktif | Schedule (her saat) |
| onboarding | ✅ Aktif | Webhook |
| subscription (BOG) | ✅ Aktif | Webhook |
| render-notify | ✅ Aktif | Webhook |
| ai-process | ✅ Aktif | Webhook |
| ai-caption | ✅ Aktif | Webhook |

---

## Testing

Webhook'ları test etmek için:
```bash
# drive-upload
curl -X POST https://[sunucu]/webhook/brandflow-drive-upload \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","minioBucket":"brandflow-temp","minioFilePath":"test.png","fileName":"test.png","userDriveToken":"test_token"}'

# subscription (BOG callback simulation)
curl -X POST https://[sunucu]/webhook/brandflow-subscription \
  -H "Content-Type: application/json" \
  -d '{"order_id":"BF_test_001","status":"completed","amount":99,"currency":"GEL"}'
```

---

## Monitoring

n8n logs: `docker logs [container-name] -f`
Workflow history: n8n UI → Workflows → [workflow name] → Executions