import VoiceExpenseInput from '../components/VoiceExpenseInput'

const VoiceExpense = () => {
  return (
    <div className="space-y-6">
      <div className="voice-expense-section">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Voice Expense Input</h1>
        <p className="text-gray-600 dark:text-gray-300">Use your voice to add expenses with AI-powered parsing</p>
      </div>
      
      <VoiceExpenseInput />
    </div>
  )
}

export default VoiceExpense
