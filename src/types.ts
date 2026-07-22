export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export type ApplicationStatus = 'submitted' | 'reviewing' | 'approved' | 'disbursed' | 'rejected';

export interface LoanApplication {
  id: string;
  amount: number;
  termMonths: number;
  status: ApplicationStatus;
  appliedAt: string;
  applicantName: string;
  phone: string;
  documents: string[];
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  occupation?: string;
  companyName?: string;
  monthlyIncome?: number;
  employmentType?: string;
  statusTimestamps?: Partial<Record<ApplicationStatus, string>>;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe: {
          user?: TelegramUser;
        };
        ready: () => void;
        expand: () => void;
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
        };
      }
    }
  }
}


export interface AppSettings { 
  appName: string; 
  primaryColor: string; 
  logoUrl: string; 
  welcomeEn: string; 
  welcomeKh: string;
  contactPhone: string;
  contactEmail: string;
  contactLiveChatUrl: string;
  contactBranchUrl: string;
  interestRate: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  minLoanTerm: number;
  maxLoanTerm: number;
  promoTitleEn: string;
  promoTitleKh: string;
  promoAmountEn: string;
  promoAmountKh: string;
  promoDescEn: string;
  promoDescKh: string;
  promoImages?: string[];
  products: Product[];
  telegramBotToken?: string;
  telegramChatId?: string;
  enableTelegramNotify?: boolean;
}

export interface Product {
  id: string;
  nameEn: string;
  nameKh: string;
  descEn: string;
  descKh: string;
  icon: string;
}
