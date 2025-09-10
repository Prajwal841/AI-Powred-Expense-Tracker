import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  X,
  Tag,
  Clock
} from 'lucide-react'
import Calendar from 'react-calendar'
import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { fetchExpenses, deleteExpense, addExpense } from '../redux/slices/expenseSlice'
import { fetchCategories } from '../redux/slices/categorySlice'
import { formatCurrency, formatDate } from '../utils/helpers'

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

const CalendarView = () => {
  const dispatch = useAppDispatch()
  const { expenses, loading } = useAppSelector((state) => state.expenses)
  const { categories } = useAppSelector((state) => state.categories)
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarValue, setCalendarValue] = useState<Value>(new Date())
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [selectedExpenses, setSelectedExpenses] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expenseForm, setExpenseForm] = useState({
    name: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  })

  useEffect(() => {
    dispatch(fetchExpenses())
    dispatch(fetchCategories())
  }, [dispatch])

  // Get expenses for a specific date
  const getExpensesForDate = (date: Date) => {
    return expenses.filter(expense => 
      isSameDay(new Date(expense.date), date)
    )
  }

  // Get total amount for a specific date
  const getTotalForDate = (date: Date) => {
    const dayExpenses = getExpensesForDate(date)
    return dayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  // Get category color
  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName)
    return category?.color || '#3B82F6'
  }

  // Handle date click
  const handleDateClick = (date: Date) => {
    const dayExpenses = getExpensesForDate(date)
    setSelectedExpenses(dayExpenses)
    setSelectedDate(date)
    setShowExpenseModal(true)
  }

  // Handle expense deletion
  const handleDeleteExpense = async (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await dispatch(deleteExpense(expenseId))
      // Refresh the modal with updated expenses
      const updatedExpenses = getExpensesForDate(selectedDate)
      setSelectedExpenses(updatedExpenses)
    }
  }

  // Handle add expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!expenseForm.name || !expenseForm.amount || !expenseForm.category) {
      alert('Please fill in all required fields')
      return
    }
    
    setIsSubmitting(true)
    try {
      await dispatch(addExpense({
        name: expenseForm.name,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        date: expenseForm.date,
        description: expenseForm.description
      }))
      
      setExpenseForm({
        name: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      })
      setShowAddExpenseModal(false)
    } catch (error) {
      console.error('Error adding expense:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Custom tile content for calendar
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayExpenses = getExpensesForDate(date)
      const total = getTotalForDate(date)
      
      if (dayExpenses.length > 0) {
        return (
          <div className="relative">
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {formatCurrency(total)}
            </div>
          </div>
        )
      }
    }
    return null
  }

  // Custom tile class for calendar
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayExpenses = getExpensesForDate(date)
      if (dayExpenses.length > 0) {
        return 'has-expenses'
      }
    }
    return ''
  }

  // Get month statistics
  const getMonthStats = () => {
    const start = startOfMonth(selectedDate)
    const end = endOfMonth(selectedDate)
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return isSameMonth(expenseDate, selectedDate)
    })
    
    const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const avg = monthExpenses.length > 0 ? total / monthExpenses.length : 0
    
    return {
      total,
      count: monthExpenses.length,
      average: avg
    }
  }

  const monthStats = getMonthStats()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 calendar-view">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage expenses by date</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'month' | 'week')}
            className="input-field w-32"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
          </select>
          <button 
            onClick={() => setShowAddExpenseModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Month Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(monthStats.total)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expenses</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {monthStats.count}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(monthStats.average)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(selectedDate, 'MMMM yyyy')}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const prevMonth = new Date(selectedDate)
                prevMonth.setMonth(prevMonth.getMonth() - 1)
                setSelectedDate(prevMonth)
                setCalendarValue(prevMonth)
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const nextMonth = new Date(selectedDate)
                nextMonth.setMonth(nextMonth.getMonth() + 1)
                setSelectedDate(nextMonth)
                setCalendarValue(nextMonth)
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="calendar-container">
          <Calendar
            onChange={setCalendarValue}
            value={calendarValue}
            tileContent={tileContent}
            tileClassName={tileClassName}
            onClickDay={handleDateClick}
            className="custom-calendar"
            maxDetail="month"
            minDetail="month"
          />
        </div>
      </div>

      {/* Expense Modal */}
      <AnimatePresence>
        {showExpenseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowExpenseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Expenses for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedExpenses.length} expense{selectedExpenses.length !== 1 ? 's' : ''} • 
                    Total: {formatCurrency(selectedExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
                  </p>
                </div>
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {selectedExpenses.length > 0 ? (
                  <div className="space-y-4">
                    {selectedExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium"
                            style={{ backgroundColor: getCategoryColor(expense.category) }}
                          >
                            {expense.category.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {expense.name}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>{expense.category}</span>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(expense.date)}</span>
                              </span>
                            </div>
                            {expense.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {expense.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(expense.amount)}
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => {/* Handle edit */}}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                              <Edit className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No expenses for this date
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Click the "Add Expense" button to add a new expense for {format(selectedDate, 'MMMM d, yyyy')}.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
                 )}
       </AnimatePresence>

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
               className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
               onClick={(e) => e.stopPropagation()}
             >
               <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                   Add New Expense
                 </h3>
                 <button
                   onClick={() => setShowAddExpenseModal(false)}
                   className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>
               
               <form onSubmit={handleAddExpense} className="p-6 space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     Expense Name *
                   </label>
                   <input
                     type="text"
                     value={expenseForm.name}
                     onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                     className="input-field"
                     placeholder="Enter expense name"
                     required
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     Amount *
                   </label>
                   <input
                     type="number"
                     step="0.01"
                     value={expenseForm.amount}
                     onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                     className="input-field"
                     placeholder="0.00"
                     required
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     Category *
                   </label>
                   <select
                     value={expenseForm.category}
                     onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                     className="input-field"
                     required
                   >
                     <option value="">Select a category</option>
                     {categories.map((category) => (
                       <option key={category.id} value={category.name}>
                         {category.name}
                       </option>
                     ))}
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     Date
                   </label>
                   <input
                     type="date"
                     value={expenseForm.date}
                     onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                     className="input-field"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     Description
                   </label>
                   <textarea
                     value={expenseForm.description}
                     onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                     className="input-field"
                     rows={3}
                     placeholder="Optional description"
                   />
                 </div>
                 
                 <div className="flex items-center justify-end space-x-3 pt-4">
                   <button
                     type="button"
                     onClick={() => setShowAddExpenseModal(false)}
                     className="btn-secondary"
                   >
                     Cancel
                   </button>
                   <button
                     type="submit"
                     className="btn-primary flex items-center space-x-2"
                     disabled={isSubmitting}
                   >
                     {isSubmitting ? (
                       <>
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                         <span>Adding...</span>
                       </>
                     ) : (
                       <>
                         <Plus className="w-4 h-4" />
                         <span>Add Expense</span>
                       </>
                     )}
                   </button>
                 </div>
               </form>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
     </motion.div>
   )
 }

export default CalendarView
