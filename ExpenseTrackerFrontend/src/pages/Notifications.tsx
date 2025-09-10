import { motion } from 'framer-motion'
import { Bell, Settings, CheckCircle, AlertTriangle, Info } from 'lucide-react'

const Notifications = () => {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your notification preferences</p>
        </div>
        <button className="btn-secondary flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="card p-6">
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Notifications Center Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            View and manage your notification history and preferences.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Budget alerts</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Spending alerts</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Info className="w-4 h-4" />
              <span>Weekly reports</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Notifications
