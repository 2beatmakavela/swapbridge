async function sendUnsafeReport(report, options = {}) {
  const {
    telegramBotToken,
    telegramChatId,
    discordWebhook,
    emailTo
  } = options;

  const rawJson = JSON.stringify(report, null, 2);
  const results = {};

  // Send to Telegram
  if (telegramBotToken && telegramChatId) {
    try {
      const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
      
      const telegramResponse = await fetch(telegramUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          chat_id: telegramChatId,
          text: `<b>Unsafe Report</b>\n\n<pre>${rawJson}</pre>`,
          parse_mode: "HTML"
        })
      });

      const telegramData = await telegramResponse.json();
      
      if (!telegramResponse.ok) {
        console.error('[Telegram] API error:', telegramData.description);
        results.telegram = { ok: false, error: telegramData.description };
      } else {
        results.telegram = { ok: true, messageId: telegramData.result?.message_id };
      }
    } catch (error) {
      console.error('[Telegram] Fetch error:', error.message);
      results.telegram = { ok: false, error: error.message };
    }
  }

  // Send to Discord
  if (discordWebhook) {
    try {
      const discordResponse = await fetch(discordWebhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: "```json\n" + rawJson + "\n```"
        })
      });

      if (!discordResponse.ok) {
        console.error('Discord API error:', await discordResponse.text());
        results.discord = { ok: false };
      } else {
        results.discord = { ok: true };
      }
    } catch (error) {
      console.error('Discord fetch error:', error);
      results.discord = { ok: false, error: error.message };
    }
  }

  // Log to console (email simulator)
  if (emailTo) {
    console.log("EMAIL SIMULATOR:", {
      to: emailTo,
      subject: "Unsafe Report",
      body: rawJson
    });
    results.email = { ok: true };
  }

  return {
    ok: Object.values(results).some(r => r.ok),
    report,
    results
  };
}

export { sendUnsafeReport };