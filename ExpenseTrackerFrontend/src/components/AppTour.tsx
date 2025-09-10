import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play,
  PiggyBank,
  CreditCard,
  Receipt,
  Mic,
  Calendar,
  Target,
  BarChart3,
  CheckCircle
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { setTourCompleted } from '../redux/slices/uiSlice'

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right'
  route: string
  icon: React.ComponentType<any>
  action?: () => void
}

const AppTour = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { tourCompleted } = useAppSelector((state) => state.ui)
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  
  const tourSteps: TourStep[] = [
    {
      id: 'budget-intro',
      title: 'Set Your Budget',
      description: 'Start by setting up your monthly budget to track your spending goals. This helps you stay on track with your financial goals.',
      target: '.budget-setup-section',
      position: 'bottom',
      route: '/budgets',
      icon: PiggyBank
    },
    {
      id: 'budget-create',
      title: 'Create Budget Categories',
      description: 'Create different budget categories like groceries, entertainment, or transportation. This helps you allocate your money wisely.',
      target: '.budget-form',
      position: 'top',
      route: '/budgets',
      icon: Target
    },
    {
      id: 'expense-intro',
      title: 'Track Your Expenses',
      description: 'Now let\'s learn how to add your expenses. You can manually enter expenses or use our smart features.',
      target: '.expense-form',
      position: 'bottom',
      route: '/expenses',
      icon: CreditCard
    },
    {
      id: 'receipt-scanner',
      title: 'Scan Receipts',
      description: 'Use our AI-powered receipt scanner to automatically extract expense details from photos. Just take a picture and we\'ll do the rest!',
      target: '.scan-receipt-button',
      position: 'bottom',
      route: '/receipt-scanner',
      icon: Receipt
    },
    {
      id: 'voice-expense',
      title: 'Voice Expense Entry',
      description: 'Too busy to type? Use voice commands to add expenses. Just speak naturally and our AI will understand you.',
      target: '.voice-expense-section',
      position: 'top',
      route: '/voice-expense',
      icon: Mic
    },
    {
      id: 'calendar-view',
      title: 'Calendar View',
      description: 'View your expenses in a calendar format to see spending patterns over time. Perfect for tracking daily habits.',
      target: '.calendar-view',
      position: 'bottom',
      route: '/calendar',
      icon: Calendar
    },
    {
      id: 'analytics',
      title: 'Analytics & Insights',
      description: 'Get detailed insights into your spending patterns with beautiful charts and analytics.',
      target: '.analytics-section',
      position: 'top',
      route: '/analytics',
      icon: BarChart3
    },
    {
      id: 'completion',
      title: 'You\'re All Set!',
      description: 'Congratulations! You now know how to use all the key features of your expense tracker. Start managing your finances smarter today!',
      target: '.dashboard-overview',
      position: 'bottom',
      route: '/dashboard',
      icon: CheckCircle
    }
  ]

  useEffect(() => {
    // Show tour for new users or when manually triggered
    if (!tourCompleted && location.pathname === '/dashboard') {
      setTimeout(() => {
        setIsVisible(true)
        startTour()
      }, 1000)
    }
  }, [tourCompleted, location.pathname])

  useEffect(() => {
    if (isVisible && currentStep < tourSteps.length) {
      const step = tourSteps[currentStep]
      
      // Navigate to the required route
      if (location.pathname !== step.route) {
        navigate(step.route)
      }
      
      // Wait for navigation and DOM update, then find target element
      setTimeout(() => {
        const element = document.querySelector(step.target) as HTMLElement
        setTargetElement(element)
        
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
        }
      }, 300)
    }
  }, [currentStep, isVisible, location.pathname])

  const startTour = () => {
    setCurrentStep(0)
    setIsVisible(true)
  }

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeTour = () => {
    setIsVisible(false)
    dispatch(setTourCompleted(true))
    navigate('/dashboard')
  }

  const skipTour = () => {
    setIsVisible(false)
    dispatch(setTourCompleted(true))
  }

  if (!isVisible || tourCompleted) {
    return null
  }

  const currentStepData = tourSteps[currentStep]
  const progress = ((currentStep + 1) / tourSteps.length) * 100

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={skipTour}
      />

      {/* Tour Overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center p-4"
        >
          {/* Tour Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="relative p-6 pb-4">
              <button
                onClick={skipTour}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <currentStepData.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentStepData.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Step {currentStep + 1} of {tourSteps.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pb-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-primary-600 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentStepData.description}
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={skipTour}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Skip Tour
                </button>
                
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  <span>
                    {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                  </span>
                  {currentStep < tourSteps.length - 1 && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Highlight Target Element */}
      {targetElement && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute pointer-events-none"
          style={{
            top: targetElement.offsetTop - 8,
            left: targetElement.offsetLeft - 8,
            width: targetElement.offsetWidth + 16,
            height: targetElement.offsetHeight + 16,
          }}
        >
          <div className="w-full h-full border-2 border-primary-500 rounded-lg shadow-lg bg-primary-50 dark:bg-primary-900/20" />
        </motion.div>
      )}
    </div>
  )
}

export default AppTour
