// --- User ---
export interface User {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string; // optional — initials shown as fallback
  cardId?: string;    // linked card (optional — user may not have one yet)
}

// --- Credit Card ---
export interface Card {
  id: string;
  lastFourDigits: string; // e.g. "4092"
  ownerId: string;        // the account owner (Account Owner)
}

// --- Transaction ---
export type TransactionCategory =
  | 'מזון ומשקאות'
  | 'קניות'
  | 'תחבורה'
  | 'פנאי'
  | 'בריאות'
  | 'אחר';

export interface Transaction {
  id: string;
  storeName: string;
  amount: number;
  date: string;           // ISO format: "2024-05-24"
  cardId: string;
  category: TransactionCategory;
  assignedUserId?: string; // undefined = unassigned
  isSplit: boolean;
  notes?: string;          // free text description
}

// --- Monthly Summary ---
export interface UserSummary {
  userId: string;
  totalOwed: number;
  totalPaid: number;
  transactionCount: number;
  settledDate?: string;   // date paid — undefined if still open
}

export interface MonthlySummary {
  month: string;          // e.g. "2024-05"
  totalExpenses: number;
  userSummaries: UserSummary[];
}
