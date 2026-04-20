import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/format';

export default function TransactionsPage() {
  const navigate = useNavigate();
  const { transactions, users, cards, assignTransaction, deleteTransaction } = useApp();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('הכל');
  // txId of the transaction currently showing the user-picker
  const [assigningTxId, setAssigningTxId] = useState<string | null>(null);

  // Dynamic filters based on actual cards
  const filters = ['הכל', ...cards.map(c => c.id), 'לא משויך'];
  const filterLabel = (f: string) => {
    if (f === 'הכל' || f === 'לא משויך') return f;
    const card = cards.find(c => c.id === f);
    return card ? `**** ${card.lastFourDigits}` : f;
  };

  const filtered = transactions.filter(tx => {
    const matchSearch =
      tx.storeName.includes(search) ||
      tx.amount.toString().includes(search);
    const matchFilter =
      activeFilter === 'הכל' ||
      (activeFilter === 'לא משויך' && !tx.assignedUserId) ||
      tx.cardId === activeFilter;
    return matchSearch && matchFilter;
  });

  function handleAssign(txId: string, userId: string) {
    assignTransaction(txId, userId);
    setAssigningTxId(null);
  }

  return (
    <main className="pt-20 pb-32 px-6 max-w-4xl mx-auto">
      {/* Search & Filters */}
      <section className="mt-4 mb-8">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#747781]">search</span>
            <input
              className="w-full bg-surface-container-low border-none rounded-xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-primary-container text-on-surface-variant"
              placeholder="חיפוש לפי חנות או סכום..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 items-center">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                  activeFilter === f
                    ? 'bg-[#002d62] text-white shadow-md'
                    : 'bg-[#ddeaf2] text-[#43474f] hover:bg-[#d7e4ec]'
                }`}
              >
                {filterLabel(f)}
              </button>
            ))}
            <div className="mr-auto flex items-center gap-2">
              <button
                onClick={() => navigate('/import')}
                className="bg-[#ddeaf2] text-[#002d62] rounded-full px-5 py-2 flex items-center gap-1.5 text-sm font-bold whitespace-nowrap hover:bg-[#d7e4ec] active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                ייבוא מ-MAX
              </button>
              <button
                onClick={() => navigate('/add')}
                className="bg-[#00193c] text-white rounded-full px-5 py-2 flex items-center gap-1.5 text-sm font-bold whitespace-nowrap hover:opacity-90 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                הוספת עסקה
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Transactions List */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="font-extrabold text-2xl text-[#00193c]" style={{ fontFamily: 'Manrope' }}>
            עסקאות אחרונות
          </h2>
          <span className="text-xs text-[#747781] font-bold uppercase tracking-widest">
            {transactions.length} עסקאות
          </span>
        </div>

        <div className="space-y-4">
          {filtered.length === 0 && (
            <p className="text-center text-on-surface-variant py-12">לא נמצאו עסקאות</p>
          )}
          {filtered.map(tx => {
            const card = cards.find(c => c.id === tx.cardId);
            const assignedUser = users.find(u => u.id === tx.assignedUserId);
            const isUnassigned = !tx.assignedUserId;
            const isPickingUser = assigningTxId === tx.id;

            return (
              <div
                key={tx.id}
                className={`rounded-xl p-5 transition-all duration-300 ${
                  isUnassigned
                    ? 'bg-surface-container-lowest border-2 border-error-container/50 shadow-card'
                    : 'bg-surface-container-low hover:bg-surface-container-high shadow-card hover:shadow-card-hover'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUnassigned ? 'bg-[#ffdad6]/30' : 'bg-white shadow-sm'}`}>
                      <span className={`material-symbols-outlined ${isUnassigned ? 'text-[#ba1a1a]' : 'text-[#002d62]'}`}>
                        {tx.category === 'מזון ומשקאות' ? 'restaurant'
                          : tx.category === 'תחבורה' ? 'local_gas_station'
                          : tx.category === 'קניות' ? 'devices'
                          : tx.category === 'בריאות' ? 'shopping_cart'
                          : 'receipt_long'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#111d23]" style={{ fontFamily: 'Manrope' }}>{tx.storeName}</h3>
                      <p className="text-sm text-[#43474f]">
                        {formatDate(tx.date)} • כרטיס ****{card?.lastFourDigits}
                      </p>
                      {tx.notes && (
                        <p className="text-xs text-[#747781] mt-1 italic">{tx.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/add', { state: { tx } })}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-[#002d62] hover:bg-[#d7e4ec] transition-colors"
                        title="ערוך עסקה"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
                        title="מחק עסקה"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                      <p className="font-extrabold text-lg text-[#00193c]" style={{ fontFamily: 'Manrope' }}>
                        ₪{tx.amount.toLocaleString()}
                      </p>
                    </div>
                    {isUnassigned ? (
                      <span className="inline-flex items-center gap-1 bg-[#ffdad6] text-[#93000a] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                        לא משויך
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-[#a3f69c] text-[#005312] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {assignedUser?.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons for unassigned */}
                {isUnassigned && !isPickingUser && (
                  <div className="mt-4 pt-4 border-t border-[#ffdad6]/30 flex gap-3">
                    <button
                      onClick={() => setAssigningTxId(tx.id)}
                      className="flex-1 bg-[#002d62] text-white rounded-full py-2.5 text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      שייך עסקה
                    </button>
                    <button className="flex-1 bg-[#cbe7f5] text-[#4e6874] rounded-full py-2.5 text-xs font-bold hover:bg-[#d7e4ec] transition-colors">
                      פצל הוצאה
                    </button>
                  </div>
                )}

                {/* User picker — shown when "שייך עסקה" is clicked */}
                {isPickingUser && (
                  <div className="mt-4 pt-4 border-t border-[#ffdad6]/30">
                    <p className="text-xs font-bold text-[#43474f] mb-3">בחר משתמש לשיוך:</p>
                    <div className="flex flex-wrap gap-2">
                      {users.map(user => (
                        <button
                          key={user.id}
                          onClick={() => handleAssign(tx.id, user.id)}
                          className="px-4 py-2 bg-[#002d62] text-white rounded-full text-xs font-bold hover:opacity-90 transition-opacity"
                        >
                          {user.name}
                        </button>
                      ))}
                      <button
                        onClick={() => setAssigningTxId(null)}
                        className="px-4 py-2 bg-[#ddeaf2] text-[#43474f] rounded-full text-xs font-bold hover:bg-[#d7e4ec]"
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FAB */}
    </main>
  );
}
