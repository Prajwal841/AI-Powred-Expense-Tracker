import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  email: string
  name: string
  phoneNumber?: string
  profilePicture?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  errorStatus?: number
  registrationSuccess: boolean
}

const getInitialToken = (): string | null => {
  return localStorage.getItem('token')
}

const getInitialUser = (): User | null => {
  const userId = localStorage.getItem('userId')
  const userEmail = localStorage.getItem('userEmail')
  const userName = localStorage.getItem('userName')
  const userPhone = localStorage.getItem('userPhone')
  
  if (userId && userEmail && userName) {
    return {
      id: userId,
      email: userEmail,
      name: userName,
      phoneNumber: userPhone || undefined
    }
  }
  return null
}

const initialState: AuthState = {
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: !!(getInitialToken() && getInitialUser()),
  loading: false,
  error: null,
  errorStatus: undefined,
  registrationSuccess: false,
}

// Helpers
const parseErrorResponse = async (response: Response): Promise<{ status: number; message: string }> => {
  try {
    const data = await response.json()
    const message = data?.message || data?.error || response.statusText || 'Request failed'
    return { status: response.status, message }
  } catch {
    return { status: response.status, message: response.statusText || 'Request failed' }
  }
}

// Async thunks for API calls
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })
      if (!response.ok) {
        const err = await parseErrorResponse(response)
        return rejectWithValue(err)
      }
      const data = await response.json()
      localStorage.setItem('token', data.token)
      return data
    } catch (error) {
      return rejectWithValue({ status: 0, message: error instanceof Error ? error.message : 'Login failed' })
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      if (!response.ok) {
        const err = await parseErrorResponse(response)
        return rejectWithValue(err)
      }
      const data = await response.json()
      // Don't store token for registration - user needs to verify email first
      return data
    } catch (error) {
      return rejectWithValue({ status: 0, message: error instanceof Error ? error.message : 'Registration failed' })
    }
  }
)

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (email: string, { rejectWithValue }) => {
    try {
      const url = `/api/user/resend-verification?email=${encodeURIComponent(email)}`
      const response = await fetch(url, { method: 'POST' })
      if (!response.ok) {
        const err = await parseErrorResponse(response)
        return rejectWithValue(err)
      }
      const data = await response.json().catch(() => ({}))
      return data
    } catch (error) {
      return rejectWithValue({ status: 0, message: error instanceof Error ? error.message : 'Failed to resend verification' })
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem('token')
      return null
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed')
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: AuthState }
      if (!auth.token) throw new Error('No token available')
      
      // For now, we'll use a default user ID of 1 since the backend doesn't have a "get current user" endpoint
      // In a real application, you'd decode the JWT token to get the user ID
      const response = await fetch('/api/user/1', {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        },
      })
      if (!response.ok) {
        const err = await parseErrorResponse(response)
        return rejectWithValue(err)
      }
      const userData = await response.json()
      
      // Transform the response to match our User interface
      return {
        id: userData.id.toString(),
        email: userData.email,
        name: userData.name
      }
    } catch (error) {
      return rejectWithValue({ status: 0, message: error instanceof Error ? error.message : 'Failed to get user data' })
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
      state.errorStatus = undefined
    },
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        // Update localStorage as well
        if (action.payload.name) {
          localStorage.setItem('userName', action.payload.name)
        }
        if (action.payload.email) {
          localStorage.setItem('userEmail', action.payload.email)
        }
        if (action.payload.phoneNumber !== undefined) {
          localStorage.setItem('userPhone', action.payload.phoneNumber)
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
        state.errorStatus = undefined
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = {
          id: action.payload.userId.toString(),
          email: action.payload.email || '',
          name: action.payload.name || 'User',
          phoneNumber: action.payload.phoneNumber || undefined
        }
        state.token = action.payload.token
        
        // Store user data in localStorage
        localStorage.setItem('userId', action.payload.userId.toString())
        localStorage.setItem('userEmail', action.payload.email || '')
        localStorage.setItem('userName', action.payload.name || 'User')
        if (action.payload.phoneNumber) {
          localStorage.setItem('userPhone', action.payload.phoneNumber)
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        const payload = action.payload as { status?: number; message?: string } | undefined
        state.error = payload?.message || 'Login failed'
        state.errorStatus = payload?.status
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
        state.errorStatus = undefined
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false
        // Don't set isAuthenticated to true - user needs to verify email first
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.registrationSuccess = true
        
        // Don't store user data in localStorage - user needs to verify email first
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        const payload = action.payload as { status?: number; message?: string } | undefined
        state.error = payload?.message || 'Registration failed'
        state.errorStatus = payload?.status
      })
      // Resend verification
      .addCase(resendVerification.pending, (state) => {
        state.loading = true
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.loading = false
        const payload = action.payload as { status?: number; message?: string } | undefined
        state.error = payload?.message || 'Failed to resend verification'
        state.errorStatus = payload?.status
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        
        // Clear user data from localStorage
        localStorage.removeItem('userId')
        localStorage.removeItem('userEmail')
        localStorage.removeItem('userName')
        localStorage.removeItem('userPhone')
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        localStorage.removeItem('userEmail')
        localStorage.removeItem('userName')
        localStorage.removeItem('userPhone')
      })
  },
})

export const { clearError, clearRegistrationSuccess, updateUser } = authSlice.actions
export default authSlice.reducer
