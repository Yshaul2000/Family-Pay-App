import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { parseMaxXlsx, type ParsedRow } from '../utils/parseMaxXlsx';
import { formatDate } from '../utils/format';

export default function ImportPage() {
  const navigate = useNavigate();
  const { cards, users, addTransaction } = useApp();

  // Map cardId → userId only when exactly one user has this card in their cardIds
  const cardToSingleUser = Object.fromEntries(
    cards
      .map(card => {
        const assignedUsers = users.filter(u => u.cardIds?.includes(card.id));
        return assignedUsers.length === 1 ? [card.id, assignedUsers[0].id] : null;
      })
      .filter(Boolean) as [string, string][]
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setRows([]);
    setDone(false);
    try {
      const parsed = await parseMaxXlsx(file);
      if (parsed.length === 0) {
        setError('לא נמצאו עסקאות בקובץ. ודא שזה קובץ XLSX מ-MAX.');
        return;
      }
      setRows(parsed);
    } catch {
      setError('שגיאה בקריאת הקובץ. ודא שזה קובץ XLSX תקין.');
    }
  }

  async function handleImport() {
    if (rows.length === 0) return;
    setImporting(true);
    try {
      for (const row of rows) {
        const matchedCard = cards.find(c => c.lastFourDigits === row.lastFour);
        if (!matchedCard) continue; // skip rows whose card isn't in the system
        await addTransaction({
          storeName: row.storeName,
          amount: row.amount,
          date: row.date,
          cardId: matchedCard.id,
          category: row.category,
          isSplit: false,
          assignedUserId: cardToSingleUser[matchedCard.id],
        });
      }
      setDone(true);
      setTimeout(() => navigate('/transactions'), 1500);
    } catch {
      setError('שגיאה בייבוא העסקאות.');
    } finally {
      setImporting(false);
    }
  }

  // Count how many rows have a matching card
  const matchedCount = rows.filter(r => cards.find(c => c.lastFourDigits === r.lastFour)).length;
  const unmatchedCount = rows.length - matchedCount;

  return (
    <main className="pt-20 pb-32 px-6 max-w-4xl mx-auto">
      <section className="mt-4 mb-8">
        <button
          onClick={() => navigate('/transactions')}
          className="flex items-center gap-1 text-sm text-[#4e6874] font-bold mb-4 hover:text-[#00193c] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          חזרה לעסקאות
        </button>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#00193c]" style={{ fontFamily: 'Manrope' }}>
          ייבוא עסקאות מ-MAX
        </h2>
        <p className="text-[#4e6874] mt-1 font-medium">העלה קובץ XLSX שהורדת מאתר MAX — הכרטיסים יזוהו אוטומטית</p>
      </section>

      {/* File upload */}
      <section
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#d7e4ec] rounded-xl p-10 text-center cursor-pointer hover:border-[#002d62] hover:bg-[#f0f7fb] transition-all mb-6"
      >
        <span className="material-symbols-outlined text-4xl text-[#002d62] mb-3 block">upload_file</span>
        <p className="font-bold text-[#00193c]">לחץ לבחירת קובץ XLSX</p>
        <p className="text-sm text-[#747781] mt-1">קובץ פירוט עסקאות מ-MAX</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </section>

      {error && (
        <div className="bg-[#ffdad6]/40 text-[#ba1a1a] rounded-xl px-4 py-3 text-sm font-bold mb-6">
          {error}
        </div>
      )}

      {done && (
        <div className="bg-[#a3f69c]/40 text-[#005312] rounded-xl px-4 py-3 text-sm font-bold mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          יובאו {matchedCount} עסקאות בהצלחה! מעביר לדף עסקאות...
        </div>
      )}

      {/* Preview */}
      {rows.length > 0 && !done && (
        <>
          {/* Summary */}
          <div className="flex gap-3 mb-4">
            <div className="bg-[#a3f69c]/30 text-[#005312] rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {matchedCount} עסקאות זוהו
            </div>
            {unmatchedCount > 0 && (
              <div className="bg-[#ffdad6]/40 text-[#ba1a1a] rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                {unmatchedCount} כרטיסים לא מוכרים — ידולגו
              </div>
            )}
          </div>

          <section className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-lg text-[#00193c]" style={{ fontFamily: 'Manrope' }}>
                תצוגה מקדימה
              </h3>
              <span className="text-xs text-[#747781] font-bold">{rows.length} עסקאות</span>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {rows.map((row, i) => {
                const matched = cards.find(c => c.lastFourDigits === row.lastFour);
                const autoUserId = matched ? cardToSingleUser[matched.id] : undefined;
                const autoUser = autoUserId ? users.find(u => u.id === autoUserId) : undefined;
                return (
                  <div
                    key={i}
                    className={`rounded-xl px-4 py-3 shadow-card flex justify-between items-center ${
                      matched ? 'bg-surface-container-lowest' : 'bg-[#ffdad6]/20 opacity-60'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-[#111d23] text-sm">{row.storeName}</p>
                      <p className="text-xs text-[#747781]">
                        {formatDate(row.date)} · {row.category} · **** {row.lastFour}
                        {!matched && <span className="text-[#ba1a1a] mr-1"> — כרטיס לא מוכר</span>}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="font-extrabold text-[#00193c]">₪{row.amount.toLocaleString()}</p>
                      {matched && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          autoUser
                            ? 'bg-[#a3f69c]/40 text-[#005312]'
                            : 'bg-[#fff3b0]/60 text-[#5c4a00]'
                        }`}>
                          {autoUser ? autoUser.name : 'לא משויך'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <button
            onClick={handleImport}
            disabled={matchedCount === 0 || importing}
            className="w-full bg-[#00193c] text-white py-4 rounded-xl font-extrabold text-base hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {importing ? 'מייבא...' : `ייבא ${matchedCount} עסקאות`}
          </button>
        </>
      )}
    </main>
  );
}
