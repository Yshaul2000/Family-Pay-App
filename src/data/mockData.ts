import type { User, Card, Transaction, MonthlySummary } from '../types';

// --- Cards ---
export const mockCards: Card[] = [
  { id: 'card-1', lastFourDigits: '4092', ownerId: 'user-owner' },
  { id: 'card-2', lastFourDigits: '8812', ownerId: 'user-owner' },
];

// --- Users ---
export const mockUsers: User[] = [
  {
    id: 'user-owner',
    name: 'בעל החשבון',
    role: 'בעל החשבון',
    cardId: 'card-1',
  },
  {
    id: 'user-1',
    name: 'משתמש א',
    role: 'משתמש',
    cardId: 'card-1',
  },
  {
    id: 'user-2',
    name: 'משתמש ב',
    role: 'משתמש',
    cardId: 'card-2',
  },
  {
    id: 'user-3',
    name: 'משתמש ג',
    role: 'משתמש',
    cardId: 'card-2',
  },
];

// --- Transactions ---
export const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    storeName: 'סופר-פארם',
    amount: 245.90,
    date: '2024-05-24',
    cardId: 'card-1',
    category: 'בריאות',
    assignedUserId: 'user-david',
    isSplit: false,
  },
  {
    id: 'tx-2',
    storeName: 'קפה לנדוור',
    amount: 112.00,
    date: '2024-05-22',
    cardId: 'card-2',
    category: 'מזון ומשקאות',
    assignedUserId: undefined,
    isSplit: false,
  },
  {
    id: 'tx-3',
    storeName: 'פז גלילות',
    amount: 350.00,
    date: '2024-05-21',
    cardId: 'card-1',
    category: 'תחבורה',
    assignedUserId: 'user-michal',
    isSplit: false,
  },
  {
    id: 'tx-4',
    storeName: 'Apple Store',
    amount: 4299.00,
    date: '2024-05-19',
    cardId: 'card-2',
    category: 'קניות',
    assignedUserId: undefined,
    isSplit: false,
  },
  {
    id: 'tx-5',
    storeName: 'שופרסל',
    amount: 413.50,
    date: '2024-05-17',
    cardId: 'card-1',
    category: 'מזון ומשקאות',
    assignedUserId: 'user-sara',
    isSplit: false,
  },
  {
    id: 'tx-6',
    storeName: 'HOT מובייל',
    amount: 299.00,
    date: '2024-05-15',
    cardId: 'card-2',
    category: 'אחר',
    assignedUserId: 'user-david',
    isSplit: false,
  },
];

// --- Monthly Summary ---
export const mockMonthlySummary: MonthlySummary = {
  month: '2024-05',
  totalExpenses: 8420,
  userSummaries: [
    {
      userId: 'user-david',
      totalOwed: 1200,
      totalPaid: 0,
      transactionCount: 5,
    },
    {
      userId: 'user-sara',
      totalOwed: 450,
      totalPaid: 0,
      transactionCount: 3,
    },
    {
      userId: 'user-michal',
      totalOwed: 1989.50,
      totalPaid: 0,
      transactionCount: 3,
    },
    {
      userId: 'user-roei',
      totalOwed: 2100,
      totalPaid: 2100,
      transactionCount: 8,
      settledDate: '2024-05-12',
    },
  ],
};
