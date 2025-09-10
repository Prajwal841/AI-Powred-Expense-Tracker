import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, AlertCircle, BarChart3, Mic, Camera, Brain, Shield, Zap, CheckCircle } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { login, clearError, resendVerification } from '../redux/slices/authSlice'
import GoogleSignIn from '../components/GoogleSignIn'

const Login = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error, errorStatus, isAuthenticated } = useAppSelector((state) => state.auth)
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    // Open popup when a new error appears
    if (error) {
      setShowErrorPopup(true)
    }
  }, [error])

  useEffect(() => {
    // Clear error when component unmounts
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      await dispatch(login(formData))
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (error) {
      dispatch(clearError())
    }
  }

  const handleResendVerification = async () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setResendStatus('error')
      return
    }
    try {
      setResendStatus('idle')
      const res = await dispatch(resendVerification(formData.email))
      if ((res as any).error) {
        setResendStatus('error')
      } else {
        setResendStatus('success')
      }
    } catch {
      setResendStatus('error')
    }
  }

  // Derive user-friendly error content
  const getErrorTitle = () => {
    if (errorStatus === 401) return 'Invalid email or password'
    if (errorStatus === 403) return 'Email not verified'
    if (errorStatus === 429) return 'Too many attempts'
    return 'Login failed'
  }

  const getErrorDescription = () => {
    if (errorStatus === 401) return 'Please check your credentials and try again.'
    if (errorStatus === 403) return 'Please verify your email before logging in.'
    if (errorStatus === 429) return 'You have exceeded the allowed attempts. Please wait a moment and try again.'
    return error || 'Something went wrong. Please try again.'
  }

  const features = [
    {
      icon: Mic,
      title: 'Voice AI Processing',
      description: 'Speak your expenses and let AI parse them automatically',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: Camera,
      title: 'Receipt Scanning',
      description: 'Scan receipts with OCR to extract expense details instantly',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      icon: Brain,
      title: 'Smart Analytics',
      description: 'AI-powered insights and spending pattern analysis',
      color: 'from-cyan-500 to-emerald-600'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your financial data is encrypted and secure',
      color: 'from-emerald-600 to-teal-700'
    }
  ]

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Left Side - Feature Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 w-full flex items-center justify-center p-12">
          <div className="max-w-lg">
            {/* Logo and Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  ExpenseTracker
                </span>
              </h1>
              <p className="text-xl text-white/90">
                AI-Powered Financial Management
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>


          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Sign in to your account</p>
          </div>

          {/* Desktop Title - Centered */}
          <div className="hidden lg:block text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            {/* Removed inline alert in favor of modal popup */}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`input-field pl-10 ${formErrors.email ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                    placeholder="Enter your email"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`input-field pl-10 pr-10 ${formErrors.password ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{formErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Google Sign-In */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-4">
                <GoogleSignIn 
                  onSuccess={(data) => {
                    // Store token and navigate to dashboard
                    localStorage.setItem('token', data.token)
                    localStorage.setItem('user', JSON.stringify(data.user))
                    navigate('/dashboard')
                  }}
                  onError={(error) => {
                    console.error('Google Sign-In failed:', error)
                  }}
                />
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Error Modal Popup */}
          {showErrorPopup && error && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowErrorPopup(false); dispatch(clearError()) }}></div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative z-10 w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-2xl"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-danger-600 dark:text-danger-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getErrorTitle()}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{getErrorDescription()}</p>
                    {errorStatus === 403 && (
                      <div className="mt-3">
                        <button
                          onClick={handleResendVerification}
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                        >
                          Resend verification email
                        </button>
                        {resendStatus === 'success' && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Verification email sent. Please check your inbox.</p>
                        )}
                        {resendStatus === 'error' && (
                          <p className="text-xs text-danger-600 dark:text-danger-400 mt-1">Unable to send verification. Ensure a valid email is entered above.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    onClick={() => { setShowErrorPopup(false); dispatch(clearError()) }}
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  )
}

export default Login
