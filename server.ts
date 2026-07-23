import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function getTelegramSettings() {
  const defaultMsg = `✨ <b>សូមស្វាគមន៍មកកាន់ EasyApply!</b>

យើងខ្ញុំផ្តល់ជូនសេវាកម្មកម្ចីប្រាក់ <b>រហ័សទាន់ចិត្ត</b> ⚡️ លក្ខខណ្ឌងាយៗ និងមានទំនុកចិត្តខ្ពស់។ 🤝

🎯 <b>របៀបប្រើប្រាស់៖</b>
1️⃣ ចុចប៊ូតុងខាងក្រោមដើម្បី <b>បើកកម្មវិធី</b> (Open App) 🚀
2️⃣ បំពេញព័ត៌មានរបស់អ្នកក្នុងទម្រង់ស្នើសុំ 📝
3️⃣ រង់ចាំការទាក់ទងត្រឡប់ពីក្រុមការងារយើងខ្ញុំ 📞

<i>សូមអរគុណដែលបានជ្រើសរើសសេវាកម្មរបស់យើងខ្ញុំ! 🙏</i>`;
  const defaultButtons = [
    [{ text: '🚀 បើកកម្មវិធី (Open App)', type: 'web_app', url: '' }]
  ];
  
  let welcomeMessage = defaultMsg;
  let buttons = defaultButtons;

  try {
    const res = await fetch("https://firestore.googleapis.com/v1/projects/caramel-ring-652jj/databases/ai-studio-easyapply-7588218e-27a1-4284-9544-6776b83abbc3/documents/settings/main");
    if (res.ok) {
      const data = await res.json();
      if (data.fields?.botWelcomeMessage?.stringValue) {
        welcomeMessage = data.fields.botWelcomeMessage.stringValue;
      }
      if (data.fields?.telegramButtons?.arrayValue?.values) {
         const btnValues = data.fields.telegramButtons.arrayValue.values;
         buttons = btnValues.map((v: any) => {
            const fields = v.mapValue?.fields;
            if (!fields) return null;
            const text = fields.text?.stringValue || '';
            const type = fields.type?.stringValue || 'web_app';
            const url = fields.url?.stringValue || '';
            return [{ text, type, url }];
         }).filter(Boolean);
      }
    }
  } catch (err) {
    console.error("Failed to fetch settings from Firestore REST:", err);
  }
  return { welcomeMessage, buttons };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory state for polling
  let activePollingTokens: Record<string, NodeJS.Timeout> = {};

  // API route for starting Telegram polling (for AI Studio Preview)
  app.post("/api/start-polling", async (req, res) => {
    const { token, domain } = req.body;
    if (!token) return res.status(400).send("Token required");

    // Stop existing polling
    if (activePollingTokens[token]) {
      clearInterval(activePollingTokens[token]);
    }

    try {
      // First, delete any existing webhook to enable polling
      await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
      console.log("Webhook deleted for polling on token:", token.substring(0, 5) + "...");
    } catch (e) {
      console.error("Failed to delete webhook");
    }

    let offset = 0;
    activePollingTokens[token] = setInterval(async () => {
      try {
        const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=10`);
        const data = await response.json();
        
        if (data.ok && data.result.length > 0) {
          for (const update of data.result) {
            offset = update.update_id + 1;
            
            if (update.message && update.message.text && update.message.text.startsWith("/start")) {
              const chatId = update.message.chat.id;
              
              const settings = await getTelegramSettings();
              const welcomeMessage = settings.welcomeMessage;

              // Construct the Web App URL dynamically
              const webAppUrl = domain || `https://ais-pre-uo6f7u2y4c4nci7ghy5fwj-478837881768.asia-southeast1.run.app`;

              const inline_keyboard = settings.buttons.map(row => {
                 return row.map(btn => {
                    if (btn.type === 'url' && btn.url) {
                       return { text: btn.text, url: btn.url };
                    } else {
                       return { text: btn.text, web_app: { url: btn.url || webAppUrl } };
                    }
                 });
              });

              try {
                await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: chatId,
                    text: welcomeMessage.trim(),
                    parse_mode: 'HTML',
                    reply_markup: {
                      inline_keyboard
                    }
                  })
                });
              } catch (err) {
                console.error("Failed to send welcome message via polling:", err);
              }
            }
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000); // poll every 2 seconds

    res.json({ success: true, message: "Started polling successfully" });
  });

  // API route for Telegram webhook
  app.post("/api/webhook/:token", async (req, res) => {
    const { token } = req.params;
    const update = req.body;

    console.log("Received webhook for token:", token.substring(0, 5) + "...");
    console.log("Update body:", JSON.stringify(update, null, 2));

    if (update.message && update.message.text && update.message.text.startsWith("/start")) {
      const chatId = update.message.chat.id;
      
      const settings = await getTelegramSettings();
      const welcomeMessage = settings.welcomeMessage;

      // Construct the Web App URL dynamically
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const webAppUrl = `${protocol}://${host}/`;

      const inline_keyboard = settings.buttons.map(row => {
         return row.map(btn => {
            if (btn.type === 'url' && btn.url) {
               return { text: btn.text, url: btn.url };
            } else {
               return { text: btn.text, web_app: { url: btn.url || webAppUrl } };
            }
         });
      });

      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeMessage.trim(),
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard
            }
          })
        });
      } catch (err) {
        console.error("Failed to send welcome message:", err);
      }
    }

    res.sendStatus(200);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
