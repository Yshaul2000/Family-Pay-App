import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function UsersPage() {
  const { users, cards, addUser, updateUser, deleteUser, assignCardToUser, addCard, deleteCard } = useApp();
  const usersWithCard = users.filter(u => u.cardId).length;

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newCardDigits, setNewCardDigits] = useState('');
  const [newCardOwner, setNewCardOwner] = useState('');
  const [addingCard, setAddingCard] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('משתמש');
  // editingId = the user currently being edited inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  // cardPickerId = user whose card picker is open
  const [cardPickerId, setCardPickerId] = useState<string | null>(null);

  const filtered = users.filter(u =>
    u.name.includes(search) ||
    u.role.includes(search)
  );

  function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    addUser({ name: newName.trim(), role: newRole.trim() || 'משתמש' });
    setNewName('');
    setNewRole('משתמש');
    setShowForm(false);
  }

  function startEdit(user: { id: string; name: string; role: string }) {
    setEditingId(user.id);
    setEditName(user.name);
    setEditRole(user.role);
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;
    updateUser(editingId, { name: editName.trim(), role: editRole.trim() || 'משתמש' });
    setEditingId(null);
  }

  function handleDelete(userId: string, userName: string) {
    if (confirm(`למחוק את ${userName}?`)) {
      deleteUser(userId);
    }
  }

  return (
    <main className="pt-20 px-6 max-w-4xl mx-auto pb-32">
      {/* Header */}
      <section className="mb-8 mt-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#00193c]" style={{ fontFamily: 'Manrope' }}>
              ניהול משתמשים וכרטיסים
            </h2>
            <p className="text-[#4e6874] mt-1 font-medium">ניהול הרשאות, הקצאת כרטיסים ומעקב פעילות</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="bg-[#00193c] text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-sm">{showForm ? 'close' : 'add'}</span>
            <span>{showForm ? 'ביטול' : 'משתמש חדש'}</span>
          </button>
        </div>
      </section>

      {/* Add User Form */}
      {showForm && (
        <form
          onSubmit={handleAddUser}
          className="bg-surface-container-lowest rounded-xl p-6 mb-6 shadow-card flex flex-col gap-4"
        >
          <h3 className="font-bold text-[#00193c]" style={{ fontFamily: 'Manrope' }}>הוספת משתמש חדש</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#43474f]">שם מלא</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="לדוגמה: יוסי כהן"
                required
                className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-container text-on-surface font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#43474f]">תפקיד</label>
              <div className="relative">
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-container text-on-surface font-medium appearance-none"
                >
                  <option value="משתמש">משתמש</option>
                  <option value="בעל כרטיס">בעל כרטיס</option>
                  <option value="בעל החשבון">בעל החשבון</option>
                </select>
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747781] pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="self-start bg-[#00193c] text-white px-6 py-2.5 rounded-full font-bold hover:opacity-90 transition-opacity"
          >
            הוסף משתמש
          </button>
        </form>
      )}

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between h-32 shadow-card">
          <span className="text-[#4e6874] text-sm font-bold">סה״כ משתמשים</span>
          <span className="text-4xl font-extrabold text-[#00193c]" style={{ fontFamily: 'Manrope' }}>
            {users.length.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between h-32 shadow-card">
          <span className="text-[#4e6874] text-sm font-bold">כרטיסים פעילים</span>
          <span className="text-4xl font-extrabold text-[#00193c]" style={{ fontFamily: 'Manrope' }}>
            {cards.length.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="bg-surface-container-highest p-6 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden shadow-card">
          <span className="text-[#4e6874] text-sm font-bold">כרטיס משויך</span>
          <span className="text-4xl font-extrabold text-[#00193c]" style={{ fontFamily: 'Manrope' }}>
            {usersWithCard} / {users.length}
          </span>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <span className="material-symbols-outlined text-8xl">credit_card</span>
          </div>
        </div>
      </section>

      {/* Cards Management */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-extrabold text-lg text-[#00193c]" style={{ fontFamily: 'Manrope' }}>כרטיסי אשראי</h3>
          <button
            onClick={() => setAddingCard(v => !v)}
            className="flex items-center gap-1.5 text-sm font-bold text-[#002d62] bg-[#ddeaf2] px-4 py-2 rounded-full hover:bg-[#d7e4ec] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">{addingCard ? 'close' : 'add'}</span>
            {addingCard ? 'ביטול' : 'הוסף כרטיס'}
          </button>
        </div>

        {addingCard && (
          <form
            onSubmit={async e => {
              e.preventDefault();
              const digits = newCardDigits.trim();
              if (digits.length !== 4 || !/^\d{4}$/.test(digits)) return;
              setCardError(null);
              try {
                await addCard(digits, newCardOwner);
                setNewCardDigits('');
                setNewCardOwner('');
                setAddingCard(false);
              } catch (err) {
                setCardError(err instanceof Error ? err.message : 'שגיאה בשמירת הכרטיס');
              }
            }}
            className="bg-surface-container-lowest rounded-xl p-4 mb-4 shadow-card flex flex-col gap-3"
          >
            {cardError && (
              <p className="text-xs font-bold text-[#ba1a1a] bg-[#ffdad6]/40 rounded-lg px-3 py-2">
                שגיאה: {cardError}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#43474f]">4 ספרות אחרונות</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  pattern="\d{4}"
                  value={newCardDigits}
                  onChange={e => setNewCardDigits(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  required
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-container text-on-surface font-mono font-bold tracking-widest"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#43474f]">בעל הכרטיס</label>
                <div className="relative">
                  <select
                    value={newCardOwner}
                    onChange={e => setNewCardOwner(e.target.value)}
                    required
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-container text-on-surface font-medium appearance-none"
                  >
                    <option value="" disabled>בחר משתמש...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747781] pointer-events-none">expand_more</span>
                </div>
              </div>
              <button
                type="submit"
                className="bg-[#00193c] text-white px-5 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                הוסף כרטיס
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap gap-3">
          {cards.map(card => {
            const owner = users.find(u => u.id === card.ownerId);
            return (
              <div
                key={card.id}
                className="bg-surface-container-lowest rounded-xl px-4 py-3 shadow-card flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-[#002d62]">credit_card</span>
                <div>
                  <p className="font-mono font-bold text-[#00193c] tracking-widest">**** {card.lastFourDigits}</p>
                  <p className="text-[11px] text-[#747781] font-medium">
                    {owner ? `של ${owner.name}` : 'ללא בעלים'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`למחוק כרטיס ****${card.lastFourDigits}?`)) deleteCard(card.id);
                  }}
                  className="mr-1 w-8 h-8 flex items-center justify-center rounded-full text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
                  title="מחק כרטיס"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            );
          })}
          {cards.length === 0 && (
            <p className="text-sm text-[#747781] font-medium py-2">אין כרטיסים — הוסף כרטיס ראשון</p>
          )}
        </div>
      </section>

      {/* Search */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 bg-[#e3f0f8] rounded-full px-4 py-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#747781]">search</span>
          <input
            className="bg-transparent border-none focus:outline-none w-full text-sm font-medium"
            placeholder="חיפוש משתמש..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Users List */}
      <section className="space-y-3">
        {filtered.map(user => {
          const card = cards.find(c => c.id === user.cardId);
          const isEditing = editingId === user.id;

          return (
            <div key={user.id} className="bg-surface-container-lowest rounded-xl shadow-card overflow-hidden">
              {/* Main row */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#ddeaf2] flex items-center justify-center text-[#00193c] font-bold text-lg">
                        {user.name[0]}
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${card ? 'bg-[#a3f69c]' : 'bg-[#747781]'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111d23]">{user.name}</h3>
                    <p className="text-xs text-[#4e6874] font-medium">{user.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden md:block">
                    {card ? (
                      <button
                        onClick={() => setCardPickerId(cardPickerId === user.id ? null : user.id)}
                        className="flex flex-col items-end hover:opacity-75 transition-opacity"
                      >
                        <span className="text-[10px] block text-[#747781] mb-1 font-bold">כרטיס משויך</span>
                        <code className="text-sm font-mono font-bold text-[#00193c]">**** {card.lastFourDigits}</code>
                      </button>
                    ) : (
                      <button
                        onClick={() => setCardPickerId(cardPickerId === user.id ? null : user.id)}
                        className="text-xs font-bold text-[#002d62] px-3 py-1 bg-[#d7e2ff] rounded-full flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">credit_card</span>
                        שיוך כרטיס
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => isEditing ? setEditingId(null) : startEdit(user)}
                      className="w-10 h-10 flex items-center justify-center rounded-full text-[#00193c] hover:bg-[#ddeaf2] transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">{isEditing ? 'close' : 'edit'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      className="w-10 h-10 flex items-center justify-center rounded-full text-[#ba1a1a] hover:bg-[#ffdad6]/30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card picker panel */}
              {cardPickerId === user.id && (
                <div className="border-t border-surface-container px-4 py-4 bg-surface-container-low">
                  <p className="text-xs font-bold text-[#43474f] mb-3">בחר כרטיס לשיוך</p>
                  <div className="flex flex-wrap gap-2">
                    {cards.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          assignCardToUser(user.id, c.id);
                          setCardPickerId(null);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                          user.cardId === c.id
                            ? 'bg-[#00193c] text-white'
                            : 'bg-white text-[#00193c] border border-[#d7e4ec] hover:bg-[#d7e4ec]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">credit_card</span>
                        **** {c.lastFourDigits}
                        {user.cardId === c.id && (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        )}
                      </button>
                    ))}
                    {user.cardId && (
                      <button
                        onClick={() => {
                          assignCardToUser(user.id, '');
                          setCardPickerId(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-[#ffdad6]/40 text-[#ba1a1a] hover:bg-[#ffdad6] transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">link_off</span>
                        הסר שיוך
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Inline edit form */}
              {isEditing && (
                <form
                  onSubmit={handleSaveEdit}
                  className="border-t border-surface-container px-4 py-4 bg-surface-container-low flex flex-wrap gap-3 items-end"
                >
                  <div className="flex-1 min-w-[140px] space-y-1">
                    <label className="text-xs font-bold text-[#43474f]">שם</label>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full bg-white border-none rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-container text-on-surface font-medium text-sm"
                      required
                    />
                  </div>
                  <div className="flex-1 min-w-[120px] space-y-1">
                    <label className="text-xs font-bold text-[#43474f]">תפקיד</label>
                    <div className="relative">
                      <select
                        value={editRole}
                        onChange={e => setEditRole(e.target.value)}
                        className="w-full bg-white border-none rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-container text-on-surface font-medium text-sm appearance-none"
                      >
                        <option value="משתמש">משתמש</option>
                        <option value="בעל כרטיס">בעל כרטיס</option>
                        <option value="בעל החשבון">בעל החשבון</option>
                      </select>
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747781] pointer-events-none text-[18px]">expand_more</span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-[#00193c] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    שמור
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </section>

    </main>
  );
}
