"use client"

import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Target, Calendar } from 'lucide-react'
import { POLLUTANTS } from '@/lib/constants'
import dayjs from 'dayjs'
import LoadingBar from '@/components/LoadingBar'

interface StatisticsProps {
  filters: any
}

export default function Statistics({ filters }: StatisticsProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState({
    current: 0,
    total: 0,
    currentPollutant: '',
    isLoading: false
  })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    setLoading(true)
    setLoadingProgress({
      current: 0,
      total: 0,
      currentPollutant: '',
      isLoading: true
    })
    
    try {
      const pollutants = filters.pollutants || [filters.pollutant || 'AER_AI']
      const params = new URLSearchParams({
        pollutants: pollutants.join(','),
        level: filters.level || 'SA2',
      })
      
      if (filters.states && filters.states.length > 0) params.append('states', filters.states.join(','))
      if (filters.codes) params.append('codes', filters.codes)
      if (filters.start) params.append('start', filters.start)
      if (filters.end) params.append('end', filters.end)

      const response = await fetch(`/api/pollution?${params.toString()}`)
      const result = await response.json()
      
      if (result.data) {
        setData(result.data)
        setLoadingProgress(prev => ({ 
          ...prev, 
          total: result.data.length,
          current: result.data.length,
          currentPollutant: pollutants.join(', ')
        }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
      setLoadingProgress(prev => ({ ...prev, isLoading: false }))
    }
  }

  const statistics = useMemo(() => {
    if (data.length === 0) return null

    const stats: any = {}
    const pollutants = [...new Set(data.map(d => d.pollutant))]

    pollutants.forEach(pollutant => {
      const pollutantData = data.filter(d => d.pollutant === pollutant)
      const values = pollutantData.map(d => d.value).filter(v => v != null)
      
      if (values.length > 0) {
        const sorted = values.sort((a, b) => a - b)
        stats[pollutant] = {
          count: values.length,
          mean: values.reduce((a, b) => a + b, 0) / values.length,
          median: sorted[Math.floor(sorted.length / 2)],
          min: Math.min(...values),
          max: Math.max(...values),
          std: Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - (values.reduce((a, b) => a + b, 0) / values.length), 2), 0) / values.length),
          q25: sorted[Math.floor(sorted.length * 0.25)],
          q75: sorted[Math.floor(sorted.length * 0.75)]
        }
      }
    })

    return stats
  }, [data])

  const timeSeriesData = useMemo(() => {
    if (data.length === 0) return []

    const grouped = data.reduce((acc, row) => {
      const date = dayjs(row.date).format('YYYY-MM-DD')
      if (!acc[date]) {
        acc[date] = { date }
      }
      if (!acc[date][row.pollutant]) {
        acc[date][row.pollutant] = []
      }
      acc[date][row.pollutant].push(row.value)
      return acc
    }, {})

    return Object.values(grouped).map((group: any) => {
      const result: any = { date: group.date }
      Object.keys(group).forEach(pollutant => {
        if (pollutant !== 'date') {
          const values = group[pollutant].filter((v: any) => v != null)
          if (values.length > 0) {
            result[pollutant] = values.reduce((a: number, b: number) => a + b, 0) / values.length
          }
        }
      })
      return result
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [data])

  const pollutantDistribution = useMemo(() => {
    if (data.length === 0) return []

    const distribution = data.reduce((acc, row) => {
      acc[row.pollutant] = (acc[row.pollutant] || 0) + 1
      return acc
    }, {})

    return Object.entries(distribution).map(([pollutant, count]) => ({
      name: pollutant,
      value: count,
      color: POLLUTANTS.find(p => p.value === pollutant)?.color || '#666'
    }))
  }, [data])

  const stateDistribution = useMemo(() => {
    if (data.length === 0) return []

    const distribution = data.reduce((acc, row) => {
      acc[row.ste_name] = (acc[row.ste_name] || 0) + 1
      return acc
    }, {})

    return Object.entries(distribution).map(([state, count]) => ({
      name: state,
      value: count
    })).sort((a, b) => b.value - a.value)
  }, [data])

  const getPollutantColor = (pollutant: string) => {
    return POLLUTANTS.find(p => p.value === pollutant)?.color || '#666'
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm">
      {/* Loading Bar */}
      <LoadingBar
        isLoading={loadingProgress.isLoading}
        current={loadingProgress.current}
        total={loadingProgress.total}
        currentPollutant={loadingProgress.currentPollutant}
        message="Loading statistics..."
      />
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Statistics Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">
          Comprehensive analysis of pollution data
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading statistics...</p>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No Data Available</h3>
            <p className="text-sm">Please adjust your filters to view statistics</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Records</p>
                  <p className="text-2xl font-bold text-blue-900">{data.length.toLocaleString()}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Pollutants</p>
                  <p className="text-2xl font-bold text-green-900">
                    {[...new Set(data.map(d => d.pollutant))].length}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">States</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {[...new Set(data.map(d => d.ste_name))].length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Date Range</p>
                  <p className="text-sm font-bold text-orange-900">
                    {data.length > 0 ? 
                      `${dayjs(data[0].date).format('MMM YYYY')} - ${dayjs(data[data.length - 1].date).format('MMM YYYY')}` : 
                      'N/A'
                    }
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Pollutant Statistics */}
          {statistics && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pollutant Statistics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.entries(statistics).map(([pollutant, stats]: [string, any]) => (
                  <div key={pollutant} className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getPollutantColor(pollutant) }}
                      />
                      <h4 className="font-semibold text-gray-900">{pollutant}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Count:</span>
                        <span className="ml-2 font-medium">{stats.count.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Mean:</span>
                        <span className="ml-2 font-medium">{stats.mean.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Median:</span>
                        <span className="ml-2 font-medium">{stats.median.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Std Dev:</span>
                        <span className="ml-2 font-medium">{stats.std.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Min:</span>
                        <span className="ml-2 font-medium">{stats.min.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Max:</span>
                        <span className="ml-2 font-medium">{stats.max.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pollutant Distribution */}
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pollutant Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pollutantDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pollutantDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* State Distribution */}
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">State Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stateDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Time Series Trend */}
          {timeSeriesData.length > 0 && (
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pollutant Trends Over Time</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.keys(timeSeriesData[0] || {}).filter(key => key !== 'date').map((pollutant, index) => (
                    <Line
                      key={pollutant}
                      type="monotone"
                      dataKey={pollutant}
                      stroke={getPollutantColor(pollutant)}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
