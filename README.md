<div align="center">

![Family Pay App](assets/banner.svg)

# Family Pay App

**A shared credit card expense manager for families**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## Overview

When multiple family members share credit cards, tracking who spent what becomes a mess.
**Family Pay App** solves this: each card has an owner, every transaction is assigned to a user, and the system automatically calculates how much each person owes each card owner at the end of the month.

---

## Features

- **Dashboard** — Monthly overview: total expenses, personal balance, who owes what, per-owner perspective selector
- **Transactions** — Full list with search, filter by card, assign to user, edit and delete
- **Add / Edit Transaction** — Smart form with auto-fill when editing an existing transaction
- **Users & Cards** — Manage family members, assign multiple cards per user, manage card ownership
- **Monthly Summary** — Detailed settlement table with month navigation, per-owner selector, and pie chart reports
- **Analytics** — Bar charts by category and by user, with month navigation and per-owner selector
- **MAX Import** — Import transactions from MAX XLSX files with automatic card detection and user auto-assignment

---

## Tech Stack

| Technology | Role |
|------------|------|
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS v4** | Styling — Material Design 3 |
| **React Router v7** | Client-side navigation |
| **Supabase** | PostgreSQL cloud database |

---

## Project Structure

```
src/
├── context/
│   └── AppContext.tsx        — Global state + all Supabase actions
├── data/
│   └── mockData.ts           — Seed data for first-time setup
├── lib/
│   └── supabase.ts           — Database client
├── pages/
│   ├── DashboardPage.tsx
│   ├── TransactionsPage.tsx
│   ├── AddTransactionPage.tsx
│   ├── UsersPage.tsx
│   ├── SummaryPage.tsx
│   ├── AnalyticsPage.tsx
│   └── ImportPage.tsx        — MAX XLSX import
├── types/
│   └── index.ts              — User, Card, Transaction, MonthlySummary
└── utils/
    ├── format.ts             — Date formatting helpers
    ├── summaryUtils.ts       — Per-owner debt calculation
    └── parseMaxXlsx.ts       — MAX XLSX file parser
```

---

## Database Schema

```
users           — Family members (name, role, card_ids[] — multiple cards per user)
cards           — Credit cards (last 4 digits, owner_id)
transactions    — All expenses (store, amount, date, category, assigned user)
settled_users   — Payment settlements
```

> **Optimistic UI** — State updates immediately on every action; Supabase is synced in the background.

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Yshaul2000/Family-Pay-App.git
cd Family-Pay-App

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase URL and anon key

# Start the dev server
npm run dev

# Access from mobile on the same network
npm run dev -- --host
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Roadmap

- [ ] Split expenses between multiple users
- [ ] Per-month settlement history
- [ ] Push notifications for pending payments
- [ ] PDF report export
- [ ] Extended analytics

---

<div align="center">

Made with ♥ by [Yshaul2000](https://github.com/Yshaul2000)

</div>
