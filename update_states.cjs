const fs = require('fs');
let content = fs.readFileSync('src/components/ApplicationForm.tsx', 'utf8');

const target1 = `  const [employmentType, setEmploymentType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);`;
const replace1 = `  const [employmentType, setEmploymentType] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);`;

content = content.replace(target1, replace1);

const target2 = `            <InputWrapper icon={Calendar} label={lang === 'EN' ? "Date of Birth" : "ថ្ងៃខែឆ្នាំកំណើត"}>
              <input 
                type="date"
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm shadow-sm text-gray-700"
              />
            </InputWrapper>
            <InputWrapper icon={MapPin} label={lang === 'EN' ? "Address" : "អាសយដ្ឋាន"}>
              <input 
                type="text" placeholder={lang === 'EN' ? "Current Address" : "អាសយដ្ឋានបច្ចុប្បន្ន"}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm shadow-sm"
              />
            </InputWrapper>`;
const replace2 = `            <InputWrapper icon={Calendar} label={lang === 'EN' ? "Date of Birth" : "ថ្ងៃខែឆ្នាំកំណើត"}>
              <input 
                type="date"
                value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm shadow-sm text-gray-700"
              />
            </InputWrapper>
            <InputWrapper icon={MapPin} label={lang === 'EN' ? "Address" : "អាសយដ្ឋាន"}>
              <input 
                type="text" placeholder={lang === 'EN' ? "Current Address" : "អាសយដ្ឋានបច្ចុប្បន្ន"}
                value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm shadow-sm"
              />
            </InputWrapper>`;

content = content.replace(target2, replace2);
fs.writeFileSync('src/components/ApplicationForm.tsx', content);
