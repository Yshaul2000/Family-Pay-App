import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { MonthlySummary, User, Transaction, TransactionCategory } from '../types';
import { formatDate } from '../utils/format';
import { computeOwnerSummary } from '../utils/summaryUtils';

// --- helpers ---

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

// --- Pie chart ---

const USER_COLORS = ['#7c9ef8','#88d982','#ffab5e','#ff85aa','#f5c800','#9db8c8','#c084fc','#fb923c'];

const CAT_COLORS: Record<TransactionCategory, string> = {
  'מזון ומשקאות': '#88d982',
  'קניות':        '#7c9ef8',
  'תחבורה':       '#f5c800',
  'פנאי':         '#ffab5e',
  'בריאות':       '#ff85aa',
  'אחר':          '#9db8c8',
};

interface PieSlice { label: string; value: number; color: string; }

function PieChart({ slices, size = 130 }: { slices: PieSlice[]; size?: number }) {
  const total = slices.reduce((s, p) => s + p.value, 0);
  if (total === 0) return <p className="text-xs text-[#747781] text-center">אין נתונים</p>;

  const cx = size / 2, cy = size / 2, r = size / 2 - 6;
  let angle = -Math.PI / 2;

  const paths = slices.map((slice, i) => {
    const sweep = (slice.value / total) * 2 * Math.PI;
    const end = angle + sweep;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
    const large = sweep > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    angle = end;
    return <path key={i} d={d} fill={slice.color} stroke="white" strokeWidth="2" />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths}
    </svg>
  );
}

// --- Report modal ---

interface ReportModalProps {
  summary: MonthlySummary;
  users: User[];
  transactions: Transaction[];
  onClose: () => void;
}

function ReportModal({ summary, users, transactions, onClose }: ReportModalProps) {
  const { totalExpenses, userSummaries } = summary;

  // Lock background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Pie 1 — by user
  const userSlices: PieSlice[] = userSummaries
    .filter(s => s.totalOwed > 0)
    .map((s, i) => ({
      label: users.find(u => u.id === s.userId)?.name ?? s.userId,
      value: s.totalOwed,
      color: USER_COLORS[i % USER_COLORS.length],
    }));

  // Pie 2 — by category (from filtered transactions)
  const monthTxs = transactions.filter(tx => tx.date.startsWith(summary.month));
  const catMap: Partial<Record<TransactionCategory, number>> = {};
  monthTxs.forEach(tx => { catMap[tx.category] = (catMap[tx.category] ?? 0) + tx.amount; });
  const catSlices: PieSlice[] = (Object.entries(catMap) as [TransactionCategory, number][])
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, val]) => ({ label: cat, value: val, color: CAT_COLORS[cat] }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,25,60,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#00193c] px-8 py-6 text-white">
          <p className="text-[#7796d1] text-sm mb-1">דוח חודשי</p>
          <h2 className="text-3xl font-extrabold" style={{ fontFamily: 'Manrope' }}>
            {monthLabel(summary.month)}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            סך הוצאות: ₪{totalExpenses.toLocaleString()} •{' '}
            {userSummaries.reduce((s, u) => s + u.transactionCount, 0)} עסקאות
          </p>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Pie 1 — users */}
          <div>
            <p className="text-xs font-bold text-[#43474f] uppercase tracking-wider mb-4">חלוקה לפי משתמש</p>
            <div className="flex items-center gap-4">
              <PieChart slices={userSlices} />
              <div className="flex flex-col gap-2 flex-1">
                {userSlices.map(s => (
                  <div key={s.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-xs font-medium text-[#111d23]">{s.label}</span>
                    </div>
                    <span className="text-xs font-bold text-[#00193c]">₪{s.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#e3f0f8]" />

          {/* Pie 2 — categories */}
          <div>
            <p className="text-xs font-bold text-[#43474f] uppercase tracking-wider mb-4">חלוקה לפי נושא</p>
            <div className="flex items-center gap-4">
              <PieChart slices={catSlices} />
              <div className="flex flex-col gap-2 flex-1">
                {catSlices.map(s => (
                  <div key={s.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-xs font-medium text-[#111d23]">{s.label}</span>
                    </div>
                    <span className="text-xs font-bold text-[#00193c]">₪{s.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Close */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-[#00193c] text-white py-3 rounded-full font-bold hover:opacity-90 active:scale-95 transition-all"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}

// --- component ---

export default function SummaryPage() {
  const navigate = useNavigate();
  const { transactions, users, cards, cardOwners, settledUsers, markSettled, unmarkSettled } = useApp();
  const [showReport, setShowReport] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedOwnerId, setSelectedOwnerId] = useState(cardOwners[0]?.id ?? '');
  const isCurrentMonth = selectedMonth === currentMonth;

  const localSummary: MonthlySummary = computeOwnerSummary(
    selectedOwnerId, selectedMonth, transactions, cards, users, settledUsers
  );

  const { totalExpenses, userSummaries } = localSummary;

  const totalPaid    = userSummaries.reduce((s, u) => s + u.totalPaid, 0);
  const totalRemaining = userSummaries.filter(u => !u.settledDate).reduce((s, u) => s + u.totalOwed, 0);
  const pendingCount = userSummaries.filter(u => !u.settledDate).length;
  const settledCount = userSummaries.filter(u =>  u.settledDate).length;

  return (
    <>
    {showReport && (
      <ReportModal
        summary={localSummary}
        users={users}
        transactions={transactions}
        onClose={() => setShowReport(false)}
      />
    )}
    <main className="mt-20 px-6 max-w-5xl mx-auto pb-32">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h2 className="font-extrabold text-3xl tracking-tight text-[#111d23] mb-1" style={{ fontFamily: 'Manrope' }}>
            סיכום חודשי
          </h2>
          {/* Month navigation */}
          <div className="flex items-center gap-1 text-[#4e6874] bg-[#cbe7f5]/50 px-2 py-1.5 rounded-full inline-flex">
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
        </div>
        <button
          onClick={() => setShowReport(true)}
          className="bg-[#00193c] text-white flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">bar_chart</span>
          <span>הצג דוח</span>
        </button>
      </header>

      {/* Owner selector */}
      {cardOwners.length > 1 && (
        <div className="flex items-center gap-3 mb-6">
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

      {/* Bento Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 bg-[#00193c] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <p className="text-[#7796d1] font-medium mb-1">סך הכל החזרים צפויים</p>
            <h3 className="text-5xl font-extrabold mb-6 tracking-tight" style={{ fontFamily: 'Manrope' }}>
              ₪{totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </h3>
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl">
                <p className="text-[10px] opacity-70">שולם עד כה</p>
                <p className="font-bold">₪{totalPaid.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <p className="text-[10px] opacity-70">יתרה לסגירה</p>
                <p className="font-bold">₪{totalRemaining.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl" />
        </div>
        <div className="bg-[#a3f69c] rounded-3xl p-8 flex flex-col justify-between shadow-sm">
          <span className="material-symbols-outlined text-[#005312] text-4xl">receipt_long</span>
          <div>
            <p className="text-[#005312] font-bold text-xl mt-4">
              {userSummaries.reduce((s, u) => s + u.transactionCount, 0)} עסקאות
            </p>
            <p className="text-[#005312]/70 text-sm mt-1">החודש הוגדרו שורות חיוב במערכת</p>
          </div>
        </div>
      </div>

      {/* Settlement Table */}
      <section className="bg-surface-container-low rounded-[2rem] p-4 md:p-8 mb-12 shadow-card">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="font-bold text-xl text-[#00193c]" style={{ fontFamily: 'Manrope' }}>
            סטטוס התחשבנות מול משתמשים
          </h3>
          {isCurrentMonth && (
            <div className="flex gap-2">
              <span className="bg-[#d7e4ec] text-[#43474f] text-xs font-bold px-3 py-1 rounded-full">
                ממתין ({pendingCount})
              </span>
              <span className="bg-[#88d982] text-[#005312] text-xs font-bold px-3 py-1 rounded-full">
                הושלם ({settledCount})
              </span>
            </div>
          )}
        </div>

        {userSummaries.length === 0 ? (
          <p className="text-center text-[#4e6874] py-8">אין עסקאות משויכות ב{monthLabel(selectedMonth)}</p>
        ) : (
          <div className="space-y-3">
            {userSummaries.map(summary => {
              const user = users.find(u => u.id === summary.userId);
              const isSettled = !!summary.settledDate;

              return (
                <div
                  key={summary.userId}
                  className={`rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4 transition-colors ${
                    isSettled
                      ? 'bg-white/50 opacity-60'
                      : 'bg-white/70 backdrop-blur-md hover:bg-[#ddeaf2]/50'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 w-full">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${isSettled ? 'bg-[#88d982] text-[#005312]' : 'bg-[#d7e2ff] text-[#00193c]'}`}>
                      {isSettled
                        ? <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
                        : user?.name.slice(0, 2) ?? '??'
                      }
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#111d23]">{user?.name ?? summary.userId}</p>
                      <p className="text-xs text-[#4e6874]">
                        {isSettled ? `הוסדר ב-${formatDate(summary.settledDate!)}` : `${summary.transactionCount} עסקאות משותפות`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-200/50">
                    <div className="text-right">
                      <p className="text-xs text-[#43474f] mb-1">{isSettled ? 'שולם' : 'חוב פתוח'}</p>
                      <p className={`font-extrabold text-blue-900 ${isSettled ? 'line-through opacity-50' : ''}`} style={{ fontFamily: 'Manrope' }}>
                        ₪{summary.totalOwed.toLocaleString()}
                      </p>
                    </div>
                    {isCurrentMonth && (
                      isSettled ? (
                        <button
                          onClick={() => unmarkSettled(summary.userId)}
                          className="text-[#88d982] font-bold text-sm px-4 hover:underline"
                        >
                          הסתיים
                        </button>
                      ) : (
                        <button
                          onClick={() => markSettled(summary.userId)}
                          className="bg-[#d7e4ec] hover:bg-[#002d62] hover:text-white text-[#00193c] px-6 py-2 rounded-full text-sm font-bold transition-all active:scale-95"
                        >
                          סמן כשולם
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Analytics link */}
      <div className="bg-surface-container-high rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-8 shadow-card">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[#00193c]">bar_chart</span>
          </div>
          <div>
            <p className="font-bold text-[#00193c]">ניתוח הוצאות</p>
            <p className="text-sm text-[#4e6874]">פילוח לפי קטגוריה ומשתמש</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/analytics')}
          className="text-[#00193c] font-bold text-sm flex items-center gap-1 hover:underline"
        >
          צפה בניתוח מלא
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </button>
      </div>
    </main>
    </>
  );
}
