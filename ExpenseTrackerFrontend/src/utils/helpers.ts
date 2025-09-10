import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const currencyMap: { [key: string]: string } = {
    'USD': 'USD',
    'EUR': 'EUR', 
    'GBP': 'GBP',
    'INR': 'INR',
    'JPY': 'JPY',
    'CAD': 'CAD'
  }
  
  const selectedCurrency = currencyMap[currency] || 'USD'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: selectedCurrency,
  }).format(amount)
}

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'MMM dd, yyyy')
}

export const formatMonth = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'MMMM yyyy')
}

export const getCurrentMonthRange = () => {
  const now = new Date()
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  }
}

export const getMonthExpenses = (expenses: any[], month: Date) => {
  const start = startOfMonth(month)
  const end = endOfMonth(month)
  
  return expenses.filter(expense => {
    const expenseDate = parseISO(expense.date)
    return expenseDate >= start && expenseDate <= end
  })
}

export const getTotalExpenses = (expenses: any[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0)
}

export const getExpensesByCategory = (expenses: any[]) => {
  return expenses.reduce((acc, expense) => {
    const category = expense.category
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += expense.amount
    return acc
  }, {} as Record<string, number>)
}

export const getRandomColor = (): string => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Sort categories by ID in ascending order
 */
export const sortCategoriesById = (categories: any[]) => {
  return [...categories].sort((a, b) => parseInt(a.id) - parseInt(b.id))
}
