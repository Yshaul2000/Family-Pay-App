import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Transaction, TransactionCategory } from '../types';
import { useApp } from '../context/AppContext';

const categories: TransactionCategory[] = [
  'מזון ומשקאות', 'קניות', 'תחבורה', 'פנאי', 'בריאות', 'אחר',
];

export default function AddTransactionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editTx = (location.state as { tx?: Transaction } | null)?.tx ?? null;

  const { users, cards, addTransaction, updateTransaction } = useApp();

  const today = new Date();
  const parseDate = (iso?: string) => {
    if (!iso) return { d: String(today.getDate()).padStart(2, '0'), m: String(today.getMonth() + 1).padStart(2, '0'), y: String(today.getFullYear()) };
    const [y, m, d] = iso.split('-');
    return { d, m, y };
  };
  const initial = parseDate(editTx?.date);

  const [amount, setAmount] = useState(editTx ? String(editTx.amount) : '');
  const [storeName, setStoreName] = useState(editTx?.storeName ?? '');
  const [day,   setDay]   = useState(initial.d);
  const [month, setMonth] = useState(initial.m);
  const [year,  setYear]  = useState(initial.y);
  const date = `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
  const [category, setCategory] = useState<TransactionCategory>(editTx?.category ?? 'אחר');
  const [cardId, setCardId] = useState(editTx?.cardId ?? cards[0]?.id ?? '');
  const [assignedUserId, setAssignedUserId] = useState<string>(editTx?.assignedUserId ?? '');
  const [notes, setNotes] = useState(editTx?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTx) {
      updateTransaction(editTx.id, {
        storeName,
        amount: parseFloat(amount),
        date,
        cardId,
        category,
        assignedUserId: assignedUserId || undefined,
        notes: notes || undefined,
      });
    } else {
      addTransaction({
        storeName,
        amount: parseFloat(amount),
        date,
        cardId,
        category,
        assignedUserId: assignedUserId || undefined,
        notes: notes || undefined,
        isSplit: false,
      });
    }
    navigate('/transactions');
  };

  return (
    <main className="pt-20 pb-32 px-4 max-w-2xl mx-auto">
      <div className="mb-8 px-2 mt-4">
        <h2 className="text-3xl font-extrabold text-[#00193c] mb-2" style={{ fontFamily: 'Manrope' }}>
          {editTx ? 'עריכת עסקה' : 'הוספת עסקה'}
        </h2>
        <p className="text-[#43474f] text-sm">{editTx ? 'עדכן את פרטי העסקה ושמור.' : 'הזן את פרטי ההוצאה החדשה בצורה מהירה ומדויקת.'}</p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-card">
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-[#43474f] mb-2 uppercase tracking-wider">
              סכום ההוצאה
            </label>
            <div className="flex items-baseline gap-2 bg-surface-container-low p-6 rounded-xl focus-within:bg-surface-container transition-colors">
              <span className="text-4xl font-extrabold text-[#00193c]" style={{ fontFamily: 'Manrope' }}>₪</span>
              <input
                autoFocus
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-5xl font-extrabold text-[#00193c] w-full p-0 placeholder:text-[#d7e4ec]"
                placeholder="0.00"
                style={{ fontFamily: 'Manrope' }}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#43474f]">בית העסק</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#747781]">storefront</span>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-primary-container text-on-surface font-medium"
                  placeholder="איפה קנית?"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#43474f]">תאריך</label>
              <div className="bg-surface-container-low rounded-xl py-3 px-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-[#747781] text-xl ml-2">calendar_today</span>
                <input
                  type="number" min="1" max="31"
                  value={day}
                  onChange={e => setDay(e.target.value.padStart(2,'0'))}
                  className="w-12 bg-transparent border-none focus:outline-none text-on-surface font-medium text-center"
                  placeholder="יי"
                />
                <span className="text-[#747781] font-bold">/</span>
                <input
                  type="number" min="1" max="12"
                  value={month}
                  onChange={e => setMonth(e.target.value.padStart(2,'0'))}
                  className="w-12 bg-transparent border-none focus:outline-none text-on-surface font-medium text-center"
                  placeholder="חח"
                />
                <span className="text-[#747781] font-bold">/</span>
                <input
                  type="number" min="2000" max="2100"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="w-20 bg-transparent border-none focus:outline-none text-on-surface font-medium text-center"
                  placeholder="שנה"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#43474f]">הערה</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#747781]">notes</span>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-primary-container text-on-surface font-medium"
                  placeholder="חלב, תשלום חשבון גז, קניות לשבת..."
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#43474f]">קטגוריה</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#747781]">category</span>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as TransactionCategory)}
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-primary-container text-on-surface font-medium appearance-none"
                >
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#747781] pointer-events-none">expand_more</span>
              </div>
            </div>

            {/* Card */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#43474f]">כרטיס</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#747781]">credit_card</span>
                <select
                  value={cardId}
                  onChange={e => setCardId(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-primary-container text-on-surface font-medium appearance-none"
                >
                  {cards.map(c => (
                    <option key={c.id} value={c.id}>**** {c.lastFourDigits}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#747781] pointer-events-none">expand_more</span>
              </div>
            </div>

            {/* Assign to User */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#43474f]">שיוך למשתמש</label>
              <div className="flex flex-wrap gap-2 p-3 bg-surface-container-low rounded-xl min-h-[56px] items-center">
                {users.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setAssignedUserId(assignedUserId === user.id ? '' : user.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      assignedUserId === user.id
                        ? 'bg-[#002d62] text-white'
                        : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {user.name}
                    {assignedUserId === user.id && (
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-[#00193c] text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ fontFamily: 'Manrope' }}
            >
              <span className="material-symbols-outlined">{editTx ? 'check' : 'save'}</span>
              {editTx ? 'עדכון עסקה' : 'שמירת עסקה'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-[#cbe7f5] text-[#4e6874] font-bold py-4 rounded-full hover:bg-[#ddeaf2] transition-all active:scale-95"
              style={{ fontFamily: 'Manrope' }}
            >
              ביטול
            </button>
          </div>
        </form>
      </div>

    </main>
  );
}
