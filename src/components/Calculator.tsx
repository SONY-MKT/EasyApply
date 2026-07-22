import { useState, useContext, useEffect } from 'react';
import { calculateMonthlyPayment, formatCurrency } from '../utils';
import { motion } from 'motion/react';
import { LanguageContext, AppSettingsContext } from '../App';
import CustomSelect from './CustomSelect';
import AmortizationScheduleModal from './AmortizationScheduleModal';
import { Calendar, Table } from 'lucide-react';

export default function Calculator() {
  const { lang } = useContext(LanguageContext);
  const { settings } = useContext(AppSettingsContext);
  
  const [amount, setAmount] = useState<string>('5000');
  const [rate, setRate] = useState<string>(settings.interestRate.toString());
  const [months, setMonths] = useState<string>('24');
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  useEffect(() => {
    setRate(settings.interestRate.toString());
  }, [settings.interestRate]);

  const parsedAmount = Number(amount) || 0;
  const parsedRate = Number(rate) || 0;
  const parsedMonths = Number(months) || 1;

  const monthlyPayment = calculateMonthlyPayment(parsedAmount, parsedRate, parsedMonths);
  const totalPayment = monthlyPayment * parsedMonths;
  const totalInterest = totalPayment - parsedAmount;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{lang === 'EN' ? 'Calculator' : 'ការគណនា'}</h2>
        <p className="text-sm text-gray-500 mt-1">{lang === 'EN' ? 'Calculate your estimated monthly payment.' : 'គណនាការបង់ប្រាក់ប្រចាំខែប៉ាន់ស្មានរបស់អ្នក។'}</p>
      </div>
      <div className="space-y-5 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{lang === 'EN' ? 'Loan Amount (USD)' : 'ចំនួនប្រាក់កម្ចី (ដុល្លារ)'}</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent outline-none transition-all font-bold text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{lang === 'EN' ? 'Loan Tenure' : 'រយៈពេលខ្ចី'}</label>
          <CustomSelect
            value={months}
            onChange={setMonths}
            options={[
              { value: '6', label: lang === 'EN' ? '6 Months' : '៦ ខែ' },
              { value: '12', label: lang === 'EN' ? '12 Months' : '១២ ខែ' },
              { value: '24', label: lang === 'EN' ? '24 Months' : '២៤ ខែ' },
              { value: '36', label: lang === 'EN' ? '36 Months' : '៣៦ ខែ' },
              { value: '48', label: lang === 'EN' ? '48 Months' : '៤៨ ខែ' }
            ]}
            className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 h-12"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{lang === 'EN' ? 'Interest Rate (per year)' : 'អត្រាការប្រាក់ (ប្រចាំឆ្នាំ)'}</label>
          <div className="relative">
            <input 
              type="number" 
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent outline-none transition-all font-bold text-gray-900"
            />
            <span className="absolute right-4 top-3.5 text-gray-400 font-bold">%</span>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl overflow-hidden shadow-md">
        <div className="bg-red-600 p-6 text-center">
          <p className="text-red-100 font-bold text-xs tracking-wider uppercase mb-2">{lang === 'EN' ? 'Monthly Payment' : 'ការបង់ប្រចាំខែ'}</p>
          <p className="text-4xl font-bold text-white">{formatCurrency(monthlyPayment)}</p>
        </div>
        
        <div className="bg-white p-5 space-y-4 border border-t-0 border-gray-100 rounded-b-2xl">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">{lang === 'EN' ? 'Total Interest' : 'ការប្រាក់សរុប'}</span>
            <span className="font-bold text-gray-900">{formatCurrency(totalInterest)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">{lang === 'EN' ? 'Total Payment' : 'ការបង់សរុប'}</span>
            <span className="font-bold text-gray-900">{formatCurrency(totalPayment)}</span>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowSchedule(true)}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
            >
              <Table size={18} className="text-red-400" />
              <span>{lang === 'EN' ? 'View Amortization Schedule' : 'មើលតារាងរំលស់ប្រាក់កម្ចី'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Modal */}
      <AmortizationScheduleModal
        isOpen={showSchedule}
        onClose={() => setShowSchedule(false)}
        principal={parsedAmount}
        annualRate={parsedRate}
        termMonths={parsedMonths}
      />
    </motion.div>
  );
}

