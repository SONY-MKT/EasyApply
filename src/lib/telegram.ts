import { AppSettings, LoanApplication } from '../types';

export const sendTelegramNotification = async (settings: AppSettings, app: LoanApplication): Promise<boolean> => {
  if (!settings.enableTelegramNotify || !settings.telegramBotToken || !settings.telegramChatId) {
    return false;
  }

  const token = settings.telegramBotToken.trim();
  const chatId = settings.telegramChatId.trim();

  if (!token || !chatId) return false;

  const appliedDateStr = new Date(app.appliedAt || Date.now()).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const formattedAmount = (Number(app.amount) || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  const formattedIncome = app.monthlyIncome ? (Number(app.monthlyIncome) || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  }) : 'N/A';

  const docCount = app.documents?.length || 0;
  
  const productName = app.productId ? (settings.products?.find(p => p.id === app.productId)?.nameKh || app.productId) : 'មិនមាន';

  const defaultNewAppMessage = `
🚨 <b>ពាក្យស្នើសុំប្រាក់កម្ចីថ្មី</b>

👤 <b>ឈ្មោះ:</b> {{name}}
📞 <b>ទូរស័ព្ទ:</b> <code>{{phone}}</code>
💵 <b>ចំនួនប្រាក់:</b> <b>{{amount}}</b>
⏱️ <b>រយៈពេល:</b> {{term}} ខែ
📦 <b>ប្រភេទផលិតផល:</b> {{product}}
💼 <b>មុខរបរ:</b> {{occupation}}
🏢 <b>ក្រុមហ៊ុន:</b> {{company}}
💰 <b>ប្រាក់ចំណូល:</b> {{income}}
📍 <b>អាសយដ្ឋាន:</b> {{address}}
📄 <b>ឯកសារ:</b> {{docs}} ឯកសារ
📅 <b>កាលបរិច្ឆេទ:</b> {{date}}
🆔 <b>ID:</b> <code>{{id}}</code>
`.trim();

  let messageTemplate = settings.botNewApplicationMessage || defaultNewAppMessage;

  const message = messageTemplate
    .replace(/\{\{name\}\}/g, app.applicantName || 'មិនមាន')
    .replace(/\{\{phone\}\}/g, app.phone || 'មិនមាន')
    .replace(/\{\{amount\}\}/g, formattedAmount)
    .replace(/\{\{term\}\}/g, String(app.termMonths))
    .replace(/\{\{product\}\}/g, productName)
    .replace(/\{\{occupation\}\}/g, app.occupation || 'មិនមាន')
    .replace(/\{\{company\}\}/g, app.companyName || 'មិនមាន')
    .replace(/\{\{income\}\}/g, formattedIncome)
    .replace(/\{\{address\}\}/g, app.address || 'មិនមាន')
    .replace(/\{\{docs\}\}/g, String(docCount))
    .replace(/\{\{date\}\}/g, appliedDateStr)
    .replace(/\{\{id\}\}/g, app.id);

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message.trim(),
        parse_mode: 'HTML'
      })
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('Telegram Bot Notification Error:', data);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
};

export const sendTelegramStatusUpdateNotification = async (settings: AppSettings, app: LoanApplication, newStatus: string, reason?: string, adminName?: string): Promise<boolean> => {
  if (!settings.enableTelegramNotify || !settings.telegramBotToken) {
    return false;
  }

  const token = settings.telegramBotToken.trim();

  if (!token) return false;

  const getStatusTextKhmer = (status: string) => {
    switch(status) {
      case 'submitted': return 'បានបញ្ជូនបន្ត';
      case 'reviewing': return 'កំពុងពិនិត្យ';
      case 'approved': return 'បានអនុម័ត';
      case 'rejected': return 'បានបដិសេធ';
      case 'disbursed': return 'បានបើកប្រាក់';
      default: return status;
    }
  };

  const getStatusEmoji = (status: string) => {
    switch(status) {
      case 'submitted': return '📥';
      case 'reviewing': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'disbursed': return '💸';
      default: return '🔄';
    }
  };

  const statusText = getStatusTextKhmer(newStatus);
  const statusEmoji = getStatusEmoji(newStatus);

  const formattedAmount = (Number(app.amount) || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  const productName = app.productId ? (settings.products?.find(p => p.id === app.productId)?.nameKh || app.productId) : 'មិនមាន';

  const defaultMessageTemplate = `
🔔 <b>ជម្រាបសួរ {{name}},</b>
ពាក្យស្នើសុំប្រាក់កម្ចីរបស់អ្នកត្រូវបានផ្លាស់ប្តូរស្ថានភាព។

🆔 <b>ID:</b> <code>{{id}}</code>
📦 <b>ប្រភេទផលិតផល:</b> {{product}}
💵 <b>ចំនួនប្រាក់:</b> <b>{{amount}}</b>

{{emoji}} <b>ស្ថានភាពថ្មី:</b> <b>{{status}}</b>{{reason}}{{admin}}
`.trim();

  let messageTemplate = settings.botStatusUpdateMessage || defaultMessageTemplate;
  
  const reasonText = newStatus === 'rejected' && reason ? `\n📝 <b>មូលហេតុ:</b> ${reason}` : '';
  const adminText = adminName ? `\n\n👨‍💼 <b>អ្នកធ្វើបច្ចុប្បន្នភាព:</b> ${adminName}` : '';

  let userMessage = messageTemplate
    .replace(/\{\{name\}\}/g, app.applicantName || 'អ្នកស្នើសុំ')
    .replace(/\{\{id\}\}/g, app.id)
    .replace(/\{\{product\}\}/g, productName)
    .replace(/\{\{amount\}\}/g, formattedAmount)
    .replace(/\{\{emoji\}\}/g, statusEmoji)
    .replace(/\{\{status\}\}/g, statusText)
    .replace(/\{\{reason\}\}/g, reasonText)
    .replace(/\{\{admin\}\}/g, adminText);

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const promises = [];

    if (app.telegramUserId) {
      promises.push(
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: app.telegramUserId,
            text: userMessage.trim(),
            parse_mode: 'HTML'
          })
        })
      );
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }

    return true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
};
export const testTelegramNotification = async (botToken: string, chatId: string): Promise<{ success: boolean; message: string }> => {

  const token = botToken.trim();
  const id = chatId.trim();

  if (!token) return { success: false, message: 'Please enter a valid Telegram Bot Token.' };
  if (!id) return { success: false, message: 'Please enter a valid Telegram Chat ID.' };

  const message = `
🤖 <b>សារសាកល្បងពី EasyApply Bot</b>

✅ <b>ការភ្ជាប់ជោគជ័យ!</b>
ការជូនដំណឹងតាម Telegram Bot ត្រូវបានកំណត់ដោយជោគជ័យ។

📅 <b>កាលបរិច្ឆេទ:</b> ${new Date().toLocaleString()}
`;

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: id,
        text: message.trim(),
        parse_mode: 'HTML'
      })
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, message: 'Test message sent successfully to Telegram!' };
    } else {
      return { success: false, message: data.description || 'Failed to send test message. Check Bot Token or Chat ID.' };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error while connecting to Telegram API.' };
  }
};

export const registerTelegramWebhook = async (botToken: string, domain: string): Promise<{ success: boolean; message: string }> => {
  const token = botToken.trim();
  if (!token) return { success: false, message: 'Please enter a valid Telegram Bot Token.' };

  try {
    const cleanDomain = domain.replace(/\/+$/, ""); 
    const webhookUrl = `${cleanDomain}/api/webhook/${token}`;

    if (domain.includes('ais-dev') || domain.includes('localhost')) {
      // AI Studio Preview blocks external webhooks, use our custom polling endpoint instead
      // Delete any existing webhook to allow getUpdates to work
      await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);

      const res = await fetch('/api/start-polling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, domain })
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, message: 'Preview Mode: Started polling successfully instead of webhook!' };
      }
      return { success: false, message: 'Failed to start polling for preview.' };
    }

    const url = `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=true`;
    
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();
    
    if (data.ok) {
      return { success: true, message: 'Webhook registered successfully for Production!' };
    } else {
      return { success: false, message: data.description || 'Failed to register webhook.' };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error while connecting to Telegram API.' };
  }
};
