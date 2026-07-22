import { motion } from 'motion/react';
import { FileText, Calculator, ClipboardList, Gift, HeadphonesIcon, ChevronRight } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { LanguageContext, AppSettingsContext, translations } from '../App';
import { TelegramUser } from '../types';

interface Props {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const { lang } = useContext(LanguageContext);
  const { settings } = useContext(AppSettingsContext);
  const t = translations[lang];
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      setTgUser(window.Telegram.WebApp.initDataUnsafe.user);
    }
  }, []);

  const menuItems = [
    { id: 'apply', title: t.applyTitle, desc: lang === 'EN' ? 'Quick and easy loan application' : 'ស្នើសុំប្រាក់កម្ចីរហ័សនិងងាយស្រួល', icon: FileText, color: 'text-red-600', iconBg: 'bg-red-50' },
    { id: 'calculator', title: t.calcTitle, desc: lang === 'EN' ? 'Calculate your loan' : 'គណនាប្រាក់កម្ចីរបស់អ្នក', icon: Calculator, color: 'text-red-600', iconBg: 'bg-red-50' },
    { id: 'status', title: t.statusTitle, desc: lang === 'EN' ? 'Check your application' : 'ពិនិត្យពាក្យសុំរបស់អ្នក', icon: ClipboardList, color: 'text-yellow-600', iconBg: 'bg-yellow-50' },
    { id: 'promotions', title: t.promoTitle, desc: lang === 'EN' ? 'Check our promotions' : 'ពិនិត្យប្រូម៉ូសិនរបស់យើង', icon: Gift, color: 'text-green-600', iconBg: 'bg-green-50' },
    { id: 'contact', title: t.contactTitle, desc: lang === 'EN' ? 'Chat with our staff' : 'ជជែកជាមួយបុគ្គលិកយើង', icon: HeadphonesIcon, color: 'text-blue-600', iconBg: 'bg-blue-50' },
  ];

  const displayName = tgUser ? tgUser.first_name : (lang === 'EN' ? 'Guest' : 'ភ្ញៀវ');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 space-y-6 pb-8"
    >
      <div className="mb-2 mt-2 px-2">
        <h2 className="text-xl text-gray-600 font-medium">{lang === 'EN' ? `Hello, ${displayName}` : `សួស្តី, ${displayName}`}</h2>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{lang === 'EN' ? settings.welcomeEn + ' ' : settings.welcomeKh + ' '}
          <span className="text-red-600" style={{ color: settings.primaryColor || '#dc2626' }}>{settings.appName}</span>
        </h3>
      </div>

      <div className="space-y-3">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            onClick={() => {
              if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
              }
              onNavigate(item.id);
            }}
            className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all active:scale-[0.98] hover:border-red-200"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                <item.icon size={24} className={item.color} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                <p className="text-[11px] font-medium text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
