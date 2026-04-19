<div align="center">

![Family Pay App](assets/banner.svg)

# Family Pay App

**אפליקציה לניהול הוצאות אשראי משותפות במשפחה**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## מה האפליקציה עושה?

בסוף כל חודש — מי חייב כמה?

כשמספר בני משפחה חולקים כרטיסי אשראי המקושרים לחשבון מרכזי, קשה לעקוב אחרי מי קנה מה ולמי.
**Family Pay App** פותרת את הבעיה: כל עסקה משויכת למשתמש, והמערכת מחשבת אוטומטית כמה כל אחד חייב להחזיר לבעל החשבון.

---

## מסכים

| מסך | תיאור |
|-----|--------|
| **Dashboard** | סקירה חודשית — סך הוצאות, כמה חייבים לך, סטטוס תשלומים |
| **עסקאות** | רשימה מלאה עם חיפוש, פילטור לפי כרטיס, שיוך ועריכה |
| **הוספת עסקה** | טופס חכם — משמש גם לעריכה עם מילוי אוטומטי |
| **משתמשים** | ניהול בני המשפחה, כרטיסים, ושיוכים |
| **סיכום חודשי** | התחשבנות מפורטת עם גרפי עוגה וניווט בין חודשים |
| **Analytics** | פילוח הוצאות לפי קטגוריה ולפי משתמש — בר-גרפים |

---

## ארכיטקטורה

```
src/
├── context/
│   └── AppContext.tsx        — ניהול מצב מרכזי + כל הפעולות (Supabase)
├── data/
│   └── mockData.ts           — נתוני seed לטעינה ראשונה
├── lib/
│   └── supabase.ts           — חיבור לבסיס הנתונים
├── pages/
│   ├── DashboardPage.tsx
│   ├── TransactionsPage.tsx
│   ├── AddTransactionPage.tsx
│   ├── UsersPage.tsx
│   ├── SummaryPage.tsx
│   └── AnalyticsPage.tsx
├── types/
│   └── index.ts              — User, Card, Transaction, MonthlySummary
└── utils/
    └── format.ts             — formatDate (DD/MM/YYYY)
```

---

## Stack טכנולוגי

| טכנולוגיה | תפקיד |
|-----------|--------|
| **React 19** | ספריית ממשק המשתמש |
| **TypeScript** | אכיפת טיפוסים ומבני נתונים |
| **Vite** | כלי בנייה ושרת פיתוח |
| **Tailwind CSS v4** | עיצוב — Material Design 3 |
| **React Router v7** | ניווט בין מסכים |
| **Supabase** | בסיס נתונים PostgreSQL בענן |

---

## בסיס הנתונים

```
users           — בני המשפחה (שם, תפקיד, כרטיס משויך)
cards           — כרטיסי אשראי (4 ספרות אחרונות, בעלים)
transactions    — עסקאות (חנות, סכום, תאריך, קטגוריה, משתמש)
settled_users   — מי שילם החזר החודש ומתי
```

> **Optimistic UI** — כל פעולה מעדכנת את ה-state מיד, ואז נשמרת ב-Supabase ברקע.

---

## התקנה והרצה מקומית

```bash
# Clone
git clone https://github.com/Yshaul2000/Family-Pay-App.git
cd Family-Pay-App

# Install
npm install

# Run dev server
npm run dev

# Run on local network (for mobile access)
npm run dev -- --host
```

### משתני סביבה

הפרויקט משתמש ב-Supabase. הוסף קובץ `.env.local`:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## פיצ'רים עתידיים

- [ ] פיצול הוצאה בין מספר משתמשים
- [ ] היסטוריית חודשים מופרדת ב-`settled_users`
- [ ] התראות push לתשלום חוב
- [ ] מסך Analytics מורחב
- [ ] ייצוא דוח PDF

---

<div align="center">

Made with ♥ by [Yshaul2000](https://github.com/Yshaul2000)

</div>
