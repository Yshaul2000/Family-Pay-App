import type { Transaction, Card, User, MonthlySummary } from '../types';

/**
 * Computes who owes the given card owner, for a specific month.
 * Logic: if a transaction is on a card owned by `ownerId`,
 * and the assigned user is NOT the owner themselves → it's a debt to the owner.
 */
export function computeOwnerSummary(
  ownerId: string,
  month: string,
  transactions: Transaction[],
  cards: Card[],
  users: User[],
  settledUsers: Record<string, string>,
): MonthlySummary {
  // Cards owned by this user
  const ownerCards = cards.filter(c => c.ownerId === ownerId);
  const ownerCardIds = new Set(ownerCards.map(c => c.id));

  // Transactions on the owner's cards this month
  const monthTxs = transactions.filter(tx =>
    tx.date.startsWith(month) && ownerCardIds.has(tx.cardId)
  );

  const totalExpenses = monthTxs.reduce((sum, tx) => sum + tx.amount, 0);

  // Group debts: who used the owner's cards (excluding the owner themselves)
  const debtMap: Record<string, number> = {};
  const countMap: Record<string, number> = {};

  for (const tx of monthTxs) {
    if (!tx.assignedUserId) continue;
    if (tx.assignedUserId === ownerId) continue; // owner used their own card — not a debt
    debtMap[tx.assignedUserId] = (debtMap[tx.assignedUserId] ?? 0) + tx.amount;
    countMap[tx.assignedUserId] = (countMap[tx.assignedUserId] ?? 0) + 1;
  }

  const userSummaries = Object.entries(debtMap).map(([userId, totalOwed]) => ({
    userId,
    totalOwed,
    totalPaid: settledUsers[userId] ? totalOwed : 0,
    transactionCount: countMap[userId] ?? 0,
    settledDate: settledUsers[userId],
  }));

  // Also include users who have settled (totalOwed may be 0 for current month)
  const settledThisMonth = users.filter(u =>
    settledUsers[u.id] && !debtMap[u.id]
  );
  for (const u of settledThisMonth) {
    userSummaries.push({
      userId: u.id,
      totalOwed: 0,
      totalPaid: 0,
      transactionCount: 0,
      settledDate: settledUsers[u.id],
    });
  }

  return { month, totalExpenses, userSummaries };
}
