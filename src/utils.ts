export function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months;
  const monthlyRate = annualRate / 100 / 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

export interface ScheduleRow {
  month: number;
  date: string;
  beginningBalance: number;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  endingBalance: number;
}

export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  months: number,
  method: 'annuity' | 'declining' | 'flat' = 'annuity',
  startDate: Date = new Date()
): ScheduleRow[] {
  const schedule: ScheduleRow[] = [];
  let balance = principal;
  const monthlyRate = annualRate / 100 / 12;

  if (months <= 0 || principal <= 0) return [];

  const basePayment = calculateMonthlyPayment(principal, annualRate, months);

  for (let i = 1; i <= months; i++) {
    const payDate = new Date(startDate);
    payDate.setMonth(payDate.getMonth() + i);

    const dateStr = payDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const begBal = balance;
    let interest = 0;
    let principalPaid = 0;
    let totalPaid = 0;

    if (method === 'annuity') {
      // Equal monthly payment
      interest = begBal * monthlyRate;
      if (i === months) {
        principalPaid = begBal;
        totalPaid = principalPaid + interest;
      } else {
        totalPaid = basePayment;
        principalPaid = totalPaid - interest;
      }
    } else if (method === 'declining') {
      // Equal principal repayment + interest on remaining balance
      principalPaid = principal / months;
      interest = begBal * monthlyRate;
      totalPaid = principalPaid + interest;
    } else {
      // Flat rate (Equal principal + interest calculated on original principal)
      principalPaid = principal / months;
      interest = (principal * (annualRate / 100)) / 12;
      totalPaid = principalPaid + interest;
    }

    let endBal = Math.max(0, begBal - principalPaid);
    if (i === months) endBal = 0;

    schedule.push({
      month: i,
      date: dateStr,
      beginningBalance: begBal,
      principalPayment: principalPaid,
      interestPayment: interest,
      totalPayment: totalPaid,
      endingBalance: endBal
    });

    balance = endBal;
  }

  return schedule;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date(dateString)).replace(',', '');
}

