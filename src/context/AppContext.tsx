import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import type { User, Card, Transaction, MonthlySummary } from '../types';
import { mockUsers, mockCards, mockTransactions } from '../data/mockData';
import { supabase } from '../lib/supabase';

// --- DB row → TypeScript mappers ---

function rowToUser(r: Record<string, unknown>): User {
  return {
    id: r.id as string,
    name: r.name as string,
    role: r.role as string,
    avatarUrl: r.avatar_url as string | undefined,
    cardId: r.card_id as string | undefined,
  };
}

function rowToCard(r: Record<string, unknown>): Card {
  return {
    id: r.id as string,
    lastFourDigits: r.last_four_digits as string,
    ownerId: r.owner_id as string,
  };
}

function rowToTransaction(r: Record<string, unknown>): Transaction {
  return {
    id: r.id as string,
    storeName: r.store_name as string,
    amount: r.amount as number,
    date: r.date as string,
    cardId: r.card_id as string,
    category: r.category as Transaction['category'],
    assignedUserId: r.assigned_user_id as string | undefined,
    isSplit: r.is_split as boolean,
    notes: r.notes as string | undefined,
  };
}

// --- Context shape ---

interface AppContextValue {
  loading: boolean;
  users: User[];
  cards: Card[];
  transactions: Transaction[];
  monthlySummary: MonthlySummary;
  addTransaction: (data: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  assignTransaction: (txId: string, userId: string) => Promise<void>;
  markSettled: (userId: string) => Promise<void>;
  unmarkSettled: (userId: string) => Promise<void>;
  addUser: (data: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<Omit<User, 'id'>>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  assignCardToUser: (userId: string, cardId: string) => Promise<void>;
  addCard: (lastFourDigits: string, ownerId: string) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

// --- Provider ---

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settledUsers, setSettledUsers] = useState<Record<string, string>>({});

  // --- Load all data on mount, seed if empty ---

  useEffect(() => {
    async function loadAll() {
      setLoading(true);

      const [usersRes, cardsRes, txRes, settledRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('cards').select('*'),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('settled_users').select('*'),
      ]);

      // Seed users if empty
      if (!usersRes.data?.length) {
        await supabase.from('users').insert(mockUsers.map(u => ({
          id: u.id, name: u.name, role: u.role,
          avatar_url: u.avatarUrl ?? null,
          card_id: u.cardId ?? null,
        })));
        const fresh = await supabase.from('users').select('*');
        setUsers((fresh.data ?? []).map(rowToUser));
      } else {
        setUsers(usersRes.data.map(rowToUser));
      }

      // Seed cards if empty
      if (!cardsRes.data?.length) {
        await supabase.from('cards').insert(mockCards.map(c => ({
          id: c.id, last_four_digits: c.lastFourDigits, owner_id: c.ownerId,
        })));
        const fresh = await supabase.from('cards').select('*');
        setCards((fresh.data ?? []).map(rowToCard));
      } else {
        setCards(cardsRes.data.map(rowToCard));
      }

      // Seed transactions if empty
      if (!txRes.data?.length) {
        await supabase.from('transactions').insert(mockTransactions.map(t => ({
          id: t.id, store_name: t.storeName, amount: t.amount, date: t.date,
          card_id: t.cardId, category: t.category,
          assigned_user_id: t.assignedUserId ?? null,
          is_split: t.isSplit, notes: t.notes ?? null,
        })));
        const fresh = await supabase.from('transactions').select('*').order('date', { ascending: false });
        setTransactions((fresh.data ?? []).map(rowToTransaction));
      } else {
        setTransactions(txRes.data.map(rowToTransaction));
      }

      // settled_users
      const settled: Record<string, string> = {};
      (settledRes.data ?? []).forEach((r: Record<string, unknown>) => {
        settled[r.user_id as string] = r.settled_date as string;
      });
      setSettledUsers(settled);

      setLoading(false);
    }

    loadAll();
  }, []);

  // --- Actions ---

  const addTransaction = useCallback(async (data: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...data, id: 'tx-' + Date.now() };
    setTransactions(prev => [newTx, ...prev]); // optimistic
    await supabase.from('transactions').insert({
      id: newTx.id, store_name: newTx.storeName, amount: newTx.amount,
      date: newTx.date, card_id: newTx.cardId, category: newTx.category,
      assigned_user_id: newTx.assignedUserId ?? null,
      is_split: newTx.isSplit, notes: newTx.notes ?? null,
    });
  }, []);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
    await supabase.from('transactions').update({
      ...(updates.storeName   !== undefined && { store_name: updates.storeName }),
      ...(updates.amount      !== undefined && { amount: updates.amount }),
      ...(updates.date        !== undefined && { date: updates.date }),
      ...(updates.cardId      !== undefined && { card_id: updates.cardId }),
      ...(updates.category    !== undefined && { category: updates.category }),
      ...(updates.assignedUserId !== undefined && { assigned_user_id: updates.assignedUserId ?? null }),
      ...(updates.notes       !== undefined && { notes: updates.notes ?? null }),
    }).eq('id', id);
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    await supabase.from('transactions').delete().eq('id', id);
  }, []);

  const assignTransaction = useCallback(async (txId: string, userId: string) => {
    setTransactions(prev => prev.map(tx => tx.id === txId ? { ...tx, assignedUserId: userId } : tx));
    await supabase.from('transactions').update({ assigned_user_id: userId }).eq('id', txId);
  }, []);

  const markSettled = useCallback(async (userId: string) => {
    const date = new Date().toISOString().split('T')[0];
    setSettledUsers(prev => ({ ...prev, [userId]: date }));
    await supabase.from('settled_users').upsert({ user_id: userId, settled_date: date });
  }, []);

  const unmarkSettled = useCallback(async (userId: string) => {
    setSettledUsers(prev => { const u = { ...prev }; delete u[userId]; return u; });
    await supabase.from('settled_users').delete().eq('user_id', userId);
  }, []);

  const addUser = useCallback(async (data: Omit<User, 'id'>) => {
    const newUser: User = { ...data, id: 'user-' + Date.now() };
    setUsers(prev => [...prev, newUser]);
    await supabase.from('users').insert({
      id: newUser.id, name: newUser.name, role: newUser.role,
      avatar_url: newUser.avatarUrl ?? null, card_id: newUser.cardId ?? null,
    });
  }, []);

  const updateUser = useCallback(async (id: string, updates: Partial<Omit<User, 'id'>>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    await supabase.from('users').update({
      ...(updates.name      !== undefined && { name: updates.name }),
      ...(updates.role      !== undefined && { role: updates.role }),
      ...(updates.avatarUrl !== undefined && { avatar_url: updates.avatarUrl }),
      ...(updates.cardId    !== undefined && { card_id: updates.cardId ?? null }),
    }).eq('id', id);
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    await supabase.from('users').delete().eq('id', id);
  }, []);

  const assignCardToUser = useCallback(async (userId: string, cardId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, cardId } : u));
    await supabase.from('users').update({ card_id: cardId || null }).eq('id', userId);
  }, []);

  const addCard = useCallback(async (lastFourDigits: string, ownerId: string) => {
    const newCard: Card = { id: 'card-' + Date.now(), lastFourDigits, ownerId };
    setCards(prev => [...prev, newCard]);
    const { error } = await supabase.from('cards').insert({
      id: newCard.id, last_four_digits: lastFourDigits, owner_id: ownerId,
    });
    if (error) {
      setCards(prev => prev.filter(c => c.id !== newCard.id));
      throw new Error(error.message);
    }
  }, []);

  const deleteCard = useCallback(async (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    // Unassign any users who had this card
    setUsers(prev => prev.map(u => u.cardId === id ? { ...u, cardId: undefined } : u));
    await supabase.from('cards').delete().eq('id', id);
    await supabase.from('users').update({ card_id: null }).eq('card_id', id);
  }, []);

  // --- Derived: monthly summary ---

  const monthlySummary = useMemo<MonthlySummary>(() => {
    const totalExpenses = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const nonOwnerUsers = users.filter(u => u.role !== 'בעל החשבון');
    const userSummaries = nonOwnerUsers.map(user => {
      const userTxs = transactions.filter(tx => tx.assignedUserId === user.id);
      const totalOwed = userTxs.reduce((sum, tx) => sum + tx.amount, 0);
      return {
        userId: user.id,
        totalOwed,
        totalPaid: settledUsers[user.id] ? totalOwed : 0,
        transactionCount: userTxs.length,
        settledDate: settledUsers[user.id],
      };
    });
    return { month: new Date().toISOString().slice(0, 7), totalExpenses, userSummaries };
  }, [transactions, users, settledUsers]);

  return (
    <AppContext.Provider value={{
      loading, users, cards, transactions, monthlySummary,
      addTransaction, updateTransaction, deleteTransaction, assignTransaction,
      markSettled, unmarkSettled,
      addUser, updateUser, deleteUser, assignCardToUser,
      addCard, deleteCard,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// --- Hook ---

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
