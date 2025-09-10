import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Tag,
  X,
  Receipt
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { 
  fetchExpenses, 
  addExpense, 
  updateExpense, 
  deleteExpense,
  setFilters,
  clearFilters
} from '../redux/slices/expenseSlice'
import { fetchCategories } from '../redux/slices/categorySlice'
import { formatCurrency, formatDate, sortCategoriesById } from '../utils/helpers'

interface ExpenseFormData {
  name: string
  amount: number
  category: string
  date: string
  description: string
}

const Expenses = () => {
  const dispatch = useAppDispatch()
  const { expenses, loading, error, filters } = useAppSelector((state) => state.expenses)
  const { categories } = useAppSelector((state) => state.categories)
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState<ExpenseFormData>({
    name: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  })

  useEffect(() => {
    console.log('Current auth state:', { isAuthenticated, user })
    dispatch(fetchExpenses())
    dispatch(fetchCategories())
  }, [dispatch, isAuthenticated, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate amount
    if (formData.amount <= 0) {
      alert('Please enter a valid amount greater than 0')
      return
    }
    
    // Validate category
    if (!formData.category) {
      alert('Please select a category')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      if (editingExpense) {
        await dispatch(updateExpense({ ...editingExpense, ...formData }))
        setEditingExpense(null)
      } else {
        await dispatch(addExpense(formData))
      }
      
      setFormData({
        name: '',
        amount: 0,
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      })
      setShowForm(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000) // Hide after 3 seconds
    } catch (error) {
      console.error('Error submitting expense:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (expense: any) => {
    setEditingExpense(expense)
    setFormData({
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await dispatch(deleteExpense(id))
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    dispatch(setFilters({ [key]: value }))
  }

  // Filter expenses based on current filters
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.name.toLowerCase().includes(filters.search.toLowerCase())
    const matchesCategory = !filters.category || expense.category === filters.category
    const matchesDateRange = !filters.dateRange.start || !filters.dateRange.end || 
      (expense.date >= filters.dateRange.start && expense.date <= filters.dateRange.end)
    
    return matchesSearch && matchesCategory && matchesDateRange
  })

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
          >
            <p className="text-sm">Expense {editingExpense ? 'updated' : 'added'} successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="flex items-center justify-between expense-form">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage and track your expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-48">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
              className="input-field"
            />
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => dispatch(clearFilters())}
            className="btn-secondary flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalAmount)}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Number of Expenses</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {filteredExpenses.length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Amount</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {filteredExpenses.length > 0 ? formatCurrency(totalAmount / filteredExpenses.length) : '$0.00'}
          </p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Receipt</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense, index) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{expense.name}</p>
                      {expense.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{expense.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge badge-primary">{expense.category}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(expense.amount)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600 dark:text-gray-300">
                      {formatDate(expense.date)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {expense.receiptPath ? (
                      <a
                        href={expense.receiptPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        title="View Receipt"
                      >
                        <Receipt className="w-5 h-5" />
                      </a>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-1 text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredExpenses.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No expenses found. {filters.search || filters.category || filters.dateRange.start ? 'Try adjusting your filters.' : 'Start by adding your first expense!'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
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
                  {editingExpense ? 'Edit Expense' : 'Add Expense'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingExpense(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 expense-form">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="text"
                    placeholder="Enter amount (e.g., 25.50)"
                    value={formData.amount === 0 ? '' : formData.amount.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      const amount = value === '' ? 0 : parseFloat(value) || 0;
                      setFormData({ ...formData, amount });
                    }}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select Category</option>
                    {sortCategoriesById(categories).map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">No categories available. Please add categories first.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Add Expense')}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setShowForm(false)
                      setEditingExpense(null)
                    }}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
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

export default Expenses
