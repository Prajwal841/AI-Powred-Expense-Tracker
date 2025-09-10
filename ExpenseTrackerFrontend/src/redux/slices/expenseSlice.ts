import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface Expense {
  id: string
  name: string
  amount: number
  category: string
  date: string
  description?: string
  userId: string
  receiptPath?: string
}

export interface ExpenseState {
  expenses: Expense[]
  loading: boolean
  error: string | null
  voiceExpenseRefreshNeeded: boolean
  filters: {
    category: string
    dateRange: {
      start: string
      end: string
    }
    search: string
  }
  lastVoiceExpenseTime: number
}

const initialState: ExpenseState = {
  expenses: [],
  loading: false,
  error: null,
  voiceExpenseRefreshNeeded: false,
  filters: {
    category: '',
    dateRange: {
      start: '',
      end: '',
    },
    search: '',
  },
  lastVoiceExpenseTime: 0,
}

// Async thunks for API calls
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { user: { id: string } | null } }
      if (!auth.user?.id) throw new Error('User not authenticated')
      
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')
      
      const response = await fetch('/api/user/expenses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': auth.user.id,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch expenses')
      const data = await response.json()
      
      // Transform backend response to match frontend structure
      return data.map((expense: any) => ({
        id: expense.id.toString(),
        name: expense.name,
        amount: expense.amount,
        category: expense.categoryName,
        date: expense.date,
        description: expense.description,
        userId: expense.userId.toString(),
        receiptPath: expense.receiptPath
      }))
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch expenses')
    }
  }
)

export const addExpense = createAsyncThunk(
  'expenses/addExpense',
  async (expense: Omit<Expense, 'id'>, { rejectWithValue, getState }) => {
    try {
      const { auth, categories } = getState() as { 
        auth: { user: { id: string } | null },
        categories: { categories: Array<{ id: string, name: string }> }
      }
      console.log('Adding expense with auth state:', auth)
      if (!auth.user?.id) throw new Error('User not authenticated')
      
      // Find category ID by name
      const category = categories.categories.find(cat => cat.name === expense.category)
      if (!category) throw new Error('Category not found')
      
      // Transform expense data to match backend API
      const expenseData = {
        name: expense.name,
        amount: expense.amount,
        categoryId: parseInt(category.id),
        date: expense.date,
        description: expense.description || '',
        paymentMethod: 'manual',
        source: 'manual'
      }
      
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')
      
      const response = await fetch('/api/user/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': auth.user.id,
        },
        body: JSON.stringify(expenseData),
      })
      if (!response.ok) throw new Error('Failed to add expense')
      const data = await response.json()
      
      // Transform backend response to match frontend structure
      return {
        id: data.id.toString(),
        name: data.name,
        amount: data.amount,
        category: data.categoryName,
        date: data.date,
        description: data.description,
        userId: data.userId.toString(),
        receiptPath: data.receiptPath
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add expense')
    }
  }
)

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async (expense: Expense, { rejectWithValue, getState }) => {
    try {
      const { auth, categories } = getState() as { 
        auth: { user: { id: string } | null },
        categories: { categories: Array<{ id: string, name: string }> }
      }
      if (!auth.user?.id) throw new Error('User not authenticated')
      
      // Find category ID by name
      const category = categories.categories.find(cat => cat.name === expense.category)
      if (!category) throw new Error('Category not found')
      
      // Transform expense data to match backend API
      const expenseData = {
        name: expense.name,
        amount: expense.amount,
        categoryId: parseInt(category.id),
        date: expense.date,
        description: expense.description || '',
        paymentMethod: 'manual',
        source: 'manual'
      }
      
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')
      
      const response = await fetch(`/api/user/expenses/${expense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': auth.user.id,
        },
        body: JSON.stringify(expenseData),
      })
      if (!response.ok) throw new Error('Failed to update expense')
      const data = await response.json()
      
      // Transform backend response to match frontend structure
      return {
        id: data.id.toString(),
        name: data.name,
        amount: data.amount,
        category: data.categoryName,
        date: data.date,
        description: data.description,
        userId: data.userId.toString(),
        receiptPath: data.receiptPath
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update expense')
    }
  }
)

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { user: { id: string } | null } }
      if (!auth.user?.id) throw new Error('User not authenticated')
      
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')
      
      const response = await fetch(`/api/user/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': auth.user.id,
        },
      })
      if (!response.ok) throw new Error('Failed to delete expense')
      return id
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete expense')
    }
  }
)

export const addExpenseWithReceipt = createAsyncThunk(
  'expenses/addExpenseWithReceipt',
  async (expenseData: { expense: Omit<Expense, 'id'>, base64Receipt: string, fileName: string }, { rejectWithValue, getState }) => {
    try {
      const { auth, categories } = getState() as { 
        auth: { user: { id: string } | null },
        categories: { categories: Array<{ id: string, name: string }> }
      }
      if (!auth.user?.id) throw new Error('User not authenticated')
      
      // Find category ID by name
      const category = categories.categories.find(cat => cat.name === expenseData.expense.category)
      if (!category) throw new Error('Category not found')
      
      // Transform expense data to match backend API
      const requestData = {
        name: expenseData.expense.name,
        amount: expenseData.expense.amount,
        categoryId: parseInt(category.id),
        date: expenseData.expense.date,
        description: expenseData.expense.description || '',
        paymentMethod: 'manual',
        source: 'receipt',
        base64Receipt: expenseData.base64Receipt,
        fileName: expenseData.fileName
      }
      
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')
      
      const response = await fetch('/api/user/expenses/with-base64-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': auth.user.id,
        },
        body: JSON.stringify(requestData),
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Expense creation error response:', errorText)
        throw new Error(`Failed to add expense with receipt: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      
      // Transform backend response to match frontend structure
      return {
        id: data.id.toString(),
        name: data.name,
        amount: data.amount,
        category: data.categoryName,
        date: data.date,
        description: data.description,
        userId: data.userId.toString(),
        receiptPath: data.receiptPath
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add expense with receipt')
    }
  }
)



const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ExpenseState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
    },
    // Action to trigger expense refresh from voice expense
    refreshExpensesFromVoice: (state) => {
      // Set flag that indicates voice expense refresh is needed
      state.voiceExpenseRefreshNeeded = true
      // Update timestamp to force re-render
      state.lastVoiceExpenseTime = Date.now()
      console.log('🔄 Redux action: refreshExpensesFromVoice triggered at', state.lastVoiceExpenseTime)
    },
    // Action to clear the voice expense refresh flag
    clearVoiceExpenseRefreshFlag: (state) => {
      state.voiceExpenseRefreshNeeded = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false
        state.expenses = action.payload
        console.log('📊 Expenses updated in Redux store:', action.payload.length, 'expenses')
        console.log('📊 Latest expenses:', action.payload.slice(0, 3)) // Show first 3 expenses
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Add expense
      .addCase(addExpense.fulfilled, (state, action) => {
        state.expenses.push(action.payload)
      })
      // Add expense with receipt
      .addCase(addExpenseWithReceipt.fulfilled, (state, action) => {
        state.expenses.push(action.payload)
      })

      // Update expense
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(expense => expense.id === action.payload.id)
        if (index !== -1) {
          state.expenses[index] = action.payload
        }
      })
      // Delete expense
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(expense => expense.id !== action.payload)
      })
  },
})

export const { setFilters, clearFilters, refreshExpensesFromVoice, clearVoiceExpenseRefreshFlag } = expenseSlice.actions
export default expenseSlice.reducer
