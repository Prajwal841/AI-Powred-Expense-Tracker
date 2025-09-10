import { motion } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  DollarSign
} from 'lucide-react'
import { useAppSelector } from '../redux/hooks'
import { formatCurrency, getTotalExpenses, getExpensesByCategory, getMonthExpenses } from '../utils/helpers'

const Insights = () => {
  const { expenses } = useAppSelector((state) => state.expenses)
  const { budgets } = useAppSelector((state) => state.budgets)

  const currentMonthExpenses = getMonthExpenses(expenses, new Date())
  const totalSpent = getTotalExpenses(currentMonthExpenses)
  const expensesByCategory = getExpensesByCategory(currentMonthExpenses)

  // Mock AI insights and recommendations
  const insights = [
    {
      type: 'spending_trend',
      title: 'Spending Trend Analysis',
      description: 'Your spending has increased by 15% compared to last month. This is mainly due to higher expenses in the Food & Dining category.',
      icon: TrendingUp,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100 dark:bg-warning-900',
      action: 'Consider reviewing your dining expenses'
    },
    {
      type: 'budget_alert',
      title: 'Budget Warning',
      description: 'You\'re approaching 80% of your Entertainment budget. Consider reducing non-essential expenses this month.',
      icon: AlertTriangle,
      color: 'text-danger-600',
      bgColor: 'bg-danger-100 dark:bg-danger-900',
      action: 'Review entertainment expenses'
    },
    {
      type: 'savings_opportunity',
      title: 'Savings Opportunity',
      description: 'You could save $200 monthly by reducing subscription services and dining out less frequently.',
      icon: Target,
      color: 'text-success-600',
      bgColor: 'bg-success-100 dark:bg-success-900',
      action: 'View detailed breakdown'
    },
    {
      type: 'positive_trend',
      title: 'Positive Trend',
      description: 'Great job! Your transportation expenses have decreased by 25% this month compared to last month.',
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-100 dark:bg-success-900',
      action: 'Keep up the good work'
    }
  ]

  const recommendations = [
    {
      category: 'Food & Dining',
      current: 450,
      suggested: 350,
      savings: 100,
      tips: [
        'Cook at home 3 more times per week',
        'Use grocery store loyalty programs',
        'Plan meals in advance to reduce waste'
      ]
    },
    {
      category: 'Entertainment',
      current: 280,
      suggested: 200,
      savings: 80,
      tips: [
        'Look for free community events',
        'Use streaming service deals',
        'Consider sharing subscriptions with family'
      ]
    },
    {
      category: 'Shopping',
      current: 320,
      suggested: 250,
      savings: 70,
      tips: [
        'Wait 24 hours before making non-essential purchases',
        'Use price comparison tools',
        'Shop during sales and use coupons'
      ]
    }
  ]

  const topCategories = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Insights</h1>
          <p className="text-gray-600 dark:text-gray-300">AI-powered financial insights and recommendations</p>
        </div>
        <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
          <Brain className="w-6 h-6" />
          <span className="text-sm font-medium">AI Powered</span>
        </div>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 ${insight.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <insight.icon className={`w-6 h-6 ${insight.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {insight.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {insight.description}
                </p>
                <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
                  {insight.action} →
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Spending Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spending Categories */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Top Spending Categories
          </h2>
          <div className="space-y-4">
            {topCategories.map(([category, amount], index) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{category}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {((amount / totalSpent) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(amount)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Monthly Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span className="text-gray-700 dark:text-gray-300">Total Spent</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(totalSpent)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-success-600 dark:text-success-400" />
                <span className="text-gray-700 dark:text-gray-300">Total Budget</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(5000)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                <span className="text-gray-700 dark:text-gray-300">Remaining</span>
              </div>
              <span className={`font-semibold ${5000 - totalSpent >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatCurrency(Math.abs(5000 - totalSpent))}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Recommendations
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Personalized suggestions to help you save money
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {rec.category}
                </h3>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Potential Savings</p>
                  <p className="text-lg font-bold text-success-600">
                    {formatCurrency(rec.savings)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Spending</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(rec.current)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Suggested Budget</p>
                  <p className="font-semibold text-success-600">
                    {formatCurrency(rec.suggested)}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Money-Saving Tips:
                </p>
                <ul className="space-y-1">
                  {rec.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Lightbulb className="w-4 h-4 text-warning-500 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Coming Soon Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            More AI Features Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We're working on advanced AI features including expense prediction, 
            automated categorization, and personalized financial advice.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
              Expense Prediction
            </span>
            <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
              Smart Categorization
            </span>
            <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
              Financial Goals
            </span>
            <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
              Investment Insights
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Insights
