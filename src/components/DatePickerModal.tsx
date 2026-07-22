import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, X, Check, ChevronLeft, ChevronRight, RotateCcw, Sliders } from 'lucide-react';

interface DatePickerModalProps {
  value: string; // 'YYYY-MM-DD' format or empty
  onChange: (val: string) => void;
  lang?: 'EN' | 'KH';
  placeholder?: string;
}

const KHMER_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const KHMER_MONTHS_SHORT = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

const ENGLISH_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Helper to get max days in a given month and year
const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate();
};

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  value,
  onChange,
  lang = 'KH',
  placeholder
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'spin' | 'calendar'>('spin');

  // Month & Year picker overlay popovers for Calendar mode
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Get current device date
  const getDeviceToday = () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    };
  };

  // Get sensible default birth date (~22 years ago)
  const getDefaultDob = () => {
    const currentYear = new Date().getFullYear();
    return {
      year: currentYear - 22,
      month: 1,
      day: 15
    };
  };

  // Parse value or set fallback
  const parseInitialDate = () => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          return { year: y, month: m, day: d };
        }
      }
    }
    return getDefaultDob();
  };

  const initial = parseInitialDate();
  const [selectedDay, setSelectedDay] = useState<number>(initial.day);
  const [selectedMonth, setSelectedMonth] = useState<number>(initial.month);
  const [selectedYear, setSelectedYear] = useState<number>(initial.year);

  // Keep selectedDay within valid range whenever month or year changes
  useEffect(() => {
    const maxDays = getDaysInMonth(selectedMonth, selectedYear);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  }, [selectedMonth, selectedYear]);

  // Sync state whenever modal opens or external value changes
  useEffect(() => {
    if (isOpen) {
      if (value) {
        const parts = value.split('-');
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          const d = parseInt(parts[2], 10);
          if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            setSelectedDay(d);
            setSelectedMonth(m);
            setSelectedYear(y);
            return;
          }
        }
      } else {
        const dob = getDefaultDob();
        setSelectedDay(dob.day);
        setSelectedMonth(dob.month);
        setSelectedYear(dob.year);
      }
    }
  }, [value, isOpen]);

  // Generate Year range (1940 to current year)
  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: currentYearNum - 1939 }, (_, i) => currentYearNum - i);

  const maxDays = getDaysInMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  // Format trigger label display
  const formatDisplay = () => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    const y = parts[0];
    const m = parseInt(parts[1], 10);
    const d = parts[2];
    const monthName = lang === 'EN' ? ENGLISH_MONTHS_SHORT[m - 1] : KHMER_MONTHS_SHORT[m - 1];
    return `${d} ${monthName} ${y}`;
  };

  const handleConfirm = () => {
    const validDay = Math.min(selectedDay, getDaysInMonth(selectedMonth, selectedYear));
    const formattedMonth = String(selectedMonth).padStart(2, '0');
    const formattedDay = String(validDay).padStart(2, '0');
    const newValue = `${selectedYear}-${formattedMonth}-${formattedDay}`;
    onChange(newValue);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // Modern iOS-style Wheel Column Component
  const WheelColumn = ({
    items,
    selectedValue,
    onSelect,
    formatItem
  }: {
    items: number[];
    selectedValue: number;
    onSelect: (val: number) => void;
    formatItem?: (val: number) => string;
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);
    const timeoutRef = useRef<any>(null);

    // Item height in px
    const ITEM_HEIGHT = 42;

    // Scroll selected item into view smoothly on open/value change
    useEffect(() => {
      if (containerRef.current && !isScrollingRef.current) {
        const index = items.indexOf(selectedValue);
        if (index !== -1) {
          containerRef.current.scrollTop = index * ITEM_HEIGHT;
        }
      }
    }, [isOpen, selectedValue, items]);

    const handleScroll = () => {
      if (!containerRef.current) return;
      isScrollingRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
      const activeItem = items[clampedIndex];

      if (activeItem !== undefined && activeItem !== selectedValue) {
        onSelect(activeItem);
      }

      timeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150);
    };

    return (
      <div className="relative flex-1 h-[210px] overflow-hidden select-none">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-none relative z-10 py-[84px]"
          style={{ scrollBehavior: 'smooth' }}
        >
          {items.map((item) => {
            const isSelected = item === selectedValue;
            return (
              <div
                key={item}
                onClick={() => {
                  onSelect(item);
                  if (containerRef.current) {
                    const idx = items.indexOf(item);
                    containerRef.current.scrollTop = idx * ITEM_HEIGHT;
                  }
                }}
                className={`h-[42px] flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'text-red-600 font-extrabold text-base sm:text-lg scale-105 tracking-wide'
                    : 'text-gray-400 font-medium text-xs sm:text-sm hover:text-gray-600 opacity-50'
                }`}
              >
                {formatItem ? formatItem(item) : item}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Calendar Grid Cells
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDayOfWeek = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    const prevDaysInMonth = new Date(selectedYear, selectedMonth - 1, 0).getDate();

    const calendarCells = [];

    // Prev month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      calendarCells.push(
        <div key={`prev-${i}`} className="h-9 flex items-center justify-center text-xs text-gray-300 font-medium">
          {prevDaysInMonth - i}
        </div>
      );
    }

    // Current month days
    const today = getDeviceToday();
    for (let d = 1; d <= daysInMonth; d++) {
      const isSelected = selectedDay === d;
      const isToday = today.year === selectedYear && today.month === selectedMonth && today.day === d;

      calendarCells.push(
        <button
          key={`day-${d}`}
          type="button"
          onClick={() => setSelectedDay(d)}
          className={`h-9 w-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            isSelected
              ? 'bg-red-600 text-white shadow-md shadow-red-200 scale-105'
              : isToday
              ? 'border-2 border-red-500 text-red-600 font-extrabold'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          {d}
        </button>
      );
    }

    return calendarCells;
  };

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm shadow-sm text-left flex items-center justify-between group hover:border-red-300"
      >
        <span className={value ? 'text-gray-900 font-semibold' : 'text-gray-400'}>
          {formatDisplay() || placeholder || (lang === 'EN' ? 'DD / MM / YYYY' : 'ថ្ងៃ / ខែ / ឆ្នាំ')}
        </span>
        <CalendarIcon size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
      </button>

      {/* Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col"
            >
              {/* Top Header */}
              <div className="flex items-center justify-between p-4 px-5 border-b border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 font-bold border border-red-100 shadow-sm">
                    <CalendarIcon size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm">
                      {lang === 'EN' ? 'Select Date of Birth' : 'ជ្រើសរើសថ្ងៃខែឆ្នាំកំណើត'}
                    </h3>
                    <p className="text-[11px] font-medium text-gray-400">
                      {lang === 'EN' ? 'Scroll wheel or tap calendar' : 'រំកិលបង្វិល ឬជ្រើសរើសតាមប្រតិទិន'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Toggle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode(viewMode === 'spin' ? 'calendar' : 'spin');
                      setShowMonthPicker(false);
                      setShowYearPicker(false);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                  >
                    <Sliders size={13} className="text-red-500" />
                    <span>{viewMode === 'spin' ? (lang === 'EN' ? 'Calendar' : 'ប្រតិទិន') : (lang === 'EN' ? 'Spin Wheel' : 'កង់បង្វិល')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>


              {/* Body Content */}
              <div className="p-4 sm:p-5 relative min-h-[250px]">
                {viewMode === 'spin' ? (
                  <div>

                    {/* Wheel Container with continuous overlay */}
                    <div className="relative bg-gray-50/80 rounded-2xl border border-gray-100 p-1 overflow-hidden h-[218px]">
                      {/* Selection Highlight Bar across columns */}
                      <div className="absolute top-[88px] left-3 right-3 h-[42px] bg-red-500/10 border border-red-200/80 rounded-xl pointer-events-none z-0 shadow-xs" />

                      {/* Top & Bottom Fade Gradients for clean fade-out */}
                      <div className="absolute top-0 left-0 right-0 h-[84px] bg-gradient-to-b from-gray-50 via-gray-50/80 to-transparent pointer-events-none z-20" />
                      <div className="absolute bottom-0 left-0 right-0 h-[84px] bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent pointer-events-none z-20" />

                      <div className="flex items-center gap-1 relative z-10">
                        {/* Day Column */}
                        <WheelColumn
                          items={days}
                          selectedValue={selectedDay}
                          onSelect={setSelectedDay}
                          formatItem={(d) => String(d).padStart(2, '0')}
                        />

                        {/* Month Column */}
                        <WheelColumn
                          items={Array.from({ length: 12 }, (_, i) => i + 1)}
                          selectedValue={selectedMonth}
                          onSelect={setSelectedMonth}
                          formatItem={(m) => lang === 'EN' ? ENGLISH_MONTHS_SHORT[m - 1] : KHMER_MONTHS_SHORT[m - 1]}
                        />

                        {/* Year Column */}
                        <WheelColumn
                          items={years}
                          selectedValue={selectedYear}
                          onSelect={setSelectedYear}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Calendar Grid View */
                  <div className="relative">
                    {/* Month & Year Navigation Header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <button
                        type="button"
                        onClick={() => {
                          let newM = selectedMonth - 1;
                          let newY = selectedYear;
                          if (newM < 1) {
                            newM = 12;
                            newY = selectedYear - 1;
                          }
                          setSelectedMonth(newM);
                          setSelectedYear(newY);
                        }}
                        className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-2xl transition-colors text-gray-700"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {/* Pill Selectors for Month and Year */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowMonthPicker(!showMonthPicker);
                            setShowYearPicker(false);
                          }}
                          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border border-gray-200/50"
                        >
                          <span>{lang === 'EN' ? ENGLISH_MONTHS[selectedMonth - 1] : KHMER_MONTHS[selectedMonth - 1]}</span>
                          <ChevronRight size={14} className={`text-gray-500 transition-transform ${showMonthPicker ? 'rotate-90' : 'rotate-0'}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowYearPicker(!showYearPicker);
                            setShowMonthPicker(false);
                          }}
                          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border border-gray-200/50"
                        >
                          <span>{selectedYear}</span>
                          <ChevronRight size={14} className={`text-gray-500 transition-transform ${showYearPicker ? 'rotate-90' : 'rotate-0'}`} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          let newM = selectedMonth + 1;
                          let newY = selectedYear;
                          if (newM > 12) {
                            newM = 1;
                            newY = selectedYear + 1;
                          }
                          setSelectedMonth(newM);
                          setSelectedYear(newY);
                        }}
                        className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-2xl transition-colors text-gray-700"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>

                    {/* Popover Month Picker Overlay */}
                    {showMonthPicker && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-2xl z-30 p-2 grid grid-cols-3 gap-2 overflow-y-auto max-h-[220px]">
                        {(lang === 'EN' ? ENGLISH_MONTHS : KHMER_MONTHS).map((mName, idx) => {
                          const mNum = idx + 1;
                          const isSel = selectedMonth === mNum;
                          return (
                            <button
                              key={mName}
                              type="button"
                              onClick={() => {
                                setSelectedMonth(mNum);
                                setShowMonthPicker(false);
                              }}
                              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                                isSel
                                  ? 'bg-red-600 text-white shadow-sm'
                                  : 'bg-gray-50 text-gray-800 hover:bg-red-50 hover:text-red-600'
                              }`}
                            >
                              {mName}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Popover Year Picker Overlay */}
                    {showYearPicker && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-2xl z-30 p-2 grid grid-cols-4 gap-2 overflow-y-auto max-h-[220px] scrollbar-none">
                        {years.map((yNum) => {
                          const isSel = selectedYear === yNum;
                          return (
                            <button
                              key={yNum}
                              type="button"
                              onClick={() => {
                                setSelectedYear(yNum);
                                setShowYearPicker(false);
                              }}
                              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                                isSel
                                  ? 'bg-red-600 text-white shadow-sm'
                                  : 'bg-gray-50 text-gray-800 hover:bg-red-50 hover:text-red-600'
                              }`}
                            >
                              {yNum}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Weekday Header */}
                    <div className="grid grid-cols-7 text-center text-[11px] font-extrabold text-gray-400 mb-2">
                      {(lang === 'EN' ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] : ['អា', 'ច', 'អ', 'ព', 'ព្រ', 'សុ', 'ស']).map((wd, i) => (
                        <div key={i}>{wd}</div>
                      ))}
                    </div>

                    {/* Calendar Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {renderCalendarDays()}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3.5 py-2.5 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw size={15} />
                  <span>{lang === 'EN' ? 'Clear' : 'សម្អាត'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors"
                  >
                    {lang === 'EN' ? 'Cancel' : 'បោះបង់'}
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-200 transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Check size={16} />
                    <span>{lang === 'EN' ? 'Confirm' : 'យល់ព្រម'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
