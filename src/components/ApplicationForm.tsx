import { toast } from 'react-hot-toast';
import React, { useState, useRef, useContext } from 'react';
import { Upload, User, Phone, MapPin, Briefcase, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { LoanApplication } from '../types';
import { LanguageContext, AppSettingsContext } from '../App';
import CustomSelect from './CustomSelect';
import { DatePickerModal } from './DatePickerModal';

interface Props {
  onSubmit: (app: Omit<LoanApplication, 'id' | 'status' | 'appliedAt'>) => void;
}

const InputWrapper = ({ icon: Icon, children, label, isSelect }: { icon: any, children: React.ReactNode, label?: string, isSelect?: boolean }) => (
  <div className="space-y-1.5">
    {label && <label className="text-xs font-semibold text-gray-600 ml-1">{label}</label>}
    <div className="relative flex items-center">
      <div className="absolute left-4 text-gray-400 pointer-events-none z-10">
        <Icon size={18} />
      </div>
      {children}
      {isSelect && (
        <div className="absolute right-4 text-gray-400 pointer-events-none z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      )}
    </div>
  </div>
);

const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(`${file.name}|||${reader.result}`);
      };
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxWidth = 800;
      const maxHeight = 800;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);
        resolve(`${file.name}|||${compressedBase64}`);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => resolve(`${file.name}|||${reader.result}`);
        reader.readAsDataURL(file);
      }
    };
    img.onerror = () => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(`${file.name}|||${reader.result}`);
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
};

export default function ApplicationForm({ onSubmit }: Props) {
  const { lang } = useContext(LanguageContext);
  const { settings } = useContext(AppSettingsContext);
  const [applicantName, setApplicantName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [termMonths, setTermMonths] = useState<string>('24');
  const [documents, setDocuments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gender, setGender] = useState<string>('');
  const [employmentType, setEmploymentType] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
      setStep(step + 1);
      return;
    }
    
    if (!amount || !termMonths || !applicantName || !phone) return;
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }

    onSubmit({
      amount: Number(amount),
      termMonths: Number(termMonths),
      applicantName,
      phone,
      documents,
      gender,
      dateOfBirth,
      address,
      occupation,
      companyName,
      monthlyIncome: Number(monthlyIncome),
      employmentType
    });
  };

  const steps = [
    { num: 1, label: lang === 'EN' ? 'Personal Info' : 'ព័ត៌មានផ្ទាល់ខ្លួន' },
    { num: 2, label: lang === 'EN' ? 'Employment' : 'ការងារ' },
    { num: 3, label: lang === 'EN' ? 'Documents' : 'ឯកសារ' },
    { num: 4, label: lang === 'EN' ? 'Review' : 'ពិនិត្យ' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-5 pb-8"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{lang === 'EN' ? 'Apply Loan' : 'ស្នើសុំប្រាក់កម្ចី'}</h2>
        <p className="text-sm text-gray-500">{lang === 'EN' ? 'Complete the steps below' : 'សូមបំពេញជំហានខាងក្រោម'}</p>
      </div>

      {/* Stepper Header */}
      <div className="mb-14 mt-4 px-2">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            const isLast = index === steps.length - 1;
            
            return (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center relative z-10">
                  <div 
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      isActive 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-200/50 ring-4 ring-red-50' 
                        : isCompleted 
                          ? 'bg-red-600 text-white' 
                          : 'bg-white text-gray-400 border border-gray-200'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={18} className="text-white" /> : s.num}
                  </div>
                  <div className={`absolute -bottom-7 text-[11px] font-medium whitespace-nowrap transition-colors duration-300 ${
                    isActive ? 'text-gray-900 font-bold' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {s.label}
                  </div>
                </div>
                {!isLast && (
                  <div className="flex-1 h-[2px] mx-1 sm:mx-2 relative bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 bottom-0 bg-red-600 transition-all duration-500 ease-in-out" 
                      style={{ width: step > s.num ? '100%' : '0%' }}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <InputWrapper icon={User} label={lang === 'EN' ? "Full Name" : "ឈ្មោះពេញ"}>
              <input 
                type="text" required placeholder={lang === 'EN' ? "Full Name" : "ឈ្មោះពេញ"}
                value={applicantName} onChange={(e) => setApplicantName(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm shadow-sm"
              />
            </InputWrapper>

            <InputWrapper icon={Phone} label={lang === 'EN' ? "Phone Number" : "លេខទូរស័ព្ទ"}>
              <input 
                type="tel" required placeholder={lang === 'EN' ? "Phone Number" : "លេខទូរស័ព្ទ"}
                value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm shadow-sm"
              />
            </InputWrapper>
            
            <InputWrapper icon={User} label={lang === 'EN' ? "Gender" : "ភេទ"}>
              <CustomSelect 
                value={gender} 
                onChange={setGender}
                placeholder={lang === 'EN' ? "Select Gender" : "ជ្រើសរើសភេទ"}
                options={[
                  { value: 'male', label: lang === 'EN' ? "Male" : "ប្រុស" },
                  { value: 'female', label: lang === 'EN' ? "Female" : "ស្រី" }
                ]}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none transition-all text-sm shadow-sm"
              />
            </InputWrapper>

            <InputWrapper icon={Calendar} label={lang === 'EN' ? "Date of Birth" : "ថ្ងៃខែឆ្នាំកំណើត"}>
              <DatePickerModal
                value={dateOfBirth}
                onChange={setDateOfBirth}
                lang={lang}
                placeholder={lang === 'EN' ? "Select Date of Birth" : "ជ្រើសរើសថ្ងៃខែឆ្នាំកំណើត"}
              />
            </InputWrapper>

            <InputWrapper icon={MapPin} label={lang === 'EN' ? "Address" : "អាសយដ្ឋាន"}>
              <input 
                type="text" placeholder={lang === 'EN' ? "Current Address" : "អាសយដ្ឋានបច្ចុប្បន្ន"} value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm shadow-sm"
              />
            </InputWrapper>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <InputWrapper icon={Briefcase} label={lang === 'EN' ? "Occupation" : "មុខរបរ"}>
              <input 
                type="text" placeholder={lang === 'EN' ? "e.g., Sales Manager" : "ឧ. អ្នកគ្រប់គ្រងផ្នែកលក់"}
                value={occupation} onChange={(e) => setOccupation(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm shadow-sm"
              />
            </InputWrapper>
            
            <InputWrapper icon={Briefcase} label={lang === 'EN' ? "Company Name" : "ឈ្មោះក្រុមហ៊ុន"}>
              <input 
                type="text" placeholder={lang === 'EN' ? "Company Name" : "ឈ្មោះក្រុមហ៊ុន"}
                value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm shadow-sm"
              />
            </InputWrapper>
            
            <InputWrapper icon={DollarSign} label={lang === 'EN' ? "Monthly Income (USD)" : "ប្រាក់ចំណូលប្រចាំខែ (ដុល្លារ)"}>
              <input 
                type="number" placeholder="0.00"
                value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm shadow-sm"
              />
            </InputWrapper>
            
            <InputWrapper icon={Briefcase} label={lang === 'EN' ? "Employment Type" : "ប្រភេទការងារ"}>
              <CustomSelect
                value={employmentType}
                onChange={setEmploymentType}
                placeholder={lang === 'EN' ? "Select Type" : "ជ្រើសរើសប្រភេទ"}
                options={[
                  { value: 'fulltime', label: lang === 'EN' ? "Full Time" : "ពេញម៉ោង" },
                  { value: 'parttime', label: lang === 'EN' ? "Part Time" : "ក្រៅម៉ោង" },
                  { value: 'contract', label: lang === 'EN' ? "Contract" : "កិច្ចសន្យា" }
                ]}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none transition-all text-sm shadow-sm"
              />
            </InputWrapper>
            
            <div className="pt-2">
              <InputWrapper icon={DollarSign} label={lang === 'EN' ? "Requested Loan Amount" : "ចំនួនប្រាក់កម្ចីដែលស្នើសុំ"}>
                <input 
                  type="number" required placeholder={settings.minLoanAmount.toString()}
                  min={settings.minLoanAmount} max={settings.maxLoanAmount}
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-white border-2 border-red-100 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-sm text-lg font-bold text-gray-900"
                />
              </InputWrapper>
              <div className="text-xs text-gray-500 text-center font-medium mt-1">
                {lang === 'EN' ? `Min: $${settings.minLoanAmount} - Max: $${settings.maxLoanAmount}` : `អប្បបរមា: $${settings.minLoanAmount} - អតិបរមា: $${settings.maxLoanAmount}`}
              </div>
            </div>

            <InputWrapper icon={Calendar} label={lang === 'EN' ? "Loan Tenure" : "រយៈពេលខ្ចី"}>
              <CustomSelect
                value={termMonths}
                onChange={setTermMonths}
                placeholder={lang === 'EN' ? "Select Tenure" : "ជ្រើសរើសរយៈពេល"}
                options={[
                  { value: '12', label: lang === 'EN' ? "12 Months" : "12 ខែ" },
                  { value: '24', label: lang === 'EN' ? "24 Months" : "24 ខែ" },
                  { value: '36', label: lang === 'EN' ? "36 Months" : "36 ខែ" },
                  { value: '48', label: lang === 'EN' ? "48 Months" : "48 ខែ" }
                ]}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none transition-all text-sm shadow-sm"
              />
            </InputWrapper>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
              <Upload size={20} className="shrink-0 text-blue-500 mt-0.5" />
              <p>{lang === 'EN' ? 'Please upload clear photos or scans of the following documents to speed up your application.' : 'សូមបញ្ចូលរូបថត ឬ ស្កេនឯកសារឲ្យបានច្បាស់ ដើម្បីពន្លឿនការស្នើសុំ។'}</p>
            </div>
            
            <div className="space-y-3">
              {[
                { label: lang === 'EN' ? 'ID Card (Front)' : 'អត្តសញ្ញាណប័ណ្ណ (មុខ)', icon: User, required: true },
                { label: lang === 'EN' ? 'ID Card (Back)' : 'អត្តសញ្ញាណប័ណ្ណ (ក្រោយ)', icon: User, required: true },
                { label: lang === 'EN' ? 'Salary Slip / Income Proof' : 'លិខិតបញ្ជាក់ប្រាក់ខែ / ចំណូល', icon: FileText, required: true },
                { label: lang === 'EN' ? 'Other Document (Optional)' : 'ឯកសារផ្សេងៗ (មិនចាំបាច់)', icon: FileText, required: false }
              ].map((doc, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-red-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500 bg-gray-50 p-2.5 rounded-lg">
                      <doc.icon size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-800 block">{doc.label}</span>
                      {doc.required && <span className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{lang === 'EN' ? 'Required' : 'ចាំបាច់'}</span>}
                    </div>
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors">
                    {lang === 'EN' ? 'Upload' : 'បញ្ចូល'}
                  </button>
                </div>
              ))}
            </div>
            
            <input 
              type="file" multiple className="hidden" ref={fileInputRef}
              onChange={async (e) => {
                if (e.target.files) {
                  const filesArray = Array.from(e.target.files) as File[];
                  const newDocs = await Promise.all(filesArray.map(compressImageFile));
                  setDocuments([...documents, ...newDocs]);
                }
              }}
            />
            {documents.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 text-sm text-green-600 mt-4 font-medium bg-green-50 p-3 rounded-xl border border-green-100">
                <CheckCircle2 size={18} />
                <span>{documents.length} {lang === 'EN' ? 'files attached successfully' : 'ឯកសារត្រូវបានភ្ជាប់ជោគជ័យ'}</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold tracking-wider text-gray-500 uppercase">{lang === 'EN' ? 'Summary' : 'សង្ខេប'}</h4>
                <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-red-600">{lang === 'EN' ? 'Edit' : 'កែប្រែ'}</button>
              </div>
              <div className="space-y-3 text-sm divide-y divide-gray-50">
                <div className="flex justify-between pt-2"><span className="text-gray-500">{lang === 'EN' ? 'Full Name' : 'ឈ្មោះពេញ'}</span><span className="font-semibold text-gray-900">{applicantName || (lang === 'EN' ? 'Not provided' : 'មិនមាន')}</span></div>
                <div className="flex justify-between pt-2"><span className="text-gray-500">{lang === 'EN' ? 'Phone Number' : 'លេខទូរស័ព្ទ'}</span><span className="font-semibold text-gray-900">{phone || (lang === 'EN' ? 'Not provided' : 'មិនមាន')}</span></div>
                <div className="flex justify-between pt-2"><span className="text-gray-500">{lang === 'EN' ? 'Occupation' : 'មុខរបរ'}</span><span className="font-semibold text-gray-900">{occupation || (lang === 'EN' ? 'Not provided' : 'មិនមាន')}</span></div>
                <div className="flex justify-between pt-2"><span className="text-gray-500">{lang === 'EN' ? 'Loan Amount' : 'ចំនួនប្រាក់កម្ចី'}</span><span className="font-bold text-red-600 text-base">${amount || '0'}</span></div>
                <div className="flex justify-between pt-2"><span className="text-gray-500">{lang === 'EN' ? 'Tenure' : 'រយៈពេលខ្ចី'}</span><span className="font-semibold text-gray-900">{termMonths} {lang === 'EN' ? 'Months' : 'ខែ'}</span></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold tracking-wider text-gray-500 uppercase">{lang === 'EN' ? 'Documents' : 'ឯកសារ'}</h4>
                <button type="button" onClick={() => setStep(3)} className="text-xs font-bold text-red-600">{lang === 'EN' ? 'Edit' : 'កែប្រែ'}</button>
              </div>
              
              {documents.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {documents.map((doc, i) => {
                    const docName = doc.includes('|||') ? doc.split('|||')[0] : doc;
                    return (
                    <div key={i} className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-200 flex-shrink-0 flex flex-col items-center justify-center overflow-hidden gap-1 p-1">
                      <FileText size={20} className="text-gray-400" />
                      <span className="text-[8px] text-gray-500 text-center truncate w-full px-1">{docName}</span>
                    </div>
                  )})}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                  {lang === 'EN' ? 'No documents uploaded' : 'មិនមានឯកសារ'}
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div className="pt-4 pb-2 flex gap-3">
          {step > 1 && (
            <button 
              type="button"
              onClick={() => {
                if (window.Telegram?.WebApp?.HapticFeedback) {
                  window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }
                setStep(step - 1);
              }}
              className="px-6 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              {lang === 'EN' ? 'Back' : 'ថយក្រោយ'}
            </button>
          )}
          <button 
            type="submit"
            disabled={isSubmitting} className="flex-1 py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors text-base flex justify-center items-center gap-2"
          >
            {isSubmitting ? (lang === 'EN' ? 'Submitting...' : 'កំពុងបញ្ជូន...') : (step === 4 ? (lang === 'EN' ? 'Submit Application' : 'បញ្ជូនពាក្យស្នើសុំ') : (lang === 'EN' ? 'Next Step' : 'បន្ទាប់'))}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
