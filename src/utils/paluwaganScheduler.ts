/**
 * Paluwagan Payment Scheduler Utility
 * Enforces Fixed Payment Dates (15th and 30th of every month)
 * Batch-Controlled Schedule Architecture
 */

export interface PaluwaganScheduleItem {
  installmentNumber: number;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  status: "UPCOMING" | "DUE" | "PAID" | "PARTIALLY PAID" | "OVERDUE" | "MISSED" | "PENDING VERIFICATION" | "REJECTED";
  paymentDate?: string;
  receiptNumber?: string;
  collector?: string;
  remarks?: string;
  referenceNumber?: string;
  verificationStatus?: "Pending Verification" | "Paid" | "Rejected";
  isDuplicateReference?: boolean;
}

/**
 * Format Date to YYYY-MM-DD
 */

export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Get last valid day of month (e.g. Feb 28/29, or 30 for 30/31 day months)
 */
export function getFixed30thDate(year: number, monthZeroBased: number): Date {
  const lastDayOfMonth = new Date(year, monthZeroBased + 1, 0).getDate();
  const day = Math.min(30, lastDayOfMonth);
  return new Date(year, monthZeroBased, day);
}

/**
 * Automatically calculate batch end date based on start date and duration (8 or 12 months)
 */
export function calculateBatchEndDate(startDateStr: string, durationMonths: 8 | 12): string {
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) {
    const today = new Date();
    return formatDateISO(new Date(today.getFullYear(), today.getMonth() + durationMonths, 0));
  }

  const endMonth = start.getMonth() + durationMonths - 1;
  const endYear = start.getFullYear() + Math.floor(endMonth / 12);
  const normalizedMonth = endMonth % 12;
  
  const lastDay = getFixed30thDate(endYear, normalizedMonth);
  return formatDateISO(lastDay);
}

/**
 * Generate Fixed Payment Dates Schedule for a Batch or Member
 * Fixed dates: 15th and 30th of each month for durationMonths (8 or 12)
 */
export function generateFixedBatchSchedule(
  startDateStr: string,
  durationMonths: 8 | 12,
  totalAmountDue: number,
  downPayment: number = 0,
  todayStr: string = formatDateISO(new Date())
): PaluwaganScheduleItem[] {
  const totalInstallmentAmount = Math.max(0, totalAmountDue - downPayment);
  const totalInstallments = durationMonths * 2; // 8 months = 16 installments, 12 months = 24 installments
  const perInstallmentAmount = Math.round(totalInstallmentAmount / totalInstallments);

  const schedule: PaluwaganScheduleItem[] = [];
  const start = new Date(startDateStr);
  const baseYear = isNaN(start.getTime()) ? new Date().getFullYear() : start.getFullYear();
  const baseMonth = isNaN(start.getTime()) ? new Date().getMonth() : start.getMonth();

  let count = 0;

  for (let m = 0; m < durationMonths; m++) {
    const currentMonthIndex = baseMonth + m;
    const year = baseYear + Math.floor(currentMonthIndex / 12);
    const month = currentMonthIndex % 12;

    // 1st payment of month: 15th
    count++;
    const d15 = new Date(year, month, 15);
    const d15Str = formatDateISO(d15);
    const status15 = evaluateInstallmentStatus(d15Str, perInstallmentAmount, 0, todayStr);

    schedule.push({
      installmentNumber: count,
      dueDate: d15Str,
      amountDue: perInstallmentAmount,
      amountPaid: 0,
      status: status15,
    });

    // 2nd payment of month: 30th (or end of Feb)
    count++;
    const d30 = getFixed30thDate(year, month);
    const d30Str = formatDateISO(d30);
    const status30 = evaluateInstallmentStatus(d30Str, perInstallmentAmount, 0, todayStr);

    schedule.push({
      installmentNumber: count,
      dueDate: d30Str,
      amountDue: perInstallmentAmount,
      amountPaid: 0,
      status: status30,
    });
  }

  return schedule;
}

/**
 * Dynamically evaluate status of a scheduled installment
 */
export function evaluateInstallmentStatus(
  dueDateStr: string,
  amountDue: number,
  amountPaid: number,
  todayStr: string = formatDateISO(new Date())
): "UPCOMING" | "DUE" | "PAID" | "PARTIALLY PAID" | "OVERDUE" | "MISSED" {
  if (amountPaid >= amountDue && amountDue > 0) {
    return "PAID";
  }
  if (amountPaid > 0 && amountPaid < amountDue) {
    return "PARTIALLY PAID";
  }
  
  if (dueDateStr < todayStr) {
    return "OVERDUE";
  }
  if (dueDateStr === todayStr) {
    return "DUE";
  }
  return "UPCOMING";
}

/**
 * Re-evaluate complete schedule with current payments and today's date
 */
export function syncScheduleWithPayments(
  schedule: PaluwaganScheduleItem[],
  installmentsLog: Array<{ amount: number; date?: string; remarks?: string }>,
  todayStr: string = formatDateISO(new Date())
): PaluwaganScheduleItem[] {
  let remainingPaymentPool = installmentsLog.reduce((sum, item) => sum + (item.amount || 0), 0);

  return schedule.map((item) => {
    let itemPaid = 0;
    if (remainingPaymentPool > 0) {
      itemPaid = Math.min(item.amountDue, remainingPaymentPool);
      remainingPaymentPool -= itemPaid;
    }

    const newStatus = evaluateInstallmentStatus(item.dueDate, item.amountDue, itemPaid, todayStr);

    return {
      ...item,
      amountPaid: itemPaid,
      status: newStatus,
    };
  });
}

/**
 * Calculate Summary Metrics for a Member's Paluwagan Plan
 */
export function calculateMemberPaluwaganMetrics(
  schedule: PaluwaganScheduleItem[],
  totalContractAmount: number,
  downPayment: number = 0,
  todayStr: string = formatDateISO(new Date())
) {
  const syncedSchedule = syncScheduleWithPayments(schedule, [], todayStr);
  const totalPaid = downPayment + syncedSchedule.reduce((sum, item) => sum + item.amountPaid, 0);
  const remainingBalance = Math.max(0, totalContractAmount - totalPaid);

  const overdueSchedule = syncedSchedule.filter((item) => item.status === "OVERDUE" || item.status === "MISSED");
  const overdueBalance = overdueSchedule.reduce((sum, item) => sum + (item.amountDue - item.amountPaid), 0);

  const paidCount = syncedSchedule.filter((item) => item.status === "PAID").length;
  const overdueCount = overdueSchedule.length;

  const nextUpcoming = syncedSchedule.find((item) => item.status === "UPCOMING" || item.status === "DUE" || item.status === "OVERDUE");

  return {
    totalAmountDue: totalContractAmount,
    downPayment,
    totalPaid,
    remainingBalance,
    overdueBalance,
    paidCount,
    overdueCount,
    nextPaymentDate: nextUpcoming ? nextUpcoming.dueDate : "Fully Paid",
    nextPaymentAmount: nextUpcoming ? (nextUpcoming.amountDue - nextUpcoming.amountPaid) : 0,
    syncedSchedule,
  };
}

/**
 * Calculate 2-Days-Before Email Reminder Date for Fixed Payment Dates
 * E.g., July 15 -> July 13 reminder
 * E.g., July 30 -> July 28 reminder
 */
export function calculateEmailReminderDate(dueDateStr: string): string {
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return dueDateStr;
  due.setDate(due.getDate() - 2);
  return formatDateISO(due);
}
