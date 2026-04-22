# BrandFlow

> "Take the photo. We handle the rest."

Gürcistan odaklı sosyal medya içerik platformu. Küçük işletme sahipleri için profesyonel, çok platformlu sosyal medya içeriği üretimi.

## Teknoloji Stack

- **Frontend**: Next.js 15 (Web), React Native (Mobile)
- **Backend**: Fastify (Node.js)
- **Database**: Neon PostgreSQL
- **Storage**: MinIO + Google Drive
- **AI**: Gemini Flash + CarveKit
- **Otomasyon**: n8n
- **Ödeme**: Bank of Georgia

## Proje Yapısı

```
brandflow/
├── apps/
│   ├── web/           # Next.js web uygulaması
│   ├── mobile/        # React Native mobil uygulaması
│   └── admin/         # Yönetim paneli
├── packages/
│   ├── auth/          # Kimlik doğrulama
│   ├── db/            # Veritabanı şeması (Drizzle ORM)
│   ├── i18n/          # Çoklu dil desteği (ka/ru/en)
│   ├── ui/            # Paylaşımlı UI bileşenleri
│   ├── brand-engine/  # Logo, renk, watermark
│   └── media-processor/ # Görsel işleme (Sharp.js)
├── services/
│   ├── api/           # Fastify API sunucusu
│   ├── render-worker/ # Video render worker
│   └── ai-gateway/    # AI servisleri
├── automation/
│   └── n8n-workflows/ # n8n otomasyon akışları
└── infra/
    ├── docker/        # Docker compose dosyaları
    └── .github/workflows/ # CI/CD
```

## Başlangıç

### Gereksinimler

- Node.js 20+
- npm 10+

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

### Environment Variables

```bash
cp .env.example .env
# .env dosyasını doldur
```

## Dokümantasyon

Detaylı mimari dokümantasyonu: [docs/BRANDFLOW_ARCHITECTURE.md](../docs/BRANDFLOW_ARCHITECTURE.md)

## Lisans

Private - Tüm hakları saklıdır.