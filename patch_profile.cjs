const fs = require('fs');
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const target = `<div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{lang === 'EN' ? 'Telegram ID' : 'លេខសម្គាល់ Telegram'}</p>
                  <p className="font-semibold text-gray-900 font-mono text-sm">{tgUser?.id || (lang === 'EN' ? 'Unknown' : 'មិនស្គាល់')}</p>
                </div>`;

const replace = `<div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{lang === 'EN' ? 'Telegram ID' : 'លេខសម្គាល់ Telegram'}</p>
                  <p className="font-semibold text-gray-900 font-mono text-sm">{tgUser?.id || (lang === 'EN' ? 'Unknown' : 'មិនស្គាល់')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{lang === 'EN' ? 'Language Code' : 'កូដភាសា'}</p>
                  <p className="font-semibold text-gray-900 text-sm uppercase">{tgUser?.language_code || (lang === 'EN' ? 'Unknown' : 'មិនស្គាល់')}</p>
                </div>`;

content = content.replace(target, replace);
fs.writeFileSync('src/components/Profile.tsx', content);
