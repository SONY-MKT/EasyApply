const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const startIdx = code.indexOf(`{activeTab === 'telegram' && (`);
const endIdx = code.indexOf(`{activeTab === 'applications' && (`, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newUI = `{activeTab === 'telegram' && (
            <motion.div key="telegram" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center gap-4 bg-sky-50/50">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <Send size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">1. Telegram Bot Connection</h2>
                    <p className="text-xs text-gray-500">Link your Telegram bot to enable notifications and Web App integration.</p>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Bot Token
                      </label>
                      <input
                        type="password"
                        value={settings.telegramBotToken || ''}
                        onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                        placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Admin Chat ID (For Notifications)
                      </label>
                      <input
                        type="text"
                        value={settings.telegramChatId || ''}
                        onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                        placeholder="e.g. -1001234567890 or 987654321"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Web App / Webhook Domain
                    </label>
                    <input
                      type="text"
                      value={settings.telegramWebhookDomain || ''}
                      onChange={(e) => setSettings({ ...settings, telegramWebhookDomain: e.target.value })}
                      placeholder="e.g. https://easyapply.tobsonyofficial.workers.dev (Leave empty to use current URL)"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
                    />
                    <p className="mt-1.5 text-[11px] text-gray-500">This URL is used when users click "Open App" in the bot and for webhook registration.</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isTestingTelegram || !settings.telegramBotToken || !settings.telegramChatId}
                      onClick={async () => {
                        setIsTestingTelegram(true);
                        const res = await testTelegramNotification(
                          settings.telegramBotToken || '',
                          settings.telegramChatId || ''
                        );
                        setIsTestingTelegram(false);
                        if (res.success) {
                          toast.success(res.message);
                          logActivity('Test Telegram Notification', 'Successfully sent test notification to Telegram chat');
                        } else {
                          toast.error(res.message);
                        }
                      }}
                      className="px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 disabled:opacity-50 font-semibold rounded-lg text-xs flex items-center gap-2 transition-colors"
                    >
                      <Send size={14} />
                      <span>{isTestingTelegram ? 'Testing...' : 'Test Connection'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isRegisteringWebhook || !settings.telegramBotToken}
                      onClick={async () => {
                        setIsRegisteringWebhook(true);
                        const domain = settings.telegramWebhookDomain?.trim() || window.location.origin;
                        const res = await registerTelegramWebhook(
                          settings.telegramBotToken || '',
                          domain
                        );
                        setIsRegisteringWebhook(false);
                        if (res.success) {
                          toast.success(res.message);
                          logActivity('Register Telegram Webhook', 'Successfully registered Telegram Webhook for domain: ' + domain);
                        } else {
                          toast.error(res.message);
                        }
                      }}
                      className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 disabled:opacity-50 font-semibold rounded-lg text-xs flex items-center gap-2 transition-colors"
                    >
                      <Activity size={14} />
                      <span>{isRegisteringWebhook ? 'Registering...' : 'Register Webhook'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center gap-4 bg-purple-50/50">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-gray-900">2. Notification Templates</h2>
                    <p className="text-xs text-gray-500">Customize the messages sent to administrators and applicants.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer" title="Enable Order Notifications">
                    <input
                      type="checkbox"
                      checked={!!settings.enableTelegramNotify}
                      onChange={(e) => setSettings({ ...settings, enableTelegramNotify: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>New Application Alert (Sent to Admin)</span>
                    </label>
                    <p className="text-[11px] text-gray-500 mb-2">Variables: {{name}}, {{phone}}, {{amount}}, {{term}}, {{product}}, {{occupation}}, {{company}}, {{income}}, {{address}}, {{docs}}, {{date}}, {{id}}</p>
                    <textarea
                      rows={5}
                      value={settings.botNewApplicationMessage || \`🚨 <b>ពាក្យស្នើសុំប្រាក់កម្ចីថ្មី</b>\\n\\n👤 <b>ឈ្មោះ:</b> {{name}}\\n📞 <b>ទូរស័ព្ទ:</b> <code>{{phone}}</code>\\n💵 <b>ចំនួនប្រាក់:</b> <b>{{amount}}</b>\\n⏱️ <b>រយៈពេល:</b> {{term}} ខែ\\n📦 <b>ប្រភេទផលិតផល:</b> {{product}}\\n💼 <b>មុខរបរ:</b> {{occupation}}\\n🏢 <b>ក្រុមហ៊ុន:</b> {{company}}\\n💰 <b>ប្រាក់ចំណូល:</b> {{income}}\\n📍 <b>អាសយដ្ឋាន:</b> {{address}}\\n📄 <b>ឯកសារ:</b> {{docs}} ឯកសារ\\n📅 <b>កាលបរិច្ឆេទ:</b> {{date}}\\n🆔 <b>ID:</b> <code>{{id}}</code>\`}
                      onChange={(e) => setSettings({ ...settings, botNewApplicationMessage: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>Status Update Notification (Sent to User & Admin)</span>
                    </label>
                    <p className="text-[11px] text-gray-500 mb-2">Variables: {{name}}, {{id}}, {{product}}, {{amount}}, {{emoji}}, {{status}}, {{reason}}, {{admin}}</p>
                    <textarea
                      rows={5}
                      value={settings.botStatusUpdateMessage || \`🔔 <b>ជម្រាបសួរ {{name}},</b>\\nពាក្យស្នើសុំប្រាក់កម្ចីរបស់អ្នកត្រូវបានផ្លាស់ប្តូរស្ថានភាព។\\n\\n🆔 <b>ID:</b> <code>{{id}}</code>\\n📦 <b>ប្រភេទផលិតផល:</b> {{product}}\\n💵 <b>ចំនួនប្រាក់:</b> <b>{{amount}}</b>\\n\\n{{emoji}} <b>ស្ថានភាពថ្មី:</b> <b>{{status}}</b>{{reason}}{{admin}}\`}
                      onChange={(e) => setSettings({ ...settings, botStatusUpdateMessage: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center gap-4 bg-orange-50/50">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">3. Bot Welcome Message (Users)</h2>
                    <p className="text-xs text-gray-500">Configure what users see when they start a chat with the bot.</p>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Welcome Message Content
                    </label>
                    <textarea
                      rows={6}
                      value={settings.botWelcomeMessage || ''}
                      onChange={(e) => setSettings({ ...settings, botWelcomeMessage: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      placeholder="Welcome message supporting HTML format"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <label className="block text-xs font-semibold text-gray-700">Bot Buttons (Inline Keyboard)</label>
                       <button
                          type="button"
                          onClick={() => {
                             const newBtns = [...(settings.telegramButtons || [])];
                             newBtns.push({ id: Date.now().toString(), text: 'New Button', type: 'web_app', url: '' });
                             setSettings({ ...settings, telegramButtons: newBtns });
                          }}
                          className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-md transition-colors"
                       >
                          <Plus size={14} /> Add Button
                       </button>
                    </div>
                    <div className="space-y-2">
                      {(settings.telegramButtons || []).map((btn, index) => (
                         <div key={btn.id} className="flex flex-col lg:flex-row gap-2 items-center bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                           <div className="flex-1 w-full flex items-center gap-2">
                             <GripVertical size={16} className="text-gray-400 cursor-move shrink-0" />
                             <input 
                               type="text" 
                               placeholder="Button Text"
                               value={btn.text}
                               onChange={(e) => {
                                  const newBtns = [...(settings.telegramButtons || [])];
                                  newBtns[index].text = e.target.value;
                                  setSettings({ ...settings, telegramButtons: newBtns });
                               }}
                               className="w-1/3 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                             />
                             <select 
                               value={btn.type}
                               onChange={(e) => {
                                  const newBtns = [...(settings.telegramButtons || [])];
                                  newBtns[index].type = e.target.value as 'web_app' | 'url';
                                  setSettings({ ...settings, telegramButtons: newBtns });
                               }}
                               className="w-1/4 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                             >
                               <option value="web_app">Web App</option>
                               <option value="url">URL Link</option>
                             </select>
                             <input 
                               type="text" 
                               placeholder={btn.type === 'web_app' ? 'Leave empty for default Web App URL' : 'https://...'}
                               value={btn.url || ''}
                               onChange={(e) => {
                                  const newBtns = [...(settings.telegramButtons || [])];
                                  newBtns[index].url = e.target.value;
                                  setSettings({ ...settings, telegramButtons: newBtns });
                               }}
                               className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-mono outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                             />
                           </div>
                           <button
                             type="button"
                             onClick={() => {
                                const newBtns = (settings.telegramButtons || []).filter(b => b.id !== btn.id);
                                setSettings({ ...settings, telegramButtons: newBtns });
                             }}
                             className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 transition-colors"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                      ))}
                      {(!settings.telegramButtons || settings.telegramButtons.length === 0) && (
                        <div className="text-xs text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                           No buttons added yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 pb-12">
                 <button onClick={handleSettingsSave} type="button" className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-sm text-sm">
                   Save All Telegram Settings
                 </button>
              </div>
            </motion.div>
          )}

          `;
          
  const updatedCode = code.substring(0, startIdx) + newUI + code.substring(endIdx);
  fs.writeFileSync('src/components/AdminDashboard.tsx', updatedCode, 'utf8');
  console.log('UI Rewritten');
} else {
  console.log('Could not find markers');
}
