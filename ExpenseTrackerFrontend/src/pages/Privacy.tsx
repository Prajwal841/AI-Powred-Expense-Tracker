import { motion } from 'framer-motion'
import { Shield, Lock, Eye, FileText } from 'lucide-react'

const Privacy = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy & Security</h1>
        <p className="text-gray-600 dark:text-gray-400">Learn about how we protect your data</p>
      </div>

      {/* Privacy Content */}
      <div className="card p-6">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Privacy Policy Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Review our privacy policy and learn about data protection measures.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Data encryption</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Privacy controls</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Terms of service</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Privacy
