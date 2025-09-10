import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  userId: string
}

export interface CategoryState {
  categories: Category[]
  loading: boolean
  error: string | null
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
}

// Async thunks for API calls
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      if (!token || !userId) {
        throw new Error('User not authenticated')
      }
      
      const response = await fetch('/api/user/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': userId
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Categories fetch error:', errorText)
        throw new Error('Failed to fetch categories')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching categories:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch categories')
    }
  }
)

export const addCategory = createAsyncThunk(
  'categories/addCategory',
  async (category: Omit<Category, 'id'>, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      if (!token || !userId) {
        throw new Error('User not authenticated')
      }
      
      const response = await fetch('/api/user/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': userId
        },
        body: JSON.stringify(category),
      })
      if (!response.ok) throw new Error('Failed to add category')
      return await response.json()
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add category')
    }
  }
)

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async (category: Category, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      if (!token || !userId) {
        throw new Error('User not authenticated')
      }
      
      const response = await fetch(`/api/user/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': userId
        },
        body: JSON.stringify(category),
      })
      if (!response.ok) throw new Error('Failed to update category')
      return await response.json()
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update category')
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      if (!token || !userId) {
        throw new Error('User not authenticated')
      }
      
      const response = await fetch(`/api/user/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': userId
        }
      })
      if (!response.ok) throw new Error('Failed to delete category')
      return id
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete category')
    }
  }
)

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Add category
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload)
        // Sort by ID to maintain order
        state.categories.sort((a, b) => parseInt(a.id) - parseInt(b.id))
      })
      // Update category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(category => category.id === action.payload.id)
        if (index !== -1) {
          state.categories[index] = action.payload
        }
        // Sort by ID to maintain order
        state.categories.sort((a, b) => parseInt(a.id) - parseInt(b.id))
      })
      // Delete category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(category => category.id !== action.payload)
      })
  },
})

export default categorySlice.reducer
