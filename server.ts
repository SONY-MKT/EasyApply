import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for Telegram webhook
  app.post("/api/webhook/:token", async (req, res) => {
    const { token } = req.params;
    const update = req.body;

    if (update.message && update.message.text === "/start") {
      const chatId = update.message.chat.id;
      
      const welcomeMessage = `
🌟 <b>សូមស្វាគមន៍មកកាន់ EasyApply!</b>

យើងខ្ញុំផ្តល់ជូនសេវាកម្មកម្ចីប្រាក់រហ័សទាន់ចិត្ត លក្ខខណ្ឌងាយៗ និងមានទំនុកចិត្តខ្ពស់។

<b>របៀបប្រើប្រាស់៖</b>
១. ចុចប៊ូតុងខាងក្រោមដើម្បីបើកកម្មវិធី (Open App)
២. បំពេញព័ត៌មានរបស់អ្នកក្នុងទម្រង់ស្នើសុំ
៣. រង់ចាំការទាក់ទងត្រឡប់ពីក្រុមការងារយើងខ្ញុំ

<i>សូមអរគុណដែលបានជ្រើសរើសសេវាកម្មរបស់យើងខ្ញុំ!</i>
      `;

      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeMessage.trim(),
            parse_mode: 'HTML'
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
