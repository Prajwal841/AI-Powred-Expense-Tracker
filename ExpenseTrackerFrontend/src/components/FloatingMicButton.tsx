import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, CheckCircle, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { processVoiceExpense, clearResponse } from '../redux/slices/voiceExpenseSlice'
import { checkRateLimit, clearRateLimitInfo } from '../redux/slices/rateLimitSlice'

const FloatingMicButton = () => {
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

  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)

  // Auto-parse when transcript is received
  useEffect(() => {
    if (transcript && !isListening) {
      handleAutoParse(transcript)
    }
  }, [transcript, isListening])

  // Show success popup when expense is parsed
  useEffect(() => {
    if (response && response.success && response.expense && !loading) {
      setShowSuccessPopup(true)
      setTimeout(() => {
        setShowSuccessPopup(false)
        dispatch(clearResponse())
      }, 3000)
    }
  }, [response, loading, dispatch])

  // Show error popup when there's an error
  useEffect(() => {
    if (error && !loading) {
      setShowErrorPopup(true)
      setTimeout(() => {
        setShowErrorPopup(false)
        dispatch(clearResponse())
      }, 3000)
    }
  }, [error, loading, dispatch])

  const handleAutoParse = async (text: string) => {
    if (!text.trim()) return

    // Get user ID from Redux auth state
    if (!user?.id) {
      console.error('User not found - please log in')
      return
    }

    const request = {
      voiceText: text.trim(),
      userId: user.id.toString()
    }

    try {
      await dispatch(processVoiceExpense(request))
    } catch (error) {
      console.error('Error parsing expense:', error)
    }
  }

  const handleMicClick = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening()
    }
  }

  if (!isSupported) {
    return null // Don't show anything if voice is not supported
  }

  // Don't show if user is not authenticated
  if (!user?.id) {
    return null
  }

  return (
    <>
             {/* Floating Mic Button */}
       <motion.div
         initial={{ scale: 0, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ type: "spring", stiffness: 260, damping: 20 }}
         className="fixed bottom-6 right-6 z-50 group"
       >
         {/* Tooltip */}
         <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
         >
           Click to speak your expense
           <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
         </motion.div>
                 <motion.button
           onClick={handleMicClick}
           whileHover={{ scale: 1.1 }}
           whileTap={{ scale: 0.9 }}
           animate={isListening ? { scale: [1, 1.05, 1] } : {}}
           transition={isListening ? { duration: 1, repeat: Infinity } : {}}
           className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 relative ${
             isListening
               ? 'bg-red-500 hover:bg-red-600 text-white'
               : 'bg-primary-500 hover:bg-primary-600 text-white'
           }`}
         >
           {isListening ? (
             <MicOff className="w-6 h-6" />
           ) : (
             <Mic className="w-6 h-6" />
           )}
           
           {/* Pulsing ring when listening */}
           {isListening && (
             <>
               <motion.div
                 animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute inset-0 rounded-full border-2 border-red-400"
               />
               <motion.div
                 animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                 transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                 className="absolute inset-0 rounded-full border-2 border-red-300"
               />
             </>
           )}
         </motion.button>

        {/* Listening indicator */}
        {isListening && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-3 h-3 bg-white rounded-full"
            />
          </motion.div>
        )}

        {/* Loading indicator */}
        {loading && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </motion.div>

             {/* Success Popup */}
       <AnimatePresence>
         {showSuccessPopup && (
           <motion.div
             initial={{ opacity: 0, y: 50, scale: 0.8 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: -50, scale: 0.8 }}
             className="fixed top-6 right-6 z-50"
           >
             <motion.div 
               className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3"
               animate={{ boxShadow: ["0 10px 25px rgba(34, 197, 94, 0.3)", "0 20px 40px rgba(34, 197, 94, 0.4)", "0 10px 25px rgba(34, 197, 94, 0.3)"] }}
               transition={{ duration: 2, repeat: Infinity }}
             >
               <motion.div
                 initial={{ scale: 0, rotate: -180 }}
                 animate={{ scale: 1, rotate: 0 }}
                 transition={{ type: "spring", stiffness: 260, damping: 20 }}
               >
                 <CheckCircle className="w-6 h-6" />
               </motion.div>
               <div>
                 <motion.p 
                   className="font-semibold"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.2 }}
                 >
                   Expense Added!
                 </motion.p>
                 <motion.p 
                   className="text-sm opacity-90"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.3 }}
                 >
                   {response?.expense?.name} - ₹{response?.expense?.amount}
                 </motion.p>
                 <motion.p 
                   className="text-xs opacity-75"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.4 }}
                 >
                   Category: {response?.expense?.categoryName}
                 </motion.p>
               </div>
               <button
                 onClick={() => setShowSuccessPopup(false)}
                 className="ml-2 hover:bg-green-600 rounded-full p-1 transition-colors"
               >
                 <X className="w-4 h-4" />
               </button>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>

             {/* Error Popup */}
       <AnimatePresence>
         {showErrorPopup && (
           <motion.div
             initial={{ opacity: 0, y: 50, scale: 0.8 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: -50, scale: 0.8 }}
             className="fixed top-6 right-6 z-50"
           >
             <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
               <X className="w-6 h-6" />
               <div>
                 <p className="font-semibold">Parsing Failed</p>
                 <p className="text-sm opacity-90">Please try again</p>
               </div>
               <button
                 onClick={() => setShowErrorPopup(false)}
                 className="ml-2 hover:bg-red-600 rounded-full p-1"
               >
                 <X className="w-4 h-4" />
               </button>
             </div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* Rate Limit Exceeded Popup */}
       <AnimatePresence>
         {rateLimitInfo && !rateLimitInfo.allowed && (
           <motion.div
             initial={{ opacity: 0, y: 50, scale: 0.8 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: -50, scale: 0.8 }}
             className="fixed top-6 right-6 z-50"
           >
             <div className="bg-orange-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm">
               <X className="w-6 h-6" />
               <div>
                 <p className="font-semibold">Daily Limit Reached</p>
                 <p className="text-sm opacity-90">{rateLimitInfo.message}</p>
                 <p className="text-xs opacity-75 mt-1">
                   Reset: {new Date(Date.now() + rateLimitInfo.timeUntilReset * 1000).toLocaleDateString()}
                 </p>
               </div>
               <button
                 onClick={() => dispatch(clearRateLimitInfo())}
                 className="ml-2 hover:bg-orange-600 rounded-full p-1"
               >
                 <X className="w-4 h-4" />
               </button>
             </div>
           </motion.div>
         )}
       </AnimatePresence>

             {/* Transcript Display */}
       <AnimatePresence>
         {transcript && isListening && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="fixed bottom-24 right-6 z-40"
           >
             <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm">
               <div className="flex items-center space-x-2 mb-2">
                 <motion.div
                   animate={{ scale: [1, 1.2, 1] }}
                   transition={{ duration: 1, repeat: Infinity }}
                   className="w-2 h-2 bg-red-500 rounded-full"
                 />
                 <p className="text-sm text-gray-600 dark:text-gray-400">Listening...</p>
               </div>
               <motion.p 
                 className="text-gray-900 dark:text-white font-medium"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ duration: 0.3 }}
               >
                 "{transcript}"
               </motion.p>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
    </>
  )
}

export default FloatingMicButton
