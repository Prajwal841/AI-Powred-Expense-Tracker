import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface ParsedExpenseResponse {
  expenseId: number
  name: string
  category: string
  subcategory: string | null
  amount: number
  currency: string
  date: string
  description: string | null
  merchant: string | null
  confidence: number
  source: string
}

export interface ParseExpenseRequest {
  text: string
  timezone: string
  currency: string
  locale: string
}

interface AiExpenseState {
  parsedExpense: ParsedExpenseResponse | null
  loading: boolean
  error: string | null
}

const initialState: AiExpenseState = {
  parsedExpense: null,
  loading: false,
  error: null
}

export const parseExpenseWithAI = createAsyncThunk(
  'aiExpense/parseExpense',
  async (request: ParseExpenseRequest, { rejectWithValue }) => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        throw new Error('User not authenticated')
      }

      const response = await fetch('/api/ai/parse-expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-User-Id': userId
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to parse expense')
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const aiExpenseSlice = createSlice({
  name: 'aiExpense',
  initialState,
  reducers: {
    clearParsedExpense: (state) => {
      state.parsedExpense = null
      state.error = null
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(parseExpenseWithAI.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(parseExpenseWithAI.fulfilled, (state, action) => {
        state.loading = false
        state.parsedExpense = action.payload
      })
      .addCase(parseExpenseWithAI.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearParsedExpense, setError } = aiExpenseSlice.actions
export default aiExpenseSlice.reducer
