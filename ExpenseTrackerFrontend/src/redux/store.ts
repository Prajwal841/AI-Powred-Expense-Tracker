import { configureStore } from '@reduxjs/toolkit'
import expenseReducer from './slices/expenseSlice'
import budgetReducer from './slices/budgetSlice'
import categoryReducer from './slices/categorySlice'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import receiptReducer from './slices/receiptSlice'
import aiExpenseReducer from './slices/aiExpenseSlice'
import voiceExpenseReducer from './slices/voiceExpenseSlice'
import rateLimitReducer from './slices/rateLimitSlice'
import settingsReducer from './slices/settingsSlice'
import goalReducer from './slices/goalSlice'

export const store = configureStore({
  reducer: {
    expenses: expenseReducer,
    budgets: budgetReducer,
    categories: categoryReducer,
    auth: authReducer,
    ui: uiReducer,
    receipts: receiptReducer,
    aiExpense: aiExpenseReducer,
    voiceExpense: voiceExpenseReducer,
    rateLimit: rateLimitReducer,
    settings: settingsReducer,
    goals: goalReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
