import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  CreditCard, 
  PiggyBank, 
  BarChart3, 
  Menu, 
  X, 
  Sun, 
  Moon,
  LogOut,
  User,
  Receipt,
  FileText,
  Settings,
  TrendingUp,
  Calendar,
  PieChart,
  Target,
  Bell,
  HelpCircle,
  Shield
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { toggleDarkMode, toggleSidebar } from '../redux/slices/uiSlice'
import { logout } from '../redux/slices/authSlice'
import FloatingMicButton from './FloatingMicButton'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { darkMode, sidebarOpen } = useAppSelector((state) => state.ui)
  const { user } = useAppSelector((state) => state.auth)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, id: 'dashboard-nav' },
    { name: 'Expenses', href: '/expenses', icon: CreditCard, id: 'expenses-nav' },
    { name: 'Budgets', href: '/budgets', icon: PiggyBank, id: 'budgets-nav' },
    { name: 'Scan Receipt', href: '/receipt-scanner', icon: Receipt, id: 'receipt-scanner-nav' },
    { name: 'Reports', href: '/reports', icon: FileText, id: 'reports-nav' },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp, id: 'analytics-nav' },
    { name: 'Calendar', href: '/calendar', icon: Calendar, id: 'calendar-nav' },
    { name: 'Goals', href: '/goals', icon: Target, id: 'goals-nav' },
    { name: 'Insights', href: '/insights', icon: BarChart3, id: 'insights-nav' },
  ]

  const secondaryNavigation = [
    { name: 'Settings', href: '/settings', icon: Settings, id: 'settings-nav' },
    { name: 'Notifications', href: '/notifications', icon: Bell, id: 'notifications-nav' },
    { name: 'Help & Support', href: '/help', icon: HelpCircle, id: 'help-nav' },
    { name: 'Privacy & Security', href: '/privacy', icon: Shield, id: 'privacy-nav' },
  ]

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => dispatch(toggleSidebar())}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Fixed */}
      <div className="hidden lg:block lg:flex-shrink-0 w-64 bg-white dark:bg-gray-800 shadow-lg fixed left-0 top-0 h-full z-30">
         <div className="flex flex-col h-full">
                       {/* Logo */}
            <div className="flex items-center h-16 px-6">
             <Link to="/dashboard" className="flex items-center space-x-2">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                 <PiggyBank className="w-5 h-5 text-white" />
               </div>
               <span className="text-xl font-bold text-gray-900 dark:text-white">
                 ExpenseTracker
               </span>
             </Link>
           </div>

           {/* Navigation */}
           <nav className="flex-1 px-4 py-6 space-y-2">
             {/* Main Navigation */}
             <div className="space-y-2">
               <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                 Main
               </h3>
               {navigation.map((item) => {
                 const isActive = location.pathname === item.href
                 return (
                   <Link
                     key={item.name}
                     id={item.id}
                     to={item.href}
                     className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                       isActive
                         ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                         : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                     }`}
                   >
                     <item.icon className="w-5 h-5" />
                     <span className="font-medium">{item.name}</span>
                   </Link>
                 )
               })}
             </div>

             {/* Secondary Navigation */}
             <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
               <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                 Settings
               </h3>
               {secondaryNavigation.map((item) => {
                 const isActive = location.pathname === item.href
                 return (
                   <Link
                     key={item.name}
                     id={item.id}
                     to={item.href}
                     className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                       isActive
                         ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                         : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                     }`}
                   >
                     <item.icon className="w-5 h-5" />
                     <span className="font-medium">{item.name}</span>
                   </Link>
                 )
               })}
             </div>
           </nav>

                      {/* User section */}
           <div className="p-4 border-t border-gray-200 dark:border-gray-700">
             <div className="flex items-center space-x-2">
               <button
                 onClick={() => dispatch(toggleDarkMode())}
                 className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
               >
                 {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                 <span>{darkMode ? 'Light' : 'Dark'}</span>
               </button>
               
               <button
                 onClick={handleLogout}
                 className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
               >
                 <LogOut className="w-4 h-4" />
                 <span>Logout</span>
               </button>
             </div>
           </div>
         </div>
       </div>

               {/* Mobile Sidebar - Slides in/out */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen ? 0 : -300 }}
          transition={{ type: 'spring', damping: 20 }}
          className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg"
        >
          <div className="flex flex-col h-full">
                         {/* Logo */}
             <div className="flex items-center justify-between h-16 px-6">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ExpenseTracker
                </span>
              </Link>
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {/* Main Navigation */}
              <div className="space-y-2">
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Main
                </h3>
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      id={item.id}
                      to={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Secondary Navigation */}
              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Settings
                </h3>
                {secondaryNavigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      id={item.id}
                      to={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => dispatch(toggleDarkMode())}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{darkMode ? 'Light' : 'Dark'}</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-40">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            ExpenseTracker
          </span>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

                 {/* Desktop header */}
         <div className="hidden lg:flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 right-0 left-64 z-30">
           <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
             {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
           </h1>
          <div className="flex items-center space-x-4">
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

                 {/* Page content */}
         <main className="p-6 lg:mt-16 mt-16 lg:mb-0 mb-0 h-full overflow-y-auto">
           {children}
         </main>
       </div>

               {/* Floating Mic Button - Available on all pages */}
        <FloatingMicButton />
     </div>
   )
 }

export default Layout
