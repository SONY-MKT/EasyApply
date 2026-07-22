import { AppSettings } from './types';

export const defaultSettings: AppSettings = {
  appName: 'EasyApply',
  primaryColor: '#dc2626',
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.png',
  welcomeEn: 'Welcome to',
  welcomeKh: 'ស្វាគមន៍មកកាន់',
  contactPhone: '023 999 005',
  contactEmail: 'info@hfcmicrofinance.com.kh',
  contactLiveChatUrl: 'https://t.me/hfc_support',
  contactBranchUrl: 'https://goo.gl/maps/hfc',
  interestRate: 1.5,
  minLoanAmount: 50,
  maxLoanAmount: 10000,
  minLoanTerm: 1,
  maxLoanTerm: 48,
  promoTitleEn: 'Special Loan Promotion',
  promoTitleKh: 'ប្រូម៉ូសិនកម្ចីពិសេស',
  promoAmountEn: 'Up to $20,000',
  promoAmountKh: 'រហូតដល់ ២០,០០០ ដុល្លារ',
  promoDescEn: 'Low Interest Rate\nStart from 10%',
  promoDescKh: 'អត្រាការប្រាក់ទាប\nចាប់ផ្តើមពី ១០%',
  promoImages: [
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=800&auto=format&fit=crop"
  ],
  products: [
    {
      id: 'motorcycle',
      nameEn: 'Motorcycle Installment',
      nameKh: 'រំលស់ម៉ូតូ',
      descEn: 'Flexible motorcycle installment plan with HFC',
      descKh: 'ពង្រីកអាជីវកម្មរបស់អ្នកជាមួយដំណោះស្រាយកម្ចី HFC',
      icon: 'Motorbike'
    },
    {
      id: 'car',
      nameEn: 'Car Installment',
      nameKh: 'រំលស់ឡាន',
      descEn: 'Get your dream car easily',
      descKh: 'សម្រេចគោលដៅផ្ទាល់ខ្លួនយ៉ាងងាយស្រួល',
      icon: 'Car'
    },
    {
      id: 'refinance',
      nameEn: 'Refinancing',
      nameKh: 'រំលស់ត្រឡប់',
      descEn: 'Support your agricultural business',
      descKh: 'គាំទ្រអាជីវកម្មកសិកម្មរបស់អ្នក',
      icon: 'RefreshCcw'
    }
  ],
  telegramBotToken: '',
  telegramChatId: '',
  enableTelegramNotify: false
};
