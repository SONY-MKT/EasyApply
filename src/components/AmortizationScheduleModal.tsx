import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Download, Calendar, DollarSign, Percent, Clock, Calculator as CalcIcon } from 'lucide-react';
import { generateAmortizationSchedule, formatCurrency, ScheduleRow } from '../utils';
import { LanguageContext, AppSettingsContext } from '../App';
import XLSX from 'xlsx-js-style';

interface AmortizationScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  principal: number;
  annualRate: number;
  termMonths: number;
  applicantName?: string;
  startDate?: Date;
}

export default function AmortizationScheduleModal({
  isOpen,
  onClose,
  principal,
  annualRate,
  termMonths,
  applicantName,
  startDate = new Date()
}: AmortizationScheduleModalProps) {
  const { lang } = useContext(LanguageContext);
  const { settings } = useContext(AppSettingsContext);
  const [method, setMethod] = useState<'annuity' | 'declining' | 'flat'>('annuity');

  if (!isOpen) return null;

  const schedule: ScheduleRow[] = generateAmortizationSchedule(principal, annualRate, termMonths, method, startDate);

  const totalInterest = schedule.reduce((sum, row) => sum + row.interestPayment, 0);
  const totalPayment = schedule.reduce((sum, row) => sum + row.totalPayment, 0);

  const handleExportExcel = () => {
    const aoa: any[][] = [];

    // Header Banner
    aoa.push([
      {
        v: `  ${settings.appName || 'HFC Microfinance'} — តារាងរំលស់ប្រាក់កម្ចី (AMORTIZATION SCHEDULE)`,
        t: 's',
        s: {
          font: { name: 'Katumroy Pro', sz: 14, bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '991B1B' } },
          alignment: { horizontal: 'left', vertical: 'center' }
        }
      }
    ]);

    // Metadata Bar
    aoa.push([
      {
        v: applicantName ? `អតិថិជន / Applicant: ${applicantName}` : `កាលបរិច្ឆេទ / Date: ${new Date().toLocaleDateString('en-GB')}`,
        t: 's',
        s: { font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '1E293B' } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'center', vertical: 'center' } }
      },
      '',
      {
        v: `ប្រាក់កម្ចី / Amount: $${principal.toLocaleString()}`,
        t: 's',
        s: { font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '15803D' } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'center', vertical: 'center' } }
      },
      '',
      {
        v: `អត្រាការប្រាក់ / Rate: ${annualRate}% /ឆ្នាំ`,
        t: 's',
        s: { font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '0F172A' } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'center', vertical: 'center' } }
      },
      '',
      {
        v: `រយៈពេល / Term: ${termMonths} ខែ`,
        t: 's',
        s: { font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '0F172A' } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'center', vertical: 'center' } }
      }
    ]);

    aoa.push([]); // Spacer

    // Table Headers
    const headers = [
      'ខែទី (Month)',
      'កាលបរិច្ឆេទ (Date)',
      'ប្រាក់ដើមដើមគ្រា (Beg. Balance)',
      'ប្រាក់ដើមបង់ (Principal)',
      'ការប្រាក់ (Interest)',
      'ប្រាក់បង់សរុប (Total Payment)',
      'ប្រាក់ដើមនៅសល់ (End. Balance)'
    ];

    aoa.push(
      headers.map(h => ({
        v: h,
        t: 's',
        s: {
          font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '0F172A' } },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: {
            top: { style: 'medium', color: { rgb: '0F172A' } },
            bottom: { style: 'medium', color: { rgb: '0F172A' } },
            left: { style: 'thin', color: { rgb: '334155' } },
            right: { style: 'thin', color: { rgb: '334155' } }
          }
        }
      }))
    );

    // Data Rows
    schedule.forEach((row, idx) => {
      const isEven = idx % 2 === 0;
      const bgRgb = isEven ? 'FFFFFF' : 'F8FAFC';
      const borderStyle = {
        top: { style: 'thin', color: { rgb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
        left: { style: 'thin', color: { rgb: 'E2E8F0' } },
        right: { style: 'thin', color: { rgb: 'E2E8F0' } }
      };

      aoa.push([
        { v: row.month, t: 'n', s: { font: { name: 'Katumroy Pro', sz: 10, color: { rgb: '64748B' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } },
        { v: row.date, t: 's', s: { font: { name: 'Katumroy Pro', sz: 10, color: { rgb: '334155' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } },
        { v: row.beginningBalance, t: 'n', z: '$#,##0.00', s: { font: { name: 'Katumroy Pro', sz: 10, color: { rgb: '475569' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'right', vertical: 'center' }, border: borderStyle } },
        { v: row.principalPayment, t: 'n', z: '$#,##0.00', s: { font: { name: 'Katumroy Pro', sz: 10, color: { rgb: '0F172A' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'right', vertical: 'center' }, border: borderStyle } },
        { v: row.interestPayment, t: 'n', z: '$#,##0.00', s: { font: { name: 'Katumroy Pro', sz: 10, color: { rgb: 'DC2626' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'right', vertical: 'center' }, border: borderStyle } },
        { v: row.totalPayment, t: 'n', z: '$#,##0.00', s: { font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '16A34A' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'right', vertical: 'center' }, border: borderStyle } },
        { v: row.endingBalance, t: 'n', z: '$#,##0.00', s: { font: { name: 'Katumroy Pro', sz: 10, color: { rgb: '475569' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'right', vertical: 'center' }, border: borderStyle } }
      ]);
    });

    // Summary Total Row
    const totalBorderStyle = {
      top: { style: 'medium', color: { rgb: '991B1B' } },
      bottom: { style: 'double', color: { rgb: '991B1B' } },
      left: { style: 'thin', color: { rgb: 'CBD5E1' } },
      right: { style: 'thin', color: { rgb: 'CBD5E1' } }
    };

    aoa.push([
      { v: 'សរុប / TOTAL', t: 's', s: { font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '991B1B' } }, fill: { fgColor: { rgb: 'FEF2F2' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: totalBorderStyle } },
      { v: '', t: 's', s: { fill: { fgColor: { rgb: 'FEF2F2' } }, border: totalBorderStyle } },
      { v: '', t: 's', s: { fill: { fgColor: { rgb: 'FEF2F2' } }, border: totalBorderStyle } },
      { v: principal, t: 'n', z: '$#,##0.00', s: { font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '0F172A' } }, fill: { fgColor: { rgb: 'FEF2F2' } }, alignment: { horizontal: 'right', vertical: 'center' }, border: totalBorderStyle } },
      { v: totalInterest, t: 'n', z: '$#,##0.00', s: { font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: 'DC2626' } }, fill: { fgColor: { rgb: 'FEF2F2' } }, alignment: { horizontal: 'right', vertical: 'center' }, border: totalBorderStyle } },
      { v: totalPayment, t: 'n', z: '$#,##0.00', s: { font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '16A34A' } }, fill: { fgColor: { rgb: 'FEF2F2' } }, alignment: { horizontal: 'right', vertical: 'center' }, border: totalBorderStyle } },
      { v: '$0.00', t: 's', s: { font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '475569' } }, fill: { fgColor: { rgb: 'FEF2F2' } }, alignment: { horizontal: 'right', vertical: 'center' }, border: totalBorderStyle } }
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Title
      { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
      { s: { r: 1, c: 2 }, e: { r: 1, c: 3 } },
      { s: { r: 1, c: 4 }, e: { r: 1, c: 5 } }
    ];

    worksheet['!cols'] = [
      { wch: 12 }, // Month
      { wch: 16 }, // Date
      { wch: 22 }, // Beg. Balance
      { wch: 20 }, // Principal
      { wch: 20 }, // Interest
      { wch: 22 }, // Total Payment
      { wch: 22 }  // End. Balance
    ];

    worksheet['!views'] = [{ showGridLines: true }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule');
    XLSX.writeFile(workbook, `Amortization_Schedule_${applicantName ? applicantName.replace(/\s+/g, '_') : 'Loan'}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden print:p-0 print:static">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm print:hidden"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white w-full h-[95vh] sm:h-auto sm:max-w-5xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:max-h-[92vh] z-10 print:h-auto print:max-h-none print:shadow-none print:rounded-none"
        >
          {/* Header */}
          <div className="px-4 py-3.5 sm:px-6 sm:py-5 bg-slate-900 text-white flex items-center justify-between print:bg-white print:text-black print:border-b print:border-gray-300">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold shrink-0 print:hidden">
                <CalcIcon className="w-5 h-5 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-xl font-bold tracking-tight truncate">
                  {lang === 'EN' ? 'Loan Schedule' : 'តារាងរំលស់ប្រាក់កម្ចី'}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate print:text-gray-600">
                  {applicantName ? `${lang === 'EN' ? 'Applicant' : 'អតិថិជន'}: ${applicantName}` : settings.appName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 print:hidden">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg sm:rounded-xl transition-colors shadow-sm"
                title="Export Excel"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Excel</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg sm:rounded-xl transition-colors"
                title="Print"
              >
                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{lang === 'EN' ? 'Print' : 'បោះពុម្ព'}</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 bg-slate-50/50 print:bg-white print:p-0">
            {/* Payment Method Selector */}
            <div className="bg-white p-1.5 rounded-2xl border border-gray-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-1 print:hidden">
              <button
                onClick={() => setMethod('annuity')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                  method === 'annuity'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {lang === 'EN' ? 'Annuity (Equal Payment)' : 'បង់ស្មើប្រចាំខែ (Annuity)'}
              </button>
              <button
                onClick={() => setMethod('declining')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                  method === 'declining'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {lang === 'EN' ? 'Declining Balance' : 'ដើមស្មើ ការប្រាក់ថយ'}
              </button>
              <button
                onClick={() => setMethod('flat')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                  method === 'flat'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {lang === 'EN' ? 'Flat Interest Rate' : 'អត្រាការប្រាក់ថេរ'}
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                <div className="flex items-center gap-1.5 text-gray-500 text-[11px] sm:text-xs font-medium mb-0.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'EN' ? 'Principal' : 'ប្រាក់ដើមកម្ចី'}</span>
                </div>
                <div className="text-sm sm:text-xl font-extrabold text-gray-900 truncate">
                  {formatCurrency(principal)}
                </div>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                <div className="flex items-center gap-1.5 text-gray-500 text-[11px] sm:text-xs font-medium mb-0.5">
                  <Percent className="w-3.5 h-3.5 text-blue-600" />
                  <span>{lang === 'EN' ? 'Rate' : 'អត្រាការប្រាក់'}</span>
                </div>
                <div className="text-sm sm:text-xl font-extrabold text-gray-900 truncate">
                  {annualRate}% <span className="text-[10px] sm:text-xs text-gray-400 font-normal">/ឆ្នាំ</span>
                </div>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                <div className="flex items-center gap-1.5 text-gray-500 text-[11px] sm:text-xs font-medium mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{lang === 'EN' ? 'Tenure' : 'រយៈពេលខ្ចី'}</span>
                </div>
                <div className="text-sm sm:text-xl font-extrabold text-gray-900 truncate">
                  {termMonths} <span className="text-[10px] sm:text-xs text-gray-400 font-normal">ខែ</span>
                </div>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                <div className="flex items-center gap-1.5 text-gray-500 text-[11px] sm:text-xs font-medium mb-0.5">
                  <Calendar className="w-3.5 h-3.5 text-red-600" />
                  <span>{lang === 'EN' ? 'Interest' : 'ការប្រាក់សរុប'}</span>
                </div>
                <div className="text-sm sm:text-xl font-extrabold text-red-600 truncate">
                  {formatCurrency(totalInterest)}
                </div>
              </div>
            </div>

            {/* Schedule Table / Cards */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden print:border-none print:shadow-none">
              <div className="p-3.5 sm:p-4 border-b border-gray-200 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 print:bg-white print:text-black">
                <h4 className="font-bold text-xs sm:text-base">
                  {lang === 'EN' ? 'Repayment Breakdown' : 'តារាងបង់ប្រាក់លម្អិត'}
                </h4>
                <div className="text-xs text-slate-300 print:text-gray-600 font-medium">
                  {lang === 'EN' ? 'Total' : 'បង់សរុប'}: <span className="text-emerald-400 print:text-emerald-700 font-bold">{formatCurrency(totalPayment)}</span>
                </div>
              </div>

              {/* Mobile Card List View (visible on mobile screens for super clean reading) */}
              <div className="block sm:hidden divide-y divide-gray-100 max-h-[50vh] overflow-y-auto">
                {schedule.map((row) => (
                  <div key={row.month} className="p-3 bg-white hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                          {row.month}
                        </span>
                        <span className="text-xs font-bold text-gray-800">{row.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block uppercase font-bold">{lang === 'EN' ? 'Monthly Payment' : 'ប្រាក់បង់សរុប'}</span>
                        <span className="text-sm font-black text-emerald-600">{formatCurrency(row.totalPayment)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-gray-500 block">{lang === 'EN' ? 'Principal' : 'ប្រាក់ដើម'}</span>
                        <span className="font-bold text-slate-900">{formatCurrency(row.principalPayment)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">{lang === 'EN' ? 'Interest' : 'ការប្រាក់'}</span>
                        <span className="font-bold text-red-600">{formatCurrency(row.interestPayment)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">{lang === 'EN' ? 'Beg. Balance' : 'ដើមគ្រា'}</span>
                        <span className="font-semibold text-slate-600">{formatCurrency(row.beginningBalance)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">{lang === 'EN' ? 'End. Balance' : 'ចុងគ្រា'}</span>
                        <span className="font-semibold text-slate-600">{formatCurrency(row.endingBalance)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop & Printable Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3 text-center w-12">#</th>
                      <th className="p-3 text-center whitespace-nowrap">{lang === 'EN' ? 'Payment Date' : 'កាលបរិច្ឆេទ'}</th>
                      <th className="p-3 text-right whitespace-nowrap">{lang === 'EN' ? 'Beg. Balance' : 'ប្រាក់ដើមដើមគ្រា'}</th>
                      <th className="p-3 text-right whitespace-nowrap">{lang === 'EN' ? 'Principal' : 'ប្រាក់ដើម'}</th>
                      <th className="p-3 text-right whitespace-nowrap">{lang === 'EN' ? 'Interest' : 'ការប្រាក់'}</th>
                      <th className="p-3 text-right whitespace-nowrap">{lang === 'EN' ? 'Total Payment' : 'ប្រាក់បង់សរុប'}</th>
                      <th className="p-3 text-right whitespace-nowrap">{lang === 'EN' ? 'End. Balance' : 'ប្រាក់ដើមនៅសល់'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {schedule.map((row) => (
                      <tr key={row.month} className={row.month % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}>
                        <td className="p-3 text-center text-gray-500 font-semibold">{row.month}</td>
                        <td className="p-3 text-center text-gray-700 whitespace-nowrap">{row.date}</td>
                        <td className="p-3 text-right text-gray-600 whitespace-nowrap">{formatCurrency(row.beginningBalance)}</td>
                        <td className="p-3 text-right text-gray-900 font-semibold whitespace-nowrap">{formatCurrency(row.principalPayment)}</td>
                        <td className="p-3 text-right text-red-600 font-semibold whitespace-nowrap">{formatCurrency(row.interestPayment)}</td>
                        <td className="p-3 text-right text-emerald-600 font-extrabold whitespace-nowrap">{formatCurrency(row.totalPayment)}</td>
                        <td className="p-3 text-right text-gray-600 whitespace-nowrap">{formatCurrency(row.endingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-red-50/70 border-t-2 border-red-200 font-extrabold text-slate-900">
                      <td colSpan={3} className="p-3 text-center text-red-900 uppercase">
                        {lang === 'EN' ? 'Grand Total' : 'សរុបរួម'}
                      </td>
                      <td className="p-3 text-right text-slate-900 whitespace-nowrap">{formatCurrency(principal)}</td>
                      <td className="p-3 text-right text-red-600 whitespace-nowrap">{formatCurrency(totalInterest)}</td>
                      <td className="p-3 text-right text-emerald-600 whitespace-nowrap">{formatCurrency(totalPayment)}</td>
                      <td className="p-3 text-right text-gray-500 whitespace-nowrap">$0.00</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
