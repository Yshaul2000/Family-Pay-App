import { mockUsers } from '../data/mockData';

const owner = mockUsers.find(u => u.id === 'user-owner')!;

export default function TopAppBar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-low/85 backdrop-blur-md flex justify-between items-center px-6 h-16 rtl shadow-[0_1px_0_0_rgba(0,25,60,0.06)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#d7e4ec] overflow-hidden border-2 border-[#002d62]/10">
          {owner.avatarUrl ? (
            <img src={owner.avatarUrl} alt="פרופיל משתמש" className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center font-bold text-[#00193c]">
              {owner.name[0]}
            </span>
          )}
        </div>
        <h1 className="font-bold text-lg tracking-tight text-blue-900" style={{ fontFamily: 'Manrope' }}>
          ניהול הוצאות
        </h1>
      </div>
      <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest/60 transition-colors">
        <span className="material-symbols-outlined text-blue-900">notifications</span>
      </button>
    </header>
  );
}
