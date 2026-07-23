import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { User, FileText, Bell, Globe, Info, ChevronRight, X, Clock, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { LanguageContext, AppSettingsContext } from '../App';
import { TelegramUser, LoanApplication } from '../types';
import { HFCLogo } from './HFCLogo';

interface Props {
  onNavigate?: (tab: string) => void;
  onViewApplication?: (id: string) => void;
  applications?: LoanApplication[];
}

export default function Profile({ onNavigate, onViewApplication, applications = [] }: Props) {
  const { lang, setLang } = useContext(LanguageContext);
  const { settings } = useContext(AppSettingsContext);
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('easyapply_notifications');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('easyapply_notifications', String(notifications));
  }, [notifications]);
  
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [showMyApplications, setShowMyApplications] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      if (window.Telegram.WebApp.initDataUnsafe?.user) {
        setTgUser(window.Telegram.WebApp.initDataUnsafe.user);
      }
    }
  }, []);

  const handleHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  const profileMenuItems = [
    { 
      label: lang === 'EN' ? 'My Applications' : 'ពាក្យសុំរបស់ខ្ញុំ', 
      icon: FileText, 
      rightText: applications.length > 0 ? `${applications.length}` : undefined,
      onClick: () => {
        handleHaptic();
        setShowMyApplications(true);
      } 
    },
    { 
      label: lang === 'EN' ? 'Personal Information' : 'ព័ត៌មានផ្ទាល់ខ្លួន', 
      icon: User, 
      onClick: () => {
        handleHaptic();
        setShowPersonalInfo(true);
      } 
    },
    { 
      label: lang === 'EN' ? 'Notifications' : 'ការជូនដំណឹង', 
      icon: Bell, 
      rightElement: (
        <div 
          className={`w-12 h-6 rounded-full relative transition-colors ${notifications ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'right-1' : 'left-1'}`}></div>
        </div>
      ),
      onClick: () => {
        handleHaptic();
        const newState = !notifications;
        
        let isSupported = false;
        if (window.Telegram?.WebApp?.version) {
          const versionObj = window.Telegram.WebApp.version.split('.').map(Number);
          isSupported = versionObj[0] > 6 || (versionObj[0] === 6 && versionObj[1] >= 9);
        }

        if (newState && isSupported && window.Telegram?.WebApp?.requestWriteAccess) {
          try {
            window.Telegram.WebApp.requestWriteAccess((granted) => {
              if (granted) {
                setNotifications(true);
                toast.success(lang === 'EN' ? 'Notifications enabled' : 'បានបើកការជូនដំណឹង');
              } else {
                // User declined, fallback to disabled or keep it disabled
                toast.error(lang === 'EN' ? 'Permission denied' : 'ការអនុញ្ញាតត្រូវបានបដិសេធ');
              }
            });
          } catch (err) {
            // Fallback if the method throws an error despite version check
            setNotifications(true);
            toast.success(lang === 'EN' ? 'Notifications enabled' : 'បានបើកការជូនដំណឹង');
          }
        } else {
          setNotifications(newState);
          if (newState) {
            toast.success(lang === 'EN' ? 'Notifications enabled' : 'បានបើកការជូនដំណឹង');
          } else {
            toast.success(lang === 'EN' ? 'Notifications disabled' : 'បានបិទការជូនដំណឹង');
          }
        }
      }
    },
    { 
      label: lang === 'EN' ? 'Language' : 'ភាសា', 
      icon: Globe, 
      rightText: lang === 'EN' ? 'English' : 'ខ្មែរ', 
      onClick: () => {
        handleHaptic();
        setLang(lang === 'EN' ? 'KH' : 'EN');
      } 
    },
    { 
      label: lang === 'EN' ? 'About Us' : 'អំពីយើង', 
      icon: Info, 
      onClick: () => {
        handleHaptic();
        setShowAboutUs(true);
      } 
    },
  ];

  const displayName = tgUser 
    ? `${tgUser.first_name} ${tgUser.last_name || ''}`.trim() 
    : (lang === 'EN' ? 'Guest User' : 'ភ្ញៀវ');
  const displayUsername = tgUser?.username ? `@${tgUser.username}` : '';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-5 pb-8 space-y-8"
    >
      <div className="flex flex-col items-center justify-center pt-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-3">
          {tgUser?.photo_url ? (
            <img src={tgUser.photo_url} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <User size={40} className="text-gray-400" />
          )}
        </div>
        <h2 className="text-lg font-bold text-gray-900">{displayName}</h2>
        {displayUsername ? (
          <p className="text-sm text-gray-500">{displayUsername}</p>
        ) : (
          <p className="text-sm text-gray-500">{lang === 'EN' ? 'Not connected to Telegram' : 'មិនមានភ្ជាប់តេឡេក្រាមទេ'}</p>
        )}
        {tgUser?.language_code && (
          <span className="mt-2 px-3 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded-full uppercase border border-gray-200">
            {tgUser.language_code}
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
        {profileMenuItems.map((item, idx) => (
          <div 
            key={idx}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={item.onClick}
          >
            <div className="flex items-center gap-4">
              <item.icon size={20} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              {item.rightText && <span className="text-xs text-gray-500">{item.rightText}</span>}
              {item.rightElement ? item.rightElement : <ChevronRight size={18} />}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPersonalInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setShowPersonalInfo(false)}
          >
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-safe"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">{lang === 'EN' ? 'Personal Information' : 'ព័ត៌មានផ្ទាល់ខ្លួន'}</h3>
                <button onClick={() => setShowPersonalInfo(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{lang === 'EN' ? 'Full Name' : 'ឈ្មោះពេញ'}</p>
                  <p className="font-semibold text-gray-900">{displayName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{lang === 'EN' ? 'Telegram Username' : 'ឈ្មោះអ្នកប្រើប្រាស់ Telegram'}</p>
                  <p className="font-semibold text-gray-900">{displayUsername || (lang === 'EN' ? 'None' : 'មិនមាន')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{lang === 'EN' ? 'Telegram ID' : 'លេខសម្គាល់ Telegram'}</p>
                  <p className="font-semibold text-gray-900 font-mono text-sm">{tgUser?.id || (lang === 'EN' ? 'Unknown' : 'មិនស្គាល់')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{lang === 'EN' ? 'Language Code' : 'កូដភាសា'}</p>
                  <p className="font-semibold text-gray-900 text-sm uppercase">{tgUser?.language_code || (lang === 'EN' ? 'Unknown' : 'មិនស្គាល់')}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showAboutUs && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setShowAboutUs(false)}
          >
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-safe text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-end">
                <button onClick={() => setShowAboutUs(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              
              <div className="w-full max-w-[220px] h-28 mx-auto mb-3 flex items-center justify-center p-1">
                {settings.logoUrl ? (
                  <img 
                    src={settings.logoUrl} 
                    alt="App Logo" 
                    className="w-full h-full object-contain drop-shadow-sm" 
                  />
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center p-2 bg-red-50/50 rounded-2xl border border-red-100/50">
                    <HFCLogo className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-red-600 mb-2">{settings.appName}</h3>
              <p className="text-sm text-gray-500 mb-6">Version 1.0.0</p>
              
              <div className="text-left text-sm text-gray-600 space-y-3 p-4 bg-gray-50 rounded-2xl mb-6">
                <p>{lang === 'EN' ? 'EasyApply is a streamlined loan application platform designed to make borrowing simple, fast, and accessible directly from Telegram.' : 'EasyApply គឺជាប្រព័ន្ធស្នើសុំប្រាក់កម្ចីដែលត្រូវបានរចនាឡើងដើម្បីធ្វើឱ្យការខ្ចីប្រាក់មានភាពងាយស្រួល លឿន និងអាចចូលប្រើបានដោយផ្ទាល់ពី Telegram ។'}</p>
              </div>
              
              <button 
                onClick={() => setShowAboutUs(false)}
                className="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition-colors"
              >
                {lang === 'EN' ? 'Close' : 'បិទ'}
              </button>
            </motion.div>
          </motion.div>
        )}

        {showMyApplications && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setShowMyApplications(false)}
          >
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-safe max-h-[85vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {lang === 'EN' ? 'My Applications' : 'ពាក្យសុំរបស់ខ្ញុំ'}
                  </h3>
                </div>
                <button onClick={() => setShowMyApplications(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
                {applications.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                      <FileText size={32} />
                    </div>
                    <p className="text-gray-500 font-medium text-sm">
                      {lang === 'EN' ? 'No applications submitted yet' : 'អ្នកមិនទាន់មានពាក្យស្នើសុំប្រាក់កម្ចីនៅឡើយទេ'}
                    </p>
                    <button 
                      onClick={() => {
                        setShowMyApplications(false);
                        if (onNavigate) onNavigate('apply');
                      }}
                      className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors text-sm shadow-sm"
                    >
                      {lang === 'EN' ? 'Apply for Loan Now' : 'ស្នើសុំប្រាក់កម្ចីឥឡូវនេះ'}
                    </button>
                  </div>
                ) : (
                  applications.map((app) => {
                    const statusConfig = {
                      submitted: { label: lang === 'EN' ? 'Submitted' : 'បានដាក់ពាក្យ', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
                      reviewing: { label: lang === 'EN' ? 'Reviewing' : 'កំពុងពិនិត្យ', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
                      approved: { label: lang === 'EN' ? 'Approved' : 'បានអនុម័ត', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                      disbursed: { label: lang === 'EN' ? 'Disbursed' : 'បានបើកប្រាក់', bg: 'bg-green-50 text-green-700 border-green-200' },
                      rejected: { label: lang === 'EN' ? 'Rejected' : 'មិនអនុម័ត', bg: 'bg-red-50 text-red-700 border-red-200' },
                    }[app.status] || { label: app.status, bg: 'bg-gray-50 text-gray-700 border-gray-200' };

                    return (
                      <div 
                        key={app.id}
                        onClick={() => {
                          setShowMyApplications(false);
                          if (onViewApplication) {
                            onViewApplication(app.id);
                          }
                        }}
                        className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 hover:border-gray-200 transition-colors cursor-pointer active:scale-[0.98]"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-mono text-gray-400">ID: #{app.id.slice(-6)}</p>
                            <p className="text-lg font-bold text-gray-900">${app.amount.toLocaleString()}</p>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${statusConfig.bg}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 pt-1 border-t border-gray-200/60">
                          <span>{app.termMonths} {lang === 'EN' ? 'Months' : 'ខែ'}</span>
                          <span>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ''}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {applications.length > 0 && (
                <div className="pt-3 border-t border-gray-100 mt-2">
                  <button 
                    onClick={() => {
                      setShowMyApplications(false);
                      if (onNavigate) onNavigate('status');
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors text-sm shadow-sm"
                  >
                    <span>{lang === 'EN' ? 'View Full Status Page' : 'មើលទំព័រស្ថានភាពពេញលេញ'}</span>
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
