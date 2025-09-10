import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { updateUser } from './authSlice'

export interface UserProfile {
  name: string
  email: string
  phone?: string
  currency: string
}

export interface NotificationSettings {
  budgetAlerts: boolean
  weeklyReports: boolean
  largeTransactions: boolean
  largeTransactionThreshold: number
}

export interface AppearanceSettings {
  darkMode: boolean
  colorTheme: string
  fontSize: string
}

export interface SettingsState {
  profile: UserProfile
  notifications: NotificationSettings
  appearance: AppearanceSettings
  loading: boolean
  error: string | null
  success: string | null
}

const initialState: SettingsState = {
  profile: {
    name: '',
    email: '',
    phone: '',
    currency: 'USD'
  },
  notifications: {
    budgetAlerts: true,
    weeklyReports: false,
    largeTransactions: true,
    largeTransactionThreshold: 100
  },
  appearance: {
    darkMode: false,
    colorTheme: '#3B82F6',
    fontSize: 'medium'
  },
  loading: false,
  error: null,
  success: null
}

// Async thunks for API calls
export const updateProfile = createAsyncThunk(
  'settings/updateProfile',
  async (profile: Partial<UserProfile>, { rejectWithValue, getState, dispatch }) => {
    try {
      const { auth } = getState() as { auth: { user: { id: string } | null } }
      if (!auth.user?.id) throw new Error('User not authenticated')
      
      // Transform profile data to match backend API
      const profileData = {
        name: profile.name,
        email: profile.email,
        phoneNumber: profile.phone
      }
      
      const response = await fetch(`/api/user/${auth.user.id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profileData),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update profile')
      }
      
      // The backend returns a plain text string, not JSON
      const data = await response.text()
      
             // Update the auth state with the new user data
       dispatch(updateUser({
         name: profile.name,
         email: profile.email,
         phoneNumber: profile.phone
       }))
      
      // Return the updated profile data
      return {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        currency: profile.currency
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update profile')
    }
  }
)

export const updateNotificationSettings = createAsyncThunk(
  'settings/updateNotificationSettings',
  async (settings: Partial<NotificationSettings>, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.put('/api/user/notifications', settings)
      // return response.data
      
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 500))
      return settings
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update notification settings')
    }
  }
)

export const changePassword = createAsyncThunk(
  'settings/changePassword',
  async (passwords: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.put('/api/user/password', passwords)
      // return response.data
      
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to change password')
    }
  }
)

export const exportData = createAsyncThunk(
  'settings/exportData',
  async (format: 'csv' | 'json', { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get(`/api/user/export?format=${format}`)
      // return response.data
      
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create mock download
      const mockData = {
        expenses: [],
        categories: [],
        budgets: []
      }
      
      const blob = new Blob([JSON.stringify(mockData, null, 2)], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      })
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `expense-data.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      return { success: true }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to export data')
    }
  }
)

export const deleteAccount = createAsyncThunk(
  'settings/deleteAccount',
  async (password: string, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.delete('/api/user/account', { data: { password } })
      // return response.data
      
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete account')
    }
  }
)

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      state.profile = { ...state.profile, ...action.payload }
    },
    setNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.notifications = { ...state.notifications, ...action.payload }
    },
    setAppearanceSettings: (state, action: PayloadAction<Partial<AppearanceSettings>>) => {
      state.appearance = { ...state.appearance, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = { ...state.profile, ...action.payload }
        state.success = 'Profile updated successfully!'
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update Notification Settings
      .addCase(updateNotificationSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = { ...state.notifications, ...action.payload }
      })
      .addCase(updateNotificationSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Export Data
      .addCase(exportData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(exportData.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(exportData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Delete Account
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setProfile, setNotificationSettings, setAppearanceSettings, clearError, clearSuccess } = settingsSlice.actions

// Additional actions for appearance settings
export const setColorTheme = (color: string) => setAppearanceSettings({ colorTheme: color })
export const setFontSize = (size: string) => setAppearanceSettings({ fontSize: size })
export default settingsSlice.reducer
