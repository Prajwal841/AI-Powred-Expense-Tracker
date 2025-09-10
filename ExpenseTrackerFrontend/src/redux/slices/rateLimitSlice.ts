import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface RateLimitInfo {
  allowed: boolean
  remainingTokens: number
  timeUntilReset: number // in seconds
  message: string
}

interface RateLimitState {
  loading: boolean
  error: string | null
  rateLimitInfo: RateLimitInfo | null
}

const initialState: RateLimitState = {
  loading: false,
  error: null,
  rateLimitInfo: null
}

// Async thunk for checking rate limit
export const checkRateLimit = createAsyncThunk(
  'rateLimit/check',
  async (userId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch('/api/user/voice-expense/rate-limit', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': userId
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to check rate limit: ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const rateLimitSlice = createSlice({
  name: 'rateLimit',
  initialState,
  reducers: {
    clearRateLimitInfo: (state) => {
      state.rateLimitInfo = null
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkRateLimit.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkRateLimit.fulfilled, (state, action) => {
        state.loading = false
        state.rateLimitInfo = action.payload
      })
      .addCase(checkRateLimit.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearRateLimitInfo, clearError } = rateLimitSlice.actions
export default rateLimitSlice.reducer
