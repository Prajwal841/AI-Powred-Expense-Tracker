import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ExtractedData } from '../../utils/ocrUtils'

export interface Receipt {
  id: string
  fileName: string
  imageUrl: string
  extractedData: ExtractedData
  status: 'processing' | 'completed' | 'error' | 'processed'
  createdAt: string
  userId: string
}

interface ReceiptState {
  receipts: Receipt[]
  loading: boolean
  error: string | null
}

const initialState: ReceiptState = {
  receipts: [],
  loading: false,
  error: null
}

// Helper function to convert backend response to frontend format
const convertBackendReceipt = (backendReceipt: any): Receipt => {
  console.log('Converting backend receipt:', backendReceipt)
  console.log('Backend receipt imageUrl type:', typeof backendReceipt.imageUrl)
  console.log('Backend receipt imageUrl value:', backendReceipt.imageUrl)
  
  let extractedData: ExtractedData = { confidence: 0 }
  
  try {
    if (backendReceipt.extractedData) {
      if (typeof backendReceipt.extractedData === 'string') {
        extractedData = JSON.parse(backendReceipt.extractedData)
      } else {
        extractedData = backendReceipt.extractedData
      }
    }
  } catch (error) {
    console.error('Error parsing extracted data:', error)
  }

  // Convert file path to full URL for frontend
  const imageUrl = backendReceipt.imageUrl ? `/api/user/files/${backendReceipt.imageUrl}` : ''

  const convertedReceipt = {
    id: backendReceipt.id.toString(),
    fileName: backendReceipt.fileName,
    imageUrl: imageUrl,
    extractedData,
    status: backendReceipt.status.toLowerCase() as 'processing' | 'completed' | 'error' | 'processed',
    createdAt: backendReceipt.createdAt,
    userId: backendReceipt.userId.toString()
  }
  
  console.log('Converted receipt imageUrl:', convertedReceipt.imageUrl)
  console.log('Converted receipt:', convertedReceipt)
  return convertedReceipt
}

// Async thunks
export const fetchReceipts = createAsyncThunk(
  'receipts/fetchReceipts',
  async (_, { rejectWithValue }) => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        throw new Error('User not authenticated')
      }

      console.log('Fetching receipts for user:', userId)
      console.log('Token:', localStorage.getItem('token'))
      
      const response = await fetch(`/api/user/${userId}/receipts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-User-Id': userId
        }
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error('Failed to fetch receipts')
      }

      const data = await response.json()
      console.log('Backend receipts data:', data)
      // Convert backend format to frontend format
      const convertedData = data.map(convertBackendReceipt)
      console.log('Converted receipts data:', convertedData)
      return convertedData
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const saveReceipt = createAsyncThunk(
  'receipts/saveReceipt',
  async (receipt: Omit<Receipt, 'id'> | Receipt, { rejectWithValue }) => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Convert frontend format to backend format
      const backendReceipt = {
        fileName: receipt.fileName,
        imageUrl: receipt.imageUrl,
        extractedData: JSON.stringify(receipt.extractedData),
        status: receipt.status.toUpperCase()
      }
      
      console.log('Sending backend receipt:', backendReceipt)
      console.log('ImageUrl being sent:', receipt.imageUrl)
      console.log('ImageUrl type:', typeof receipt.imageUrl)
      console.log('ImageUrl length:', receipt.imageUrl ? receipt.imageUrl.length : 'null/undefined')

      // Determine if this is a new receipt or an update
      const isUpdate = 'id' in receipt && receipt.id
      const method = isUpdate ? 'PUT' : 'POST'
      const url = isUpdate 
        ? `/api/user/${userId}/receipts/${receipt.id}`
        : `/api/user/${userId}/receipts`

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-User-Id': userId
        },
        body: JSON.stringify(backendReceipt)
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isUpdate ? 'update' : 'save'} receipt`)
      }

      const data = await response.json()
      console.log('Response data from backend:', data)
      console.log('Response imageUrl:', data.imageUrl)
      console.log('Response imageUrl type:', typeof data.imageUrl)
      console.log('Response imageUrl length:', data.imageUrl ? data.imageUrl.length : 'null/undefined')
      return convertBackendReceipt(data)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteReceipt = createAsyncThunk(
  'receipts/deleteReceipt',
  async (receiptId: string, { rejectWithValue }) => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        throw new Error('User not authenticated')
      }

      const response = await fetch(`/api/user/${userId}/receipts/${receiptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-User-Id': userId
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete receipt')
      }

      return receiptId
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const receiptSlice = createSlice({
  name: 'receipts',
  initialState,
  reducers: {
    addReceipt: (state, action: PayloadAction<Receipt>) => {
      state.receipts.unshift(action.payload)
    },
    updateReceipt: (state, action: PayloadAction<Receipt>) => {
      const index = state.receipts.findIndex(receipt => receipt.id === action.payload.id)
      if (index !== -1) {
        state.receipts[index] = action.payload
      }
    },
    removeReceipt: (state, action: PayloadAction<string>) => {
      state.receipts = state.receipts.filter(receipt => receipt.id !== action.payload)
    },
    clearReceipts: (state) => {
      state.receipts = []
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch receipts
      .addCase(fetchReceipts.pending, (state) => {
        state.loading = true
        state.error = null
      })
             .addCase(fetchReceipts.fulfilled, (state, action) => {
         state.loading = false
         console.log('Fetch receipts fulfilled - payload:', action.payload)
         console.log('Payload type:', typeof action.payload)
         console.log('Payload length:', Array.isArray(action.payload) ? action.payload.length : 'not array')
         console.log('Previous receipts count:', state.receipts.length)
         state.receipts = action.payload
         console.log('Receipts state after setting:', state.receipts)
         console.log('New receipts count:', state.receipts.length)
       })
             .addCase(fetchReceipts.rejected, (state, action) => {
         state.loading = false
         console.log('Fetch receipts rejected - error:', action.payload)
         console.log('Action error:', action.error)
         state.error = action.payload as string
       })
      // Save receipt
      .addCase(saveReceipt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(saveReceipt.fulfilled, (state, action) => {
        state.loading = false
        console.log('Save receipt fulfilled, payload:', action.payload)
        // Update existing receipt or add new one
        const index = state.receipts.findIndex(receipt => receipt.id === action.payload.id)
        if (index !== -1) {
          console.log('Updating existing receipt at index:', index)
          state.receipts[index] = action.payload
        } else {
          console.log('Adding new receipt to beginning of list')
          state.receipts.unshift(action.payload)
        }
        console.log('Receipts state after save:', state.receipts)
      })
      .addCase(saveReceipt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Delete receipt
      .addCase(deleteReceipt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteReceipt.fulfilled, (state, action) => {
        state.loading = false
        state.receipts = state.receipts.filter(receipt => receipt.id !== action.payload)
      })
      .addCase(deleteReceipt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { addReceipt, updateReceipt, removeReceipt, clearReceipts } = receiptSlice.actions
export default receiptSlice.reducer
