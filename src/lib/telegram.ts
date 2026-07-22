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

  const message = `
🚨 <b>ពាក្យស្នើសុំប្រាក់កម្ចីថ្មី</b>

👤 <b>ឈ្មោះ:</b> ${app.applicantName || 'មិនមាន'}
📞 <b>ទូរស័ព្ទ:</b> <code>${app.phone || 'មិនមាន'}</code>
💵 <b>ចំនួនប្រាក់:</b> <b>${formattedAmount}</b>
⏱️ <b>រយៈពេល:</b> ${app.termMonths} ខែ
📦 <b>ប្រភេទផលិតផល:</b> ${productName}
💼 <b>មុខរបរ:</b> ${app.occupation || 'មិនមាន'}
🏢 <b>ក្រុមហ៊ុន:</b> ${app.companyName || 'មិនមាន'}
💰 <b>ប្រាក់ចំណូល:</b> ${formattedIncome}
📍 <b>អាសយដ្ឋាន:</b> ${app.address || 'មិនមាន'}
📄 <b>ឯកសារ:</b> ${docCount} ឯកសារ
📅 <b>កាលបរិច្ឆេទ:</b> ${appliedDateStr}
🆔 <b>ID:</b> <code>${app.id}</code>
`;

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

export const sendTelegramStatusUpdateNotification = async (settings: AppSettings, app: LoanApplication, newStatus: string, reason?: string): Promise<boolean> => {
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

  let userMessage = `
🔔 <b>ជម្រាបសួរ ${app.applicantName || 'អ្នកស្នើសុំ'},</b>
ពាក្យស្នើសុំប្រាក់កម្ចីរបស់អ្នកត្រូវបានផ្លាស់ប្តូរស្ថានភាព។

🆔 <b>ID:</b> <code>${app.id}</code>
📦 <b>ប្រភេទផលិតផល:</b> ${productName}
💵 <b>ចំនួនប្រាក់:</b> <b>${formattedAmount}</b>

${statusEmoji} <b>ស្ថានភាពថ្មី:</b> <b>${statusText}</b>
`;

  if (newStatus === 'rejected' && reason) {
    userMessage += `📝 <b>មូលហេតុ:</b> ${reason}\n`;
  }

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
    const webhookUrl = `${domain}/api/webhook/${token}`;
    const url = `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
    
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();
    
    if (data.ok) {
      return { success: true, message: 'Webhook registered successfully!' };
    } else {
      return { success: false, message: data.description || 'Failed to register webhook.' };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error while connecting to Telegram API.' };
  }
};
