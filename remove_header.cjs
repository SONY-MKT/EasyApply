const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `        <div className="w-full max-w-md bg-white h-screen relative shadow-2xl flex flex-col">
        {renderHeader()}
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-20">`;

const replace1 = `        <div className="w-full max-w-md bg-white h-screen relative shadow-2xl flex flex-col">
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-20">`;

content = content.replace(target1, replace1);

const target2 = `  const renderHeader = () => {
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
  };`;

const replace2 = ``;

content = content.replace(target2, replace2);
fs.writeFileSync('src/App.tsx', content);
