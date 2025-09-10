import { motion } from 'framer-motion'
import { HelpCircle, Book, MessageCircle, Mail, Phone } from 'lucide-react'

const Help = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
        <p className="text-gray-600 dark:text-gray-400">Get help and find answers to your questions</p>
      </div>

      {/* Help Content */}
      <div className="card p-6">
        <div className="text-center py-12">
          <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Help Center Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Access documentation, FAQs, and contact support for assistance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center space-x-2">
              <Book className="w-4 h-4" />
              <span>Documentation</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Live Chat</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email Support</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Phone Support</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Help
