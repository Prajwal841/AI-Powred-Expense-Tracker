import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  darkMode: boolean
  sidebarOpen: boolean
  loading: boolean
  tourCompleted: boolean
}

const getInitialDarkMode = (): boolean => {
  const saved = localStorage.getItem('darkMode')
  if (saved !== null) {
    return JSON.parse(saved)
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const getInitialTourCompleted = (): boolean => {
  const saved = localStorage.getItem('tourCompleted')
  return saved ? JSON.parse(saved) : false
}

const initialState: UIState = {
  darkMode: getInitialDarkMode(),
  sidebarOpen: false,
  loading: false,
  tourCompleted: getInitialTourCompleted(),
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
      localStorage.setItem('darkMode', JSON.stringify(state.darkMode))
      if (state.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload
      localStorage.setItem('darkMode', JSON.stringify(state.darkMode))
      if (state.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setTourCompleted: (state, action: PayloadAction<boolean>) => {
      state.tourCompleted = action.payload
      localStorage.setItem('tourCompleted', JSON.stringify(action.payload))
    },
    resetTour: (state) => {
      state.tourCompleted = false
      localStorage.removeItem('tourCompleted')
    },
  },
})

export const { toggleDarkMode, setDarkMode, toggleSidebar, setSidebarOpen, setLoading, setTourCompleted, resetTour } = uiSlice.actions
export default uiSlice.reducer
