/**
 * Expense Chart Component
 * 
 * PURPOSE: Visualizes expense data using Chart.js for trend analysis.
 * Provides multiple chart types (Line, Bar, Doughnut) for different insights.
 * 
 * KEY FEATURES:
 * - Line chart: Shows spending trends over time
 * - Bar chart: Compares spending by category
 * - Doughnut chart: Shows category proportions
 * - Responsive design with Chart.js
 * 
 * ORGANIZATION: Wrapper around Chart.js components with data transformation.
 * Receives expense data from Reports page and formats it for chart display.
 * Chart type selection handled by parent component for flexibility.
 */

import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
// ExpenseRecord type - compatible with normalized Expense from reporting.ts
interface ExpenseRecord {
  id: string
  timestamp: number
  amount: number
  description: string
  type?: string
}

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

/**
 * Props for the ExpenseChart component.
 */
interface ExpenseChartProps {
  /** Array of expense records to visualize */
  expenses: ExpenseRecord[]
  /** Type of chart to display */
  chartType?: 'line' | 'bar' | 'doughnut'
}

/**
 * ExpenseChart Component
 * 
 * Displays expense data in various chart formats.
 * 
 * @param props - Component props
 * @returns JSX element representing the chart
 */
function ExpenseChart({ expenses, chartType = 'line' }: ExpenseChartProps) {
  // Guard: If no expenses, show fallback UI
  if (!expenses || expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg">No expenses yet</p>
          <p className="text-sm">Buy an item to generate report data.</p>
        </div>
      </div>
    )
  }
  
  /**
   * Groups expenses by date for time series visualization.
   */
  const groupByDate = () => {
    const grouped: { [key: string]: number } = {}
    const dateToTimestamp: { [key: string]: number } = {} // Track timestamp for each date string
    
    expenses.forEach(expense => {
      if (!expense || !expense.timestamp || !expense.amount) return
      const date = new Date(expense.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
      grouped[date] = (grouped[date] || 0) + (expense.amount || 0)
      // Store the earliest timestamp for this date string (for sorting)
      if (!dateToTimestamp[date] || expense.timestamp < dateToTimestamp[date]) {
        dateToTimestamp[date] = expense.timestamp
      }
    })
    
    return { grouped, dateToTimestamp }
  }
  
  /**
   * Groups expenses by category/description.
   */
  const groupByCategory = () => {
    const grouped: { [key: string]: number } = {}
    
    expenses.forEach(expense => {
      if (!expense || !expense.amount) return
      
      // Extract category from description or use type if available
      let category = 'Other'
      const desc = (expense.description || '').toLowerCase()
      const type = (expense.type || '').toLowerCase()
      
      if (desc.includes('feed') || desc.includes('food') || type === 'food') {
        category = 'Food'
      } else if (desc.includes('play') || type === 'toy') {
        category = 'Entertainment'
      } else if (desc.includes('rest') || type === 'care') {
        category = 'Rest'
      } else if (desc.includes('clean') || type === 'supplies') {
        category = 'Hygiene'
      } else if (desc.includes('veterinarian') || desc.includes('vet') || desc.includes('health') || type === 'healthcare') {
        category = 'Healthcare'
      } else if (desc.includes('purchase') || type === 'purchase' || type === 'activity') {
        category = 'Store Items'
      }
      
      grouped[category] = (grouped[category] || 0) + (expense.amount || 0)
    })
    
    return grouped
  }
  
  // Prepare data based on chart type
  let chartData: any
  let options: any
  
  if (chartType === 'line' || chartType === 'bar') {
    const { grouped: dateGroups, dateToTimestamp } = groupByDate()
    // Sort labels chronologically by timestamp (oldest to newest)
    const labels = Object.keys(dateGroups).sort((a, b) => {
      const timestampA = dateToTimestamp[a] || 0
      const timestampB = dateToTimestamp[b] || 0
      return timestampA - timestampB
    })
    const data = labels.map(label => dateGroups[label] || 0)
    
    // Guard: Ensure we have data
    if (labels.length === 0 || data.every(d => d === 0)) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-lg">No expense data for selected period</p>
          </div>
        </div>
      )
    }
    
    chartData = {
      labels,
      datasets: [
        {
          label: 'Expenses (coins)',
          data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: chartType === 'bar' 
            ? 'rgba(59, 130, 246, 0.5)'
            : 'rgba(59, 130, 246, 0.1)',
          fill: chartType === 'line',
          tension: 0.4
        }
      ]
    }
    
    options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Expenses Over Time'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return value + ' coins'
            }
          }
        }
      }
    }
  } else {
    // Doughnut chart by category
    const categoryGroups = groupByCategory()
    const labels = Object.keys(categoryGroups)
    const data = labels.map(label => categoryGroups[label] || 0)
    
    // Guard: Ensure we have data
    if (labels.length === 0 || data.every(d => d === 0)) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-lg">No expense data for selected period</p>
          </div>
        </div>
      )
    }
    
    const colors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(236, 72, 153, 0.8)'
    ]
    
    chartData = {
      labels,
      datasets: [
        {
          label: 'Expenses by Category',
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: 'white',
          borderWidth: 2
        }
      ]
    }
    
    options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'right' as const,
        },
        title: {
          display: true,
          text: 'Expenses by Category'
        }
      }
    }
  }
  
  // Render appropriate chart type
  if (chartType === 'line') {
    return <Line data={chartData} options={options} />
  } else if (chartType === 'bar') {
    return <Bar data={chartData} options={options} />
  } else {
    return <Doughnut data={chartData} options={options} />
  }
}

export default ExpenseChart

