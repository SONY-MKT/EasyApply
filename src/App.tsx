import { Toaster } from 'react-hot-toast';
import { useState, useEffect, createContext } from 'react';
import { Home, ClipboardList, Calculator as CalcIcon, User, ChevronLeft, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import CalculatorView from './components/Calculator';
import ApplicationForm from './components/ApplicationForm';
import LoanStatusView from './components/LoanStatus';
import ProfileView from './components/Profile';
import PromotionsView from './components/Promotions';
import ContactView from './components/Contact';
import { LoanApplication, AppSettings } from './types';
import { defaultSettings } from './defaultSettings';
import { subscribeToSettings, subscribeToApplications, addApplication } from './lib/db';
import { sendTelegramNotification } from './lib/telegram';

type Tab = 'home' | 'status' | 'calculator' | 'profile' | 'apply' | 'promotions' | 'contact';
type Language = 'EN' | 'KH';

export const LanguageContext = createContext<{lang: Language, setLang: (l: Language) => void}>({
  lang: 'KH',
  setLang: () => {},
});

export const AppSettingsContext = createContext<{settings: AppSettings}>({
  settings: defaultSettings
});

export const translations = {
  EN: {
    home: 'Home',
    status: 'Status',
    calculator: 'Calculator',
    profile: 'Profile',
    applyTitle: 'Apply Loan',
    calcTitle: 'Loan Calculator',
    statusTitle: 'Loan Status',
    profileTitle: 'Profile',
    promoTitle: 'Promotions',
    contactTitle: 'Contact Us',
  },
  KH: {
    home: 'ទំព័រដើម',
    status: 'ស្ថានភាព',
    calculator: 'គណនា',
    profile: 'គណនី',
    applyTitle: 'ស្នើសុំប្រាក់កម្ចី',
    calcTitle: 'គណនាប្រាក់កម្ចី',
    statusTitle: 'ស្ថានភាពកម្ចី',
    profileTitle: 'គណនី',
    promoTitle: 'ប្រូម៉ូសិន',
    contactTitle: 'ទំនាក់ទំនង',
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [lang, setLang] = useState<Language>('KH');
  
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultSettings);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Detect focus on form fields to hide bottom nav when virtual keyboard is open
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        setIsInputFocused(true);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA' && active.tagName !== 'SELECT')) {
          setIsInputFocused(false);
        }
      }, 100);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    const initialHeight = window.innerHeight;
    const handleViewportResize = () => {
      if (window.visualViewport) {
        if (window.visualViewport.height < initialHeight * 0.82) {
          setIsInputFocused(true);
        }
      } else if (window.innerHeight < initialHeight * 0.82) {
        setIsInputFocused(true);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
    } else {
      window.addEventListener('resize', handleViewportResize);
    }

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      } else {
        window.removeEventListener('resize', handleViewportResize);
      }
    };
  }, []);

  useEffect(() => {
    if (appSettings.appName) {
      document.title = appSettings.appName;
    }
    const faviconTarget = appSettings.faviconUrl || appSettings.logoUrl;
    if (faviconTarget) {
      const linkElements = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon'], link[rel*='apple-touch-icon'], link[rel*='shortcut']");
      if (linkElements.length > 0) {
        linkElements.forEach(link => {
          link.href = faviconTarget;
        });
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = faviconTarget;
        document.head.appendChild(link);
      }
    }
  }, [appSettings.appName, appSettings.faviconUrl, appSettings.logoUrl]);

  useEffect(() => {
    const unsubscribeSettings = subscribeToSettings((settings) => {
      // Keep any custom mappings like the motorcycle icon fix if needed,
      // but otherwise just set it.
      if (settings.products) {
        settings.products = settings.products.map(p => {
          if (
            p.id === 'motorcycle' || 
            p.nameKh?.includes('ម៉ូតូ') || 
            p.nameEn?.toLowerCase().includes('motorcycle')
          ) {
            return { ...p, icon: 'Motorbike' };
          }
          return p;
        });
      }
      setAppSettings(settings);
    });

    const unsubscribeApps = subscribeToApplications((apps) => {
      setApplications(apps);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeApps();
    };
  }, []);

  const handleNav = (tab: Tab) => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    setActiveTab(tab);
  };

  const handleApply = async (appData: Omit<LoanApplication, 'id' | 'status' | 'appliedAt'>) => {
    const now = new Date().toISOString();
    const newApp = {
      ...appData,
      status: 'submitted' as const,
      appliedAt: now,
      statusTimestamps: {
        submitted: now
      }
    };
    
    // Optimistic UI update could be added here, but Firestore listener is fast enough.
    // Also, generate a nice 6-character short ID for the user's reference, 
    // or let Firestore generate it and we just save it. Wait, the type requires 'id'.
    // Firestore generates ID on addDoc, but let's pre-generate a readable ID for 'id' field,
    // since the original code uses a 8-char uppercase string.
    const customId = 'APP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const fullApp = { ...newApp, id: customId };
    await addApplication(fullApp);

    // Send Telegram Notification asynchronously
    sendTelegramNotification(appSettings, fullApp).catch((err) => {
      console.error('Telegram notification error:', err);
    });

    handleNav('status');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      } catch (e) {
        console.log('Telegram WebApp init error:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (window.Telegram?.WebApp?.BackButton) {
      if (activeTab === 'home') {
        window.Telegram.WebApp.BackButton.hide();
      } else {
        window.Telegram.WebApp.BackButton.show();
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const handleBack = () => {
      handleNav('home');
    };
    if (window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.onClick(handleBack);
      return () => {
        window.Telegram.WebApp.BackButton.offClick(handleBack);
      };
    }
  }, []);

  const t = translations[lang];

  const navItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'status', label: t.status, icon: ClipboardList },
    { id: 'calculator', label: t.calculator, icon: CalcIcon },
    { id: 'profile', label: t.profile, icon: User },
  ] as const;

  const renderHeader = () => {
    if (activeTab === 'home') {
      return null;
    }

    const titles: Record<Exclude<Tab, 'home'>, string> = {
      apply: t.applyTitle,
      calculator: t.calcTitle,
      status: t.statusTitle,
      profile: t.profileTitle,
      promotions: t.promoTitle,
      contact: t.contactTitle
    };

    return (
      <header className="bg-white text-gray-900 px-4 pt-6 pb-4 flex items-center justify-center sticky top-0 z-20 border-b border-gray-100 shadow-sm">
        <button onClick={() => handleNav('home')} className="absolute left-4 p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors z-10 border border-gray-200">
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <h1 className="font-bold text-lg text-center tracking-tight">
          <AnimatePresence mode="wait">
            <motion.span
              key={titles[activeTab as keyof typeof titles]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {titles[activeTab as keyof typeof titles] || ''}
            </motion.span>
          </AnimatePresence>
        </h1>
      </header>
    );
  };

  return (
    <AppSettingsContext.Provider value={{ settings: appSettings }}>
      <LanguageContext.Provider value={{ lang, setLang }}>
        <style dangerouslySetInnerHTML={{__html: `
          .text-red-600 { color: ${appSettings.primaryColor} !important; }
          .bg-red-600 { background-color: ${appSettings.primaryColor} !important; }
          .border-red-600 { border-color: ${appSettings.primaryColor} !important; }
          .ring-red-500 { --tw-ring-color: ${appSettings.primaryColor} !important; }
          .focus\\:border-red-500:focus { border-color: ${appSettings.primaryColor} !important; }
          .hover\\:bg-red-700:hover { filter: brightness(0.9); }
          .bg-red-50 { background-color: ${appSettings.primaryColor}15 !important; }
          .text-red-700 { color: ${appSettings.primaryColor} !important; }
        `}} />
        <div className="min-h-[100dvh] bg-gray-100 font-sans flex justify-center overflow-hidden">
          <Toaster position="top-center" toastOptions={{ className: 'text-sm font-medium rounded-xl shadow-lg border border-gray-100' }} />
        <div className="w-full max-w-[450px] bg-white h-[100dvh] relative shadow-2xl flex flex-col mx-auto border-x border-gray-100">
        <main className={`flex-1 overflow-y-auto bg-gray-50 ${isInputFocused ? 'pb-6' : 'pb-20'}`}>
          {activeTab === 'home' && <Dashboard onNavigate={(t) => handleNav(t as Tab)} />}
          {activeTab === 'calculator' && <CalculatorView />}
          {activeTab === 'apply' && <ApplicationForm onSubmit={handleApply} />}
          {activeTab === 'status' && <LoanStatusView applications={applications} />}
          {activeTab === 'profile' && <ProfileView applications={applications} onNavigate={(t) => handleNav(t as Tab)} />}
          {activeTab === 'promotions' && <PromotionsView />}
          {activeTab === 'contact' && <ContactView />}
        </main>

        <nav className={`bg-white border-t border-gray-200 justify-around py-2.5 pb-safe z-20 absolute bottom-0 w-full shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] transition-all duration-200 ${isInputFocused ? 'hidden pointer-events-none opacity-0' : 'flex opacity-100'}`}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id || (['apply', 'promotions', 'contact'].includes(activeTab) && item.id === 'home');
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id as Tab)}
                className={`flex flex-col items-center gap-1 transition-all px-2 sm:px-4 ${
                  isActive
                    ? 'text-red-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-red-50' : 'bg-transparent'}`}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] whitespace-nowrap ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
    </LanguageContext.Provider>
    </AppSettingsContext.Provider>
  );
}
