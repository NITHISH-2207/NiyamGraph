export interface StatusStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
  dotColor: string;
}

export const STATUS_STYLE_MAP: Record<string, StatusStyle> = {
  Draft: {
    label: 'Draft',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dotColor: 'bg-slate-400',
  },
  Submitted: {
    label: 'Submitted',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dotColor: 'bg-blue-500',
  },
  'Under Scrutiny': {
    label: 'Under Scrutiny',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dotColor: 'bg-indigo-500',
  },
  'Deficiency Raised': {
    label: 'Deficiency Raised',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
    dotColor: 'bg-amber-500',
  },
  Resubmitted: {
    label: 'Resubmitted',
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    dotColor: 'bg-cyan-500',
  },
  'Under Evaluation': {
    label: 'Under Evaluation',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dotColor: 'bg-purple-500',
  },
  'Decision Pending': {
    label: 'Decision Pending',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    dotColor: 'bg-orange-500',
  },
  Approved: {
    label: 'Approved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  Rejected: {
    label: 'Rejected',
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-300',
    dotColor: 'bg-red-500',
  },
  Closed: {
    label: 'Closed',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
    dotColor: 'bg-slate-400',
  },
  Pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
    dotColor: 'bg-amber-500',
  },
  Open: {
    label: 'Action Required',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
    dotColor: 'bg-amber-500',
  },
  Overdue: {
    label: 'Overdue',
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-300',
    dotColor: 'bg-red-600',
  },
  Deficient: {
    label: 'Deficient',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
    dotColor: 'bg-amber-500',
  },
};

export function getStatusStyle(status: string): StatusStyle {
  return (
    STATUS_STYLE_MAP[status] || {
      label: status,
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      dotColor: 'bg-slate-400',
    }
  );
}

/**
 * Format ISO datetime string in Asia/Kolkata (IST).
 */
export function formatIST(dateString: string | null | undefined, withTime: boolean = false): string {
  if (!dateString) return '—';

  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    if (withTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = true;
    }

    return new Intl.DateTimeFormat('en-IN', options).format(d);
  } catch {
    return '—';
  }
}

