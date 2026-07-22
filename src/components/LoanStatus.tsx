import { motion } from 'motion/react';
import { LoanApplication } from '../types';
import { CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../utils';
import { useContext } from 'react';
import { LanguageContext, AppSettingsContext } from '../App';

interface Props {
  applications: LoanApplication[];
  selectedAppId?: string | null;
}

export default function LoanStatus({ applications, selectedAppId }: Props) {
  const { lang } = useContext(LanguageContext);
  const { settings } = useContext(AppSettingsContext);
  
  // Get the selected application or most recent one
  const app = selectedAppId 
    ? (applications.find(a => a.id === selectedAppId) || (applications.length > 0 ? applications[0] : null)) 
    : (applications.length > 0 ? applications[0] : null);

  if (!app) {
    return (
      <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-64">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <p className="font-medium">{lang === 'EN' ? 'No applications found.' : 'មិនមានពាក្យស្នើសុំទេ។'}</p>
      </div>
    );
  }

  const getStepTime = (stepKey: string) => {
    if (app.statusTimestamps && app.statusTimestamps[stepKey as keyof typeof app.statusTimestamps]) {
      return app.statusTimestamps[stepKey as keyof typeof app.statusTimestamps];
    }
    if (stepKey === "submitted") return app.appliedAt;
    return null;
  };

  const steps = [
    { key: 'submitted', label: lang === 'EN' ? 'Application Submitted' : 'ពាក្យសុំត្រូវបានដាក់ស្នើ', time: getStepTime('submitted') },
    { key: 'reviewing', label: lang === 'EN' ? 'Under Review' : 'កំពុងត្រួតពិនិត្យ', time: getStepTime('reviewing') },
    { key: 'approved', label: lang === 'EN' ? 'Approved' : 'បានអនុម័ត', time: getStepTime('approved') },
    { key: 'rejected', label: lang === 'EN' ? 'Rejected' : 'ត្រូវបានបដិសេធ', time: getStepTime('rejected') },
    { key: 'disbursed', label: lang === 'EN' ? 'Disbursed' : 'បានដកប្រាក់', time: getStepTime('disbursed') },
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const order = { 'submitted': 1, 'reviewing': 2, 'approved': 3, 'rejected': 4, 'disbursed': 5 };
    const currentOrder = order[currentStatus as keyof typeof order] || 0;
    const stepOrder = order[stepKey as keyof typeof order] || 0;

    if (currentStatus === 'rejected') {
      if (stepKey === 'submitted' || stepKey === 'reviewing') return 'past';
      if (stepKey === 'rejected') return 'current';
      return 'future';
    }

    if (currentStatus === 'disbursed') {
      if (stepKey === 'rejected') return 'future';
      if (stepOrder < currentOrder) return 'past';
      if (stepOrder === currentOrder) return 'current';
      return 'future';
    }

    if (stepKey === 'rejected' || stepKey === 'disbursed') return 'future';
    if (stepOrder < currentOrder) return 'past';
    if (stepOrder === currentOrder) return 'current';
    return 'future';
  };

  const getStatusBadgeColor = () => {
    switch (app.status) {
      case 'submitted': return 'bg-blue-500';
      case 'reviewing': return 'bg-yellow-400';
      case 'approved': return 'bg-green-500';
      case 'disbursed': return 'bg-green-600';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = () => {
    switch (app.status) {
      case 'submitted': return lang === 'EN' ? 'Submitted' : 'បានដាក់ស្នើ';
      case 'reviewing': return lang === 'EN' ? 'In Review' : 'កំពុងត្រួតពិនិត្យ';
      case 'approved': return lang === 'EN' ? 'Approved' : 'បានអនុម័ត';
      case 'disbursed': return lang === 'EN' ? 'Disbursed' : 'បានដកប្រាក់';
      case 'rejected': return lang === 'EN' ? 'Rejected' : 'ត្រូវបានបដិសេធ';
      default: return app.status;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{lang === 'EN' ? 'Application Status' : 'ស្ថានភាពពាក្យស្នើសុំ'}</h2>
        <p className="text-sm text-gray-500 mt-1">{lang === 'EN' ? 'Track the progress of your loan application.' : 'ពិនិត្យមើលដំណើរការនៃពាក្យស្នើសុំកម្ចីរបស់អ្នក។'}</p>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
        <p className="text-xs font-bold text-gray-500 tracking-wider mb-4 uppercase">{lang === 'EN' ? 'Your Application Status' : 'ស្ថានភាពពាក្យស្នើសុំរបស់អ្នក'}</p>
        
        <div className={`text-white font-bold py-2 px-8 rounded-full text-sm uppercase mb-5 shadow-sm ${getStatusBadgeColor()}`}>
          {getStatusLabel()}
        </div>
        
        <p className="text-center text-sm text-gray-600 px-2 font-medium mb-6">
          {app.status === 'rejected' 
            ? (lang === 'EN' ? 'Your application has been rejected.' : 'ពាក្យស្នើសុំរបស់អ្នកត្រូវបានបដិសេធ។')
            : (lang === 'EN' ? 'Your application is currently being processed. We will notify you once there is an update.' : 'ពាក្យស្នើសុំរបស់អ្នកកំពុងត្រូវបានដំណើរការ។ យើងនឹងជូនដំណឹងនៅពេលមានការអាប់ដេត។')}
        </p>
        
        {app.status === 'rejected' && app.rejectionReason && (
          <div className="w-full bg-red-50 border border-red-100 rounded-xl p-4 mb-8">
            <p className="text-xs font-bold text-red-600 mb-1 uppercase tracking-wider">{lang === 'EN' ? 'Reason for Rejection' : 'មូលហេតុនៃការបដិសេធ'}</p>
            <p className="text-sm text-red-900">{app.rejectionReason}</p>
          </div>
        )}

        <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100 mb-8 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">ID</span>
            <span className="font-bold text-gray-900">#{app.id.slice(-6)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">{lang === 'EN' ? 'Amount' : 'ចំនួនប្រាក់'}</span>
            <span className="font-bold text-red-600">${app.amount.toLocaleString()}</span>
          </div>
          {app.productId && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">{lang === 'EN' ? 'Product' : 'ផលិតផល'}</span>
              <span className="font-bold text-gray-900">
                {settings.products.find(p => p.id === app.productId)?.[lang === 'EN' ? 'nameEn' : 'nameKh'] || app.productId}
              </span>
            </div>
          )}
        </div>

        <div className="w-full px-2">
          <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
            {steps.map((step, idx) => {
              const state = getStepStatus(step.key, app.status);
              const isPast = state === 'past';
              const isCurrent = state === 'current';
              const isFuture = state === 'future';
              
              let dotColor = 'bg-gray-100 border-2 border-white shadow-sm';
              if (isPast) dotColor = 'bg-green-500';
              if (isCurrent) {
                if (step.key === 'rejected') dotColor = 'bg-red-500 ring-4 ring-red-100';
                else if (step.key === 'disbursed') dotColor = 'bg-green-600 ring-4 ring-green-100';
                else dotColor = 'bg-yellow-400 ring-4 ring-yellow-100';
              }

              return (
                <div key={idx} className="relative pl-8">
                  <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full flex items-center justify-center ${dotColor}`}>
                    {isPast ? <CheckCircle size={14} className="text-white" /> : (isCurrent && step.key === 'rejected' ? <XCircle size={14} className="text-white" /> : (isCurrent ? <div className="w-2 h-2 bg-white rounded-full" /> : null))}
                  </div>
                  
                  <div className="-mt-1">
                    <p className={`font-bold text-sm ${isPast || isCurrent ? (step.key === 'rejected' ? 'text-red-600' : 'text-gray-900') : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {step.time && (isPast || isCurrent) ? (
                      <p className={`text-xs font-medium mt-1 ${step.key === 'rejected' ? 'text-red-400' : 'text-gray-500'}`}>
                        {formatDate(step.time)}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-300 mt-1">-</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {app.documents && app.documents.length > 0 && (
          <div className="w-full mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase">{lang === 'EN' ? 'Attached Documents' : 'ឯកសារភ្ជាប់'}</p>
            <div className="space-y-2">
              {app.documents.map((doc, idx) => {
                const docName = doc.includes('|||') ? doc.split('|||')[0] : doc;
                return (
                <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-gray-900 truncate">{docName}</p>
                    <p className="text-xs text-gray-500">{lang === 'EN' ? 'Uploaded' : 'បានបញ្ចូល'}</p>
                  </div>
                  <div className="shrink-0 text-green-500 bg-green-100 p-1.5 rounded-full">
                    <CheckCircle size={14} />
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
