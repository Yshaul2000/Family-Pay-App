import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { TransactionCategory } from '../types';

const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS_HE[m - 1]} ${y}`;
}

function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const CATEGORY_COLORS: Record<TransactionCategory, { bg: string; text: string; bar: string }> = {
  'מזון ומשקאות': { bg: 'bg-[#a3f69c]/30', text: 'text-[#005312]', bar: 'bg-[#88d982]' },
  'קניות':        { bg: 'bg-[#d7e2ff]/30', text: 'text-[#002d62]', bar: 'bg-[#7c9ef8]' },
  'תחבורה':       { bg: 'bg-[#fff3b0]/40', text: 'text-[#5c4a00]', bar: 'bg-[#f5c800]' },
  'פנאי':         { bg: 'bg-[#ffd8b2]/30', text: 'text-[#6b3000]', bar: 'bg-[#ffab5e]' },
  'בריאות':       { bg: 'bg-[#ffc8dd]/30', text: 'text-[#6b0028]', bar: 'bg-[#ff85aa]' },
  'אחר':          { bg: 'bg-[#ddeaf2]/30', text: 'text-[#43474f]', bar: 'bg-[#9db8c8]' },
};

const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  'מזון ומשקאות': 'restaurant',
  'קניות':        'shopping_bag',
  'תחבורה':       'directions_car',
  'פנאי':         'sports_esports',
  'בריאות':       'favorite',
  'אחר':          'receipt_long',
};

const ALL_CATEGORIES: TransactionCategory[] = [
  'מזון ומשקאות', 'קניות', 'תחבורה', 'פנאי', 'בריאות', 'אחר',
];

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { transactions, users, cards, cardOwners } = useApp();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedOwnerId, setSelectedOwnerId] = useState(cardOwners[0]?.id ?? '');
  const isCurrentMonth = selectedMonth === currentMonth;

  // Filter to selected owner's cards only
  const ownerCardIds = new Set(cards.filter(c => c.ownerId === selectedOwnerId).map(c => c.id));
  const monthTxs = transactions.filter(tx =>
    tx.date.startsWith(selectedMonth) && ownerCardIds.has(tx.cardId)
  );
  const total = monthTxs.reduce((sum, tx) => sum + tx.amount, 0);

  // Category breakdown
  const byCategory = ALL_CATEGORIES.map(cat => {
    const txs = monthTxs.filter(tx => tx.category === cat);
    const amount = txs.reduce((sum, tx) => sum + tx.amount, 0);
    return { cat, amount, count: txs.length };
  }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

  // Per-user breakdown (who used the owner's cards, excluding owner themselves)
  const debtors = users.filter(u => u.id !== selectedOwnerId);
  const byUser = debtors.map(user => {
    const txs = monthTxs.filter(tx => tx.assignedUserId === user.id);
    const amount = txs.reduce((sum, tx) => sum + tx.amount, 0);
    return { user, amount, count: txs.length };
  }).filter(u => u.amount > 0).sort((a, b) => b.amount - a.amount);

  const maxCatAmount = byCategory[0]?.amount ?? 1;
  const maxUserAmount = byUser[0]?.amount ?? 1;

  return (
    <main className="pt-20 pb-32 px-6 max-w-4xl mx-auto">
      {/* Header */}
      <section className="mt-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button
            onClick={() => navigate('/summary')}
            className="flex items-center gap-1 text-[#4e6874] text-sm font-medium mb-2 hover:text-[#00193c] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            חזרה לסיכום
          </button>
          <h2 className="text-3xl font-extrabold text-[#00193c]" style={{ fontFamily: 'Manrope' }}>ניתוח הוצאות</h2>
          <p className="text-[#4e6874] text-sm mt-1">פילוח לפי קטגוריה ומשתמש</p>
          {cardOwners.length > 1 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {cardOwners.map(owner => (
                <button
                  key={owner.id}
                  onClick={() => setSelectedOwnerId(owner.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    selectedOwnerId === owner.id
                      ? 'bg-[#002d62] text-white'
                      : 'bg-[#ddeaf2] text-[#43474f] hover:bg-[#d7e4ec]'
                  }`}
                >
                  {owner.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-1 text-[#4e6874] bg-[#cbe7f5]/50 px-2 py-1.5 rounded-full">
          <button
            onClick={() => setSelectedMonth(m => shiftMonth(m, -1))}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#cbe7f5] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
          <span className="material-symbols-outlined text-[18px] mx-1">calendar_month</span>
          <span className="text-sm font-semibold min-w-[110px] text-center">{monthLabel(selectedMonth)}</span>
          <button
            onClick={() => setSelectedMonth(m => shiftMonth(m, 1))}
            disabled={isCurrentMonth}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#cbe7f5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
        </div>
      </section>

      {/* Total banner */}
      <div className="bg-[#00193c] rounded-3xl p-6 mb-8 text-white flex justify-between items-center shadow-xl">
        <div>
          <p className="text-[#7796d1] text-sm mb-1">סך הוצאות — {monthLabel(selectedMonth)}</p>
          <p className="text-4xl font-extrabold" style={{ fontFamily: 'Manrope' }}>₪{total.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[#7796d1] text-sm mb-1">עסקאות</p>
          <p className="text-3xl font-extrabold" style={{ fontFamily: 'Manrope' }}>{monthTxs.length}</p>
        </div>
      </div>

      {total === 0 ? (
        <p className="text-center text-[#4e6874] py-16">אין עסקאות ב{monthLabel(selectedMonth)}</p>
      ) : (
        <>
          {/* Category breakdown */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-card mb-6">
            <h3 className="font-bold text-[#00193c] mb-6" style={{ fontFamily: 'Manrope' }}>פילוח לפי קטגוריה</h3>
            <div className="space-y-4">
              {byCategory.map(({ cat, amount, count }) => {
                const colors = CATEGORY_COLORS[cat];
                const pct = Math.round((amount / total) * 100);
                const barWidth = Math.round((amount / maxCatAmount) * 100);
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colors.bg}`}>
                          <span className={`material-symbols-outlined text-[16px] ${colors.text}`}>
                            {CATEGORY_ICONS[cat]}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-[#111d23]">{cat}</span>
                        <span className="text-xs text-[#747781]">({count})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-[#00193c] text-sm" style={{ fontFamily: 'Manrope' }}>
                          ₪{amount.toLocaleString()}
                        </span>
                        <span className="text-xs text-[#747781] mr-2">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-[#e3f0f8] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Per-user breakdown */}
          {byUser.length > 0 && (
            <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-card">
              <h3 className="font-bold text-[#00193c] mb-6" style={{ fontFamily: 'Manrope' }}>פילוח לפי משתמש</h3>
              <div className="space-y-4">
                {byUser.map(({ user, amount, count }) => {
                  const pct = Math.round((amount / total) * 100);
                  const barWidth = Math.round((amount / maxUserAmount) * 100);
                  return (
                    <div key={user.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#d7e2ff] flex items-center justify-center text-[#00193c] font-bold text-xs">
                            {user.name[0]}
                          </div>
                          <span className="text-sm font-bold text-[#111d23]">{user.name}</span>
                          <span className="text-xs text-[#747781]">({count} עסקאות)</span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-[#00193c] text-sm" style={{ fontFamily: 'Manrope' }}>
                            ₪{amount.toLocaleString()}
                          </span>
                          <span className="text-xs text-[#747781] mr-2">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-[#e3f0f8] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#7c9ef8] transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
