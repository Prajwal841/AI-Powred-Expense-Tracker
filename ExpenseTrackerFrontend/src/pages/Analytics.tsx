import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { fetchExpenses } from '../redux/slices/expenseSlice'
import { fetchCategories } from '../redux/slices/categorySlice'
import { formatCurrency, formatDate } from '../utils/helpers'

const Analytics = () => {
  const dispatch = useAppDispatch()
  const { expenses } = useAppSelector((state) => state.expenses)
  const { categories } = useAppSelector((state) => state.categories)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    dispatch(fetchExpenses())
    dispatch(fetchCategories())
  }, [dispatch])

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  // Filter expenses for selected year
  const yearExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getFullYear() === selectedYear
  })

  // Monthly spending data
  const monthlyData = Array.from({ length: 12 }, (_, month) => {
    const monthExpenses = yearExpenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === month
    })
    const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const avg = monthExpenses.length > 0 ? total / monthExpenses.length : 0
    
    return {
      month: new Date(2024, month).toLocaleString('default', { month: 'short' }),
      total,
      average: avg,
      count: monthExpenses.length
    }
  })

  // Default colors for pie chart
  const DEFAULT_COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
    '#14B8A6', '#F43F5E', '#8B5CF6', '#06B6D4', '#84CC16'
  ]

  // Category spending data
  const categoryData = categories.map((category, index) => {
    const categoryExpenses = yearExpenses.filter(expense => expense.category === category.name)
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    return {
      name: category.name,
      amount: total,
      color: category.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      percentage: yearExpenses.length > 0 ? (total / yearExpenses.reduce((sum, e) => sum + e.amount, 0)) * 100 : 0
    }
  }).filter(item => item.amount > 0)

  // Spending trends
  const spendingTrend = monthlyData.map((data, index) => ({
    month: data.month,
    spending: data.total,
    trend: index > 0 ? ((data.total - monthlyData[index - 1].total) / monthlyData[index - 1].total) * 100 : 0
  }))

  // Top spending categories
  const topCategories = categoryData
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  // Calculate insights
  const totalYearSpending = yearExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const avgMonthlySpending = totalYearSpending / 12
  const highestMonth = monthlyData.reduce((max, month) => month.total > max.total ? month : max)
  const lowestMonth = monthlyData.reduce((min, month) => month.total < min.total ? month : min)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 analytics-section">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Advanced spending analytics and insights</p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="input-field w-32"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalYearSpending)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">in {selectedYear}</p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Monthly</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(avgMonthlySpending)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">per month</p>
            </div>
            <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Highest Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(highestMonth.total)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{highestMonth.month}</p>
            </div>
            <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {yearExpenses.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">in {selectedYear}</p>
            </div>
            <div className="p-3 bg-info-100 dark:bg-info-900 rounded-lg">
              <Calendar className="w-6 h-6 text-info-600 dark:text-info-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Spending Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Spending by Category
          </h3>
          {categoryData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center space-x-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-600 dark:text-gray-300 truncate">
                      {item.name}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium ml-auto">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Top Categories Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Spending Categories
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topCategories}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Bar dataKey="amount" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Spending Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Peak Spending Month</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {highestMonth.month} - {formatCurrency(highestMonth.total)}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Lowest Spending Month</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {lowestMonth.month} - {formatCurrency(lowestMonth.total)}
                </p>
              </div>
              <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Average Transaction</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {yearExpenses.length > 0 ? formatCurrency(totalYearSpending / yearExpenses.length) : '$0'}
                </p>
              </div>
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Most Active Category</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {topCategories[0]?.name || 'N/A'} - {topCategories[0] ? formatCurrency(topCategories[0].amount) : '$0'}
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Analytics
