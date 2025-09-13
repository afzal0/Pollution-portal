"use client"

import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { GitCompare, Plus, X, Calendar, MapPin, TrendingUp, BarChart3, Settings, Play, Pause, RotateCcw, Edit3, Trash2 } from 'lucide-react'
import { POLLUTANTS } from '@/lib/constants'
import dayjs from 'dayjs'
import LoadingBar from '@/components/LoadingBar'

interface CompareProps {
  filters: any
}

interface ComparisonDataset {
  id: string
  name: string
  description: string
  filters: any
  data: any[]
  color: string
  isActive: boolean
}

export default function Compare({ filters }: CompareProps) {
  const [datasets, setDatasets] = useState<ComparisonDataset[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState({
    current: 0,
    total: 0,
    currentPollutant: '',
    isLoading: false
  })
  const [comparisonType, setComparisonType] = useState<'overview' | 'pollutants' | 'states' | 'time' | 'regions'>('overview')
  const [showAddDataset, setShowAddDataset] = useState(false)
  const [newDatasetName, setNewDatasetName] = useState('')
  const [newDatasetDescription, setNewDatasetDescription] = useState('')

  const addDataset = () => {
    if (!newDatasetName.trim()) return
    
    const newDataset: ComparisonDataset = {
      id: `dataset_${Date.now()}`,
      name: newDatasetName.trim(),
      description: newDatasetDescription.trim(),
      filters: { ...filters },
      data: [],
      color: `hsl(${datasets.length * 60}, 70%, 50%)`,
      isActive: true
    }
    setDatasets([...datasets, newDataset])
    setNewDatasetName('')
    setNewDatasetDescription('')
    setShowAddDataset(false)
  }

  const removeDataset = (id: string) => {
    setDatasets(datasets.filter(d => d.id !== id))
  }

  const updateDataset = (id: string, updates: Partial<ComparisonDataset>) => {
    setDatasets(datasets.map(d => 
      d.id === id ? { ...d, ...updates } : d
    ))
  }

  const toggleDataset = (id: string) => {
    updateDataset(id, { isActive: !datasets.find(d => d.id === id)?.isActive })
  }

  const clearAllDatasets = () => {
    setDatasets([])
  }

  const fetchDatasetData = async (dataset: ComparisonDataset) => {
    try {
      const pollutants = dataset.filters.pollutants || [dataset.filters.pollutant || 'AER_AI']
      const params = new URLSearchParams({
        pollutants: pollutants.join(','),
        level: dataset.filters.level || 'SA2',
        aggregation: dataset.filters.aggregation || 'daily'
      })
      
      if (dataset.filters.states && dataset.filters.states.length > 0) {
        params.append('states', dataset.filters.states.join(','))
      }
      if (dataset.filters.codes) params.append('codes', dataset.filters.codes)
      if (dataset.filters.start) params.append('start', dataset.filters.start)
      if (dataset.filters.end) params.append('end', dataset.filters.end)

      const response = await fetch(`/api/pollution?${params.toString()}`)
      const result = await response.json()
      
      if (result.data) {
        updateDataset(dataset.id, { data: result.data })
      }
    } catch (error) {
      console.error('Error fetching dataset data:', error)
    }
  }

  const refreshDataset = async (id: string) => {
    const dataset = datasets.find(d => d.id === id)
    if (dataset) {
      await fetchDatasetData(dataset)
    }
  }

  const refreshAllDatasets = async () => {
    setLoading(true)
    setLoadingProgress({
      current: 0,
      total: datasets.length,
      currentPollutant: '',
      isLoading: true
    })

    for (let i = 0; i < datasets.length; i++) {
      setLoadingProgress(prev => ({ 
        ...prev, 
        current: i,
        currentPollutant: datasets[i].name
      }))
      await fetchDatasetData(datasets[i])
    }
    
    setLoading(false)
    setLoadingProgress(prev => ({ ...prev, isLoading: false }))
  }

  const activeDatasets = useMemo(() => {
    return datasets.filter(d => d.isActive)
  }, [datasets])

  const comparisonData = useMemo(() => {
    if (activeDatasets.length === 0) return []

    return activeDatasets.map(dataset => ({
      name: dataset.name,
      description: dataset.description,
      data: dataset.data,
      color: dataset.color,
      totalRecords: dataset.data.length,
      pollutants: [...new Set(dataset.data.map((d: any) => d.pollutant))],
      states: [...new Set(dataset.data.map((d: any) => d.ste_name))],
      aggregation: dataset.filters.aggregation || 'daily',
      dateRange: dataset.data.length > 0 ? {
        start: dataset.data[0].date || dataset.data[0].period,
        end: dataset.data[dataset.data.length - 1].date || dataset.data[dataset.data.length - 1].period
      } : null
    }))
  }, [activeDatasets])

  const pollutantComparison = useMemo(() => {
    if (comparisonType !== 'pollutants' || activeDatasets.length === 0) return []

    const pollutantStats: any = {}
    
    activeDatasets.forEach(dataset => {
      dataset.data.forEach((row: any) => {
        if (!pollutantStats[row.pollutant]) {
          pollutantStats[row.pollutant] = {}
        }
        if (!pollutantStats[row.pollutant][dataset.name]) {
          pollutantStats[row.pollutant][dataset.name] = []
        }
        pollutantStats[row.pollutant][dataset.name].push(row.value)
      })
    })

    return Object.entries(pollutantStats).map(([pollutant, stats]: [string, any]) => {
      const result: any = { pollutant }
      Object.entries(stats).forEach(([dataset, values]: [string, any]) => {
        result[dataset] = values.reduce((a: number, b: number) => a + b, 0) / values.length
      })
      return result
    })
  }, [activeDatasets, comparisonType])

  const stateComparison = useMemo(() => {
    if (comparisonType !== 'states' || activeDatasets.length === 0) return []

    const stateStats: any = {}
    
    activeDatasets.forEach(dataset => {
      dataset.data.forEach((row: any) => {
        if (!stateStats[row.ste_name]) {
          stateStats[row.ste_name] = {}
        }
        if (!stateStats[row.ste_name][dataset.name]) {
          stateStats[row.ste_name][dataset.name] = []
        }
        stateStats[row.ste_name][dataset.name].push(row.value)
      })
    })

    return Object.entries(stateStats).map(([state, stats]: [string, any]) => {
      const result: any = { state }
      Object.entries(stats).forEach(([dataset, values]: [string, any]) => {
        result[dataset] = values.reduce((a: number, b: number) => a + b, 0) / values.length
      })
      return result
    })
  }, [activeDatasets, comparisonType])

  const timeSeriesComparison = useMemo(() => {
    if (comparisonType !== 'time' || activeDatasets.length === 0) return []

    const timeData: any = {}
    
    activeDatasets.forEach(dataset => {
      dataset.data.forEach((row: any) => {
        const date = dayjs(row.date || row.period).format('YYYY-MM-DD')
        if (!timeData[date]) {
          timeData[date] = { date }
        }
        if (!timeData[date][dataset.name]) {
          timeData[date][dataset.name] = []
        }
        timeData[date][dataset.name].push(row.value)
      })
    })

    return Object.values(timeData).map((group: any) => {
      const result: any = { date: group.date }
      Object.keys(group).forEach(dataset => {
        if (dataset !== 'date') {
          const values = group[dataset].filter((v: any) => v != null)
          if (values.length > 0) {
            result[dataset] = values.reduce((a: number, b: number) => a + b, 0) / values.length
          }
        }
      })
      return result
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [activeDatasets, comparisonType])

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
          <div className="flex items-center gap-2">
            {datasets.length > 0 && (
              <button
                onClick={refreshAllDatasets}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Refresh All
              </button>
            )}
            <button
              onClick={() => setShowAddDataset(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Dataset
            </button>
          </div>
        </div>

        {/* Comparison Type Selector */}
        <div className="flex gap-2">
          {[
            { value: 'overview', label: 'Overview', icon: BarChart3 },
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

      {/* Add Dataset Modal */}
      {showAddDataset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Dataset</h3>
              <button
                onClick={() => setShowAddDataset(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dataset Name *
                </label>
                <input
                  type="text"
                  value={newDatasetName}
                  onChange={(e) => setNewDatasetName(e.target.value)}
                  placeholder="e.g., Current Analysis"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newDatasetDescription}
                  onChange={(e) => setNewDatasetDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium mb-1">Current Filters:</p>
                <p>Pollutants: {filters.pollutants?.join(', ') || filters.pollutant || 'None'}</p>
                <p>States: {filters.states?.join(', ') || 'All'}</p>
                <p>Level: {filters.level}</p>
                <p>Aggregation: {filters.aggregation || 'daily'}</p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={addDataset}
                disabled={!newDatasetName.trim()}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Dataset
              </button>
              <button
                onClick={() => setShowAddDataset(false)}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {datasets.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <GitCompare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No Datasets Yet</h3>
            <p className="text-sm mb-4">Add datasets to compare different pollution data</p>
            <button
              onClick={() => setShowAddDataset(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add First Dataset
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* Dataset Management */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Datasets ({datasets.length})</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {activeDatasets.length} active
                </span>
                <button
                  onClick={clearAllDatasets}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {datasets.map((dataset, index) => (
                <div key={dataset.id} className={`bg-white rounded-lg p-4 border-2 transition-all ${
                  dataset.isActive ? 'border-blue-500' : 'border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: dataset.color }}
                      />
                      <h4 className="font-semibold text-gray-900">{dataset.name}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleDataset(dataset.id)}
                        className={`p-1 rounded ${
                          dataset.isActive ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      >
                        {dataset.isActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => refreshDataset(dataset.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeDataset(dataset.id)}
                        className="p-1 text-red-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {dataset.description && (
                    <p className="text-sm text-gray-600 mb-3">{dataset.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Records:</span>
                      <span className="font-medium">{dataset.data.length.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pollutants:</span>
                      <span className="font-medium">
                        {[...new Set(dataset.data.map((d: any) => d.pollutant))].length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">States:</span>
                      <span className="font-medium">
                        {[...new Set(dataset.data.map((d: any) => d.ste_name))].length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Aggregation:</span>
                      <span className="font-medium capitalize">
                        {dataset.filters.aggregation || 'daily'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts based on comparison type */}
          {comparisonType === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary Cards */}
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Summary</h3>
                <div className="space-y-3">
                  {comparisonData.map((dataset, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: dataset.color }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{dataset.name}</p>
                          <p className="text-sm text-gray-600">{dataset.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{dataset.totalRecords.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">records</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pollutant Distribution */}
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pollutant Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={comparisonData.map(dataset => ({
                        name: dataset.name,
                        value: dataset.totalRecords,
                        color: dataset.color
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {comparisonData.map((dataset, index) => (
                        <Cell key={`cell-${index}`} fill={dataset.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

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
                  {activeDatasets.map(dataset => (
                    <Bar
                      key={dataset.name}
                      dataKey={dataset.name}
                      fill={dataset.color}
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
                  {activeDatasets.map(dataset => (
                    <Bar
                      key={dataset.name}
                      dataKey={dataset.name}
                      fill={dataset.color}
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
                  {activeDatasets.map(dataset => (
                    <Line
                      key={dataset.name}
                      type="monotone"
                      dataKey={dataset.name}
                      stroke={dataset.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {comparisonType === 'regions' && activeDatasets.length > 0 && (
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDatasets.map((dataset, index) => (
                  <div key={dataset.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: dataset.color }}
                      />
                      <h4 className="font-semibold text-gray-900">{dataset.name}</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Records:</span>
                        <span className="font-medium">{dataset.data.length.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pollutants:</span>
                        <span className="font-medium">
                          {[...new Set(dataset.data.map((d: any) => d.pollutant))].join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">States:</span>
                        <span className="font-medium">
                          {[...new Set(dataset.data.map((d: any) => d.ste_name))].join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Aggregation:</span>
                        <span className="font-medium capitalize">
                          {dataset.filters.aggregation || 'daily'}
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