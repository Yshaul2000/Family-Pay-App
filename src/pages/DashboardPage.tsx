import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { computeOwnerSummary } from '../utils/summaryUtils';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { transactions, users, cards, cardOwners, settledUsers } = useApp();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedOwnerId, setSelectedOwnerId] = useState(cardOwners[0]?.id ?? '');

  const summary = computeOwnerSummary(
    selectedOwnerId, currentMonth, transactions, cards, users, settledUsers
  );

  const totalOwed = summary.userSummaries
    .filter(s => !s.settledDate)
    .reduce((sum, s) => sum + s.totalOwed, 0);

  // Owner's own expenses = transactions on their cards assigned to themselves
  const ownerCardIds = new Set(cards.filter(c => c.ownerId === selectedOwnerId).map(c => c.id));
  const ownerPersonal = transactions
    .filter(tx => tx.date.startsWith(currentMonth) && ownerCardIds.has(tx.cardId) && tx.assignedUserId === selectedOwnerId)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const pendingUsers = summary.userSummaries
    .filter(s => !s.settledDate && s.totalOwed > 0)
    .map(s => ({ ...s, user: users.find(u => u.id === s.userId) }));

  return (
    <main className="pt-24 px-6 max-w-5xl mx-auto pb-32">
      {/* Intro + owner selector */}
      <section className="mb-10">
        <h2 className="text-3xl font-extrabold text-[#00193c] mb-2" style={{ fontFamily: 'Manrope' }}>
          סקירה כללית
        </h2>
        <p className="text-[#4e6874] font-medium opacity-80 mb-4">ריכוז הוצאות האשראי המשותפות שלך</p>

        {cardOwners.length > 1 && (
          <div className="flex items-center gap-3">
            <div className="flex gap-2 flex-wrap">
              {cardOwners.map(owner => (
                <button
                  key={owner.id}
                  onClick={() => setSelectedOwnerId(owner.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                    selectedOwnerId === owner.id
                      ? 'bg-[#002d62] text-white'
                      : 'bg-[#ddeaf2] text-[#43474f] hover:bg-[#d7e4ec]'
                  }`}
                >
                  {owner.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Total Monthly */}
        <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between shadow-card">
          <div className="flex justify-between items-start">
            <span className="p-3 bg-[#002d62] text-white rounded-full">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </span>
            <span className="text-[#88d982] text-xs font-bold bg-[#003709]/10 px-2 py-1 rounded-full">
              +12% החודש
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold text-[#4e6874] opacity-60">סה״כ הוצאות החודש</p>
            <h3 className="text-3xl font-extrabold text-[#00193c]" style={{ fontFamily: 'Manrope' }}>
              ₪{summary.totalExpenses.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Your Balance */}
        <div className="bg-[#002d62] p-6 rounded-xl text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
          <span className="p-3 bg-white/10 rounded-full w-fit">
            <span className="material-symbols-outlined">payments</span>
          </span>
          <div className="mt-4">
            <p className="text-sm font-bold text-white/60">ההוצאה האישית שלך</p>
            <h3 className="text-3xl font-extrabold" style={{ fontFamily: 'Manrope' }}>
              ₪{ownerPersonal.toLocaleString()}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-xs text-white/40">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>עסקאות על הכרטיסים שלך</span>
            </div>
          </div>
        </div>

        {/* Owed to You */}
        <div className="bg-[#a3f69c] p-6 rounded-xl text-[#005312] flex flex-col justify-between shadow-card">
          <span className="p-3 bg-white/50 rounded-full w-fit">
            <span className="material-symbols-outlined">trending_up</span>
          </span>
          <div className="mt-4">
            <p className="text-sm font-bold opacity-70">חייבים לך סה״כ</p>
            <h3 className="text-3xl font-extrabold" style={{ fontFamily: 'Manrope' }}>
              ₪{totalOwed.toLocaleString()}
            </h3>
            <div className="mt-4 h-1.5 w-full bg-[#005312]/10 rounded-full overflow-hidden">
              <div className="bg-[#005312] h-full w-2/3" />
            </div>
          </div>
        </div>
      </div>

      {/* User Status */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#00193c]" style={{ fontFamily: 'Manrope' }}>
            סטטוס משתמשים
          </h2>
          <button
            onClick={() => navigate('/users')}
            className="text-[#00193c] text-sm font-bold flex items-center gap-1 hover:underline"
          >
            צפה בהכל
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingUsers.length === 0 && (
            <p className="text-sm text-[#4e6874] col-span-2">אין חובות פתוחים</p>
          )}
          {pendingUsers.map(({ userId, totalOwed: owed, user }) => (
            <div
              key={userId}
              className="bg-surface-container-high p-5 rounded-xl flex items-center justify-between hover:scale-[1.01] transition-transform shadow-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#00193c]/10 flex items-center justify-center font-bold text-[#00193c]">
                  {user?.name[0] ?? '?'}
                </div>
                <div>
                  <h4 className="font-bold text-[#00193c]">{user?.name ?? userId}</h4>
                  <p className="text-xs text-[#4e6874]">חייב לך</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[#4e6874] opacity-60">חייב לך</p>
                <p className="text-lg font-extrabold text-[#00193c]">₪{owed.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mb-8">
        <div className="relative rounded-2xl overflow-hidden px-16 py-8 text-white bg-[#00193c] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl" />
          <h3 className="relative z-10 text-2xl md:text-3xl font-extrabold leading-snug" style={{ fontFamily: 'Manrope' }}>
            יש לך הוצאה חדשה?<br />
            <span className="text-white/50 text-base font-medium">תוסיף אותה עכשיו לפני שתשכח</span>
          </h3>
          <button
            onClick={() => navigate('/add')}
            className="relative z-10 bg-white text-[#00193c] px-10 py-4 rounded-full font-bold flex items-center gap-2 text-base shadow-xl active:scale-95 transition-transform whitespace-nowrap"
          >
            <span className="material-symbols-outlined">add_circle</span>
            הוספת עסקה
          </button>
        </div>
      </section>
    </main>
  );
}
