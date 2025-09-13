"use client"

interface LoadingBarProps {
  isLoading: boolean
  current: number
  total: number
  currentPollutant?: string
  message?: string
}

export default function LoadingBar({ 
  isLoading, 
  current, 
  total, 
  currentPollutant,
  message = "Loading data..." 
}: LoadingBarProps) {
  if (!isLoading) return null

  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-md mx-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">{message}</h3>
          </div>
          
          {currentPollutant && (
            <p className="text-sm text-gray-600 mb-2">
              Fetching {currentPollutant} data...
            </p>
          )}
          
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{current} / {total} records</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-500 mt-1">
              {percentage}%
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            This may take a moment for large datasets...
          </div>
        </div>
      </div>
    </div>
  )
}
