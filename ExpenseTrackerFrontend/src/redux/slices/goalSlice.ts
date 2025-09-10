import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface Goal {
  id: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  type: string
  typeDisplayName: string
  status: string
  statusDisplayName: string
  targetDate: string
  createdAt: string
  updatedAt: string
  progressPercentage: number
  daysRemaining: number
  progressStatus: string
}

export interface GoalState {
  goals: Goal[]
  loading: boolean
  error: string | null
}

const initialState: GoalState = {
  goals: [],
  loading: false,
  error: null,
}

// Async thunks for API calls
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { user: { id: string } | null } }
      if (!auth.user?.id) throw new Error('User not authenticated')
      
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')
      
      const response = await fetch('/api/user/goals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': auth.user.id,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch goals')
      return await response.json()
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch goals')
    }
  }
)

export const addGoal = createAsyncThunk(
  'goals/addGoal',
  async (goal: { title: string; description?: string; targetAmount: number; type: string; targetDate: string }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { user: { id: string } | null } }
      if (!auth.user?.id) throw new Error('User not authenticated')
      
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')
      
      const response = await fetch('/api/user/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': auth.user.id,
        },
        body: JSON.stringify(goal),
      })
      
      if (!response.ok) {
        try {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to add goal (${response.status})`)
        } catch (parseError) {
          throw new Error(`Failed to add goal (${response.status})`)
        }
      }
      
      return await response.json()
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add goal')
    }
  }
)

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async (goal: Goal, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { user: { id: string } | null } }
      if (!auth.user?.id) throw new Error('User not authenticated')
      
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')
      
      const response = await fetch(`/api/user/goals/${goal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': auth.user.id,
        },
        body: JSON.stringify({
          title: goal.title,
          description: goal.description,
          targetAmount: goal.targetAmount,
          type: goal.type,
          targetDate: goal.targetDate,
        }),
      })
      
      if (!response.ok) {
        try {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to update goal (${response.status})`)
        } catch (parseError) {
          throw new Error(`Failed to update goal (${response.status})`)
        }
      }
      
      return await response.json()
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update goal')
    }
  }
)

export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { user: { id: string } | null } }
      if (!auth.user?.id) throw new Error('User not authenticated')
      
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')
      
      const response = await fetch(`/api/user/goals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': auth.user.id,
        },
      })
      
      if (!response.ok) {
        try {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to delete goal (${response.status})`)
        } catch (parseError) {
          throw new Error(`Failed to delete goal (${response.status})`)
        }
      }
      
      return id
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete goal')
    }
  }
)

export const updateGoalProgress = createAsyncThunk(
  'goals/updateGoalProgress',
  async ({ goalId, amount }: { goalId: string; amount: number }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { user: { id: string } | null } }
      if (!auth.user?.id) throw new Error('User not authenticated')
      
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')
      
      const response = await fetch(`/api/user/goals/${goalId}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': auth.user.id,
        },
        body: JSON.stringify(amount),
      })
      
      if (!response.ok) {
        try {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to update goal progress (${response.status})`)
        } catch (parseError) {
          throw new Error(`Failed to update goal progress (${response.status})`)
        }
      }
      
      return await response.json()
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update goal progress')
    }
  }
)

export const updateGoalStatus = createAsyncThunk(
  'goals/updateGoalStatus',
  async ({ goalId, status }: { goalId: string; status: string }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { user: { id: string } | null } }
      if (!auth.user?.id) throw new Error('User not authenticated')
      
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')
      
      const response = await fetch(`/api/user/goals/${goalId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': auth.user.id,
        },
        body: JSON.stringify(status),
      })
      
      if (!response.ok) {
        try {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to update goal status (${response.status})`)
        } catch (parseError) {
          throw new Error(`Failed to update goal status (${response.status})`)
        }
      }
      
      return await response.json()
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update goal status')
    }
  }
)

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch goals
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false
        state.goals = action.payload
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Add goal
      .addCase(addGoal.fulfilled, (state, action) => {
        state.goals.unshift(action.payload)
      })
      // Update goal
      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex(goal => goal.id === action.payload.id)
        if (index !== -1) {
          state.goals[index] = action.payload
        }
      })
      // Delete goal
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter(goal => goal.id !== action.payload)
      })
      // Update goal progress
      .addCase(updateGoalProgress.fulfilled, (state, action) => {
        const index = state.goals.findIndex(goal => goal.id === action.payload.id)
        if (index !== -1) {
          state.goals[index] = action.payload
        }
      })
      // Update goal status
      .addCase(updateGoalStatus.fulfilled, (state, action) => {
        const index = state.goals.findIndex(goal => goal.id === action.payload.id)
        if (index !== -1) {
          state.goals[index] = action.payload
        }
      })
  },
})

export const { clearError } = goalSlice.actions
export default goalSlice.reducer


