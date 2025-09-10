import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  MicOff, 
  Send, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Volume2
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { processVoiceExpense, clearResponse } from '../redux/slices/voiceExpenseSlice'
import { checkRateLimit, clearRateLimitInfo } from '../redux/slices/rateLimitSlice'
import { fetchExpenses, refreshExpensesFromVoice } from '../redux/slices/expenseSlice'

const VoiceExpenseInput = () => {
  const dispatch = useAppDispatch()
  const { response, loading, error } = useAppSelector((state: any) => state.voiceExpense)
  const { user } = useAppSelector((state: any) => state.auth)
  const { rateLimitInfo } = useAppSelector((state: any) => state.rateLimit)
  
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported
  } = useVoiceInput()

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [manualText, setManualText] = useState('')

  // Auto-submit when transcript is received
  useEffect(() => {
    if (transcript && !isListening) {
      setManualText(transcript)
      setShowConfirmModal(true)
    }
  }, [transcript, isListening])

  const handleParseExpense = async (text: string) => {
    if (!text.trim() || !user?.id) return

    const request = {
      voiceText: text.trim(),
      userId: user.id.toString()
    }

    try {
      console.log('🎤 Processing voice expense request:', request)
      const result = await dispatch(processVoiceExpense(request))
      console.log('🎤 Voice expense result:', result)
      
      // If voice expense was created successfully, refresh the expenses list
      // This will update the dashboard charts and recent expenses
      if (processVoiceExpense.fulfilled.match(result) && result.payload?.success) {
        console.log('✅ Voice expense created successfully! Expense data:', result.payload.expense)
        
        // Signal to all components that a voice expense was added
        dispatch(refreshExpensesFromVoice())
        
        // Also refresh expenses immediately
        setTimeout(() => {
          console.log('🔄 Dispatching fetchExpenses after voice expense creation')
          dispatch(fetchExpenses())
        }, 1000) // Increased delay to ensure backend transaction is complete
      } else {
        console.log('❌ Voice expense creation failed or no success flag:', result.payload)
      }
    } catch (error) {
      console.error('❌ Error parsing expense:', error)
    }
  }

  const handleConfirm = () => {
    handleParseExpense(manualText)
    setShowConfirmModal(false)
  }

  const handleCancel = () => {
    setShowConfirmModal(false)
    setManualText('')
    resetTranscript()
    dispatch(clearResponse())
    dispatch(clearRateLimitInfo())
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userCurrency
    }).format(amount)
  }

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString('en-IN')
  }

  if (!isSupported) {
    return (
      <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Voice Input Not Supported
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your browser doesn't support voice input. You can still type your expenses manually.
        </p>
        <div className="space-y-3">
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Type your expense (e.g., 'I spent 300 rs yesterday on sandwich')"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => handleParseExpense(manualText)}
            disabled={!manualText.trim() || loading}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{loading ? 'Parsing...' : 'Parse Expense'}</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Voice Input Section */}
      <div className="text-center p-8 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 rounded-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Voice Expense Input
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Speak your expense and let AI parse it automatically
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {isListening ? 'Listening...' : 'Click to start recording'}
            </p>
            {transcript && (
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                "{transcript}"
              </p>
            )}
          </div>

          {/* Manual Input Fallback */}
          <div className="w-full max-w-md">
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Or type your expense here..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={!manualText.trim()}
              className="mt-2 btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Parse Text</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center p-6 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-500" />
          <p className="text-blue-700 dark:text-blue-300">AI is parsing your expense...</p>
        </div>
      )}

             {/* Error State */}
       {error && (
         <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg">
           <div className="flex items-center space-x-2">
             <AlertCircle className="w-5 h-5 text-red-500" />
             <p className="text-red-700 dark:text-red-300">{error}</p>
           </div>
         </div>
       )}

       {/* Rate Limit Exceeded State */}
       {rateLimitInfo && !rateLimitInfo.allowed && (
         <div className="p-6 bg-orange-50 dark:bg-orange-900 rounded-lg">
           <div className="flex items-center space-x-2 mb-4">
             <AlertCircle className="w-6 h-6 text-orange-500" />
             <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
               Daily Limit Reached
             </h3>
           </div>
           <p className="text-orange-700 dark:text-orange-300 mb-2">
             {rateLimitInfo.message}
           </p>
           <p className="text-sm text-orange-600 dark:text-orange-400">
             You can still add expenses manually through the Expenses page.
           </p>
           <div className="mt-4">
             <button
               onClick={() => dispatch(clearRateLimitInfo())}
               className="btn-secondary"
             >
               Dismiss
             </button>
           </div>
         </div>
       )}

      {/* Parsed Result */}
      {response && response.success && response.expense && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-green-50 dark:bg-green-900 rounded-lg"
        >
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
              Expense Parsed Successfully!
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Name</p>
              <p className="font-medium text-green-800 dark:text-green-200">{response.expense.name}</p>
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Amount</p>
              <p className="font-medium text-green-800 dark:text-green-200">
                {formatCurrency(response.expense.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Category</p>
              <p className="font-medium text-green-800 dark:text-green-200">{response.expense.categoryName}</p>
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Date</p>
              <p className="font-medium text-green-800 dark:text-green-200">
                {formatDate(response.expense.date)}
              </p>
            </div>
            {response.expense.description && (
              <div className="md:col-span-2">
                <p className="text-sm text-green-600 dark:text-green-400">Description</p>
                <p className="font-medium text-green-800 dark:text-green-200">{response.expense.description}</p>
              </div>
            )}
            <div className="md:col-span-2">
              <p className="text-sm text-green-600 dark:text-green-400">Confidence</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-green-200 dark:bg-green-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: response.confidence === 'High' ? '100%' : '60%' }}
                  />
                </div>
                <span className="text-sm text-green-700 dark:text-green-300">
                  {response.confidence}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => dispatch(clearResponse())}
              className="btn-secondary flex-1"
            >
              Parse Another
            </button>
            <button
              onClick={() => {
                // Navigate to expenses page or show success message
                dispatch(clearResponse())
              }}
              className="btn-primary flex-1"
            >
              View in Expenses
            </button>
          </div>
          
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
              ✅ Expense has been added to your dashboard and will appear in charts!
            </p>
          </div>
        </motion.div>
      )}

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm Expense Text
                </h3>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Please confirm the text to be parsed:
                </p>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-900 dark:text-white font-medium">"{manualText}"</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="btn-primary flex-1"
                >
                  Parse Expense
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VoiceExpenseInput
