const fs = require('fs');
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const target = `        {displayUsername ? (
          <p className="text-sm text-gray-500">{displayUsername}</p>
        ) : (
          <p className="text-sm text-gray-500">{lang === 'EN' ? 'Not connected to Telegram' : 'មិនមានភ្ជាប់តេឡេក្រាមទេ'}</p>
        )}`;

const replace = `        {displayUsername ? (
          <p className="text-sm text-gray-500">{displayUsername}</p>
        ) : (
          <p className="text-sm text-gray-500">{lang === 'EN' ? 'Not connected to Telegram' : 'មិនមានភ្ជាប់តេឡេក្រាមទេ'}</p>
        )}
        {tgUser?.language_code && (
          <span className="mt-2 px-3 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded-full uppercase border border-gray-200">
            {tgUser.language_code}
          </span>
        )}`;

content = content.replace(target, replace);
fs.writeFileSync('src/components/Profile.tsx', content);
