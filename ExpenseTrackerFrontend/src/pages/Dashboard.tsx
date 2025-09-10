import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Plus,
  Eye,
  Camera,
  X
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { fetchExpenses, addExpense, clearVoiceExpenseRefreshFlag } from '../redux/slices/expenseSlice'
import { fetchBudgets } from '../redux/slices/budgetSlice'
import { fetchCategories } from '../redux/slices/categorySlice'
import { formatCurrency, getTotalExpenses, getExpensesByCategory, getCurrentMonthRange, getMonthExpenses, sortCategoriesById } from '../utils/helpers'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const dispatch = useAppDispatch()
  const { expenses, loading, voiceExpenseRefreshNeeded } = useAppSelector((state) => state.expenses)
  const { budgets } = useAppSelector((state) => state.budgets)
  const { categories } = useAppSelector((state) => state.categories)
  const { profile } = useAppSelector((state) => state.settings)
  
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expenseForm, setExpenseForm] = useState({
    name: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  })

  // Get user's selected currency
  const userCurrency = profile?.currency || 'USD'

  useEffect(() => {
    dispatch(fetchExpenses())
    dispatch(fetchBudgets())
    dispatch(fetchCategories())
  }, [dispatch])

  // Listen for voice expense refresh flag
  useEffect(() => {
    if (voiceExpenseRefreshNeeded) {
      console.log('🔄 Dashboard - Voice expense refresh flag detected, refreshing expenses...')
      dispatch(fetchExpenses())
      dispatch(clearVoiceExpenseRefreshFlag())
    }
  }, [voiceExpenseRefreshNeeded, dispatch])



  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!expenseForm.name || !expenseForm.amount || !expenseForm.category) {
      alert('Please fill in all required fields')
      return
    }
    
    setIsSubmitting(true)
    try {
      const result = await dispatch(addExpense({
        name: expenseForm.name,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        date: expenseForm.date,
        description: expenseForm.description
      }))
      
      // Check if expense was successfully added
      if (addExpense.fulfilled.match(result)) {
        // Refresh expenses to update charts and recent expenses
        dispatch(fetchExpenses())
        
        setExpenseForm({
          name: '',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          description: ''
        })
        setShowAddExpenseModal(false)
      } else {
        console.error('Failed to add expense:', result.payload)
        alert('Failed to add expense. Please try again.')
      }
    } catch (error) {
      console.error('Error adding expense:', error)
      alert('Error adding expense. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentMonthRange = getCurrentMonthRange()
  const currentMonthExpenses = getMonthExpenses(expenses, new Date())
  const totalSpent = getTotalExpenses(currentMonthExpenses)
  const expensesByCategory = getExpensesByCategory(currentMonthExpenses)

  // Default colors for pie chart
  const DEFAULT_COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
    '#14B8A6', '#F43F5E', '#8B5CF6', '#06B6D4', '#84CC16'
  ]

  // Prepare data for charts
  const pieChartData = Object.entries(expensesByCategory).map(([category, amount], index) => ({
    name: category,
    value: amount,
    color: getCategoryColor(category) || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }))

  const barChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount,
    color: getCategoryColor(category)
  }))

  // Mock data for spending trend (last 7 days)
  const spendingTrendData = [
    { date: 'Mon', amount: 45 },
    { date: 'Tue', amount: 32 },
    { date: 'Wed', amount: 67 },
    { date: 'Thu', amount: 23 },
    { date: 'Fri', amount: 89 },
    { date: 'Sat', amount: 54 },
    { date: 'Sun', amount: 38 }
  ]

  // Recent expenses (sorted by date, most recent first)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  function getCategoryColor(category: string): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
      '#14B8A6', '#F43F5E', '#8B5CF6', '#06B6D4', '#84CC16'
    ]
    const index = category.charCodeAt(0) % colors.length
    return colors[index] || '#3B82F6' // Fallback to blue if something goes wrong
  }

     const stats = [
     {
       title: 'Total Spent This Month',
       value: formatCurrency(totalSpent, userCurrency),
       change: '+12.5%',
       changeType: 'increase' as const,
       icon: DollarSign
     },
     {
       title: 'Budget Remaining',
       value: formatCurrency(totalSpent > 0 ? (totalSpent * 0.8) : 0, userCurrency), // Mock calculation
       change: '-8.2%',
       changeType: 'decrease' as const,
       icon: TrendingDown
     },
     {
       title: 'Expenses This Week',
       value: formatCurrency(320, userCurrency),
       change: '+5.1%',
       changeType: 'increase' as const,
       icon: Calendar
     },
     {
       title: 'Average Daily Spend',
       value: formatCurrency(totalSpent / 30, userCurrency),
       change: '+2.3%',
       changeType: 'increase' as const,
       icon: TrendingUp
     }
   ]

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
      <div className="flex items-center justify-between dashboard-overview">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your expenses and financial insights</p>
        </div>
                 <div className="flex items-center space-x-3">
                       <Link
              to="/receipt-scanner"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
             <Camera className="w-4 h-4" />
             <span>Scan Receipt</span>
           </Link>
                       <button
              id="add-expense-btn"
              onClick={() => setShowAddExpenseModal(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
             <Plus className="w-4 h-4" />
             <span>Add Expense</span>
           </button>
                       <Link
              to="/expenses"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
             <Eye className="w-4 h-4" />
             <span>View All</span>
           </Link>
         </div>
      </div>

      {/* Stats Cards */}
      <div id="dashboard-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <div className={`flex items-center space-x-1 text-sm ${
                  stat.changeType === 'increase' ? 'text-success-600' : 'text-danger-600'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category - Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Spending by Category
          </h3>
          <div className="h-64">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, userCurrency)}
                    labelFormatter={(label) => `Category: ${label}`}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No expenses this month</p>
                  <p className="text-xs">Add some expenses to see the breakdown</p>
                </div>
              </div>
            )}
          </div>
          {pieChartData.length > 0 && (
            <div className="mt-4 space-y-2">
              {pieChartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.value, userCurrency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Weekly Spending Trend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Spending Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendingTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(value) => `${userCurrency}${value}`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${userCurrency}${value}`, 'Amount']}
                  labelFormatter={(label) => `Day: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Expenses
          </h3>
          <Link
            to="/expenses"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center space-x-1"
          >
            <span>View All</span>
            <Eye className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="space-y-3">
          {recentExpenses.length > 0 ? (
            recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: getCategoryColor(expense.category) }}
                  >
                    {expense.category.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {expense.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {expense.category} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(expense.amount, userCurrency)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No expenses yet. Start tracking your spending!</p>
            </div>
          )}
                 </div>
       </motion.div>

       {/* Add Expense Modal */}
       <AnimatePresence>
         {showAddExpenseModal && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
             onClick={() => setShowAddExpenseModal(false)}
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
                   Add New Expense
                 </h2>
                 <button
                   onClick={() => setShowAddExpenseModal(false)}
                   className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>

               <form onSubmit={handleAddExpense} className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     Name
                   </label>
                   <input
                     type="text"
                     value={expenseForm.name}
                     onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                     placeholder="Enter expense name"
                     required
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     Amount
                   </label>
                   <input
                     type="number"
                     step="0.01"
                     value={expenseForm.amount}
                     onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                     placeholder="Enter amount"
                     required
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     Category
                   </label>
                   <select
                     value={expenseForm.category}
                     onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                     required
                   >
                     <option value="">Select Category</option>
                     {sortCategoriesById(categories).map((category) => (
                       <option key={category.id} value={category.name}>
                         {category.name}
                       </option>
                     ))}
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     Date
                   </label>
                   <input
                     type="date"
                     value={expenseForm.date}
                     onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                     required
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     Description (Optional)
                   </label>
                   <textarea
                     value={expenseForm.description}
                     onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                     rows={3}
                     placeholder="Optional description"
                   />
                 </div>

                 <div className="flex items-center space-x-3 pt-4">
                   <button
                     type="submit"
                     disabled={isSubmitting}
                     className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isSubmitting ? 'Adding...' : 'Add Expense'}
                   </button>
                   <button
                     type="button"
                     disabled={isSubmitting}
                     onClick={() => setShowAddExpenseModal(false)}
                     className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default Dashboard
