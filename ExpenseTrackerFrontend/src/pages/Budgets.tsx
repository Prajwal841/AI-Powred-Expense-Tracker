import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { fetchBudgets, addBudget, updateBudget, deleteBudget, clearError } from '../redux/slices/budgetSlice'
import { fetchCategories } from '../redux/slices/categorySlice'
import { fetchExpenses } from '../redux/slices/expenseSlice'
import { formatCurrency, getMonthExpenses, getExpensesByCategory, sortCategoriesById } from '../utils/helpers'

interface BudgetFormData {
  categoryId: string
  limitAmount: number | null
  month: string
}

const Budgets = () => {
  const dispatch = useAppDispatch()
  const { budgets, loading, error } = useAppSelector((state) => state.budgets)
  const { categories } = useAppSelector((state) => state.categories)
  const { expenses } = useAppSelector((state) => state.expenses)
  
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<any>(null)
  const [formData, setFormData] = useState<BudgetFormData>({
    categoryId: '',
    limitAmount: null,
    month: new Date().toISOString().slice(0, 7) // Format: YYYY-MM
  })

  useEffect(() => {
    dispatch(fetchBudgets())
    dispatch(fetchCategories())
    dispatch(fetchExpenses())
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingBudget) {
      await dispatch(updateBudget({ ...editingBudget, ...formData }))
      setEditingBudget(null)
    } else {
      await dispatch(addBudget({
        categoryId: parseInt(formData.categoryId),
        limitAmount: formData.limitAmount || 0,
        month: formData.month
      }))
    }
    
    setFormData({
      categoryId: '',
      limitAmount: null,
      month: new Date().toISOString().slice(0, 7)
    })
    setShowForm(false)
  }

  const handleEdit = (budget: any) => {
    setEditingBudget(budget)
    setFormData({
      categoryId: budget.categoryId || budget.category,
      limitAmount: budget.limitAmount || budget.amount || null,
      month: budget.month
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      await dispatch(deleteBudget(id))
    }
  }

  // Calculate spent amounts for each budget
  const budgetsWithSpent = budgets.map(budget => {
    // Parse the month string (YYYY-MM) to get year and month
    const [year, month] = budget.month.split('-').map(Number)
    const currentMonthExpenses = getMonthExpenses(expenses, new Date(year, month - 1))
    const expensesByCategory = getExpensesByCategory(currentMonthExpenses)
    const spent = expensesByCategory[budget.categoryName] || 0
    const percentage = (spent / budget.limitAmount) * 100
    
    return {
      ...budget,
      spent,
      percentage,
      status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good'
    }
  })

  const totalBudget = budgetsWithSpent.reduce((sum, budget) => sum + budget.limitAmount, 0)
  const totalSpent = budgetsWithSpent.reduce((sum, budget) => sum + budget.spent, 0)
  const totalRemaining = totalBudget - totalSpent

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded':
        return 'text-danger-600 bg-danger-100 dark:text-danger-400 dark:bg-danger-900'
      case 'warning':
        return 'text-warning-600 bg-warning-100 dark:text-warning-400 dark:bg-warning-900'
      default:
        return 'text-success-600 bg-success-100 dark:text-success-400 dark:bg-success-900'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded':
        return <AlertTriangle className="w-4 h-4" />
      case 'warning':
        return <TrendingUp className="w-4 h-4" />
      default:
        return <CheckCircle className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between budget-setup-section">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budgets</h1>
          <p className="text-gray-600 dark:text-gray-300">Set and monitor your monthly budgets</p>
        </div>
        <button
          id="add-budget-btn"
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Budget</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalBudget)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <div className="w-12 h-12 bg-danger-100 dark:bg-danger-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-danger-600 dark:text-danger-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining</p>
              <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatCurrency(Math.abs(totalRemaining))}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              totalRemaining >= 0 ? 'bg-success-100 dark:bg-success-900' : 'bg-danger-100 dark:bg-danger-900'
            }`}>
              {totalRemaining >= 0 ? (
                <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-danger-600 dark:text-danger-400" />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Budget Progress */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Budget Progress</h2>
        
        <div className="space-y-6">
          {budgetsWithSpent.length > 0 ? (
            budgetsWithSpent.map((budget, index) => (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{budget.categoryName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(budget.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Spent / Budget</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limitAmount)}
                      </p>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(budget.status)}`}>
                      {getStatusIcon(budget.status)}
                      <span>{Math.round(budget.percentage)}%</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="p-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="p-1 text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      budget.status === 'exceeded' 
                        ? 'bg-danger-500' 
                        : budget.status === 'warning' 
                        ? 'bg-warning-500' 
                        : 'bg-success-500'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No budgets set yet. Start by creating your first budget!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Budget Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingBudget ? 'Edit Budget' : 'Add Budget'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingBudget(null)
                    // Clear any error when closing the form
                    if (error) {
                      dispatch(clearError())
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 budget-form">
                {/* Error Display */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Category</option>
                    {sortCategoriesById(categories).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.limitAmount ?? ''}
                    onChange={(e) => setFormData({ ...formData, limitAmount: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter budget amount"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Month
                  </label>
                  <input
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    {editingBudget ? 'Update Budget' : 'Add Budget'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingBudget(null)
                      // Clear any error when canceling
                      if (error) {
                        dispatch(clearError())
                      }
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Budgets
