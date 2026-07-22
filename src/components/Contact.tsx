import { motion } from 'motion/react';
import { Phone, Mail, MessageSquare, MapPin, Headphones } from 'lucide-react';
import { useContext } from 'react';
import { LanguageContext, AppSettingsContext } from '../App';

export default function Contact() {
  const { lang } = useContext(LanguageContext);
  const { settings } = useContext(AppSettingsContext);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 pb-8 flex flex-col items-center"
    >
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 mt-6">
        <Headphones size={40} className="text-red-600" />
      </div>
      
      <h2 className="text-lg font-bold text-red-600 mb-2">{lang === 'EN' ? 'We are here to help you!' : 'យើងខ្ញុំនៅទីនេះដើម្បីជួយអ្នក!'}</h2>
      <p className="text-sm text-gray-500 text-center mb-8 max-w-[250px]">
        {lang === 'EN' ? 'Contact our staff through the channels below.' : 'ទំនាក់ទំនងបុគ្គលិករបស់យើងតាមរយៈឆានែលខាងក្រោម។'}
      </p>

      <div className="w-full space-y-4">
        <motion.a 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }} 
          href={`tel:${settings.contactPhone.replace(/\s+/g, '')}`} 
          className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-red-300 transition-colors block"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
            <Phone size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-sm">{lang === 'EN' ? 'Phone Number' : 'លេខទូរស័ព្ទ'}</h4>
            <p className="font-semibold text-red-600 text-sm">{settings.contactPhone}</p>
          </div>
        </motion.a>
        
        <motion.a 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          href={`mailto:${settings.contactEmail}`} 
          className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-red-300 transition-colors block"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
            <Mail size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-sm">{lang === 'EN' ? 'Email Address' : 'អាសយដ្ឋានអ៊ីមែល'}</h4>
            <p className="font-semibold text-red-600 text-sm break-all">{settings.contactEmail}</p>
          </div>
        </motion.a>

        <motion.a 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }} 
          href={settings.contactLiveChatUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-red-300 transition-colors text-left cursor-pointer block"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
            <MessageSquare size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-sm">{lang === 'EN' ? 'Live Chat' : 'ជជែកផ្ទាល់'}</h4>
            <p className="text-xs text-gray-500 font-medium">{lang === 'EN' ? 'Chat with our staff' : 'ជជែកជាមួយបុគ្គលិកយើង'}</p>
          </div>
        </motion.a>

        <motion.a 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }} 
          href={settings.contactBranchUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-red-300 transition-colors text-left cursor-pointer block"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
            <MapPin size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-sm">{lang === 'EN' ? 'Our Branches' : 'ទីតាំងសាខាយើង'}</h4>
            <p className="text-xs text-gray-500 font-medium">{lang === 'EN' ? 'Find nearest branch' : 'ស្វែងរកសាខាជិតអ្នក'}</p>
          </div>
        </motion.a>
      </div>
    </motion.div>
  );
}
