"use client"

import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from 'recharts'
import { GitCompare, Plus, X, Calendar, MapPin, TrendingUp, BarChart3 } from 'lucide-react'
import { POLLUTANTS } from '@/lib/constants'
import dayjs from 'dayjs'
import LoadingBar from '@/components/LoadingBar'

interface CompareProps {
  filters: any
}

interface ComparisonData {
  id: string
  name: string
  filters: any
  data: any[]
  color: string
}

export default function Compare({ filters }: CompareProps) {
  const [comparisons, setComparisons] = useState<ComparisonData[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState({
    current: 0,
    total: 0,
    currentPollutant: '',
    isLoading: false
  })
  const [comparisonType, setComparisonType] = useState<'pollutants' | 'states' | 'time' | 'regions'>('pollutants')

  const addComparison = () => {
    const newComparison: ComparisonData = {
      id: `comparison_${Date.now()}`,
      name: `Comparison ${comparisons.length + 1}`,
      filters: { ...filters },
      data: [],
      color: `hsl(${comparisons.length * 60}, 70%, 50%)`
    }
    setComparisons([...comparisons, newComparison])
  }

  const removeComparison = (id: string) => {
    setComparisons(comparisons.filter(c => c.id !== id))
  }

  const updateComparison = (id: string, updates: Partial<ComparisonData>) => {
    setComparisons(comparisons.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ))
  }

  const fetchComparisonData = async (comparison: ComparisonData) => {
    try {
      const pollutants = comparison.filters.pollutants || [comparison.filters.pollutant || 'AER_AI']
      const params = new URLSearchParams({
        pollutants: pollutants.join(','),
        level: comparison.filters.level || 'SA2',
      })
      
      if (comparison.filters.states && comparison.filters.states.length > 0) {
        params.append('states', comparison.filters.states.join(','))
      }
      if (comparison.filters.codes) params.append('codes', comparison.filters.codes)
      if (comparison.filters.start) params.append('start', comparison.filters.start)
      if (comparison.filters.end) params.append('end', comparison.filters.end)

      const response = await fetch(`/api/pollution?${params.toString()}`)
      const result = await response.json()
      
      if (result.data) {
        updateComparison(comparison.id, { data: result.data })
      }
    } catch (error) {
      console.error('Error fetching comparison data:', error)
    }
  }

  useEffect(() => {
    if (comparisons.length > 0) {
      setLoading(true)
      setLoadingProgress({
        current: 0,
        total: comparisons.length,
        currentPollutant: '',
        isLoading: true
      })

      const fetchAll = async () => {
        for (let i = 0; i < comparisons.length; i++) {
          setLoadingProgress(prev => ({ 
            ...prev, 
            current: i,
            currentPollutant: comparisons[i].name
          }))
          await fetchComparisonData(comparisons[i])
        }
        setLoading(false)
        setLoadingProgress(prev => ({ ...prev, isLoading: false }))
      }

      fetchAll()
    }
  }, [comparisons.length])

  const comparisonData = useMemo(() => {
    if (comparisons.length === 0) return []

    const allData = comparisons.map(comp => ({
      name: comp.name,
      data: comp.data,
      color: comp.color,
      totalRecords: comp.data.length,
      pollutants: [...new Set(comp.data.map((d: any) => d.pollutant))],
      states: [...new Set(comp.data.map((d: any) => d.ste_name))],
      dateRange: comp.data.length > 0 ? {
        start: comp.data[0].date,
        end: comp.data[comp.data.length - 1].date
      } : null
    }))

    return allData
  }, [comparisons])

  const pollutantComparison = useMemo(() => {
    if (comparisonType !== 'pollutants' || comparisons.length === 0) return []

    const pollutantStats: any = {}
    
    comparisons.forEach(comp => {
      comp.data.forEach((row: any) => {
        if (!pollutantStats[row.pollutant]) {
          pollutantStats[row.pollutant] = {}
        }
        if (!pollutantStats[row.pollutant][comp.name]) {
          pollutantStats[row.pollutant][comp.name] = []
        }
        pollutantStats[row.pollutant][comp.name].push(row.value)
      })
    })

    return Object.entries(pollutantStats).map(([pollutant, stats]: [string, any]) => {
      const result: any = { pollutant }
      Object.entries(stats).forEach(([comparison, values]: [string, any]) => {
        result[comparison] = values.reduce((a: number, b: number) => a + b, 0) / values.length
      })
      return result
    })
  }, [comparisons, comparisonType])

  const stateComparison = useMemo(() => {
    if (comparisonType !== 'states' || comparisons.length === 0) return []

    const stateStats: any = {}
    
    comparisons.forEach(comp => {
      comp.data.forEach((row: any) => {
        if (!stateStats[row.ste_name]) {
          stateStats[row.ste_name] = {}
        }
        if (!stateStats[row.ste_name][comp.name]) {
          stateStats[row.ste_name][comp.name] = []
        }
        stateStats[row.ste_name][comp.name].push(row.value)
      })
    })

    return Object.entries(stateStats).map(([state, stats]: [string, any]) => {
      const result: any = { state }
      Object.entries(stats).forEach(([comparison, values]: [string, any]) => {
        result[comparison] = values.reduce((a: number, b: number) => a + b, 0) / values.length
      })
      return result
    })
  }, [comparisons, comparisonType])

  const timeSeriesComparison = useMemo(() => {
    if (comparisonType !== 'time' || comparisons.length === 0) return []

    const timeData: any = {}
    
    comparisons.forEach(comp => {
      comp.data.forEach((row: any) => {
        const date = dayjs(row.date).format('YYYY-MM-DD')
        if (!timeData[date]) {
          timeData[date] = { date }
        }
        if (!timeData[date][comp.name]) {
          timeData[date][comp.name] = []
        }
        timeData[date][comp.name].push(row.value)
      })
    })

    return Object.values(timeData).map((group: any) => {
      const result: any = { date: group.date }
      Object.keys(group).forEach(comparison => {
        if (comparison !== 'date') {
          const values = group[comparison].filter((v: any) => v != null)
          if (values.length > 0) {
            result[comparison] = values.reduce((a: number, b: number) => a + b, 0) / values.length
          }
        }
      })
      return result
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [comparisons, comparisonType])

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
        message="Loading comparison data..."
      />
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Data Comparison
          </h2>
          <button
            onClick={addComparison}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Comparison
          </button>
        </div>

        {/* Comparison Type Selector */}
        <div className="flex gap-2">
          {[
            { value: 'pollutants', label: 'By Pollutants', icon: BarChart3 },
            { value: 'states', label: 'By States', icon: MapPin },
            { value: 'time', label: 'Over Time', icon: Calendar },
            { value: 'regions', label: 'By Regions', icon: TrendingUp }
          ].map(type => {
            const Icon = type.icon
            return (
              <button
                key={type.value}
                onClick={() => setComparisonType(type.value as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  comparisonType === type.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            )
          })}
        </div>
      </div>

      {comparisons.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <GitCompare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No Comparisons Yet</h3>
            <p className="text-sm mb-4">Add comparisons to analyze different datasets</p>
            <button
              onClick={addComparison}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add First Comparison
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisonData.map((comp, index) => (
              <div key={comp.name} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{comp.name}</h3>
                  <button
                    onClick={() => removeComparison(comparisons[index].id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Records:</span>
                    <span className="font-medium">{comp.totalRecords.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pollutants:</span>
                    <span className="font-medium">{comp.pollutants.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">States:</span>
                    <span className="font-medium">{comp.states.length}</span>
                  </div>
                  {comp.dateRange && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date Range:</span>
                      <span className="font-medium text-xs">
                        {dayjs(comp.dateRange.start).format('MMM YYYY')} - {dayjs(comp.dateRange.end).format('MMM YYYY')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Charts based on comparison type */}
          {comparisonType === 'pollutants' && pollutantComparison.length > 0 && (
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pollutant Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={pollutantComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="pollutant" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {comparisons.map(comp => (
                    <Bar
                      key={comp.name}
                      dataKey={comp.name}
                      fill={comp.color}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {comparisonType === 'states' && stateComparison.length > 0 && (
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">State Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stateComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="state" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {comparisons.map(comp => (
                    <Bar
                      key={comp.name}
                      dataKey={comp.name}
                      fill={comp.color}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {comparisonType === 'time' && timeSeriesComparison.length > 0 && (
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Series Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeSeriesComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {comparisons.map(comp => (
                    <Line
                      key={comp.name}
                      type="monotone"
                      dataKey={comp.name}
                      stroke={comp.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {comparisonType === 'regions' && comparisons.length > 0 && (
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparisons.map(comp => (
                  <div key={comp.name} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{comp.name}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Records:</span>
                        <span className="font-medium">{comp.data.length.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pollutants:</span>
                        <span className="font-medium">
                          {[...new Set(comp.data.map((d: any) => d.pollutant))].join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">States:</span>
                        <span className="font-medium">
                          {[...new Set(comp.data.map((d: any) => d.ste_name))].join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
