import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface VoiceExpenseRequest {
  voiceText: string
  userId: string
}

export interface VoiceExpenseResponse {
  success: boolean
  message: string
  expense?: any
  parsedText?: string
  confidence?: string
}

interface VoiceExpenseState {
  loading: boolean
  error: string | null
  response: VoiceExpenseResponse | null
}

const initialState: VoiceExpenseState = {
  loading: false,
  error: null,
  response: null
}

// Async thunk for processing voice expense
export const processVoiceExpense = createAsyncThunk(
  'voiceExpense/process',
  async (request: VoiceExpenseRequest, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch('/api/user/voice-expense/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': request.userId
        },
        body: JSON.stringify({
          voiceText: request.voiceText,
          userId: request.userId
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        if (response.status === 429) {
          // Rate limit exceeded
          const errorData = JSON.parse(errorText)
          throw new Error(`Rate limit exceeded: ${errorData.message}`)
        }
        throw new Error(`Failed to process voice expense: ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// Async thunk for testing voice expense
export const testVoiceExpense = createAsyncThunk(
  'voiceExpense/test',
  async (request: VoiceExpenseRequest, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch('/api/user/voice-expense/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': request.userId
        },
        body: JSON.stringify({
          voiceText: request.voiceText,
          userId: request.userId
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to test voice expense: ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const voiceExpenseSlice = createSlice({
  name: 'voiceExpense',
  initialState,
  reducers: {
    clearResponse: (state) => {
      state.response = null
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Process voice expense
      .addCase(processVoiceExpense.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(processVoiceExpense.fulfilled, (state, action) => {
        state.loading = false
        state.response = action.payload
      })
      .addCase(processVoiceExpense.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Test voice expense
      .addCase(testVoiceExpense.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(testVoiceExpense.fulfilled, (state, action) => {
        state.loading = false
        state.response = action.payload
      })
      .addCase(testVoiceExpense.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearResponse, clearError } = voiceExpenseSlice.actions
export default voiceExpenseSlice.reducer
