import { create } from 'zustand'
import { initialTransactions, monthlyBudgets } from '../data/mockData'

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

export const useStore = create((set, get) => ({
  // Transactions
  transactions: loadFromStorage('centra-transactions', initialTransactions),
  addTransaction: (transaction) => {
    const transactions = get().transactions
    const maxId = transactions.reduce((max, t) => Math.max(max, t.id), 0)
    const newTransactions = [{ ...transaction, id: maxId + 1 }, ...transactions]
    localStorage.setItem('centra-transactions', JSON.stringify(newTransactions))
    set({ transactions: newTransactions })
  },
  updateTransaction: (id, updates) => {
    const newTransactions = get().transactions.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    )
    localStorage.setItem('centra-transactions', JSON.stringify(newTransactions))
    set({ transactions: newTransactions })
  },
  deleteTransaction: (id) => {
    const newTransactions = get().transactions.filter((t) => t.id !== id)
    localStorage.setItem('centra-transactions', JSON.stringify(newTransactions))
    set({ transactions: newTransactions })
  },
  resetTransactions: () => {
    localStorage.removeItem('centra-transactions')
    set({ transactions: initialTransactions })
  },

  // Budgets
  budgets: loadFromStorage('centra-budgets', monthlyBudgets),
  setBudget: (category, amount) => {
    const budgets = { ...get().budgets, [category]: amount }
    localStorage.setItem('centra-budgets', JSON.stringify(budgets))
    set({ budgets })
  },

  // Filters
  filters: {
    search: '',
    category: 'All',
    type: 'All',
    sortBy: 'date',
    sortDir: 'desc',
  },
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  // Role
  role: loadFromStorage('centra-role', 'admin'),
  setRole: (role) => {
    localStorage.setItem('centra-role', JSON.stringify(role))
    set({ role })
  },

  // Theme
  theme: loadFromStorage('centra-theme', 'dark'),
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('centra-theme', JSON.stringify(newTheme))
    set({ theme: newTheme })
  },

  // Active page
  activePage: 'dashboard',
  setActivePage: (page) => set({ activePage: page }),

  // Modal
  modalOpen: false,
  editingTransaction: null,
  openModal: (transaction = null) => set({ modalOpen: true, editingTransaction: transaction }),
  closeModal: () => set({ modalOpen: false, editingTransaction: null }),
}))
