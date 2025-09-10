import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Shield, 
  BarChart3, 
  Mic,
  Camera,
  Brain,
  Calendar,
  Target,
  Users,
  Star,
  Play,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Globe,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { toggleDarkMode } from '../redux/slices/uiSlice'

const LandingPage = () => {
  const dispatch = useAppDispatch()
  const { darkMode } = useAppSelector((state) => state.ui)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  // Ensure dark class is applied at mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Auto-advance carousel
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPlaying])

  const heroFeatures = [
    {
      icon: Mic,
      title: 'Voice AI Expense',
      description: 'Speak your expenses and let AI parse them automatically with advanced natural language processing',
      color: 'from-emerald-500 to-teal-600',
      image: '/images/voiceai.jpg'
    },
    {
      icon: Camera,
      title: 'Receipt Scanning',
      description: 'Scan receipts with OCR to extract expense details instantly and accurately',
      color: 'from-teal-500 to-cyan-600',
      image: '/images/recipt%20scanner.jpg'
    },
    {
      icon: Brain,
      title: 'Smart Analytics',
      description: 'AI-powered insights and spending pattern analysis to optimize your finances',
      color: 'from-cyan-500 to-emerald-600',
      image: '/images/smart%20analyts.webp'
    }
  ]

  const features = [
    {
      icon: Mic,
      title: 'Voice AI Processing',
      description: 'Use natural language to add expenses. Just speak and our AI will understand and categorize your expenses automatically.',
      gradient: 'from-emerald-500 to-teal-600',
      delay: 0.1
    },
    {
      icon: Camera,
      title: 'Receipt Scanning',
      description: 'Take a photo of your receipt and our OCR technology will extract all the details and create the expense entry for you.',
      gradient: 'from-teal-500 to-cyan-600',
      delay: 0.2
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get intelligent insights about your spending patterns, budget recommendations, and financial health analysis.',
      gradient: 'from-cyan-500 to-emerald-600',
      delay: 0.3
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Beautiful charts and detailed analytics to understand your spending habits and track your financial goals.',
      gradient: 'from-emerald-600 to-teal-700',
      delay: 0.4
    },
    {
      icon: Target,
      title: 'Smart Budgeting',
      description: 'Set category-wise budgets and get real-time alerts when you approach your spending limits.',
      gradient: 'from-teal-600 to-cyan-700',
      delay: 0.5
    },
    {
      icon: Calendar,
      title: 'Calendar View',
      description: 'View your expenses in a calendar format to track daily, weekly, and monthly spending patterns.',
      gradient: 'from-cyan-600 to-emerald-700',
      delay: 0.6
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your financial data is encrypted with bank-level security. We never share your information with third parties.',
      gradient: 'from-emerald-700 to-teal-800',
      delay: 0.7
    },
    {
      icon: Globe,
      title: 'Multi-Currency Support',
      description: 'Track expenses in multiple currencies and get real-time exchange rates for international transactions.',
      gradient: 'from-teal-700 to-cyan-800',
      delay: 0.8
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Freelance Designer',
      content: 'The voice AI feature is incredible! I can just speak my expenses and they get added automatically. It saves me so much time.',
      rating: 5,
      avatar: '👩‍🎨'
    },
    {
      name: 'Mike Chen',
      role: 'Business Owner',
      content: 'The receipt scanning feature is a game-changer. I scan all my receipts and the app extracts everything perfectly.',
      rating: 5,
      avatar: '👨‍💼'
    },
    {
      name: 'Emma Davis',
      role: 'Student',
      content: 'The analytics helped me understand where my money goes. I\'ve saved 30% more since using this app!',
      rating: 5,
      avatar: '👩‍🎓'
    }
  ]

  const stats = [
    { number: '50K+', label: 'Active Users', icon: Users },
    { number: '2M+', label: 'Expenses Tracked', icon: Receipt },
    { number: '99.9%', label: 'Uptime', icon: Shield },
    { number: '4.9★', label: 'User Rating', icon: Star }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ExpenseTracker
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400">AI-Powered</div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-6"
          >
            <button
              aria-label="Toggle dark mode"
              onClick={() => dispatch(toggleDarkMode())}
              className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link
              to="/login"
              className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-lg blur group-hover:blur-md transition-all duration-300"></div>
              <div className="relative bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                Get Started Free
              </div>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section with 3D Carousel */}
      <section className="relative px-6 py-20 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-4"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI-Powered Expense Tracking</span>
                </motion.div>
              </div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
              >
                Track Expenses with
                <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  AI Magic
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
              >
                Experience the future of expense tracking with voice AI, receipt scanning, and intelligent analytics. 
                Take control of your finances like never before.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12"
              >
                <Link
                  to="/register"
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2">
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Watch Demo</span>
                </button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6"
              >
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - 3 small images grid */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="grid grid-cols-3 gap-4">
                {heroFeatures.map((f) => (
                  <div key={f.title} className="aspect-square rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={f.image} alt={f.title} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white dark:bg-gray-800 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"></div>
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Features for
              <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Modern Finance
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to track, analyze, and optimize your expenses with cutting-edge AI technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-gray-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Loved by Users Worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what our users have to say about their experience with ExpenseTracker.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-emerald-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content - Free plan copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4" />
                <span>Completely Free Right Now</span>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
              >
                Manage money smarter
                <span className="block">with AI — for free</span>
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-lg text-white/90 mb-8 leading-relaxed"
              >
                No credit card, no trial, no limits. Start using voice input, receipt scanning and analytics today — free.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <Link to="/register" className="group relative">
                  <div className="absolute inset-0 bg-white rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-75"></div>
                  <div className="relative bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 group-hover:scale-105">
                    <span>Get Started Free</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                <Link to="/features" className="text-white/90 border-2 border-white/30 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:border-white/50">
                  Explore Features
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Content - Moved carousel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-80"
            >
              <div className="relative w-full h-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    <div className={`w-full h-full bg-gradient-to-br ${heroFeatures[currentSlide].color} rounded-2xl overflow-hidden relative shadow-xl`}>
                      <img 
                        src={heroFeatures[currentSlide].image} 
                        alt={heroFeatures[currentSlide].title}
                        className="w-full h-full object-cover opacity-25"
                      />
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                          {React.createElement(heroFeatures[currentSlide].icon, { className: 'w-6 h-6' })}
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{heroFeatures[currentSlide].title}</h3>
                        <p className="text-sm text-white/90">{heroFeatures[currentSlide].description}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Carousel Controls */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
                  {[0, 1, 2].map((index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentSlide(index)
                        setIsPlaying(false)
                        setTimeout(() => setIsPlaying(true), 1000)
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        currentSlide === index 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={() => {
                    setCurrentSlide((prev) => (prev - 1 + 3) % 3)
                    setIsPlaying(false)
                    setTimeout(() => setIsPlaying(true), 800)
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setCurrentSlide((prev) => (prev + 1) % 3)
                    setIsPlaying(false)
                    setTimeout(() => setIsPlaying(true), 800)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">ExpenseTracker</span>
                  <div className="text-xs text-gray-400">AI-Powered</div>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Take control of your finances with our powerful AI-powered expense tracking platform.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Voice AI</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Receipt Scanning</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Analytics</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Budgeting</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 ExpenseTracker. All rights reserved. Made with ❤️ for better financial management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage