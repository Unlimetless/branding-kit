# BrandFlow — n8n Workflows Setup for Coolify

## Quick Import Instructions

### 1. Access n8n on Coolify
```
http://[your-server-ip]:5678
```

### 2. Import Workflow
1. Open n8n dashboard
2. Click **Workflows** → **Import from JSON**
3. Copy-paste JSON content from any workflow file

### 3. Required Credentials

Create these in n8n: **Settings → Credentials**

#### MinIO (AWS S3)
```json
{
  "awsAccessKeyId": "your_minio_access_key",
  "awsSecretAccessKey": "your_minio_secret_key",
  "endpoint": "http://localhost:9000",
  "region": "eu-central-1"
}
```

#### SMTP (Email)
```json
{
  "host": "smtp.example.com",
  "port": 587,
  "user": "noreply@brandflow.ge",
  "password": "smtp_password"
}
```

### 4. Environment Variables in n8n

In n8n: **Settings → Environment Variables**
```bash
BACKEND_API_URL=http://localhost:3000
CARVEKIT_URL=http://localhost:8000
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_URL=https://api.gemini.google.com/v1
```

---

## Workflows Summary

| File | Purpose | Webhook Path |
|------|---------|-------------|
| `drive-upload.json` | Upload processed files to Google Drive | `/webhook/brandflow-drive-upload` |
| `cleanup.json` | Delete old temp files from MinIO | Schedule (hourly) |
| `onboarding.json` | New user welcome email sequence | `/webhook/brandflow-onboarding` |
| `subscription.json` | BOG payment callback handler | `/webhook/brandflow-subscription` |
| `render-notify.json` | Video render complete → Drive upload | `/webhook/brandflow-render-complete` |
| `ai-process.json` | Background removal via CarveKit | `/webhook/brandflow-ai-process` |
| `ai-caption.json` | AI caption & hashtag generation | `/webhook/brandflow-ai-caption` |

---

## Webhook URLs

After import, each workflow will have a unique webhook URL:
```
https://[your-server]:5678/webhook/[webhook-id]
```

Update your API's n8n webhook URLs after importing.

---

## Testing

```bash
# Test drive-upload
curl -X POST http://localhost:5678/webhook/brandflow-drive-upload \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","minioBucket":"brandflow-temp","minioFilePath":"test.png","fileName":"test.png","userDriveToken":"token"}'

# Test subscription webhook (BOG simulation)
curl -X POST http://localhost:5678/webhook/brandflow-subscription \
  -H "Content-Type: application/json" \
  -d '{"order_id":"BF_test_001","status":"completed","amount":49,"currency":"GEL"}'
```

---

## Monitoring

- n8n logs: `docker logs n8n -f`
- Workflow executions: n8n UI → Workflows → [name] → Executions
- For errors: n8n UI → Workflows → [name] → Last Execution → Error Details

---

## CarveKit Note

`ai-process.json` requires CarveKit running at `CARVEKIT_URL`. If not available, the workflow will fail at the Background Remove step. You can skip this by manually disabling that node or using an alternative like remove.bg API.