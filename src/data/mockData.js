// ── Realistic financial data for a software developer in Austin, TX ──
// All transactions are hand-crafted to simulate 6 months of real life.
// Recurring items (rent, salary, subscriptions) land on consistent dates.
// One-off purchases and meals use real merchant names.

export const allCategories = [
  'Housing',
  'Food & Dining',
  'Transport',
  'Subscriptions',
  'Utilities',
  'Health & Fitness',
  'Shopping',
  'Entertainment',
  'Education',
  'Salary',
  'Freelance',
  'Transfers',
]

// Monthly budgets — what a real user would set
export const monthlyBudgets = {
  'Housing': 1650,
  'Food & Dining': 600,
  'Transport': 250,
  'Subscriptions': 80,
  'Utilities': 200,
  'Health & Fitness': 120,
  'Shopping': 300,
  'Entertainment': 150,
  'Education': 100,
}

// Upcoming / recurring bills the user tracks
export const recurringBills = [
  { name: 'Rent — The Bowie Apartments', amount: 1595, dueDay: 1, category: 'Housing' },
  { name: 'Austin Energy', amount: 87.40, dueDay: 5, category: 'Utilities' },
  { name: 'AT&T Fiber', amount: 65, dueDay: 8, category: 'Utilities' },
  { name: 'T-Mobile', amount: 47, dueDay: 12, category: 'Utilities' },
  { name: 'Netflix Premium', amount: 22.99, dueDay: 14, category: 'Subscriptions' },
  { name: 'Spotify Family', amount: 16.99, dueDay: 14, category: 'Subscriptions' },
  { name: 'iCloud+ 200GB', amount: 2.99, dueDay: 15, category: 'Subscriptions' },
  { name: 'ChatGPT Plus', amount: 20, dueDay: 18, category: 'Subscriptions' },
  { name: 'Equinox Gym', amount: 95, dueDay: 20, category: 'Health & Fitness' },
  { name: 'Geico Auto Insurance', amount: 124, dueDay: 22, category: 'Transport' },
]

function d(y, m, day) {
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Deterministic transaction history — same for every user
export const initialTransactions = [
  // ──────── 2025-11 (November) ────────
  { id: 1,  date: d(2025,11,1),  description: 'Acme Corp — Salary Deposit', category: 'Salary', amount: 6840, type: 'income' },
  { id: 2,  date: d(2025,11,1),  description: 'Rent — The Bowie Apartments', category: 'Housing', amount: 1595, type: 'expense' },
  { id: 3,  date: d(2025,11,3),  description: 'H-E-B Grocery #124',         category: 'Food & Dining', amount: 127.43, type: 'expense' },
  { id: 4,  date: d(2025,11,5),  description: 'Austin Energy — Electric',    category: 'Utilities', amount: 92.17, type: 'expense' },
  { id: 5,  date: d(2025,11,7),  description: 'Torchy\'s Tacos — Lunch',     category: 'Food & Dining', amount: 18.50, type: 'expense' },
  { id: 6,  date: d(2025,11,8),  description: 'AT&T Fiber Internet',         category: 'Utilities', amount: 65, type: 'expense' },
  { id: 7,  date: d(2025,11,10), description: 'Shell Gas Station — Mopac',   category: 'Transport', amount: 48.72, type: 'expense' },
  { id: 8,  date: d(2025,11,14), description: 'Netflix Premium',             category: 'Subscriptions', amount: 22.99, type: 'expense' },
  { id: 9,  date: d(2025,11,14), description: 'Spotify Family',              category: 'Subscriptions', amount: 16.99, type: 'expense' },
  { id: 10, date: d(2025,11,15), description: 'Freelance — Logo redesign for Brewhaus Coffee', category: 'Freelance', amount: 1200, type: 'income' },
  { id: 11, date: d(2025,11,17), description: 'Costco — Bulk groceries',     category: 'Food & Dining', amount: 214.88, type: 'expense' },
  { id: 12, date: d(2025,11,18), description: 'ChatGPT Plus',                category: 'Subscriptions', amount: 20, type: 'expense' },
  { id: 13, date: d(2025,11,20), description: 'Equinox — Monthly membership',category: 'Health & Fitness', amount: 95, type: 'expense' },
  { id: 14, date: d(2025,11,22), description: 'Geico Auto Insurance',        category: 'Transport', amount: 124, type: 'expense' },
  { id: 15, date: d(2025,11,24), description: 'Amazon — Mechanical keyboard',category: 'Shopping', amount: 179.99, type: 'expense' },
  { id: 16, date: d(2025,11,26), description: 'Uchi — Dinner with friends',  category: 'Food & Dining', amount: 87.00, type: 'expense' },
  { id: 17, date: d(2025,11,28), description: 'Uber ride — Airport pickup',  category: 'Transport', amount: 34.50, type: 'expense' },

  // ──────── 2025-12 (December) ────────
  { id: 18, date: d(2025,12,1),  description: 'Acme Corp — Salary Deposit',  category: 'Salary', amount: 6840, type: 'income' },
  { id: 19, date: d(2025,12,1),  description: 'Rent — The Bowie Apartments', category: 'Housing', amount: 1595, type: 'expense' },
  { id: 20, date: d(2025,12,2),  description: 'H-E-B Grocery #124',          category: 'Food & Dining', amount: 143.21, type: 'expense' },
  { id: 21, date: d(2025,12,5),  description: 'Austin Energy — Electric',    category: 'Utilities', amount: 78.33, type: 'expense' },
  { id: 22, date: d(2025,12,8),  description: 'AT&T Fiber Internet',         category: 'Utilities', amount: 65, type: 'expense' },
  { id: 23, date: d(2025,12,10), description: 'Target — Holiday gifts',      category: 'Shopping', amount: 312.47, type: 'expense' },
  { id: 24, date: d(2025,12,12), description: 'T-Mobile — Phone plan',       category: 'Utilities', amount: 47, type: 'expense' },
  { id: 25, date: d(2025,12,14), description: 'Netflix Premium',             category: 'Subscriptions', amount: 22.99, type: 'expense' },
  { id: 26, date: d(2025,12,14), description: 'Spotify Family',              category: 'Subscriptions', amount: 16.99, type: 'expense' },
  { id: 27, date: d(2025,12,15), description: 'iCloud+ 200GB',               category: 'Subscriptions', amount: 2.99, type: 'expense' },
  { id: 28, date: d(2025,12,16), description: 'Starbucks — Barton Creek',    category: 'Food & Dining', amount: 7.45, type: 'expense' },
  { id: 29, date: d(2025,12,18), description: 'ChatGPT Plus',                category: 'Subscriptions', amount: 20, type: 'expense' },
  { id: 30, date: d(2025,12,20), description: 'Equinox — Monthly membership',category: 'Health & Fitness', amount: 95, type: 'expense' },
  { id: 31, date: d(2025,12,22), description: 'Geico Auto Insurance',        category: 'Transport', amount: 124, type: 'expense' },
  { id: 32, date: d(2025,12,23), description: 'Best Buy — AirPods Pro',      category: 'Shopping', amount: 249.99, type: 'expense' },
  { id: 33, date: d(2025,12,25), description: 'Freelance — Shopify store for Lonestar Leather', category: 'Freelance', amount: 2400, type: 'income' },
  { id: 34, date: d(2025,12,28), description: 'Whole Foods — Meal prep',     category: 'Food & Dining', amount: 96.12, type: 'expense' },
  { id: 35, date: d(2025,12,30), description: 'Shell Gas Station — Mopac',   category: 'Transport', amount: 52.18, type: 'expense' },

  // ──────── 2026-01 (January) ────────
  { id: 36, date: d(2026,1,1),  description: 'Acme Corp — Salary Deposit',   category: 'Salary', amount: 6840, type: 'income' },
  { id: 37, date: d(2026,1,1),  description: 'Rent — The Bowie Apartments',  category: 'Housing', amount: 1595, type: 'expense' },
  { id: 38, date: d(2026,1,3),  description: 'H-E-B Grocery #124',           category: 'Food & Dining', amount: 118.90, type: 'expense' },
  { id: 39, date: d(2026,1,5),  description: 'Austin Energy — Electric',     category: 'Utilities', amount: 104.55, type: 'expense' },
  { id: 40, date: d(2026,1,6),  description: 'Udemy — React Advanced Patterns course', category: 'Education', amount: 13.99, type: 'expense' },
  { id: 41, date: d(2026,1,8),  description: 'AT&T Fiber Internet',          category: 'Utilities', amount: 65, type: 'expense' },
  { id: 42, date: d(2026,1,10), description: 'CVS Pharmacy — Prescription',  category: 'Health & Fitness', amount: 23.50, type: 'expense' },
  { id: 43, date: d(2026,1,14), description: 'Netflix Premium',              category: 'Subscriptions', amount: 22.99, type: 'expense' },
  { id: 44, date: d(2026,1,14), description: 'Spotify Family',               category: 'Subscriptions', amount: 16.99, type: 'expense' },
  { id: 45, date: d(2026,1,18), description: 'ChatGPT Plus',                 category: 'Subscriptions', amount: 20, type: 'expense' },
  { id: 46, date: d(2026,1,19), description: 'Texadelphia — Lunch',          category: 'Food & Dining', amount: 14.75, type: 'expense' },
  { id: 47, date: d(2026,1,20), description: 'Equinox — Monthly membership', category: 'Health & Fitness', amount: 95, type: 'expense' },
  { id: 48, date: d(2026,1,22), description: 'Geico Auto Insurance',         category: 'Transport', amount: 124, type: 'expense' },
  { id: 49, date: d(2026,1,25), description: 'Amazon — Standing desk mat',   category: 'Shopping', amount: 44.99, type: 'expense' },
  { id: 50, date: d(2026,1,28), description: 'Freelance — API integration for RunTrack', category: 'Freelance', amount: 1800, type: 'income' },

  // ──────── 2026-02 (February) ────────
  { id: 51, date: d(2026,2,1),  description: 'Acme Corp — Salary Deposit',   category: 'Salary', amount: 6840, type: 'income' },
  { id: 52, date: d(2026,2,1),  description: 'Rent — The Bowie Apartments',  category: 'Housing', amount: 1595, type: 'expense' },
  { id: 53, date: d(2026,2,3),  description: 'H-E-B Grocery #124',           category: 'Food & Dining', amount: 132.67, type: 'expense' },
  { id: 54, date: d(2026,2,5),  description: 'Austin Energy — Electric',     category: 'Utilities', amount: 81.20, type: 'expense' },
  { id: 55, date: d(2026,2,8),  description: 'AT&T Fiber Internet',          category: 'Utilities', amount: 65, type: 'expense' },
  { id: 56, date: d(2026,2,10), description: 'Shell Gas Station — Mopac',    category: 'Transport', amount: 45.90, type: 'expense' },
  { id: 57, date: d(2026,2,14), description: 'Netflix Premium',              category: 'Subscriptions', amount: 22.99, type: 'expense' },
  { id: 58, date: d(2026,2,14), description: 'Spotify Family',               category: 'Subscriptions', amount: 16.99, type: 'expense' },
  { id: 59, date: d(2026,2,14), description: 'Valentines — Dinner at Launderette', category: 'Food & Dining', amount: 142.00, type: 'expense' },
  { id: 60, date: d(2026,2,18), description: 'ChatGPT Plus',                 category: 'Subscriptions', amount: 20, type: 'expense' },
  { id: 61, date: d(2026,2,20), description: 'Equinox — Monthly membership', category: 'Health & Fitness', amount: 95, type: 'expense' },
  { id: 62, date: d(2026,2,22), description: 'Geico Auto Insurance',         category: 'Transport', amount: 124, type: 'expense' },
  { id: 63, date: d(2026,2,24), description: 'BookPeople — 3 dev books',     category: 'Education', amount: 67.40, type: 'expense' },

  // ──────── 2026-03 (March) ────────
  { id: 64, date: d(2026,3,1),  description: 'Acme Corp — Salary Deposit',   category: 'Salary', amount: 7200, type: 'income' },
  { id: 65, date: d(2026,3,1),  description: 'Rent — The Bowie Apartments',  category: 'Housing', amount: 1595, type: 'expense' },
  { id: 66, date: d(2026,3,2),  description: 'H-E-B Grocery #124',           category: 'Food & Dining', amount: 109.34, type: 'expense' },
  { id: 67, date: d(2026,3,5),  description: 'Austin Energy — Electric',     category: 'Utilities', amount: 74.88, type: 'expense' },
  { id: 68, date: d(2026,3,7),  description: 'Alamo Drafthouse — SXSW film', category: 'Entertainment', amount: 28.00, type: 'expense' },
  { id: 69, date: d(2026,3,8),  description: 'AT&T Fiber Internet',          category: 'Utilities', amount: 65, type: 'expense' },
  { id: 70, date: d(2026,3,10), description: 'SXSW Interactive — Badge',     category: 'Entertainment', amount: 395, type: 'expense' },
  { id: 71, date: d(2026,3,12), description: 'T-Mobile — Phone plan',        category: 'Utilities', amount: 47, type: 'expense' },
  { id: 72, date: d(2026,3,14), description: 'Netflix Premium',              category: 'Subscriptions', amount: 22.99, type: 'expense' },
  { id: 73, date: d(2026,3,14), description: 'Spotify Family',               category: 'Subscriptions', amount: 16.99, type: 'expense' },
  { id: 74, date: d(2026,3,15), description: 'Freelance — Landing page for Zilker Botanicals', category: 'Freelance', amount: 850, type: 'income' },
  { id: 75, date: d(2026,3,18), description: 'ChatGPT Plus',                 category: 'Subscriptions', amount: 20, type: 'expense' },
  { id: 76, date: d(2026,3,20), description: 'Equinox — Monthly membership', category: 'Health & Fitness', amount: 95, type: 'expense' },
  { id: 77, date: d(2026,3,22), description: 'Geico Auto Insurance',         category: 'Transport', amount: 124, type: 'expense' },
  { id: 78, date: d(2026,3,23), description: 'Uber — 3 rides this week',     category: 'Transport', amount: 67.40, type: 'expense' },
  { id: 79, date: d(2026,3,26), description: 'Whole Foods — Meal prep',      category: 'Food & Dining', amount: 88.55, type: 'expense' },
  { id: 80, date: d(2026,3,28), description: 'Amazon — USB-C hub & cables',  category: 'Shopping', amount: 56.98, type: 'expense' },

  // ──────── 2026-04 (April — current month, partial) ────────
  { id: 81, date: d(2026,4,1),  description: 'Acme Corp — Salary Deposit',   category: 'Salary', amount: 7200, type: 'income' },
  { id: 82, date: d(2026,4,1),  description: 'Rent — The Bowie Apartments',  category: 'Housing', amount: 1595, type: 'expense' },
  { id: 83, date: d(2026,4,2),  description: 'H-E-B Grocery #124',           category: 'Food & Dining', amount: 135.22, type: 'expense' },
  { id: 84, date: d(2026,4,3),  description: 'Starbucks — South Lamar',      category: 'Food & Dining', amount: 6.85, type: 'expense' },
  { id: 85, date: d(2026,4,5),  description: 'Austin Energy — Electric',     category: 'Utilities', amount: 69.40, type: 'expense' },
].sort((a, b) => new Date(b.date) - new Date(a.date))
