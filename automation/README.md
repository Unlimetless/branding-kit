# BrandFlow — Otomasyon

## Genel Bakış

Bu dizin BrandFlow'un otomasyon bileşenlerini içerir.

## Dizın Yapısı

```
automation/
├── n8n-workflows/     # n8n workflow JSON dosyaları
│   ├── README.md      # Workflow dökümantasyonu
│   ├── drive-upload.json
│   ├── cleanup.json
│   ├── onboarding.json
│   ├── subscription.json
│   └── render-notify.json
└── README.md           # (bu dosya)
```

## n8n Kurulum Bilgisi

**URL**: `http://[sunucu-ip]:5678`

**Coolify'da çalışıyor**: Evet

### Webhook Endpoint'leri

| Workflow | URL | Method |
|----------|-----|--------|
| drive-upload | `/webhook/brandflow-drive-upload` | POST |
| onboarding | `/webhook/brandflow-onboarding` | POST |
| subscription | `/webhook/brandflow-subscription` | POST |
| render-notify | `/webhook/brandflow-render-complete` | POST |

### Credentials (n8n'de ayarlanacak)

| Credential | Tip | Açıklama |
|------------|-----|----------|
| minio | AWS S3 | MinIO storage erişimi |
| smtp | Email | Email gönderimi |

### Environment Variables

```
BACKEND_API_URL=http://[sunucu-ip]:3000
```

## Workflow'lar Hakkında

Detaylı bilgi için: [n8n-workflows/README.md](./n8n-workflows/README.md)

## Worker Node'ları

| Node | Amaç | Durum |
|------|------|-------|
| drive-upload | Dosyaları Drive'a yükle | ✅ Aktif |
| cleanup | Geçici dosyaları sil | ✅ Aktif |
| onboarding | Yeni kullanıcı emaili | ✅ Aktif |
| subscription | Stripe webhook işleme | ✅ Aktif |
| render-notify | Video render bildirimi | ✅ Aktif |

## Takvim

```
Her saat      → cleanup workflow çalışır
Her gün       → Stripe webhook'ları kontrol edilir
3 gün sonra   → onboarding reminder email
7 gün sonra   → subscription recovery email
```

## Monitoring

n8n logs: `docker logs [container-name] -f`

Workflow history: n8n UI → Workflows → [workflow name] → Executions