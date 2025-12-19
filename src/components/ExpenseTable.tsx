/**
 * Expense Table Component
 * 
 * PURPOSE: Displays expense history in a sortable, filterable table format.
 * Used in Reports page to show detailed transaction history.
 * 
 * KEY FEATURES:
 * - Sortable columns (date, amount, category, description)
 * - Formatted timestamps and currency display
 * - Total calculation at bottom
 * - Responsive design for mobile/desktop
 * 
 * ORGANIZATION: Simple table component that receives pre-filtered expense data.
 * All filtering and sorting logic handled by parent Reports component.
 * This separation keeps the component focused and reusable.
 */

// ExpenseRecord type - compatible with normalized Expense from reporting.ts
interface ExpenseRecord {
  id: string
  timestamp: number
  amount: number
  description: string
  type?: string
}

/**
 * Props for the ExpenseTable component.
 */
interface ExpenseTableProps {
  /** Array of expense records to display */
  expenses: ExpenseRecord[]
  /** Optional filter function to apply to expenses */
  filter?: (expense: ExpenseRecord) => boolean
  /** Optional sort function to apply to expenses */
  sort?: (a: ExpenseRecord, b: ExpenseRecord) => number
}

/**
 * ExpenseTable Component
 * 
 * Displays a table of expenses with sorting and filtering capabilities.
 * 
 * @param props - Component props
 * @returns JSX element representing the expense table
 * 
 * Example usage:
 * <ExpenseTable expenses={pet.expenses} />
 */
function ExpenseTable({ expenses, filter, sort }: ExpenseTableProps) {
  /**
   * Formats a timestamp into a human-readable date string.
   * 
   * @param timestamp - Timestamp in milliseconds
   * @returns Formatted date string
   */
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  /**
   * Formats a timestamp into a relative time string (e.g., "2 hours ago").
   * 
   * @param timestamp - Timestamp in milliseconds
   * @returns Relative time string
   */
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }
  
  // Apply filter if provided
  let filteredExpenses = filter ? expenses.filter(filter) : expenses
  
  // Apply sort if provided
  if (sort) {
    filteredExpenses = [...filteredExpenses].sort(sort)
  } else {
    // Default sort: most recent first
    filteredExpenses = [...filteredExpenses].sort((a, b) => b.timestamp - a.timestamp)
  }
  
  // Calculate total (all amounts are positive, sum them)
  const total = filteredExpenses.reduce((sum, expense) => {
    const amount = typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0
    return sum + Math.abs(amount) // Ensure positive
  }, 0)
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(expense.timestamp)}</div>
                  <div className="text-xs text-gray-500">{formatRelativeTime(expense.timestamp)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{expense.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-semibold text-red-600">
                    -{expense.amount.toLocaleString()} coins
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                No expenses found.
              </td>
            </tr>
          )}
        </tbody>
        {filteredExpenses.length > 0 && (
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={2} className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                Total Spent:
              </td>
              <td className="px-6 py-3 text-right text-sm font-bold text-red-600">
                {total.toLocaleString()} coins
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

export default ExpenseTable

