import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface Budget {
  id: string
  categoryId: number
  categoryName: string
  limitAmount: number
  spent: number
  month: string
  userId: string
}

export interface BudgetState {
  budgets: Budget[]
  loading: boolean
  error: string | null
}

const initialState: BudgetState = {
  budgets: [],
  loading: false,
  error: null,
}

// Async thunks for API calls
export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { user: { id: string } | null } }
      if (!auth.user?.id) throw new Error('User not authenticated')
      
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token')
      
      const response = await fetch('/api/user/budgets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': auth.user.id,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch budgets')
      return await response.json()
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch budgets')
    }
  }
)

export const addBudget = createAsyncThunk(
  'budgets/addBudget',
  async (budget: { categoryId: string; limitAmount: number; month: string }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { user: { id: string } | null } }
      if (!auth.user?.id) throw new Error('User not authenticated')
      
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token')
      
      const response = await fetch('/api/user/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': auth.user.id,
        },
        body: JSON.stringify(budget),
      })
      
      if (!response.ok) {
        // Try to get the error message from the response
        try {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to add budget (${response.status})`)
        } catch (parseError) {
          // If we can't parse the error response, use a generic message
          throw new Error(`Failed to add budget (${response.status})`)
        }
      }
      
      return await response.json()
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add budget')
    }
  }
)

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async (budget: Budget, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { user: { id: string } | null } }
      if (!auth.user?.id) throw new Error('User not authenticated')
      
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token')
      
      const response = await fetch(`/api/user/budgets/${budget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': auth.user.id,
        },
        body: JSON.stringify(budget),
      })
      if (!response.ok) throw new Error('Failed to update budget')
      return await response.json()
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update budget')
    }
  }
)

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { user: { id: string } | null } }
      if (!auth.user?.id) throw new Error('User not authenticated')
      
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token')
      
      const response = await fetch(`/api/user/budgets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': auth.user.id,
        },
      })
      if (!response.ok) throw new Error('Failed to delete budget')
      return id
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete budget')
    }
  }
)

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false
        state.budgets = action.payload
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Add budget
      .addCase(addBudget.fulfilled, (state, action) => {
        state.budgets.push(action.payload)
      })
      // Update budget
      .addCase(updateBudget.fulfilled, (state, action) => {
        const index = state.budgets.findIndex(budget => budget.id === action.payload.id)
        if (index !== -1) {
          state.budgets[index] = action.payload
        }
      })
      // Delete budget
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter(budget => budget.id !== action.payload)
      })
  },
})

export const { clearError } = budgetSlice.actions
export default budgetSlice.reducer
