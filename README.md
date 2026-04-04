# Centra — Personal Finance Dashboard

A personal finance tracker for people who want to actually see where their money goes. Built with React, Tailwind CSS v4, Zustand, and Recharts.

The demo ships with 6 months of realistic transaction data for a software developer in Austin, TX — real merchant names, recurring rent and salary on predictable dates, actual subscription services, and seasonal spending patterns.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

> **Tip:** Data persists in localStorage. To reset to the default dataset, open DevTools → Application → Local Storage and clear the `centra-*` keys (or the store exposes `resetTransactions()`).

## What it does

### Dashboard
- **Summary cards** — Net balance, this month's income, spending (with MoM % change), savings rate
- **Balance trend** — 6-month area chart
- **Spending breakdown** — Donut chart by category
- **Budget vs. Actual** — Per-category budget bars that turn amber/red when you approach or exceed limits
- **Upcoming bills** — Recurring bills that haven't hit yet this month, with "due in X days" warnings

### Transactions
- Sortable, filterable table of all transactions
- Search by description or category name
- Filter by category dropdown and income/expense type
- Human-readable dates (e.g. "Apr 2, '26" not "2026-04-02")
- Color-coded: green income, red expense
- CSV export of the current filtered view

### Insights
- **Recommendations engine** — Actionable advice based on your data (e.g. "You've exceeded your budget in Shopping", "Subscriptions total $82/mo — audit unused services")
- Top spending category, MoM expense trend, largest single expense
- Current month savings with comparison to last month
- Subscription cost tracking
- Budget alerts count
- All-time spending breakdown with animated bars

### Role-Based Access (RBAC)
Dropdown in the navbar switches between:

| | Viewer | Admin |
|-|--------|-------|
| View all pages | Yes | Yes |
| Add transaction | No | Yes |
| Edit / delete | No | Yes |

No backend auth — role is frontend state saved in localStorage.

### Other
- **Dark / Light mode** — sun/moon toggle, persisted
- **Responsive** — mobile hamburger nav, stacked grids
- **Animated** — Framer Motion page transitions, chart entrance animations

## State Management

Zustand store with localStorage persistence. No prop drilling, no context boilerplate.

| Key | What it stores |
|-----|---------------|
| `centra-transactions` | Full transaction list |
| `centra-budgets` | Monthly budget limits per category |
| `centra-role` | `'admin'` or `'viewer'` |
| `centra-theme` | `'dark'` or `'light'` |

## Stack

| Library | Purpose |
|---------|---------|
| React | UI |
| Vite | Build tool |
| Tailwind CSS v4 | Styling (with `@tailwindcss/vite` plugin) |
| Zustand | State management |
| Recharts | Area + Pie charts |
| Framer Motion | Animations |
| Lucide React | Icons |

## Project Structure

```
src/
├── App.jsx
├── main.jsx
├── index.css                    # Tailwind config + theme tokens
├── data/
│   └── mockData.js              # 85 hand-crafted transactions, budgets, recurring bills
├── store/
│   └── useStore.js              # Zustand store
└── components/
    ├── Navbar.jsx
    ├── Dashboard.jsx            # Summary cards, charts, budgets, upcoming bills
    ├── Transactions.jsx         # Filterable/sortable table + CSV export
    ├── Insights.jsx             # Recommendations, metrics, category breakdown
    ├── TransactionModal.jsx     # Add/edit form
    └── charts/
        ├── BalanceChart.jsx
        └── SpendingPieChart.jsx
```
