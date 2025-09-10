import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Award, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { 
  fetchGoals, 
  addGoal, 
  updateGoal, 
  deleteGoal, 
  updateGoalProgress, 
  updateGoalStatus,
  clearError,
  Goal 
} from '../redux/slices/goalSlice'
import { formatCurrency } from '../utils/helpers'

const Goals = () => {
  const dispatch = useAppDispatch()
  const { goals, loading, error } = useAppSelector((state) => state.goals)
  const { profile } = useAppSelector((state) => state.settings)
  const { user } = useAppSelector((state) => state.auth)
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Get user's selected currency
  const userCurrency = profile?.currency || 'USD'

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    type: 'SAVINGS',
    targetDate: ''
  })

  useEffect(() => {
    dispatch(fetchGoals())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, dispatch])

  const goalTypes = [
    { value: 'SAVINGS', label: 'Savings', icon: '💰' },
    { value: 'SPENDING_LIMIT', label: 'Spending Limit', icon: '📊' },
    { value: 'DEBT_PAYOFF', label: 'Debt Payoff', icon: '💳' },
    { value: 'INVESTMENT', label: 'Investment', icon: '📈' },
    { value: 'EMERGENCY_FUND', label: 'Emergency Fund', icon: '🛡️' },
    { value: 'VACATION', label: 'Vacation', icon: '✈️' },
    { value: 'HOME', label: 'Home', icon: '🏠' },
    { value: 'CAR', label: 'Car', icon: '🚗' },
    { value: 'EDUCATION', label: 'Education', icon: '🎓' },
    { value: 'OTHER', label: 'Other', icon: '📝' }
  ]

  const goalStatuses = [
    { value: 'ACTIVE', label: 'Active', color: 'text-green-600' },
    { value: 'COMPLETED', label: 'Completed', color: 'text-blue-600' },
    { value: 'PAUSED', label: 'Paused', color: 'text-yellow-600' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'text-red-600' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.targetAmount || !formData.targetDate) {
      return
    }

    try {
      if (editingGoal) {
        await dispatch(updateGoal({
          ...editingGoal,
          title: formData.title,
          description: formData.description,
          targetAmount: parseFloat(formData.targetAmount),
          type: formData.type,
          targetDate: formData.targetDate
        })).unwrap()
      } else {
        await dispatch(addGoal({
          title: formData.title,
          description: formData.description,
          targetAmount: parseFloat(formData.targetAmount),
          type: formData.type,
          targetDate: formData.targetDate
        })).unwrap()
      }
      
      resetForm()
      setShowForm(false)
    } catch (error) {
      console.error('Error saving goal:', error)
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description || '',
      targetAmount: goal.targetAmount.toString(),
      type: goal.type,
      targetDate: goal.targetDate.split('T')[0]
    })
    setShowForm(true)
  }

  const handleDelete = async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await dispatch(deleteGoal(goalId)).unwrap()
      } catch (error) {
        console.error('Error deleting goal:', error)
      }
    }
  }

  const handleProgressUpdate = async (goalId: string, newAmount: number) => {
    try {
      console.log('🔄 Updating goal progress:', { goalId, newAmount })
      
      if (isNaN(newAmount) || newAmount < 0) {
        alert('Please enter a valid amount (0 or greater)')
        return
      }
      
      // Debug: Check if user is authenticated
      const token = localStorage.getItem('token')
      if (!token) {
        alert('You are not logged in. Please log in again.')
        return
      }
      
      console.log('🔑 JWT Token found:', token.substring(0, 20) + '...')
      console.log('👤 User ID:', user?.id)
      
      const result = await dispatch(updateGoalProgress({ goalId, amount: newAmount })).unwrap()
      console.log('✅ Goal progress updated successfully:', result)
      
      // Show success message
      alert(`Progress updated to ${formatCurrency(newAmount, userCurrency)}`)
      
    } catch (error: any) {
      console.error('❌ Error updating goal progress:', error)
      
      // Show user-friendly error message
      if (error?.toString().includes('403')) {
        alert('Access denied (403). Please check if you are logged in and try again.')
      } else if (error?.toString().includes('404')) {
        alert('Goal not found (404). Please refresh the page and try again.')
      } else {
        alert(`Failed to update progress: ${error}`)
      }
    }
  }

  const handleStatusUpdate = async (goalId: string, newStatus: string) => {
    try {
      await dispatch(updateGoalStatus({ goalId, status: newStatus })).unwrap()
    } catch (error) {
      console.error('Error updating goal status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      type: 'SAVINGS',
      targetDate: ''
    })
    setEditingGoal(null)
  }

  const filteredGoals = goals.filter(goal => {
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus
    const matchesType = filterType === 'all' || goal.type === filterType
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (goal.description && goal.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesStatus && matchesType && matchesSearch
  })

  const getProgressColor = (status: string, progressStatus: string) => {
    if (status === 'COMPLETED') return 'bg-blue-500'
    if (status === 'CANCELLED' || status === 'PAUSED') return 'bg-gray-400'
    
    switch (progressStatus) {
      case 'completed': return 'bg-green-500'
      case 'ahead': return 'bg-blue-500'
      case 'behind': return 'bg-red-500'
      default: return 'bg-yellow-500'
    }
  }

  const getProgressStatusIcon = (status: string, progressStatus: string) => {
    if (status === 'COMPLETED') return <CheckCircle className="w-4 h-4 text-blue-600" />
    if (status === 'CANCELLED' || status === 'PAUSED') return <Clock className="w-4 h-4 text-gray-500" />
    
    switch (progressStatus) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'ahead': return <TrendingUp className="w-4 h-4 text-blue-600" />
      case 'behind': return <AlertCircle className="w-4 h-4 text-red-600" />
      default: return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const stats = {
    total: goals.length,
    active: goals.filter(g => g.status === 'ACTIVE').length,
    completed: goals.filter(g => g.status === 'COMPLETED').length,
    totalTarget: goals.reduce((sum, g) => sum + g.targetAmount, 0),
    totalCurrent: goals.reduce((sum, g) => sum + g.currentAmount, 0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Goals</h1>
          <p className="text-gray-600 dark:text-gray-400">Set and track your savings and spending goals</p>
        </div>
        <button 
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Goals</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Target</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalTarget, userCurrency)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Saved</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalCurrent, userCurrency)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search goals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              {goalStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              {goalTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <PieChart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="card p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Goals Grid/List */}
      {loading ? (
        <div className="card p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="card p-12">
          <div className="text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' ? 'No goals found' : 'No goals yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                ? 'Try adjusting your filters or search terms.'
                : 'Create your first financial goal to start tracking your progress.'}
            </p>
            {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
              <button 
                onClick={() => {
                  resetForm()
                  setShowForm(true)
                }}
                className="btn-primary"
              >
                Create Your First Goal
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredGoals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">
                      {goalTypes.find(t => t.value === goal.type)?.icon || '📝'}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{goal.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      {getProgressStatusIcon(goal.status, goal.progressStatus)}
                      <span>{goal.progressStatus.replace('-', ' ')}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {goal.progressPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal.status, goal.progressStatus)}`}
                    style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(goal.currentAmount, userCurrency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Target</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(goal.targetAmount, userCurrency)}
                  </p>
                </div>
              </div>

              {/* PROGRESS UPDATE SECTION - Very Clear and Prominent */}
              {goal.status === 'ACTIVE' && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="text-center mb-3">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      🎯 Update Your Progress
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Enter the new amount you've saved/invested
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Enter new amount"
                      className="flex-1 px-3 py-2 text-sm border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-blue-700 dark:text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement
                          const newAmount = parseFloat(input.value)
                          if (!isNaN(newAmount) && newAmount >= 0) {
                            handleProgressUpdate(goal.id, newAmount)
                            input.value = ''
                          } else {
                            alert('Please enter a valid amount (0 or greater)')
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector(`input[placeholder="Enter new amount"]`) as HTMLInputElement
                        if (input) {
                          const newAmount = parseFloat(input.value)
                          if (!isNaN(newAmount) && newAmount >= 0) {
                            handleProgressUpdate(goal.id, newAmount)
                            input.value = ''
                          } else {
                            alert('Please enter a valid amount (0 or greater)')
                          }
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {goal.daysRemaining > 0 ? `${goal.daysRemaining} days left` : 'Overdue'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={goal.status}
                    onChange={(e) => handleStatusUpdate(goal.id, e.target.value)}
                    className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    {goalStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Save for vacation"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Optional description"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Amount *
                    </label>
                    <input
                      type="number"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Goal Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    >
                      {goalTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Date *
                    </label>
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        resetForm()
                      }}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {editingGoal ? 'Update Goal' : 'Create Goal'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Goals
