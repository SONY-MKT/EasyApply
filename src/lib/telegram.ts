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

  const message = `
🚨 <b>ពាក្យស្នើសុំប្រាក់កម្ចីថ្មី / NEW LOAN APPLICATION</b>

👤 <b>ឈ្មោះ / Applicant:</b> ${app.applicantName || 'N/A'}
📞 <b>ទូរស័ព្ទ / Phone:</b> <code>${app.phone || 'N/A'}</code>
💵 <b>ចំនួនប្រាក់ / Amount:</b> <b>${formattedAmount}</b>
⏱️ <b>រយៈពេល / Tenure:</b> ${app.termMonths} ខែ (Months)
💼 <b>មុខរបរ / Occupation:</b> ${app.occupation || 'N/A'}
🏢 <b>ក្រុមហ៊ុន / Company:</b> ${app.companyName || 'N/A'}
💰 <b>ប្រាក់ចំណូល / Income:</b> ${formattedIncome}
📍 <b>អាសយដ្ឋាន / Address:</b> ${app.address || 'N/A'}
📄 <b>ឯកសារ / Documents:</b> ${docCount} file(s)
📅 <b>កាលបរិច្ឆេទ / Date:</b> ${appliedDateStr}
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

export const testTelegramNotification = async (botToken: string, chatId: string): Promise<{ success: boolean; message: string }> => {
  const token = botToken.trim();
  const id = chatId.trim();

  if (!token) return { success: false, message: 'Please enter a valid Telegram Bot Token.' };
  if (!id) return { success: false, message: 'Please enter a valid Telegram Chat ID.' };

  const message = `
🤖 <b>EasyApply Telegram Bot Test Notification</b>

✅ <b>ការភ្ជាប់ជោគជ័យ! / Connection Successful!</b>
ការជូនដំណឹងតាម Telegram Bot ត្រូវបានកំណត់ដោយជោគជ័យ។

📅 <b>Time:</b> ${new Date().toLocaleString()}
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
